/**
 * @file Pipeline Checkpoint Engine
 * @description Server-side pipeline execution tracking with persistent checkpoints.
 *              Enables pipeline resume after crash, full audit trail, and progress tracking.
 *              In-memory for now; designed for easy swap to Prisma/SQLite persistence.
 * @module lib/pipeline/checkpoint-engine
 */

/** Status of a pipeline stage */
export type StageStatus = 'idle' | 'queued' | 'running' | 'done' | 'error' | 'skipped';

/** Status of the overall pipeline run */
export type PipelineRunStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error' | 'cancelled';

/** Checkpoint for a single pipeline stage */
export interface StageCheckpoint {
  /** 1-based stage number */
  stageNumber: number;
  /** Stage name */
  stageName: string;
  /** Current status */
  status: StageStatus;
  /** AI-generated output */
  output: string;
  /** Error message if failed */
  error?: string;
  /** ISO timestamp when stage started */
  startedAt?: string;
  /** ISO timestamp when stage completed */
  completedAt?: string;
  /** Duration in milliseconds */
  durationMs?: number;
  /** AI model used */
  model?: string;
  /** Tokens consumed */
  tokensCost?: number;
  /** Retry count for this stage */
  retryCount: number;
}

/** A complete pipeline run record */
export interface PipelineRun {
  /** Unique run ID */
  runId: string;
  /** Associated project ID */
  projectId: string;
  /** User who triggered the run */
  userId: string;
  /** Overall pipeline status */
  status: PipelineRunStatus;
  /** All stage checkpoints */
  stages: StageCheckpoint[];
  /** Index of the current/next stage to execute (0-based) */
  currentStageIndex: number;
  /** Overall progress percentage */
  progress: number;
  /** ISO timestamp when run started */
  startedAt?: string;
  /** ISO timestamp when run completed */
  completedAt?: string;
  /** Total duration in milliseconds */
  totalDurationMs: number;
  /** Total tokens consumed across all stages */
  totalTokensCost: number;
  /** Configuration used for this run */
  config: PipelineConfig;
}

/** Pipeline execution configuration */
export interface PipelineConfig {
  /** Total number of stages */
  totalStages: number;
  /** Stage names in order */
  stageNames: string[];
  /** Whether to auto-continue to next stage */
  autoContinue: boolean;
  /** Approval gate stage indices (0-based) */
  approvalGates: number[];
  /** Max retries per stage */
  maxRetriesPerStage: number;
}

/** Default 12-stage pipeline configuration */
const DEFAULT_STAGE_NAMES = [
  'Requirements AI', 'Architecture AI', 'Task Breakdown AI',
  'Frontend AI', 'Backend AI', 'Database AI',
  'Testing AI', 'Documentation AI', 'Code Review AI',
  'Deployment AI', 'Monitoring AI', 'Quality Audit',
];

/** Default approval gates: after Requirements, Architecture, Code Review */
const DEFAULT_APPROVAL_GATES = [0, 1, 8];

/**
 * Pipeline Checkpoint Engine — manages pipeline execution with
 * persistent checkpoints, resume capability, and full audit trail.
 *
 * @example
 * ```ts
 * const engine = new CheckpointEngine();
 * const run = engine.createRun('project-123', 'user-456');
 * engine.startStage(run.runId, 1);
 * engine.completeStage(run.runId, 1, 'Generated requirements output', 150);
 * ```
 */
export class CheckpointEngine {
  /** In-memory store of pipeline runs */
  private runs: Map<string, PipelineRun> = new Map();

  /** Runs indexed by project ID for fast lookup */
  private projectIndex: Map<string, string[]> = new Map();

  /**
   * Create a new pipeline run
   * @param projectId - Project to run pipeline for
   * @param userId - User triggering the run
   * @param config - Optional custom pipeline configuration
   * @returns The created PipelineRun
   */
  createRun(projectId: string, userId: string, config?: Partial<PipelineConfig>): PipelineRun {
    const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const stageNames = config?.stageNames || DEFAULT_STAGE_NAMES;

    const run: PipelineRun = {
      runId,
      projectId,
      userId,
      status: 'idle',
      stages: stageNames.map((name, i) => ({
        stageNumber: i + 1,
        stageName: name,
        status: 'idle',
        output: '',
        retryCount: 0,
      })),
      currentStageIndex: 0,
      progress: 0,
      totalDurationMs: 0,
      totalTokensCost: 0,
      config: {
        totalStages: stageNames.length,
        stageNames,
        autoContinue: config?.autoContinue ?? true,
        approvalGates: config?.approvalGates ?? DEFAULT_APPROVAL_GATES,
        maxRetriesPerStage: config?.maxRetriesPerStage ?? 2,
      },
    };

    this.runs.set(runId, run);

    // Index by project
    const existing = this.projectIndex.get(projectId) || [];
    existing.push(runId);
    this.projectIndex.set(projectId, existing);

    return run;
  }

  /**
   * Mark the overall pipeline as started and queue all stages
   * @param runId - Pipeline run ID
   */
  startPipeline(runId: string): PipelineRun | null {
    const run = this.runs.get(runId);
    if (!run) return null;

    run.status = 'running';
    run.startedAt = new Date().toISOString();
    run.stages.forEach(s => { s.status = 'queued'; });
    run.stages[0].status = 'running';
    run.stages[0].startedAt = new Date().toISOString();

    return run;
  }

  /**
   * Mark a stage as started
   * @param runId - Pipeline run ID
   * @param stageNumber - 1-based stage number
   */
  startStage(runId: string, stageNumber: number): StageCheckpoint | null {
    const run = this.runs.get(runId);
    if (!run) return null;

    const stage = run.stages[stageNumber - 1];
    if (!stage) return null;

    stage.status = 'running';
    stage.startedAt = new Date().toISOString();
    run.currentStageIndex = stageNumber - 1;

    return stage;
  }

  /**
   * Mark a stage as completed with output
   * @param runId - Pipeline run ID
   * @param stageNumber - 1-based stage number
   * @param output - AI-generated output
   * @param tokensCost - Tokens consumed
   * @param model - AI model used
   */
  completeStage(
    runId: string,
    stageNumber: number,
    output: string,
    tokensCost = 0,
    model?: string
  ): PipelineRun | null {
    const run = this.runs.get(runId);
    if (!run) return null;

    const stage = run.stages[stageNumber - 1];
    if (!stage) return null;

    const now = new Date().toISOString();
    stage.status = 'done';
    stage.output = output;
    stage.completedAt = now;
    stage.model = model;
    stage.tokensCost = tokensCost;
    stage.durationMs = stage.startedAt
      ? new Date(now).getTime() - new Date(stage.startedAt).getTime()
      : 0;

    // Update run totals
    run.totalTokensCost += tokensCost;
    run.totalDurationMs += stage.durationMs;

    // Calculate progress
    const completedCount = run.stages.filter(s => s.status === 'done' || s.status === 'skipped').length;
    run.progress = Math.round((completedCount / run.config.totalStages) * 100);

    // Check if pipeline is complete
    if (completedCount === run.config.totalStages) {
      run.status = 'completed';
      run.completedAt = now;
    } else if (run.config.autoContinue) {
      // Auto-advance to next stage if no approval gate
      const nextIdx = stageNumber; // 0-based next
      if (nextIdx < run.config.totalStages) {
        if (run.config.approvalGates.includes(stageNumber - 1)) {
          // Approval gate — pause and wait for human
          run.status = 'paused';
        } else {
          // Auto-continue
          run.stages[nextIdx].status = 'running';
          run.stages[nextIdx].startedAt = new Date().toISOString();
          run.currentStageIndex = nextIdx;
        }
      }
    }

    return run;
  }

  /**
   * Mark a stage as failed
   * @param runId - Pipeline run ID
   * @param stageNumber - 1-based stage number
   * @param error - Error message
   */
  errorStage(runId: string, stageNumber: number, error: string): PipelineRun | null {
    const run = this.runs.get(runId);
    if (!run) return null;

    const stage = run.stages[stageNumber - 1];
    if (!stage) return null;

    stage.retryCount++;
    if (stage.retryCount <= run.config.maxRetriesPerStage) {
      // Auto-retry
      stage.status = 'running';
      stage.error = `Retry ${stage.retryCount}: ${error}`;
      return run;
    }

    // Max retries exceeded
    stage.status = 'error';
    stage.error = error;
    stage.completedAt = new Date().toISOString();
    run.status = 'error';

    return run;
  }

  /**
   * Resume a paused pipeline (after approval gate)
   * @param runId - Pipeline run ID
   */
  resumePipeline(runId: string): PipelineRun | null {
    const run = this.runs.get(runId);
    if (!run || run.status !== 'paused') return null;

    run.status = 'running';
    const nextIdx = run.stages.findIndex(s => s.status === 'queued');
    if (nextIdx >= 0) {
      run.stages[nextIdx].status = 'running';
      run.stages[nextIdx].startedAt = new Date().toISOString();
      run.currentStageIndex = nextIdx;
    }

    return run;
  }

  /**
   * Get a pipeline run by ID
   */
  getRun(runId: string): PipelineRun | null {
    return this.runs.get(runId) || null;
  }

  /**
   * Get all runs for a project
   */
  getProjectRuns(projectId: string): PipelineRun[] {
    const runIds = this.projectIndex.get(projectId) || [];
    return runIds.map(id => this.runs.get(id)!).filter(Boolean);
  }

  /**
   * Get the latest run for a project
   */
  getLatestRun(projectId: string): PipelineRun | null {
    const runs = this.getProjectRuns(projectId);
    return runs.length > 0 ? runs[runs.length - 1] : null;
  }

  /**
   * Get a summary of all runs (for admin dashboard)
   */
  getAllRunsSummary(): { total: number; running: number; completed: number; failed: number } {
    const all = Array.from(this.runs.values());
    return {
      total: all.length,
      running: all.filter(r => r.status === 'running').length,
      completed: all.filter(r => r.status === 'completed').length,
      failed: all.filter(r => r.status === 'error').length,
    };
  }
}

/** Singleton instance for the application */
export const pipelineEngine = new CheckpointEngine();
