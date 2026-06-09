/**
 * @file API Route: /api/projects
 * @description CRUD operations for user projects
 * @methods GET (list projects), POST (create project)
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateRequest, CreateProjectSchema, apiError } from '@/lib/validators';

/**
 * GET /api/projects — List all projects for the authenticated user
 * @returns {Object} { success: boolean, projects: Project[] }
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id || session.user.email || 'demo-user';

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { documents: true, tasks: true, codeFiles: true, knowledgeNodes: true }
        }
      }
    });

    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    console.error('[API] GET /api/projects error:', error.message);
    return NextResponse.json({ success: false, error: 'Failed to fetch projects' }, { status: 500 });
  }
}

/**
 * POST /api/projects — Create a new project
 * @body { name: string, description?: string, domainTemplate?: string }
 * @returns {Object} { success: boolean, project: Project }
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = validateRequest(CreateProjectSchema, body);
    if (!validation.success) {
      return NextResponse.json(apiError(`Validation failed: ${validation.errors?.join(', ')}`), { status: 400 });
    }
    const { name, description, domainTemplate } = validation.data!;

    const userId = (session.user as any).id || session.user.email || 'demo-user';

    // Ensure user exists in DB
    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email: session.user.email || `${userId}@factory.local`,
        name: session.user.name || 'Factory User',
        role: 'CLIENT',
      },
      update: {},
    });

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description || '',
        domainTemplate: domainTemplate || 'general',
        userId,
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error('[API] POST /api/projects error:', error.message);
    return NextResponse.json({ success: false, error: 'Failed to create project' }, { status: 500 });
  }
}

/**
 * DELETE /api/projects — Delete a project by ID
 * @body { projectId: string }
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Project ID required' }, { status: 400 });
    }

    const userId = (session.user as any).id || session.user.email || 'demo-user';
    const result = await prisma.project.deleteMany({ 
      where: { 
        id: projectId,
        userId: userId
      } 
    });
    
    if (result.count === 0) {
      return NextResponse.json({ success: false, error: 'Project not found or forbidden' }, { status: 403 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API] DELETE /api/projects error:', error.message);
    return NextResponse.json({ success: false, error: 'Failed to delete project' }, { status: 500 });
  }
}
