import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

// Initialize DeepSeek using the OpenAI SDK
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // 1. Fetch Hard Metrics from Database
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: true,
        codeReviews: true,
        codeFiles: true,
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // 2. Calculate Hard Statistics
    const tasks = project.tasks;
    const completedTasks = tasks.filter((t: any) => t.status === 'DONE').length;
    const pendingTasks = tasks.filter((t: any) => t.status !== 'DONE').length;
    
    // Get activity logs from the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogs = await prisma.activityLog.findMany({
      where: {
        projectId,
        createdAt: { gte: yesterday }
      }
    });
    
    const tasksToday = recentLogs.filter((log: any) => log.action === 'TASK_COMPLETED').length;
    const commits = recentLogs.filter((log: any) => log.action === 'CODE_GENERATED').length;
    
    const codeReviews = project.codeReviews;
    const openReviews = codeReviews.filter((cr: any) => cr.status === 'open');
    const criticalRisks = openReviews.filter((cr: any) => cr.severity === 'critical').length;
    const mediumRisks = openReviews.filter((cr: any) => cr.severity === 'high' || cr.severity === 'medium').length;
    const lowRisks = openReviews.filter((cr: any) => cr.severity === 'low').length;
    
    const untestedModules = project.codeFiles.filter((f: any) => f.status === 'GENERATED').length;

    const baseHealthScore = Math.max(0, 100 - (criticalRisks * 10) - (mediumRisks * 2) - (untestedModules * 1));

    // Combine hard metrics payload
    const hardMetrics = {
      healthScore: baseHealthScore,
      tasksCompleted: completedTasks,
      tasksPending: pendingTasks,
      criticalRisks,
      mediumRisks,
      lowRisks,
      untestedModules,
      tasksToday,
      commits,
      recentLogsCount: recentLogs.length,
      projectStatus: project.status,
      projectProgress: project.progress
    };

    // 3. Generate Soft Metrics using DeepSeek V4 Pro
    let aiInsights = {
      EXECUTIVE_SUMMARY: "Project progressing normally. Analyzing recent metrics...",
      DELIVERY_PREDICTION: { expectedCompletion: "TBD", onTimeProb: 80, delayProb: 20 },
      CTO_ADVICE: [
        { text: "Review open code reviews", impact: "High", effort: "Medium", priority: "High" }
      ],
      FUTURE_PREDICTION: ["Potential testing bottleneck"],
      CEO_STRATEGIC_ADVICE: ["Ensure QA phase is resourced adequately"]
    };

    if (process.env.DEEPSEEK_API_KEY) {
      try {
        const prompt = `You are the AI CEO and CTO of a software project. Review the following hard telemetry data for this project and generate insightful, realistic executive summaries, advice, and predictions.
        
Project Telemetry:
${JSON.stringify(hardMetrics, null, 2)}

Respond with a strictly formatted JSON object containing ONLY the following keys:
- EXECUTIVE_SUMMARY: A 2-3 sentence paragraph summarizing the project's current state.
- DELIVERY_PREDICTION: An object with { "expectedCompletion": "Month Day", "onTimeProb": number (0-100), "delayProb": number (0-100) }
- CTO_ADVICE: An array of 3-4 objects, each with { "text": "Advice string", "impact": "High/Medium/Low", "effort": "High/Medium/Low", "priority": "High/Medium/Low" }
- FUTURE_PREDICTION: An array of 2-3 strings predicting future technical or business risks.
- CEO_STRATEGIC_ADVICE: An array of 3-4 strings with strategic directives for the team.

Do not wrap the JSON in markdown code blocks. Output raw JSON only.`;

        const response = await openai.chat.completions.create({
          model: 'deepseek-v4-pro',
          messages: [
            { role: 'system', content: 'You are a precise JSON-generating AI orchestrator.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        });

        const content = response.choices[0].message.content;
        if (content) {
          const parsed = JSON.parse(content);
          aiInsights = { ...aiInsights, ...parsed };
        }
      } catch (aiError) {
        console.error("DeepSeek generation failed, falling back to default insights:", aiError);
      }
    }

    // 4. Return Full Telemetry Payload
    return NextResponse.json({
      success: true,
      data: {
        hardMetrics,
        insights: aiInsights
      }
    });

  } catch (error) {
    console.error("Failed to generate CEO dashboard data:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
