'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveDocument(projectId: string, title: string, content: string, type: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  // Verify project ownership (if client)
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project not found");
  if (session.user.role === 'CLIENT' && project.userId !== (session.user as any).id) {
    throw new Error("Unauthorized access to project");
  }

  // Save Document
  const doc = await prisma.document.create({
    data: {
      title,
      content,
      type,
      projectId,
    }
  });

  revalidatePath(`/${projectId}/documents`);
  return { success: true, documentId: doc.id };
}
