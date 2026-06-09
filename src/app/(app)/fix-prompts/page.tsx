'use client';

import React, { useState, useCallback } from 'react';
import {
  Wrench,
  Copy,
  Download,
  Check,
  ChevronDown,
  Sparkles,
  FileText,
  AlertCircle,
  Zap,
  Code2,
  Globe,
  Bot,
  BrainCircuit,
} from 'lucide-react';

/** Available platforms for fix prompt generation */
const PLATFORMS = [
  { id: 'cursor', name: 'Cursor', icon: Code2 },
  { id: 'bolt', name: 'Bolt', icon: Zap },
  { id: 'v0', name: 'V0', icon: Globe },
  { id: 'windsurf', name: 'Windsurf', icon: Code2 },
  { id: 'lovable', name: 'Lovable', icon: Sparkles },
  { id: 'claude', name: 'Claude', icon: Bot },
  { id: 'chatgpt', name: 'ChatGPT', icon: Bot },
  { id: 'gemini', name: 'Gemini', icon: BrainCircuit },
] as const;

/** Sample CRs for demonstration */
const SAMPLE_CRS = [
  { id: 'CR-1001', title: 'Update user authentication flow', priority: 'High', status: 'Open' },
  { id: 'CR-1002', title: 'Fix dashboard loading performance', priority: 'Critical', status: 'In Progress' },
  { id: 'CR-1003', title: 'Add dark mode toggle to settings', priority: 'Medium', status: 'Open' },
  { id: 'CR-1004', title: 'Resolve API rate limiting issues', priority: 'High', status: 'Open' },
  { id: 'CR-1005', title: 'Migrate database schema for v2', priority: 'Critical', status: 'Pending' },
  { id: 'CR-1006', title: 'Implement file upload compression', priority: 'Low', status: 'Open' },
];

/** Generates a mock platform-specific prompt for the given CR and platform */
function generatePrompt(crId: string, crTitle: string, platform: string): string {
  const platformInstructions: Record<string, string> = {
    cursor: `# Cursor AI Fix Prompt — ${crId}

## Context
You are working on a codebase that requires the following change request to be resolved:
**${crId}: ${crTitle}**

## Instructions
1. Analyze the relevant files in the current workspace related to this CR.
2. Identify the root cause of the issue described.
3. Propose a minimal, targeted fix that addresses the CR without introducing regressions.
4. Apply the changes using Cursor's inline editing capabilities.
5. Verify the fix compiles and passes existing tests.

## Constraints
- Follow existing code style and conventions.
- Do not refactor unrelated code.
- Add inline comments explaining non-obvious changes.
- Ensure backward compatibility.

## Expected Output
- Modified files with the fix applied.
- A brief summary of changes made.`,

    bolt: `# Bolt Fix Prompt — ${crId}

## Task
Resolve change request **${crId}: ${crTitle}**

## Approach
Use Bolt's rapid prototyping capabilities to:
1. Scaffold the fix within the existing project structure.
2. Generate the necessary component/module changes.
3. Wire up any new dependencies or imports.
4. Preview the result in the integrated browser.

## Guidelines
- Keep changes atomic and reversible.
- Use TypeScript strict mode.
- Follow the project's Tailwind CSS conventions.
- Test in the preview pane before finalizing.`,

    v0: `# V0 Fix Prompt — ${crId}

## Design Task
Implement a fix for **${crId}: ${crTitle}**

## Requirements
- Generate a React component or page update that resolves this CR.
- Use shadcn/ui components where applicable.
- Ensure responsive design (mobile-first).
- Match the existing dark theme palette.
- Include proper TypeScript types.

## Deliverables
- Updated component code with the fix.
- Any new UI elements needed.
- Accessibility attributes (aria labels, roles).`,

    windsurf: `# Windsurf Fix Prompt — ${crId}

## Objective
Address change request **${crId}: ${crTitle}** using Windsurf's AI-assisted development flow.

## Steps
1. Use Cascade to analyze the codebase for files related to this CR.
2. Identify dependencies and potential side effects.
3. Implement the fix with multi-file editing.
4. Run the integrated terminal to verify the build.
5. Commit with a descriptive message referencing ${crId}.

## Standards
- Adhere to ESLint and Prettier configurations.
- Maintain test coverage above current levels.
- Document any API changes.`,

    lovable: `# Lovable Fix Prompt — ${crId}

## Project Update
Fix **${crId}: ${crTitle}**

## Instructions
1. Navigate to the relevant feature in the Lovable project.
2. Use the visual editor or code mode to implement the fix.
3. Ensure the Supabase backend (if applicable) is updated.
4. Test the change in the integrated preview.
5. Deploy to staging for verification.

## Notes
- Preserve existing animations and transitions.
- Keep the design system consistent.
- Update any affected API routes.`,

    claude: `# Claude Fix Prompt — ${crId}

## System
You are a senior software engineer tasked with resolving change requests.

## Task
Resolve **${crId}: ${crTitle}**

## Instructions
Please analyze this change request and provide:

1. **Root Cause Analysis**: What is likely causing this issue?
2. **Proposed Fix**: Provide the exact code changes needed.
3. **Files to Modify**: List all files that need changes.
4. **Testing Strategy**: How should this fix be verified?
5. **Risk Assessment**: What could go wrong with this change?

## Format
Provide code changes as complete file contents with clear markers for what changed and why.`,

    chatgpt: `# ChatGPT Fix Prompt — ${crId}

You are helping resolve a software change request.

**CR ID**: ${crId}
**Title**: ${crTitle}

Please help me fix this by:

1. Understanding what needs to change based on the CR description.
2. Writing the corrected code for each affected file.
3. Explaining each change clearly.
4. Suggesting test cases to verify the fix.
5. Noting any potential breaking changes.

Use TypeScript/React best practices. Format code in markdown code blocks with filenames.`,

    gemini: `# Gemini Fix Prompt — ${crId}

## Context
Change Request: **${crId} — ${crTitle}**

## Request
Analyze and resolve this change request. Provide:

### Analysis
- Identify affected components and modules.
- Trace the data flow related to this issue.
- Pinpoint the exact location(s) requiring changes.

### Implementation
- Write production-ready TypeScript code.
- Follow React/Next.js best practices.
- Include error handling and edge cases.

### Verification
- Provide unit test additions/modifications.
- Describe manual testing steps.
- List acceptance criteria for this CR.

### Documentation
- Update any affected JSDoc comments.
- Note breaking changes (if any).
- Suggest follow-up improvements.`,
  };

  return platformInstructions[platform] || `# Fix Prompt for ${crId}\n\nNo template available for this platform.`;
}

/** Fix Prompts Generator page — AI generates platform-specific fix prompts for CRs */
export default function FixPromptsPage() {
  const [selectedCR, setSelectedCR] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('cursor');
  const [copied, setCopied] = useState(false);
  const [crDropdownOpen, setCrDropdownOpen] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  const activeCR = SAMPLE_CRS.find((cr) => cr.id === selectedCR);

  const handleSelectCR = useCallback(
    (crId: string) => {
      setSelectedCR(crId);
      setCrDropdownOpen(false);
      const cr = SAMPLE_CRS.find((c) => c.id === crId);
      if (cr) {
        setGeneratedPrompt(generatePrompt(cr.id, cr.title, selectedPlatform));
      }
    },
    [selectedPlatform]
  );

  const handleSelectPlatform = useCallback(
    (platformId: string) => {
      setSelectedPlatform(platformId);
      if (activeCR) {
        setGeneratedPrompt(generatePrompt(activeCR.id, activeCR.title, platformId));
      }
    },
    [activeCR]
  );

  const handleCopy = useCallback(async () => {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [generatedPrompt]);

  const handleDownload = useCallback(() => {
    if (!generatedPrompt || !activeCR) return;
    const blob = new Blob([generatedPrompt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fix-prompt-${activeCR.id}-${selectedPlatform}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedPrompt, activeCR, selectedPlatform]);

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'text-red-400';
      case 'High':
        return 'text-orange-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'Low':
        return 'text-blue-400';
      default:
        return 'text-[#8b9bb4]';
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#8b9bb4]">
      {/* Header */}
      <div className="border-b border-[#1e2532] bg-[#111622]/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20">
              <Wrench className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Fix Prompts Generator</h1>
              <p className="text-sm text-[#586c8f]">AI generates platform-specific fix prompts for your CRs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel — CR Selector + Platform Selector */}
          <div className="lg:col-span-4 space-y-6">
            {/* CR Selector */}
            <div className="rounded-xl border border-[#1e2532] bg-[#111622]/80 p-5">
              <h2 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-400" />
                Select Change Request
              </h2>

              {/* Dropdown trigger */}
              <div className="relative">
                <button
                  onClick={() => setCrDropdownOpen(!crDropdownOpen)}
                  className="w-full flex items-center justify-between rounded-lg border border-[#1e2532] bg-[#0b0e14] px-4 py-3 text-left text-sm transition-colors hover:border-purple-500/40 focus:outline-none focus:border-purple-500/60"
                >
                  <span className={activeCR ? 'text-white' : 'text-[#586c8f]'}>
                    {activeCR ? `${activeCR.id} — ${activeCR.title}` : 'Choose a CR...'}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#586c8f] transition-transform ${crDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown list */}
                {crDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full rounded-lg border border-[#1e2532] bg-[#111622] shadow-xl shadow-black/40 max-h-64 overflow-y-auto">
                    {SAMPLE_CRS.map((cr) => (
                      <button
                        key={cr.id}
                        onClick={() => handleSelectCR(cr.id)}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-purple-500/10 border-b border-[#1e2532] last:border-b-0 ${
                          selectedCR === cr.id ? 'bg-purple-500/10 text-white' : 'text-[#8b9bb4]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-purple-400">{cr.id}</span>
                          <span className={`text-xs ${priorityColor(cr.priority)}`}>{cr.priority}</span>
                        </div>
                        <p className="mt-1 text-[#8b9bb4] truncate">{cr.title}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected CR details */}
              {activeCR && (
                <div className="mt-4 rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-purple-400">{activeCR.id}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        activeCR.status === 'In Progress'
                          ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                          : activeCR.status === 'Pending'
                            ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                            : 'border-green-500/30 bg-green-500/10 text-green-400'
                      }`}
                    >
                      {activeCR.status}
                    </span>
                  </div>
                  <p className="text-sm text-white">{activeCR.title}</p>
                  <p className={`text-xs mt-1 ${priorityColor(activeCR.priority)}`}>
                    Priority: {activeCR.priority}
                  </p>
                </div>
              )}
            </div>

            {/* Platform Selector */}
            <div className="rounded-xl border border-[#1e2532] bg-[#111622]/80 p-5">
              <h2 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Target Platform
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  const isActive = selectedPlatform === platform.id;
                  return (
                    <button
                      key={platform.id}
                      onClick={() => handleSelectPlatform(platform.id)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all duration-200 ${
                        isActive
                          ? 'border-purple-500/40 bg-purple-500/10 text-purple-300 shadow-sm shadow-purple-500/10'
                          : 'border-[#1e2532] bg-[#0b0e14] text-[#586c8f] hover:border-purple-500/20 hover:text-[#8b9bb4]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {platform.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel — Generated Prompt */}
          <div className="lg:col-span-8">
            <div className="rounded-xl border border-[#1e2532] bg-[#111622]/80 h-full flex flex-col">
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-[#1e2532] px-5 py-4">
                <h2 className="text-sm font-medium text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  Generated Fix Prompt
                  {activeCR && (
                    <span className="ml-2 text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                      {activeCR.id} → {PLATFORMS.find((p) => p.id === selectedPlatform)?.name}
                    </span>
                  )}
                </h2>
                {generatedPrompt && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 rounded-lg border border-[#1e2532] bg-[#0b0e14] px-3 py-1.5 text-xs text-[#8b9bb4] transition-all hover:border-purple-500/30 hover:text-purple-300"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-400" />
                          <span className="text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 rounded-lg border border-[#1e2532] bg-[#0b0e14] px-3 py-1.5 text-xs text-[#8b9bb4] transition-all hover:border-purple-500/30 hover:text-purple-300"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                  </div>
                )}
              </div>

              {/* Prompt output or empty state */}
              <div className="flex-1 p-5">
                {generatedPrompt ? (
                  <textarea
                    readOnly
                    value={generatedPrompt}
                    className="w-full h-full min-h-[500px] rounded-lg border border-[#1e2532] bg-[#0b0e14] p-4 text-sm text-[#8b9bb4] font-mono leading-relaxed resize-none focus:outline-none focus:border-purple-500/40 selection:bg-purple-500/30"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 mb-4">
                      <Wrench className="h-8 w-8 text-purple-400/60" />
                    </div>
                    <h3 className="text-base font-medium text-white mb-1">Select a CR to generate fix prompts</h3>
                    <p className="text-sm text-[#586c8f] max-w-sm">
                      Choose a change request from the left panel and pick your target platform to generate
                      a tailored fix prompt.
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-xs text-[#586c8f]">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Prompts are optimized for each platform&apos;s AI capabilities</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
