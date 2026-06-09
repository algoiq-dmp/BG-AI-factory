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

    const assessment = await prisma.mCQAssessment.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });

    if (assessment) {
      return NextResponse.json({ 
        success: true, 
        assessment: {
          id: assessment.id,
          score: assessment.score,
          total: assessment.total,
          questions: JSON.parse(assessment.questions),
          gaps: assessment.gaps ? JSON.parse(assessment.gaps) : []
        }
      });
    }

    return NextResponse.json({ success: true, assessment: null });
  } catch (error: any) {
    console.error('Failed to fetch MCQ assessment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, score, total, questions, gaps } = await request.json();
    if (!projectId || !questions) {
      return NextResponse.json({ success: false, error: 'projectId and questions are required' }, { status: 400 });
    }

    const assessment = await prisma.mCQAssessment.create({
      data: {
        projectId,
        score: score || 0,
        total: total || questions.length,
        questions: JSON.stringify(questions),
        gaps: gaps ? JSON.stringify(gaps) : null
      }
    });

    return NextResponse.json({ success: true, assessment });
  } catch (error: any) {
    console.error('Failed to save MCQ assessment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
