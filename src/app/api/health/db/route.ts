import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Perform a lightweight query to check if DB is reachable
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'connected' }, { status: 200 });
  } catch (error) {
    console.error('Database Health Check Failed:', error);
    return NextResponse.json({ status: 'error' }, { status: 503 });
  }
}
