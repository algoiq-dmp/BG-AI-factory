import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return new NextResponse('Missing projectId', { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial connection event
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'connected' })}\n\n`));

      try {
        const files = await prisma.codeFile.findMany({
          where: { projectId },
          orderBy: { createdAt: 'desc' }
        });

        let streamIndex = 0;
        
        const intervalId = setInterval(() => {
          if (streamIndex >= files.length) {
            clearInterval(intervalId);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'COMPLETE' })}\n\n`));
            controller.close();
            return;
          }

          const file = files[streamIndex];
          const score = 100 - (file.retryCount * 10);
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'METRIC',
            data: {
              fileName: file.path,
              score: score,
              quality: score > 80 ? 'EXCELLENT' : score > 50 ? 'GOOD' : 'POOR',
              timestamp: new Date().toISOString()
            }
          })}\n\n`));
          
          streamIndex++;
        }, 3000);

        req.signal.addEventListener('abort', () => {
          clearInterval(intervalId);
        });
      } catch (error) {
        console.error("SSE Streaming Error:", error);
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
