'use client';

/**
 * @file Help Guide Page
 * @description 10-phase interactive workflow guide with power tips, collapsible phases,
 *              clickable navigation to routes, and Quick Start flow.
 */
import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, Sparkles, Rocket, Shield, Brain, Zap, Target, ArrowRight, CheckCircle, Download, Pencil, Settings } from 'lucide-react';

const WORKFLOW_STEPS = [
  {
    phase: 'Phase 1 — Ideation & Define', color: '#f59e0b', emoji: '💡',
    steps: [
      { route: '/start', label: 'Start Project', desc: 'Define your idea, tech stack, and blueprint. The MORE detail you enter, the better AI output.' },
      { route: '/geeta-guidance', label: 'Geeta Guidance', desc: 'Ask Krishna for strategic advice — "Is this the right approach?", "What am I missing?"' },
    ],
    tip: '🔑 Secret: Add flow diagrams, revenue model, and target user details — AI uses EVERY word you provide.',
  },
  {
    phase: 'Phase 2 — Analyze & Build KB', color: '#6366f1', emoji: '🧠',
    steps: [
      { route: '/mcq', label: '① AI Suggestions (Accept/Reject)', desc: 'AI generates concern cards — accept to add to KB, reject to skip.' },
      { route: '/mcq', label: '② MCQ Analysis (Optional)', desc: 'Unlocks at 75% KB data. Answer MCQs or skip to Auto Intelligence.' },
      { route: '/knowledgebase', label: 'Review KB', desc: 'Review and edit the enriched KB — this is your project brain.' },
    ],
    tip: '🔑 Secret: Accept suggestions first, then MCQs are optional. Rich KB = better outputs everywhere.',
  },
  {
    phase: 'Phase 3 — Summarize & Auto Intel', color: '#8b5cf6', emoji: '📊',
    steps: [
      { route: '/summary', label: 'Project Summary', desc: '30-point executive summary auto-generated from KB.' },
      { route: '/auto-intelligence', label: 'Auto Intelligence (27 Steps)', desc: 'Autonomous 27-step pipeline: scans, audit, testing, SOPs, prompts — fully automated.' },
    ],
    tip: '🔑 Secret: Auto Intelligence runs 27 steps automatically — just click Start and review results.',
  },
  {
    phase: 'Phase 4 — Requirement Intelligence', color: '#ec4899', emoji: '🔍',
    steps: [
      { route: '/analysis', label: 'Requirement Intel', desc: 'Deep-scan: Ambiguity, Missing, Dependency, Security checks.' },
      { route: '/board', label: 'User Stories', desc: 'Auto-generate Agile user stories with acceptance criteria.' },
      { route: '/competitive-analysis', label: 'Competitive Analysis', desc: 'SWOT, market positioning, competitor mapping.' },
      { route: '/feature-engine', label: 'Feature Engine', desc: 'Toggle features on/off with MoSCoW prioritization.' },
    ],
    tip: '🔑 Secret: Run Requirement Intel AFTER Auto Intelligence for the deepest analysis.',
  },
  {
    phase: 'Phase 5 — Architecture & Design', color: '#10b981', emoji: '🏗️',
    steps: [
      { route: '/architecture', label: 'Solution Architect', desc: 'HLD + LLD auto-generated from your KB.' },
      { route: '/backend-ai', label: 'API Blueprint', desc: 'RESTful endpoints with request/response schemas.' },
      { route: '/database-ai', label: 'Database Designer', desc: 'Normalized schema with types, PKs, FKs, indexes.' },
      { route: '/frontend-ai', label: 'Frontend AI', desc: 'Component architecture and screen-by-screen specs.' },
      { route: '/hub', label: 'Project Hub', desc: 'Central command center for all project artifacts.' },
      { route: '/execution-studio', label: 'Execution Studio', desc: 'AI code generation in sandboxed environment.' },
    ],
    tip: '🔑 Secret: Share generated architecture with clients BEFORE sprints start.',
  },
  {
    phase: 'Phase 6 — Planning & Estimation', color: '#f97316', emoji: '📋',
    steps: [
      { route: '/skills-analyzer', label: 'Skills Analyzer', desc: 'Know exactly which skills your team needs.' },
      { route: '/risk-analyzer', label: 'Risk Analyzer', desc: 'Every risk with severity and mitigation.' },
      { route: '/board', label: 'Sprint Planner', desc: 'Board + Timeline view with story points.' },
      { route: '/quality-swarm', label: 'Quality Swarm', desc: 'Multi-agent quality validation.' },
    ],
    tip: '🔑 Secret: Run Risk Analyzer after Architecture for the most accurate risk assessment.',
  },
  {
    phase: 'Phase 7 — Execution Plan (Interval)', color: '#5b5fd8', emoji: '🎯',
    steps: [
      { route: '/execution-plan', label: 'Execution Plan', desc: 'Bridge between prompts and code — Understanding Summary, Sprint Board, Module Breakdown.' },
      { route: '/execution-plan', label: 'AI Time Estimation', desc: 'Hours per sprint with confidence intervals — estimated by AI, not humans.' },
      { route: '/execution-plan', label: 'AI Approval Gate', desc: 'AI reviews plan completeness and auto-approves (score ≥ 85).' },
      { route: '/execution-plan', label: 'Agent Assignment', desc: 'Which Gita AI agent handles which sprint and module.' },
      { route: '/execution-plan', label: 'Agent Skills Matrix', desc: 'Full skill breakdown of all 6 AI agents with rationale.' },
    ],
    tip: '🔑 Secret: The Execution Plan is the critical "interval" step — it converts intelligence into actionable sprints before code generation starts.',
  },
  {
    phase: 'Phase 8 — Prompt Compilation', color: '#3b82f6', emoji: '⚡',
    steps: [
      { route: '/prompt-compiler', label: 'Prompt Compiler', desc: 'Compile for 10 AI platforms (Cursor, Bolt, V0, Gemini, etc).' },
      { route: '/phase-prompts', label: 'Phase Prompts', desc: '10-phase prompts with confidence scoring.' },
      { route: '/prompts', label: 'Prompt Workshop', desc: 'Custom prompt crafting with 12 templates.' },
    ],
    tip: '🔑 Secret: Paste Phase 1 prompt in Cursor/Bolt — watch it build your entire project.',
  },
  {
    phase: 'Phase 9 — Quality & Testing', color: '#ef4444', emoji: '🧪',
    steps: [
      { route: '/testing-ai', label: 'Testing AI', desc: 'Auto-generated test cases, edge cases, QA checklists.' },
      { route: '/code-review', label: 'Code Review AI', desc: '360° code analysis and improvement suggestions.' },
      { route: '/quality-dashboard', label: 'Quality Dashboard', desc: 'Quality metrics and scoring across all dimensions.' },
      { route: '/monitoring', label: 'Monitoring AI', desc: 'Real-time monitoring strategy and alerting rules.' },
    ],
    tip: '🔑 Secret: Run Code Review AI after generating code — it catches issues humans miss.',
  },
  {
    phase: 'Phase 10 — Documentation', color: '#06b6d4', emoji: '📖',
    steps: [
      { route: '/documentation-ai', label: 'Documentation AI', desc: 'Complete technical docs, README, API specs.' },
      { route: '/documents', label: 'Documents', desc: 'All generated documents in one place.' },
      { route: '/activity', label: 'Activity Log', desc: 'Timeline of all project actions.' },
      { route: '/knowledgebase', label: 'Knowledge Memory', desc: 'Save patterns for future projects.' },
    ],
    tip: '🔑 Secret: Use Knowledge Memory to save patterns — next project auto-recommends them.',
  },
  {
    phase: 'Phase 11 — Change Request Ops', color: '#f59e0b', emoji: '🔄',
    steps: [
      { route: '/cr-dashboard', label: 'CR Dashboard', desc: 'Track all change requests — status, priority, assigned agent, resolution timeline.' },
      { route: '/file-cr-bug', label: 'File CR / Bug', desc: 'Submit new change requests or bug reports with severity classification.' },
      { route: '/requirements-vault', label: 'Requirements Vault', desc: 'Immutable record of all original + changed requirements with full audit trail.' },
      { route: '/impact-analysis', label: 'Impact Analysis', desc: 'AI analyzes cascading effects of a change across modules, APIs, and tests.' },
      { route: '/fix-prompts', label: 'Fix Prompts', desc: 'Auto-generated fix prompts for Cursor/Bolt/Claude to resolve CRs and bugs.' },
      { route: '/cr-testing', label: 'CR Testing', desc: 'Regression test plans auto-generated for each change request.' },
    ],
    tip: '🔑 Secret: File a CR → Impact Analysis → Fix Prompts → paste in Cursor → done. Full cycle in 15 minutes.',
  },
  {
    phase: 'Phase 12 — Work Analytics & Governance', color: '#06b6d4', emoji: '📈',
    steps: [
      { route: '/work-analytics', label: 'Work Analytics Dashboard', desc: '8-tab dashboard: Developer activity, hourly timeline, daily reports, compliance.' },
      { route: '/work-analytics', label: 'Developer Activity', desc: 'Login time, active hours, idle time, files modified, commits, AI prompts used.' },
      { route: '/work-analytics', label: 'Predictive Alerts', desc: 'AI predicts delay risks, burnout alerts, and module bottlenecks before they happen.' },
      { route: '/work-analytics', label: 'Privacy & Compliance', desc: 'GDPR-compliant data handling with configurable anonymization and consent controls.' },
    ],
    tip: '🔑 Secret: Work Analytics + Live Telemetry together give you the "management intelligence layer" — real-time visibility into developer productivity.',
  },
  {
    phase: 'Phase 13 — Deployment & Go-Live', color: '#a855f7', emoji: '🚀',
    steps: [
      { route: '/deployment', label: 'Deployment AI', desc: 'CI/CD pipeline, Docker, cloud deployment strategy.' },
      { route: '/summary', label: 'Final Summary Review', desc: 'Review complete project summary before launch.' },
      { route: '/pricing', label: 'Pricing Page', desc: 'Platform pricing tiers and feature comparison.' },
    ],
    tip: '🔑 Secret: Run Deployment AI as the LAST step — validates everything is production-ready.',
  },
  {
    phase: 'Phase 14 — Admin & System', color: '#64748b', emoji: '⚙️',
    steps: [
      { route: '/admin', label: 'Admin Panel', desc: 'User management, system health, project approvals, and client access controls.' },
      { route: '/login', label: 'Login / Logout', desc: 'Secure authentication with User ID, password, and 2FA PIN.' },
      { route: '/chat', label: 'Krishna AI Chat', desc: 'Direct AI assistant for real-time project guidance and Q&A.' },
      { route: '/settings', label: 'Settings', desc: 'Platform configuration, API keys, notification preferences.' },
    ],
    tip: '🔑 Secret: Admin Panel lets you approve/reject client plans. Use Krishna Chat for quick "what should I do next?" guidance.',
  },
];

const POWER_TIPS = [
  { icon: '💡', title: 'Suggestions First, MCQ Optional', desc: 'Accept/reject AI suggestions to build KB fast. MCQs unlock at 75% — but you can skip directly to Auto Intelligence.' },
  { icon: '🔄', title: 'Auto Intelligence = 27 Steps', desc: 'One click runs 27 automated steps: scans, audit, testing, SOPs, prompts, KB enrichment — fully autonomous.' },
  { icon: '📁', title: 'Upload Folders for Review', desc: 'In Dev Intelligence & Code Audit — upload your entire project folder. AI reviews every file against your KB.' },
  { icon: '🤖', title: 'Activate Agents', desc: 'Go to AI Agents and activate CTO + Security + DBA agents. They enhance ALL analysis automatically.' },
  { icon: '📋', title: 'Export Everything', desc: 'Every module has Copy/Export — use Master Doc for client handoff, Phase Prompts for development.' },
  { icon: '🔐', title: 'Gita Modes = Auto-Prompt', desc: 'When on Architecture pages, Vishwakarma mode auto-activates. On Risk pages, Bhishma. No manual switching needed.' },
  { icon: '⚡', title: 'Prompt Compiler = Multiplier', desc: 'One KB → prompts for Cursor, Bolt, V0, Claude, Gemini, GPT, Copilot, Windsurf, Replit. 10 platforms from 1 project.' },
  { icon: '🎯', title: 'Execution Plan = Interval', desc: 'The "bridge" between prompts and coding. AI creates sprints, assigns agents, estimates time — all auto-approved.' },
  { icon: '📈', title: 'Work Analytics = Governance', desc: 'Track developer productivity, AI usage %, task velocity, and delay risks — the management intelligence layer.' },
  { icon: '🔄', title: 'CR Ops = 15-Min Fix Cycle', desc: 'File CR → Impact Analysis → Fix Prompts → paste in Cursor/Bolt → fixed. Complete change request cycle in 15 minutes.' },
  { icon: '🛡️', title: 'Admin Panel = Client Gate', desc: 'Approve or reject client project plans directly from Admin Panel. Full audit trail for compliance.' },
  { icon: '🎯', title: 'UI Preview → Client Sign-off', desc: 'Generate HTML mockups before Sprint 1. Share screenshots. Get approval. Zero rework.' },
];

export default function HelpGuidePage() {
  const [expandedPhase, setExpandedPhase] = useState(0);

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8 max-w-[900px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-[#f59e0b]" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Master Help Guide</h1>
          </div>
          <p className="text-[#8b9bb4] text-sm mt-1">How to get maximum benefit — plan better, faster, secure, and scalable</p>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="rounded-xl p-6 mb-5 border" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(245,158,11,0.04) 100%)', borderColor: 'rgba(99,102,241,0.15)' }}>
        <h3 className="text-lg font-bold text-white mb-2">🎯 The 14-Phase Pipeline — Your Path to Production</h3>
        <p className="text-sm text-[#8b9bb4] leading-relaxed mb-3">
          Launch IQ transforms a <strong className="text-white">raw idea</strong> into <strong className="text-white">production-ready code</strong> through 14 intelligent phases.
          Flow: <strong className="text-white">Define → Analyze → Architect → Plan → Execute → Compile → Test → CR Ops → Analytics → Deploy</strong>.
        </p>
        <div className="flex gap-2 flex-wrap">
          {['55+ Modules', '14 Pipeline Stages', '10 Platform Outputs', '6 AI Agents', 'CR Ops', 'Work Analytics', 'Accept/Reject Flow'].map(b => (
            <span key={b} className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#5b5fd8]/10 border border-[#5b5fd8]/20 text-[#8b9bb4]">{b}</span>
          ))}
        </div>
      </div>

      {/* Power Tips */}
      <div className="text-[10px] font-extrabold uppercase tracking-[2px] text-[#586c8f] mb-3">⚡ Power Tips — Get 10x Output ({POWER_TIPS.length} tips)</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
        {POWER_TIPS.map((tip, i) => (
          <div key={i} className="bg-[#111622] border border-[#1e2532] rounded-xl p-3 hover:border-[#5b5fd8]/30 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{tip.icon}</span>
              <span className="font-bold text-[11px] text-white">{tip.title}</span>
            </div>
            <div className="text-[10px] text-[#8b9bb4] leading-relaxed">{tip.desc}</div>
          </div>
        ))}
      </div>

      {/* Workflow Phases */}
      <div className="text-[10px] font-extrabold uppercase tracking-[2px] text-[#586c8f] mb-3">📋 Complete Workflow — {WORKFLOW_STEPS.length} Phases · {WORKFLOW_STEPS.reduce((a, p) => a + p.steps.length, 0)} Modules</div>
      {WORKFLOW_STEPS.map((phase, pi) => (
        <div key={pi} className="bg-[#111622] border border-[#1e2532] rounded-xl mb-2 overflow-hidden" style={{ borderLeft: `3px solid ${phase.color}` }}>
          <button onClick={() => setExpandedPhase(expandedPhase === pi ? -1 : pi)} className="w-full p-3 px-4 flex items-center gap-3 text-left cursor-pointer hover:bg-white/[0.02] transition-all">
            <span className="text-xl">{phase.emoji}</span>
            <span className="font-bold text-sm text-white flex-1">{phase.phase}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-[#8b9bb4]">{phase.steps.length} modules</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#586c8f] transition-transform duration-200" style={{ transform: expandedPhase === pi ? 'rotate(90deg)' : 'none' }} />
          </button>
          {expandedPhase === pi && (
            <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
              {phase.steps.map((step, si) => (
                <Link key={si} href={step.route} className="flex items-center gap-3 p-2.5 mb-1 rounded-lg hover:bg-white/[0.03] transition-all group">
                  <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-[10px] font-extrabold flex-shrink-0" style={{ background: `${phase.color}15`, color: phase.color }}>{si + 1}</span>
                  <div className="flex-1">
                    <div className="font-bold text-xs text-white">{step.label}</div>
                    <div className="text-[10px] text-[#586c8f]">{step.desc}</div>
                  </div>
                  <ArrowRight className="w-3 h-3 text-[#586c8f] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
              <div className="mt-2 px-3 py-2 rounded-md text-[10px] font-semibold leading-relaxed" style={{ background: `${phase.color}08`, color: phase.color, borderLeft: `2px solid ${phase.color}` }}>
                {phase.tip}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Quick Start */}
      <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-5 mt-4 text-center">
        <h3 className="text-lg font-bold text-white mb-2">🚀 Quick Start — 5 Minutes to First Output</h3>
        <div className="flex gap-2 justify-center flex-wrap mb-4 items-center text-xs text-[#8b9bb4]">
          {[
            { label: '1. Start', color: '#f59e0b' },
            { label: '2. Analyze', color: '#6366f1' },
            { label: '3. Auto Intel', color: '#8b5cf6' },
            { label: '4. Architect', color: '#10b981' },
            { label: '5. Execute', color: '#5b5fd8' },
            { label: '6. Prompts', color: '#3b82f6' },
            { label: '7. CR Ops', color: '#f59e0b' },
            { label: '8. Deploy!', color: '#a855f7' },
          ].map((s, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md font-bold text-xs" style={{ background: `${s.color}12`, color: s.color }}>{s.label}</span>
              {i < 7 && <ArrowRight className="w-3 h-3 text-[#586c8f]" />}
            </span>
          ))}
        </div>
        <Link href="/start" className="inline-flex items-center gap-2 bg-[#5b5fd8] hover:bg-[#4a4fcf] text-white px-8 py-3 rounded-xl font-bold transition-all">
          <Sparkles className="w-4 h-4" /> Start Your First Project
        </Link>
      </div>
    </div>
  );
}
