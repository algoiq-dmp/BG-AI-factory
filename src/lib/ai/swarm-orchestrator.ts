import { AIModelRouter, AIModel } from './router';
import { getProjectApiKeys } from '@/lib/db/project-settings'; // We will create this

export interface ProjectContext {
  id: string;
  name: string;
  description: string;
  domain: string;
}

export interface SwarmAgent {
  id: string;
  role: string;
  skills: string[];
  systemPrompt: string;
  model: AIModel;
}

export interface ExecutionPhase {
  phaseId: number;
  name: string;
  assignedAgents: string[];
  tasks: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface SwarmPlan {
  projectUnderstanding: string;
  assignedAgents: SwarmAgent[];
  executionPlan: ExecutionPhase[];
  risks: string[];
  recommendations: string[];
}

export class SwarmOrchestrator {
  /**
   * Automatically routes the task to the best model based on the domain.
   * Fallback to DeepSeek if the specific key is missing.
   */
  static async routeToModel(targetModel: AIModel, prompt: string, systemPrompt: string, projectId: string, modelVariant?: string): Promise<string> {
    const apiKeys = await getProjectApiKeys(projectId);
    
    let modelToUse = targetModel;
    let apiKeyToUse = apiKeys[targetModel];

    // Fallback to DeepSeek if primary model key is missing
    if (!apiKeyToUse && targetModel !== 'deepseek') {
      console.warn(`[Swarm] Missing key for ${targetModel}, falling back to DeepSeek.`);
      modelToUse = 'deepseek';
      apiKeyToUse = apiKeys['deepseek'];
    }

    if (!apiKeyToUse) {
      throw new Error(`Critical Error: No API keys available for ${modelToUse} or deepseek fallback.`);
    }

    return AIModelRouter.execute({
      model: modelToUse,
      prompt,
      systemPrompt,
      apiKey: apiKeyToUse,
      modelVariant
    });
  }

  /**
   * Phase 0: Master Orchestrator plans the entire project and assigns the 300+ agents.
   */
  static async initializeProjectSwarm(context: ProjectContext): Promise<SwarmPlan> {
    const systemPrompt = `You are the Master AI Orchestrator of Launch IQ.
Your mission is to operate as a complete autonomous AI Software Company consisting of 300+ specialized AI agents that collaborate to build software projects with enterprise-grade quality.

Based on the user's project idea, you must:
1. Provide a detailed Project Understanding.
2. Automatically identify and assign specialized AI agents (from your 300+ pool) required for this specific project.
3. Map these agents to a strict 10-Phase Execution Pipeline:
   - Phase 1: Requirement Discovery
   - Phase 2: Architecture Planning
   - Phase 3: UI/UX Factory
   - Phase 4: Frontend Factory
   - Phase 5: Backend Factory
   - Phase 6: Database Factory
   - Phase 7: Testing Factory
   - Phase 8: Documentation Factory
   - Phase 9: DevOps Factory
   - Phase 10: Quality Audit

Return ONLY valid JSON matching this schema:
{
  "projectUnderstanding": "Detailed analysis...",
  "assignedAgents": [{ "id": "agent_1", "role": "Frontend Specialist", "skills": ["React"], "systemPrompt": "...", "model": "claude" }],
  "executionPlan": [{ "phaseId": 1, "name": "Requirement Discovery", "assignedAgents": ["agent_1"], "tasks": ["Write BRD"], "status": "pending" }],
  "risks": ["risk 1"],
  "recommendations": ["rec 1"]
}`;

    const prompt = `Project Name: ${context.name}\nDomain: ${context.domain}\nDescription: ${context.description}`;

    // Use Kimi K2.6 for Agent Swarm Orchestration as per user rules (fallback to DeepSeek handled internally)
    const rawResponse = await this.routeToModel('kimi', prompt, systemPrompt, context.id);

    try {
      const cleaned = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned) as SwarmPlan;
    } catch (e) {
      throw new Error("Failed to parse Swarm Orchestrator JSON output. " + rawResponse);
    }
  }
}
