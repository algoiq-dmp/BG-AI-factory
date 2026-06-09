import fs from 'fs';
import path from 'path';
import { SwarmOrchestrator, SwarmPlan } from './swarm-orchestrator';
import { SwarmCodeGenerator } from './swarm-code-generator';

export class SwarmExecutor {
  private static sanitizeProjectId(projectId: string): string {
    if (!/^[a-zA-Z0-9-_]+$/.test(projectId)) {
      throw new Error('Invalid projectId format. Path traversal prevented.');
    }
    return projectId;
  }

  private static getProjectDir(projectId: string) {
    const safeId = this.sanitizeProjectId(projectId);
    const dir = path.join(process.cwd(), '.data', 'projects', safeId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  private static getPlanPath(projectId: string) {
    return path.join(this.getProjectDir(projectId), 'plan.json');
  }

  private static getOutputPath(projectId: string, phaseName: string) {
    const outDir = path.join(this.getProjectDir(projectId), 'output');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    return path.join(outDir, `${phaseName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`);
  }

  static savePlan(projectId: string, plan: SwarmPlan) {
    fs.writeFileSync(this.getPlanPath(projectId), JSON.stringify(plan, null, 2));
  }

  static loadPlan(projectId: string): SwarmPlan | null {
    const planPath = this.getPlanPath(projectId);
    if (fs.existsSync(planPath)) {
      return JSON.parse(fs.readFileSync(planPath, 'utf-8'));
    }
    return null;
  }

  static async executePhase(projectId: string, phaseId: number) {
    const plan = this.loadPlan(projectId);
    if (!plan) throw new Error(`SwarmPlan not found for project ${projectId}. Initialize swarm first.`);

    const phaseIndex = plan.executionPlan.findIndex(p => p.phaseId === phaseId);
    if (phaseIndex === -1) throw new Error(`Phase ${phaseId} not found in execution plan.`);

    const phase = plan.executionPlan[phaseIndex];
    
    // Mark as in progress
    phase.status = 'in_progress';
    this.savePlan(projectId, plan);

    try {
      console.log(`[Swarm Executor] Executing Phase ${phaseId}: ${phase.name}`);
      
      // Load context from previous phase (simplified for MVP)
      let previousContext = '';
      if (phaseId > 1) {
        const prevPhase = plan.executionPlan[phaseIndex - 1];
        const prevFile = this.getOutputPath(projectId, prevPhase.name);
        if (fs.existsSync(prevFile)) {
          previousContext = fs.readFileSync(prevFile, 'utf-8');
        }
      }

      // Generate prompt based on phase
      const prompt = `
Execute Phase ${phaseId}: ${phase.name}.
Assigned Agents: ${phase.assignedAgents.join(', ')}.
Tasks to complete:
${phase.tasks.map(t => `- ${t}`).join('\n')}

Previous Phase Context:
${previousContext || 'None (Initial Phase)'}

Provide a detailed, enterprise-grade output artifact for this phase.
`;

      // Determine model: 
      // Architecture/Requirements -> GPT/Claude
      // Coding -> DeepSeek
      // Validation -> GPT
      let targetModel = 'claude'; // Default for analysis/docs
      if (phase.name.toLowerCase().includes('frontend') || phase.name.toLowerCase().includes('backend') || phase.name.toLowerCase().includes('database')) {
        targetModel = 'deepseek';
      } else if (phase.name.toLowerCase().includes('quality')) {
        targetModel = 'gpt4';
      }

      // Divert to Specialized Code Generator Factories if Phase 4 or 5
      let result = '';
      if (phase.name.toLowerCase().includes('frontend')) {
        result = await SwarmCodeGenerator.executeFrontendFactory(projectId, previousContext, phase.tasks);
      } else if (phase.name.toLowerCase().includes('backend')) {
        result = await SwarmCodeGenerator.executeBackendFactory(projectId, previousContext, phase.tasks);
      } else {
        // Execute standard phases via the master orchestrator's router
        result = await SwarmOrchestrator.routeToModel(
          targetModel as any, 
          prompt, 
          `You are a specialized Swarm Agent Team executing ${phase.name}. Follow the exact tasks and generate high-quality outputs.`, 
          projectId
        );
      }

      // Save output
      fs.writeFileSync(this.getOutputPath(projectId, phase.name), result);

      // Mark complete
      phase.status = 'completed';
      this.savePlan(projectId, plan);

      return {
        success: true,
        phaseId,
        outputFile: this.getOutputPath(projectId, phase.name),
        resultPreview: result.substring(0, 500) + '...'
      };

    } catch (error: any) {
      console.error(`[Swarm Executor] Phase ${phaseId} failed:`, error.message);
      phase.status = 'failed';
      this.savePlan(projectId, plan);
      throw error;
    }
  }
}
