import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyProjectOwnership } from "@/lib/security";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    // IDOR Protection
    const isAuthorized = await verifyProjectOwnership(projectId, session);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error('Documents API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, title, type, content } = await req.json();
    if (!projectId || !title || !type) {
      return NextResponse.json({ success: false, error: 'projectId, title, and type are required' }, { status: 400 });
    }

    // IDOR Protection
    const isAuthorized = await verifyProjectOwnership(projectId, session);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    let doc = await prisma.document.findFirst({
      where: { projectId, title, type }
    });

    if (doc) {
      doc = await prisma.document.update({
        where: { id: doc.id },
        data: { content }
      });
    } else {
      doc = await prisma.document.create({
        data: { projectId, title, type, content }
      });
    }

    return NextResponse.json({ success: true, document: doc });
  } catch (error: any) {
    console.error('Documents POST Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
