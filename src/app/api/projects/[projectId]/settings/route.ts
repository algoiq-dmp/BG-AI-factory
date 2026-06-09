import { NextResponse } from 'next/server';
import { saveProjectApiKeys } from '@/lib/db/project-settings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: (session.user as any).id }
    });
    
    if (!project) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { apiKeys } = await req.json();

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });
    }

    if (!apiKeys) {
      return NextResponse.json({ success: false, error: 'apiKeys object is required' }, { status: 400 });
    }

    // Clean up empty strings so we don't overwrite with empty values if they just leave the field blank
    const cleanedKeys = Object.fromEntries(
      Object.entries(apiKeys).filter(([_, v]) => v !== '')
    );

    await saveProjectApiKeys(projectId, cleanedKeys);

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    console.error('[Project Settings API] Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
