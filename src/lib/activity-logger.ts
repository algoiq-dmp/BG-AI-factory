import { prisma } from './prisma';

interface LogOptions {
  action: string;
  details?: string | Record<string, any>;
  status?: string;
  projectId?: string;
  userId: string;
}

export async function logActivity({ action, details, status = 'success', projectId, userId }: LogOptions) {
  try {
    return await prisma.activityLog.create({
      data: {
        action,
        details: typeof details === 'string' ? details : JSON.stringify(details),
        status,
        projectId,
        userId
      }
    });
  } catch (error) {
    console.error('[Activity Logger] Failed to write log:', error);
  }
}
