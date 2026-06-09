import fs from 'fs';
import path from 'path';
import { SwarmOrchestrator } from './swarm-orchestrator';

export class SwarmCodeGenerator {
  
  /**
   * Parses markdown output looking for code blocks with a file path.
   * Example format expected from AI:
   * ```typescript filepath=src/components/Button.tsx
   * const Button = () => <button>Click</button>;
   * ```
   */
  private static parseAndWriteCodeBlocks(output: string, projectId: string): string[] {
    const sandboxDir = path.join(process.cwd(), '.data', 'projects', projectId, 'source');
    if (!fs.existsSync(sandboxDir)) fs.mkdirSync(sandboxDir, { recursive: true });

    const regex = /```\w+\s+filepath=([^\s\n]+)\n([\s\S]*?)```/g;
    const writtenFiles: string[] = [];
    let match;

    while ((match = regex.exec(output)) !== null) {
      const filepath = match[1];
      const code = match[2];

      // Ensure the path is safely inside the sandbox
      const safePath = path.normalize(filepath).replace(/^(\.\.(\/|\\|$))+/, '');
      const fullPath = path.join(sandboxDir, safePath);

      // Create directories if needed
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      // Write the file
      fs.writeFileSync(fullPath, code.trim());
      writtenFiles.push(safePath);
    }

    return writtenFiles;
  }

  static async executeFrontendFactory(projectId: string, previousContext: string, tasks: string[]) {
    const systemPrompt = `You are the Master Frontend Factory Swarm Agent.
Your job is to generate production-ready frontend code.

IMPORTANT INSTRUCTION: 
Adapt the frontend framework exactly as requested in the "Previous Architecture Context". If it specifies React+Vite, generate Vite structures. If it specifies Next.js, use Next.js.
If not specified, default to Next.js 14 App Router + TailwindCSS.

OUTPUT FORMAT:
You MUST output all code wrapped in markdown codeblocks. 
The very first line of the codeblock MUST contain the filepath exactly like this:
\`\`\`typescript filepath=src/components/ui/Button.tsx
export const Button = () => <button>Click</button>;
\`\`\`
Do this for every single file you generate. Do not wrap the filepath in quotes.`;

    const prompt = `
Tasks to complete:
${tasks.map(t => `- ${t}`).join('\n')}

Previous Architecture Context:
${previousContext || 'Use best practices.'}

Generate all required frontend components, pages, and utilities.
`;

    const result = await SwarmOrchestrator.routeToModel(
      'deepseek', 
      prompt, 
      systemPrompt, 
      projectId, 
      'deepseek-coder' // User approved using deepseek-coder
    );

    const filesGenerated = this.parseAndWriteCodeBlocks(result, projectId);
    
    return `Frontend Factory execution complete.\nFiles generated:\n${filesGenerated.map(f => `- ${f}`).join('\n')}\n\nRaw Output:\n${result.substring(0, 1000)}...`;
  }

  static async executeBackendFactory(projectId: string, previousContext: string, tasks: string[]) {
    const systemPrompt = `You are the Master Backend Factory Swarm Agent.
Your job is to generate enterprise-grade backend APIs, Services, and Repositories following SOLID principles.

OUTPUT FORMAT:
You MUST output all code wrapped in markdown codeblocks. 
The very first line of the codeblock MUST contain the filepath exactly like this:
\`\`\`typescript filepath=src/app/api/users/route.ts
export async function GET() {}
\`\`\`
Do this for every single file you generate. Do not wrap the filepath in quotes.`;

    const prompt = `
Tasks to complete:
${tasks.map(t => `- ${t}`).join('\n')}

Previous Architecture Context:
${previousContext || 'Use Node.js/Next.js Route Handlers.'}

Generate all required APIs, middleware, and services.
`;

    const result = await SwarmOrchestrator.routeToModel(
      'deepseek', 
      prompt, 
      systemPrompt, 
      projectId, 
      'deepseek-coder' // User approved using deepseek-coder
    );

    const filesGenerated = this.parseAndWriteCodeBlocks(result, projectId);
    
    return `Backend Factory execution complete.\nFiles generated:\n${filesGenerated.map(f => `- ${f}`).join('\n')}\n\nRaw Output:\n${result.substring(0, 1000)}...`;
  }
}
