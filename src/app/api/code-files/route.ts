import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyProjectOwnership } from '@/lib/security';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const path = searchParams.get('path');
    
    if (!projectId) {
      return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 });
    }

    const isAuthorized = await verifyProjectOwnership(projectId, session);
    if (!isAuthorized) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const whereClause: any = { projectId };
    if (path) whereClause.path = path;

    const files = await prisma.codeFile.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ success: true, files });
  } catch (error: any) {
    console.error('Failed to fetch code files:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, path, content, language } = await request.json();
    if (!projectId || !path || !content) {
      return NextResponse.json({ success: false, error: 'projectId, path, and content are required' }, { status: 400 });
    }

    const isAuthorized = await verifyProjectOwnership(projectId, session);
    if (!isAuthorized) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    // Upsert the code file based on projectId and path
    // Since we don't have a unique constraint on [projectId, path], we do findFirst then update/create
    let file = await prisma.codeFile.findFirst({
      where: { projectId, path }
    });

    if (file) {
      file = await prisma.codeFile.update({
        where: { id: file.id },
        data: { content, language: language || 'typescript', status: 'GENERATED' }
      });
    } else {
      file = await prisma.codeFile.create({
        data: {
          projectId,
          path,
          content,
          language: language || 'typescript',
          status: 'GENERATED'
        }
      });
    }

    return NextResponse.json({ success: true, file });
  } catch (error: any) {
    console.error('Failed to save code file:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
