import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyProjectOwnership } from "@/lib/security";
import { PIKBEngine } from "@/lib/pikb-engine";
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId, fileId } = await req.json();

    if (!projectId || !/^[0-9a-fA-F-]+$/.test(projectId)) {
      return NextResponse.json({ error: "Invalid or missing projectId" }, { status: 400 });
    }

    const isAuthorized = await verifyProjectOwnership(projectId, session);
    if (!isAuthorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const codeFile = await prisma.codeFile.findUnique({ where: { id: fileId } });
    if (!codeFile) return NextResponse.json({ error: "File not found" }, { status: 404 });

    // 1. Create a temporary directory for the Docker Sandbox
    const tmpDir = path.join(process.cwd(), '.sandbox', projectId);
    await fs.mkdir(tmpDir, { recursive: true });

    // 2. Write the file from the DB to the host filesystem temporarily
    const tmpFilePath = path.join(tmpDir, path.basename(codeFile.path));
    await fs.writeFile(tmpFilePath, codeFile.content);

    // 3. Construct Secure Docker command
    // We mount the temp dir to /app and run a syntax check using Node.js
    // SECURITY: --network none air-gaps the container. --read-only prevents malicious OS modifications.
    const dockerCmd = `docker run --rm --network none --read-only -v "${tmpDir}:/app" node:alpine node -c "/app/${path.basename(codeFile.path)}"`;

    let executionOutput = '';
    let status = 'SUCCESS';

    try {
      const { stdout, stderr } = await execAsync(dockerCmd, { timeout: 5000 });
      executionOutput = stdout || stderr || 'Syntax OK.';
    } catch (err: any) {
      status = 'FAILED';
      executionOutput = err.stderr || err.message || 'Execution Failed due to container error or timeout.';
    }

    // 4. Cleanup temp file
    await fs.unlink(tmpFilePath).catch(() => {});

    // 5. Circuit Breaker Logic & DB Update
    let newStatus = status === 'SUCCESS' ? 'REVIEWED' : 'FAILED';
    let newRetryCount = codeFile.retryCount;
    
    if (status === 'FAILED') {
      newRetryCount += 1;
      if (newRetryCount >= 3) {
        newStatus = 'CIRCUIT_TRIPPED';
        executionOutput = 'CIRCUIT TRIPPED: AI failed 3 times. Escalating to human intervention.';
      }
    } else {
      // Success resets the breaker
      newRetryCount = 0;
    }

    await prisma.codeFile.update({
      where: { id: fileId },
      data: { status: newStatus, retryCount: newRetryCount }
    });

    if (newStatus === 'REVIEWED') {
      PIKBEngine.runContinuousAudit(projectId).catch(console.error);
    }

    return NextResponse.json({ success: true, output: executionOutput, status: newStatus, retryCount: newRetryCount });
  } catch (error: any) {
    // If Docker isn't installed on the host machine, it will throw here.
    return NextResponse.json({ 
      error: "Docker Sandbox Execution Failed. Ensure Docker Desktop is running on the host.",
      details: error.message
    }, { status: 500 });
  }
}
