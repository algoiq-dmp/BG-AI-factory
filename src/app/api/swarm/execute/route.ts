import { NextResponse } from 'next/server';
import { SwarmOrchestrator, ProjectContext } from '@/lib/ai/swarm-orchestrator';
import { SwarmExecutor } from '@/lib/ai/swarm-executor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, projectName, projectDescription, domain, action, phaseId } = body;

    if (!projectId || !projectName || !projectDescription) {
      return NextResponse.json(
        { success: false, error: 'Missing required project context (id, name, description).' },
        { status: 400 }
      );
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: (session.user as any).id }
    });
    
    if (!project) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const context: ProjectContext = {
      id: projectId,
      name: projectName,
      description: projectDescription,
      domain: domain || 'General Software',
    };

    if (action === 'initialize') {
      console.log(`[Swarm API] Initializing 300+ Agent Swarm for Project: ${projectName}`);
      
      const swarmPlan = await SwarmOrchestrator.initializeProjectSwarm(context);
      SwarmExecutor.savePlan(projectId, swarmPlan);

      return NextResponse.json({
        success: true,
        data: swarmPlan
      });
    }

    if (action === 'executePhase') {
      if (!phaseId) return NextResponse.json({ success: false, error: 'phaseId required' }, { status: 400 });
      console.log(`[Swarm API] Triggering Phase ${phaseId}`);
      
      const result = await SwarmExecutor.executePhase(projectId, phaseId);
      
      // Return updated plan so UI reflects status change
      const updatedPlan = SwarmExecutor.loadPlan(projectId);

      return NextResponse.json({
        success: true,
        result,
        updatedPlan
      });
    }

    return NextResponse.json(
      { success: false, error: `Unknown action: ${action}` },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('[Swarm API] Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
