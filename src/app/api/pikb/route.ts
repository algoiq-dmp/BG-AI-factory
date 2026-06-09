import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) return new NextResponse("Missing projectId", { status: 400 });

    const state = await prisma.pIKBState.findUnique({
      where: { projectId },
      include: {
        project: { select: { name: true, description: true } }
      }
    });
    
    const drift = await prisma.pIKBDrift.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    const risks = await prisma.pIKBRisk.findMany({
      where: { projectId, status: 'OPEN' }
    });

    return NextResponse.json({ success: true, state, drift, risks });
  } catch (error: any) {
    console.error('PIKB GET Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
