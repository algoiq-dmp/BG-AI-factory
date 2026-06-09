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
    const limit = parseInt(searchParams.get('limit') || '50');

    let whereClause: any = {};
    if (projectId) {
      whereClause.projectId = projectId;
    } else {
      // If no specific project, only show activities for projects owned by the user or global system logs
      // Assuming for now they can see their own project logs
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      });
      if (user) {
         whereClause.OR = [
           { userId: user.id },
           { project: { userId: user.id } }
         ];
      }
    }

    const logs = await prisma.activityLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        project: { select: { name: true } },
        user: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('Failed to fetch activity logs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

