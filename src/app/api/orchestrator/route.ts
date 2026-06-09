import { NextResponse } from 'next/server';
import { AIModelRouter } from '@/lib/ai/router';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PIKBEngine } from "@/lib/pikb-engine";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { stepId, stepName, kbContext, apiKey, model = 'deepseek' } = body;

    console.log(`[Orchestrator] Executing Step ${stepId}: ${stepName}`);

    // Generate the specific prompt for the current step in the 27-step pipeline
    const systemPrompt = `You are the Bhagvat Gita AI Engine. You are executing Step ${stepId}: ${stepName} of the 27-step Auto-Intel pipeline. 
Your goal is to provide enterprise-grade, highly structured JSON output based on the provided Knowledge Base (KB) context.`;

    const userPrompt = `
Based on the following Knowledge Base context, execute the task for '${stepName}'.
Return ONLY valid JSON, without any markdown formatting or surrounding text.

KB Context:
${JSON.stringify(kbContext, null, 2)}

Task requirements for ${stepName}:
- Identify critical missing elements, risks, or architecture components based on this specific step.
- Return a JSON object with a 'status' field (success/warning), and a 'data' field containing your analysis.
`;

    // Execute via the Dynamic Router
    const aiResponseText = await AIModelRouter.execute({
      model,
      prompt: userPrompt,
      systemPrompt,
      apiKey,
      temperature: 0.2 // Low temperature for consistent JSON output
    });

    // Attempt to parse the response as JSON
    let parsedResponse;
    try {
      // Remove any potential markdown code blocks the AI might have wrapped the JSON in
      const cleanedText = aiResponseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch (e) {
      console.warn(`[Orchestrator] Failed to parse JSON for Step ${stepId}. Returning raw text.`);
      parsedResponse = {
        status: 'warning',
        data: { rawResponse: aiResponseText, error: 'Failed to parse structured JSON.' }
      };
    }

    // PIKB Rule 4 & 8: Every feature/step completion triggers audit
    // We run it asynchronously so it doesn't block the UI response
    const projectId = kbContext?.projectId || '';
    if (projectId) {
      PIKBEngine.runContinuousAudit(projectId).catch(console.error);
      PIKBEngine.evaluateReadiness(projectId).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      stepId,
      stepName,
      result: parsedResponse
    });

  } catch (error: any) {
    console.error('[Orchestrator] Pipeline Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
