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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== 'ADMIN') {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Fetch users for admin management
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        // Since we don't have loginId, plan, expires, status in Prisma by default, map defaults
        // We'll pass the whole object so the UI can adapt. We can use role as proxy for plan for now.
        createdAt: true,
      }
    });

    // Fetch system-wide activity logs
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { select: { email: true } },
      }
    });

    return NextResponse.json({ success: true, users, logs });
  } catch (error: any) {
    console.error('Failed to fetch admin data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
