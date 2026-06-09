import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, pipelineStatus, progress } = await req.json();

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(pipelineStatus && { pipelineStatus }),
        ...(progress !== undefined && { progress }),
      }
    });

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { pipelineStatus: true, progress: true }
    });

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
