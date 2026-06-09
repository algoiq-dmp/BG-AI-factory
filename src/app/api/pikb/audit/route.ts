import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PIKBEngine } from "@/lib/pikb-engine";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { projectId } = await req.json();
    if (!projectId) return new NextResponse("Missing projectId", { status: 400 });

    // Trigger Stage 8 & 9 manually
    await PIKBEngine.runContinuousAudit(projectId);
    await PIKBEngine.evaluateReadiness(projectId);

    return NextResponse.json({ success: true, message: 'Audit completed successfully.' });
  } catch (error: any) {
    console.error('PIKB Audit Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
