import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const backupDir = path.join(process.cwd(), '.backups');
    
    await fs.mkdir(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilePath = path.join(backupDir, `backup_${timestamp}.db`);

    // Ensure the DB exists before copying
    try {
      await fs.access(dbPath);
    } catch {
      return NextResponse.json({ success: false, error: 'Database file not found' }, { status: 404 });
    }

    await fs.copyFile(dbPath, backupFilePath);

    return NextResponse.json({ 
      success: true, 
      message: 'Backup created successfully', 
      path: backupFilePath 
    });

  } catch (error: any) {
    console.error('Backup API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
