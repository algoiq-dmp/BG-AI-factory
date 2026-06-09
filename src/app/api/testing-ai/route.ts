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
        type: 'TEST_RESULTS'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (doc && doc.content) {
      return NextResponse.json({ success: true, results: JSON.parse(doc.content) });
    }

    return NextResponse.json({ success: true, results: [] });
  } catch (error: any) {
    console.error('Failed to fetch test results:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, results } = await request.json();
    if (!projectId || !results) {
      return NextResponse.json({ success: false, error: 'projectId and results are required' }, { status: 400 });
    }

    // Upsert the test results document
    let doc = await prisma.document.findFirst({
      where: { projectId, type: 'TEST_RESULTS' }
    });

    if (doc) {
      doc = await prisma.document.update({
        where: { id: doc.id },
        data: { content: JSON.stringify(results) }
      });
    } else {
      doc = await prisma.document.create({
        data: {
          title: 'Test Results',
          type: 'TEST_RESULTS',
          content: JSON.stringify(results),
          projectId
        }
      });
    }

    return NextResponse.json({ success: true, document: doc });
  } catch (error: any) {
    console.error('Failed to save test results:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
