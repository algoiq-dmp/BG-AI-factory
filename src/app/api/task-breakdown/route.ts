import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 });
    }

    const doc = await prisma.document.findFirst({
      where: {
        projectId,
        type: 'SPRINT_PLAN'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (doc && doc.content) {
      return NextResponse.json({ success: true, sprints: JSON.parse(doc.content) });
    }

    return NextResponse.json({ success: true, sprints: [] });
  } catch (error: any) {
    console.error('Failed to fetch sprint plan:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, sprints } = await request.json();
    if (!projectId || !sprints) {
      return NextResponse.json({ success: false, error: 'projectId and sprints are required' }, { status: 400 });
    }

    // Upsert the sprint plan document
    let doc = await prisma.document.findFirst({
      where: { projectId, type: 'SPRINT_PLAN' }
    });

    if (doc) {
      doc = await prisma.document.update({
        where: { id: doc.id },
        data: { content: JSON.stringify(sprints) }
      });
    } else {
      doc = await prisma.document.create({
        data: {
          title: 'Sprint Plan',
          type: 'SPRINT_PLAN',
          content: JSON.stringify(sprints),
          projectId
        }
      });
    }

    return NextResponse.json({ success: true, document: doc });
  } catch (error: any) {
    console.error('Failed to save sprint plan:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
