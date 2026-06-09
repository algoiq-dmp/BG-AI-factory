/**
 * @file Pipeline Store — Zustand state management for the 12-stage AI pipeline
 * @description Tracks pipeline execution state, per-stage progress, and overall status.
 *              Used by Pipeline Orchestrator, Dashboard, and RightPane telemetry.
 * @module store/usePipelineStore
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Pipeline stage definition */
interface PipelineStage {
  id: number;
  name: string;
  status: 'idle' | 'running' | 'done' | 'error' | 'skipped';
  output: string;
  startedAt: string | null;
  completedAt: string | null;
}

/** Default 12 pipeline stages */
const defaultStages: PipelineStage[] = [
  { id: 1, name: 'Requirements AI', status: 'idle', output: '', startedAt: null, completedAt: null },
  { id: 2, name: 'Architecture AI', status: 'idle', output: '', startedAt: null, completedAt: null },
  { id: 3, name: 'Task Breakdown AI', status: 'idle', output: '', startedAt: null, completedAt: null },
  { id: 4, name: 'Frontend AI', status: 'idle', output: '', startedAt: null, completedAt: null },
  { id: 5, name: 'Backend AI', status: 'idle', output: '', startedAt: null, completedAt: null },
  { id: 6, name: 'Database AI', status: 'idle', output: '', startedAt: null, completedAt: null },
  { id: 7, name: 'Testing AI', status: 'idle', output: '', startedAt: null, completedAt: null },
  { id: 8, name: 'Documentation AI', status: 'idle', output: '', startedAt: null, completedAt: null },
  { id: 9, name: 'Code Review AI', status: 'idle', output: '', startedAt: null, completedAt: null },
  { id: 10, name: 'Deployment AI', status: 'idle', output: '', startedAt: null, completedAt: null },
  { id: 11, name: 'Monitoring AI', status: 'idle', output: '', startedAt: null, completedAt: null },
  { id: 12, name: 'Quality Audit', status: 'idle', output: '', startedAt: null, completedAt: null },
];

interface PipelineState {
  /** Current pipeline execution status */
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  /** All 12 stages */
  stages: PipelineStage[];
  /** Current active stage index (0-based) */
  currentStageIndex: number;
  /** Overall progress percentage */
  progress: number;
  /** Pipeline start time */
  startedAt: string | null;
  /** Elapsed seconds */
  elapsedSeconds: number;

  /** Start the pipeline */
  startPipeline: () => void;
  /** Pause the pipeline */
  pausePipeline: () => void;
  /** Resume the pipeline */
  resumePipeline: () => void;
  /** Complete a stage */
  completeStage: (stageId: number, output: string) => void;
  /** Mark a stage as error */
  errorStage: (stageId: number, error: string) => void;
  /** Set stage status */
  setStageStatus: (stageId: number, status: PipelineStage['status']) => void;
  /** Reset pipeline */
  resetPipeline: () => void;
  /** Tick elapsed time */
  tick: () => void;
}

export const usePipelineStore = create<PipelineState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      stages: [...defaultStages],
      currentStageIndex: 0,
      progress: 0,
      startedAt: null,
      elapsedSeconds: 0,

      startPipeline: () => set({
        status: 'running',
        startedAt: new Date().toISOString(),
        currentStageIndex: 0,
        stages: defaultStages.map((s, i) => ({
          ...s,
          status: i === 0 ? 'running' : 'idle',
          startedAt: i === 0 ? new Date().toISOString() : null,
        })),
      }),

      pausePipeline: () => set({ status: 'paused' }),
      resumePipeline: () => set({ status: 'running' }),

      completeStage: (stageId, output) => {
        const state = get();
        const newStages = state.stages.map((s) =>
          s.id === stageId
            ? { ...s, status: 'done' as const, output, completedAt: new Date().toISOString() }
            : s
        );
        const doneCount = newStages.filter((s) => s.status === 'done').length;
        const nextIndex = state.currentStageIndex + 1;
        const isComplete = nextIndex >= newStages.length;

        // Auto-start next stage
        if (!isComplete) {
          newStages[nextIndex] = { ...newStages[nextIndex], status: 'running', startedAt: new Date().toISOString() };
        }

        set({
          stages: newStages,
          currentStageIndex: isComplete ? state.currentStageIndex : nextIndex,
          progress: Math.round((doneCount / newStages.length) * 100),
          status: isComplete ? 'completed' : 'running',
        });
      },

      errorStage: (stageId, error) => {
        set({
          stages: get().stages.map((s) =>
            s.id === stageId ? { ...s, status: 'error' as const, output: error } : s
          ),
          status: 'error',
        });
      },

      setStageStatus: (stageId, status) => {
        set({
          stages: get().stages.map((s) => (s.id === stageId ? { ...s, status } : s)),
        });
      },

      resetPipeline: () => set({
        status: 'idle',
        stages: [...defaultStages],
        currentStageIndex: 0,
        progress: 0,
        startedAt: null,
        elapsedSeconds: 0,
      }),

      tick: () => set({ elapsedSeconds: get().elapsedSeconds + 1 }),
    }),
    {
      name: 'bg-factory-pipeline',
      partialize: (state) => ({
        status: state.status,
        stages: state.stages,
        currentStageIndex: state.currentStageIndex,
        progress: state.progress,
      }),
    }
  )
);
