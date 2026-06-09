import { NextResponse } from 'next/server';
import { AIModelRouter } from '@/lib/ai/router';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateRequest, ChatMessageSchema, apiError } from '@/lib/validators';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = validateRequest(ChatMessageSchema, body);
    if (!validation.success) {
      return NextResponse.json(apiError(`Validation failed: ${validation.errors?.join(', ')}`), { status: 400 });
    }
    const { messages } = body;

    // Check tokens
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.karmaTokens < 2) {
      return NextResponse.json({ error: "Insufficient Karma Tokens." }, { status: 402 });
    }

    // Deduct 2 Karma Tokens for a chat turn
    await prisma.user.update({
      where: { email: session.user.email },
      data: { karmaTokens: { decrement: 2 } }
    });

    const systemPrompt = `You are a world-class Product Manager AI. 
Your goal is to perform Requirement Discovery. 
The user will pitch an idea. Ask 1-2 highly intelligent, clarifying questions to lock down the scope, tech stack, or business logic. 
If you feel you have enough information after a few turns, say exactly this phrase: "[DISCOVERY_COMPLETE]" followed by a consolidated summary of the requirements.`;

    // Convert messages array to a single text prompt for the router
    const conversation = messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

    const userPrompt = `
Conversation History:
${conversation}

Respond as the AI Product Manager.
`;

    const aiResponseText = await AIModelRouter.execute({
      model: 'deepseek',
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.7
    });

    return NextResponse.json({ success: true, message: aiResponseText });
  } catch (error: any) {
    console.error('[Discovery Error]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
