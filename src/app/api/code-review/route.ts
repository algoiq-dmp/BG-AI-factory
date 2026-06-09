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
    if (!projectId) {
      return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 });
    }

    const isAuthorized = await verifyProjectOwnership(projectId, session);
    if (!isAuthorized) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const reviews = await prisma.codeReview.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error('Failed to fetch code reviews:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, reviews } = await request.json();
    if (!projectId || !reviews || !Array.isArray(reviews)) {
      return NextResponse.json({ success: false, error: 'projectId and reviews array are required' }, { status: 400 });
    }

    const isAuthorized = await verifyProjectOwnership(projectId, session);
    if (!isAuthorized) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    // Delete existing reviews for this project (optional, or we could just append)
    // For simplicity, we'll append, but in a real scenario we might want to deduplicate or just clear existing open ones.
    // Let's clear existing ones so that a new "generate" gives a fresh list.
    await prisma.codeReview.deleteMany({
      where: { projectId }
    });

    // Bulk insert new reviews
    const created = await prisma.codeReview.createMany({
      data: reviews.map((r: any) => ({
        projectId,
        file: r.file || 'unknown',
        title: r.title || 'Review Finding',
        description: r.description || '',
        severity: r.severity || 'low',
        status: r.status || 'open'
      }))
    });

    const newReviews = await prisma.codeReview.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, reviews: newReviews });
  } catch (error: any) {
    console.error('Failed to save code reviews:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
