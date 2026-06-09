import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user tokens
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { karmaTokens: true }
    });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    
    let projectStats = null;
    let recentDocs: any[] = [];

    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { pipelineStatus: true, progress: true }
      });
      projectStats = project;

      recentDocs = await prisma.document.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, title: true, type: true, createdAt: true }
      });
    }

    return NextResponse.json({ 
      success: true, 
      tokens: user?.karmaTokens || 0,
      projectStats,
      recentDocs
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
