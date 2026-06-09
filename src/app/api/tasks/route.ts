import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyProjectOwnership } from "@/lib/security";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

    const isAuthorized = await verifyProjectOwnership(projectId, session);
    if (!isAuthorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, title, description, status = 'TODO', priority = 'MEDIUM', tokens = 0 } = body;

    if (!projectId) return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    const isAuthorized = await verifyProjectOwnership(projectId, session);
    if (!isAuthorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        status,
        priority,
        tokens
      }
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body;
    
    // For PATCH, we must look up the task first to check ownership of the parent project
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    const isAuthorized = await verifyProjectOwnership(existingTask.projectId, session);
    if (!isAuthorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const task = await prisma.task.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
