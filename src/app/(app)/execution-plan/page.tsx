'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  Zap,
  Target,
  Clock,
  Shield,
  Users,
  BarChart3,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  GitBranch,
  FileCode2,
  Settings,
  TestTube2,
  BookOpen,
  Rocket,
  Loader2,
  TrendingUp,
  Lock,
  Database,
  Globe,
  Cpu,
  Paintbrush,
  ArrowRight,
  Info,
} from 'lucide-react';

/* ────────────────────── TYPES ────────────────────── */

interface PhaseData {
  id: number;
  name: string;
  modules: string[];
  hours: number;
  agent: string;
  agentEmoji: string;
  confidence: number;
  color: string;
}

interface ModuleData {
  name: string;
  icon: React.ReactNode;
  files: number;
  tasks: number;
  complexity: 'Low' | 'Medium' | 'High' | 'Critical';
  agent: string;
  subtasks: string[];
}

interface AgentData {
  name: string;
  emoji: string;
  role: string;
  color: string;
  borderColor: string;
  bgColor: string;
  assignedModules: string[];
  tokenUsage: string;
  skills: { name: string; value: number }[];
  rationale: string;
}

/* ────────────────────── MOCK DATA ────────────────────── */

const SPRINTS: PhaseData[] = [
  { id: 1, name: 'Sprint 1: Core Foundation', modules: ['Project Setup', 'Requirement Docs', 'User Personas'], hours: 32, agent: 'Arjun', agentEmoji: '🟡', confidence: 96, color: '#f59e0b' },
  { id: 2, name: 'Sprint 2: Architecture & DB', modules: ['HLD', 'LLD', 'Component Design', 'DB Schema', 'Migrations', 'Seed Data'], hours: 48, agent: 'Vishwakarma', agentEmoji: '🟣', confidence: 94, color: '#8b5cf6' },
  { id: 3, name: 'Sprint 3: API & Backend', modules: ['API Routes', 'Business Logic', 'Auth'], hours: 64, agent: 'Krishna', agentEmoji: '🔵', confidence: 89, color: '#6366f1' },
  { id: 4, name: 'Sprint 4: Frontend Components', modules: ['UI Components', 'Dashboard', 'Data Viz'], hours: 72, agent: 'Hanuman', agentEmoji: '🟠', confidence: 91, color: '#f97316' },
  { id: 5, name: 'Sprint 5: Testing & QA', modules: ['Unit Tests', 'E2E Tests', 'Security Audit'], hours: 48, agent: 'Bhishma', agentEmoji: '🔴', confidence: 95, color: '#ef4444' },
  { id: 6, name: 'Sprint 6: Deployment & Docs', modules: ['CI/CD', 'Infra', 'Monitoring', 'Documentation'], hours: 56, agent: 'Chanakya', agentEmoji: '🟢', confidence: 88, color: '#10b981' },
];

const MODULES: ModuleData[] = [
  { name: 'Authentication', icon: <Lock className="w-4 h-4" />, files: 12, tasks: 18, complexity: 'High', agent: '🟣', subtasks: ['JWT token service', 'OAuth2 providers', 'Role-based access control', 'Session management', 'Password hashing & reset'] },
  { name: 'Database Schema', icon: <Database className="w-4 h-4" />, files: 8, tasks: 14, complexity: 'Medium', agent: '🟣', subtasks: ['Prisma schema design', 'Migration scripts', 'Seed data generator', 'Index optimization'] },
  { name: 'API Routes', icon: <Globe className="w-4 h-4" />, files: 24, tasks: 32, complexity: 'High', agent: '🔵', subtasks: ['REST endpoints', 'GraphQL resolvers', 'Rate limiting middleware', 'Input validation layer', 'Error handling'] },
  { name: 'Frontend Components', icon: <Paintbrush className="w-4 h-4" />, files: 36, tasks: 45, complexity: 'Medium', agent: '🟡', subtasks: ['Design system atoms', 'Dashboard layouts', 'Data visualization', 'Form components', 'Modal system'] },
  { name: 'AI Pipeline', icon: <Cpu className="w-4 h-4" />, files: 16, tasks: 22, complexity: 'Critical', agent: '🟠', subtasks: ['Prompt compiler engine', 'Multi-model router', 'Context window manager', 'Token budget optimizer', 'Response streaming'] },
  { name: 'Testing Suite', icon: <TestTube2 className="w-4 h-4" />, files: 20, tasks: 28, complexity: 'Medium', agent: '🔴', subtasks: ['Unit test framework', 'Integration test suite', 'E2E with Playwright', 'Coverage reporting', 'Mutation testing'] },
  { name: 'CI/CD Pipeline', icon: <GitBranch className="w-4 h-4" />, files: 6, tasks: 10, complexity: 'Low', agent: '🟢', subtasks: ['GitHub Actions workflows', 'Docker containerization', 'Preview deployments', 'Production pipeline'] },
  { name: 'Documentation', icon: <BookOpen className="w-4 h-4" />, files: 10, tasks: 15, complexity: 'Low', agent: '🟢', subtasks: ['API reference docs', 'Architecture guide', 'Deployment runbook', 'Contributing guide'] },
];

const AGENTS: AgentData[] = [
  {
    name: 'Krishna', emoji: '🔵', role: 'Strategic Advisor',
    color: '#6366f1', borderColor: 'border-indigo-500/30', bgColor: 'bg-indigo-500/10',
    assignedModules: ['Dashboard', 'Projects', 'Competitive Analysis'],
    tokenUsage: '~142K tokens',
    skills: [{ name: 'Strategy', value: 10 }, { name: 'Planning', value: 9 }, { name: 'Analysis', value: 8 }, { name: 'Communication', value: 9 }, { name: 'Leadership', value: 10 }],
    rationale: 'Krishna\'s strategic vision excels at high-level project orchestration. Best suited for dashboard composition and competitive landscape analysis where broad context understanding is critical.',
  },
  {
    name: 'Arjun', emoji: '🟡', role: 'Question Master',
    color: '#f59e0b', borderColor: 'border-amber-500/30', bgColor: 'bg-amber-500/10',
    assignedModules: ['MCQ', 'Analysis', 'Requirements'],
    tokenUsage: '~98K tokens',
    skills: [{ name: 'Questioning', value: 10 }, { name: 'Analysis', value: 9 }, { name: 'Precision', value: 8 }, { name: 'Requirements', value: 9 }, { name: 'Validation', value: 8 }],
    rationale: 'Arjun\'s questioning precision ensures nothing is missed during requirements gathering. His validation skills make him ideal for building MCQ systems and analysis pipelines.',
  },
  {
    name: 'Bhishma', emoji: '🔴', role: 'Risk Governor',
    color: '#ef4444', borderColor: 'border-red-500/30', bgColor: 'bg-red-500/10',
    assignedModules: ['Risk Analysis', 'Testing', 'Code Review', 'Quality'],
    tokenUsage: '~156K tokens',
    skills: [{ name: 'Risk', value: 10 }, { name: 'Security', value: 9 }, { name: 'Compliance', value: 9 }, { name: 'Testing', value: 8 }, { name: 'Governance', value: 10 }],
    rationale: 'Bhishma\'s unwavering commitment to quality and governance makes him the natural choice for risk analysis, code review, and test coverage. He ensures production-grade reliability.',
  },
  {
    name: 'Chanakya', emoji: '🟢', role: 'Cost Optimizer',
    color: '#10b981', borderColor: 'border-emerald-500/30', bgColor: 'bg-emerald-500/10',
    assignedModules: ['Estimation', 'Skills', 'Sprint Planning'],
    tokenUsage: '~87K tokens',
    skills: [{ name: 'Optimization', value: 10 }, { name: 'Cost', value: 9 }, { name: 'ROI', value: 8 }, { name: 'Estimation', value: 9 }, { name: 'Negotiation', value: 8 }],
    rationale: 'Chanakya\'s cost-optimization mastery ensures maximum ROI on every sprint. His estimation algorithms minimize budget overruns while maintaining quality thresholds.',
  },
  {
    name: 'Hanuman', emoji: '🟠', role: 'Speed Executor',
    color: '#f97316', borderColor: 'border-orange-500/30', bgColor: 'bg-orange-500/10',
    assignedModules: ['Prompts', 'Execution Studio', 'Fix Prompts'],
    tokenUsage: '~203K tokens',
    skills: [{ name: 'Speed', value: 10 }, { name: 'Execution', value: 9 }, { name: 'Code', value: 8 }, { name: 'Shipping', value: 9 }, { name: 'Iteration', value: 8 }],
    rationale: 'Hanuman\'s raw execution speed and iteration velocity make him the engine of the code generation pipeline. He ships fast and self-heals through rapid iteration cycles.',
  },
  {
    name: 'Vishwakarma', emoji: '🟣', role: 'System Architect',
    color: '#8b5cf6', borderColor: 'border-violet-500/30', bgColor: 'bg-violet-500/10',
    assignedModules: ['Architecture', 'DB', 'API', 'Frontend AI', 'Backend AI'],
    tokenUsage: '~178K tokens',
    skills: [{ name: 'Architecture', value: 10 }, { name: 'Systems', value: 9 }, { name: 'Patterns', value: 9 }, { name: 'Scale', value: 8 }, { name: 'Design', value: 9 }],
    rationale: 'Vishwakarma\'s architectural mastery ensures clean system boundaries and scalable design patterns. He owns the foundational structure that every other agent builds upon.',
  },
];

const APPROVAL_FLAGS = [
  { type: 'warning', text: 'AI Pipeline module has Critical complexity — consider splitting into 2 sub-modules for safer delivery.' },
  { type: 'info', text: 'Sprint 3 has lowest confidence (87%) — recommend adding a 6-hour buffer for model integration uncertainties.' },
  { type: 'info', text: 'Hanuman agent has highest token allocation (~203K). Monitor context-window usage during execution.' },
  { type: 'warning', text: 'No explicit rollback strategy detected for database migrations — add to Sprint 1 checklist.' },
];

/* ────────────────────── HELPERS ────────────────────── */

function complexityBadge(c: string) {
  const map: Record<string, string> = {
    Low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    High: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    Critical: 'bg-red-500/15 text-red-400 border-red-500/25',
  };
  return map[c] || map.Low;
}

/* ────────────────────── COMPONENT ────────────────────── */

export default function ExecutionPlanPage() {
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('activeProjectId');
    setProjectId(id);
    if (id) {
      fetch(`/api/documents?projectId=${id}`)
        .then(r => r.json())
        .then(d => {
          if (d.success && d.project && d.project.documents) {
            const plan = d.project.documents.find((doc: any) => doc.type === 'EXECUTION_PLAN');
            if (plan) {
              setGenerated(true);
            }
          }
        });
    }
  }, []);

  const toggleModule = (name: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleGenerate = useCallback(async () => {
    if (!projectId) return alert('Please select a project first.');
    setGenerating(true);
    setProgress(0);
    
    // Animate progress
    for (let p = 0; p <= 100; p += 10) {
      setProgress(p);
      await new Promise(r => setTimeout(r, 120));
    }
    
    // Save to DB
    await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, title: 'Execution Plan', type: 'EXECUTION_PLAN', content: '{"generated":true}' })
    });
    
    setGenerating(false);
    setGenerated(true);
  }, [projectId]);

  const totalHours = SPRINTS.reduce((a, s) => a + s.hours, 0);
  const maxSprintHours = Math.max(...SPRINTS.map((s) => s.hours));

  /* ── render ── */
  return (
    <div className="h-full w-full overflow-y-auto bg-[#0b0e14] animate-in fade-in slide-in-from-bottom-4 duration-500 custom-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-[#1e2532] bg-[#0b0e14]/95 backdrop-blur-md px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Target className="w-6 h-6 text-[#5b5fd8]" />
              Post-Prompt Execution Plan
            </h1>
            <p className="text-[#8b9bb4] mt-1 text-sm">
              Bridge between AI-generated prompts and actual code generation. Review, approve, and execute.
            </p>
          </div>
          {generated && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400">Plan Active</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-6 space-y-10">
        {/* ╔══════════════════════════════════════════════╗
           ║  SECTION 1 — Understanding Summary           ║
           ╚══════════════════════════════════════════════╝ */}
        <section>
          <div className="rounded-2xl border border-[#1e2532] bg-gradient-to-br from-[#111622] to-[#0f1218] p-8 relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-[#6366f1]" />
                <h2 className="text-lg font-bold text-white">AI Understanding Summary</h2>
              </div>

              {!generated && !generating && (
                <div className="space-y-6">
                  <p className="text-[#8b9bb4] text-sm leading-relaxed max-w-2xl">
                    Your prompts have been compiled. Click below to generate the full execution plan — the AI will analyze requirements, estimate effort, assign agents, and produce a sprint-level roadmap.
                  </p>
                  <button
                    onClick={handleGenerate}
                    className="bg-[#5b5fd8] hover:bg-[#4a4fcf] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40"
                  >
                    <Sparkles className="w-4 h-4" /> Generate Execution Plan
                  </button>
                </div>
              )}

              {generating && (
                <div className="space-y-4 max-w-xl">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-[#6366f1] animate-spin" />
                    <span className="text-sm text-white font-medium">Generating plan… {progress}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#1e2532] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#586c8f] font-mono animate-pulse">
                    {progress < 25 ? 'Parsing compiled prompts...' : progress < 50 ? 'Analyzing feature complexity...' : progress < 75 ? 'Assigning agents and estimating effort...' : 'Finalizing sprint roadmap...'}
                  </p>
                </div>
              )}

              {generated && (
                <div className="space-y-5">
                  <p className="text-[#8b9bb4] text-sm leading-relaxed max-w-3xl">
                    The AI has analyzed <span className="text-white font-semibold">47 compiled prompts</span> across 8 modules. The project is a full-stack enterprise SaaS platform featuring multi-agent AI orchestration, real-time dashboards, and an integrated prompt compilation pipeline. Below is the complete execution roadmap.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { label: 'Total Features', value: '47', icon: <Layers className="w-4 h-4" /> },
                      { label: 'Tech Stack', value: 'Next.js · Prisma · GPT-4 · Tailwind', icon: <Cpu className="w-4 h-4" /> },
                      { label: 'Complexity', value: 'High', icon: <AlertTriangle className="w-4 h-4" /> },
                      { label: 'Sprints', value: '6', icon: <GitBranch className="w-4 h-4" /> },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center gap-3 bg-[#0b0e14]/60 border border-[#1e2532] rounded-xl px-4 py-3">
                        <span className="text-[#6366f1]">{m.icon}</span>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-[#586c8f] font-bold">{m.label}</div>
                          <div className="text-sm text-white font-semibold">{m.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {generated && (
          <>
            {/* ╔══════════════════════════════════════════════╗
               ║  SECTION 2 — Sprint Board                    ║
               ╚══════════════════════════════════════════════╝ */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <GitBranch className="w-5 h-5 text-[#6366f1]" />
                <h2 className="text-lg font-bold text-white">Sprint Board</h2>
                <span className="text-xs text-[#586c8f] ml-1">— Visual Timeline</span>
              </div>
              <div className="overflow-x-auto pb-4 -mx-2 px-2 custom-scrollbar">
                <div className="flex gap-5 min-w-max">
                  {SPRINTS.map((sprint, idx) => (
                    <div key={sprint.id} className="relative group">
                      <div
                        className="w-[260px] rounded-2xl border bg-[#111622] p-5 relative overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg"
                        style={{ borderColor: `${sprint.color}30` }}
                      >
                        {/* Top bar accent */}
                        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: sprint.color }} />
                        <div className="flex items-center justify-between mb-3 pt-1">
                          <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: sprint.color }}>
                            Sprint {sprint.id}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ color: sprint.color, borderColor: `${sprint.color}40`, background: `${sprint.color}15` }}>
                            {sprint.confidence}% conf
                          </span>
                        </div>
                        <h3 className="text-white font-bold text-sm mb-3">{sprint.name}</h3>
                        <div className="space-y-1 mb-4">
                          {sprint.modules.map((m) => (
                            <div key={m} className="text-xs text-[#8b9bb4] flex items-center gap-1.5">
                              <div className="w-1 h-1 rounded-full" style={{ background: sprint.color }} />
                              {m}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#586c8f]">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {sprint.hours}h
                          </span>
                          <span className="text-[#8b9bb4]">
                            {sprint.agentEmoji} {sprint.agent}
                          </span>
                        </div>
                      </div>
                      {idx < SPRINTS.length - 1 && (
                        <div className="absolute left-[38px] top-14 bottom-[-16px] w-[2px] bg-gradient-to-b from-[#5b5fd8]/50 to-transparent group-hover:from-white/20 transition-all"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ╔══════════════════════════════════════════════╗
               ║  SECTION 3 — Module Breakdown                ║
               ╚══════════════════════════════════════════════╝ */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <Layers className="w-5 h-5 text-[#6366f1]" />
                <h2 className="text-lg font-bold text-white">Module Breakdown</h2>
                <span className="ml-auto text-xs text-[#586c8f]">{MODULES.length} modules · {MODULES.reduce((a, m) => a + m.files, 0)} files · {MODULES.reduce((a, m) => a + m.tasks, 0)} tasks</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {MODULES.map((mod) => {
                  const expanded = expandedModules.has(mod.name);
                  return (
                    <div
                      key={mod.name}
                      className="rounded-xl border border-[#1e2532] bg-[#111622] hover:border-[#2a3444] transition-colors overflow-hidden"
                    >
                      <button
                        onClick={() => toggleModule(mod.name)}
                        className="w-full text-left p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[#6366f1]">{mod.icon}</span>
                            <span className="text-white font-bold text-sm">{mod.name}</span>
                          </div>
                          <span className="text-lg">{mod.agent}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[10px] text-[#586c8f]">
                            <FileCode2 className="w-3 h-3 inline mr-0.5" /> {mod.files} files
                          </span>
                          <span className="text-[10px] text-[#586c8f]">
                            <Target className="w-3 h-3 inline mr-0.5" /> {mod.tasks} tasks
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${complexityBadge(mod.complexity)}`}>
                            {mod.complexity}
                          </span>
                          {expanded ? (
                            <ChevronDown className="w-4 h-4 text-[#586c8f]" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[#586c8f]" />
                          )}
                        </div>
                      </button>
                      {expanded && (
                        <div className="border-t border-[#1e2532] px-4 py-3 space-y-1.5 bg-[#0b0e14]/50">
                          {mod.subtasks.map((t) => (
                            <div key={t} className="flex items-center gap-2 text-xs text-[#8b9bb4]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500/60 flex-shrink-0" />
                              {t}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ╔══════════════════════════════════════════════╗
               ║  SECTION 4 — AI Time Estimation              ║
               ╚══════════════════════════════════════════════╝ */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <Clock className="w-5 h-5 text-[#6366f1]" />
                <h2 className="text-lg font-bold text-white">AI Time Estimation</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main stat */}
                <div className="rounded-2xl border border-[#1e2532] bg-gradient-to-br from-[#111622] to-[#0f1218] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent pointer-events-none" />
                  <div className="relative z-10">
                    <p className="text-[10px] uppercase tracking-wider text-[#586c8f] font-bold mb-1">Total Estimated</p>
                    <div className="text-5xl font-black text-white mb-1">{totalHours}</div>
                    <p className="text-[#8b9bb4] text-sm">hours of AI generation</p>
                    <div className="mt-4 flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-[#586c8f]">Min</span>
                        <div className="text-white font-bold">326h</div>
                      </div>
                      <div className="w-px h-6 bg-[#1e2532]" />
                      <div>
                        <span className="text-emerald-400 font-bold">Expected</span>
                        <div className="text-white font-bold">{totalHours}h</div>
                      </div>
                      <div className="w-px h-6 bg-[#1e2532]" />
                      <div>
                        <span className="text-[#586c8f]">Max</span>
                        <div className="text-white font-bold">451h</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bar chart */}
                <div className="lg:col-span-2 rounded-2xl border border-[#1e2532] bg-[#111622] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-white">Hours per Sprint</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> 87% Confidence
                    </span>
                  </div>
                  <div className="space-y-4 relative">
                    {SPRINTS.map((s) => (
                      <div key={s.id} className="flex items-center gap-3">
                        <span className="text-[11px] text-[#586c8f] w-36 truncate flex-shrink-0">
                          S{s.id} · {s.name}
                        </span>
                        <div className="flex-1 h-7 rounded-lg bg-[#0b0e14] overflow-hidden relative">
                          <div
                            className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                            style={{
                              width: `${(s.hours / maxSprintHours) * 100}%`,
                              background: `linear-gradient(90deg, ${s.color}30, ${s.color}90)`,
                            }}
                          >
                            <span className="text-[10px] font-bold text-white drop-shadow">{s.hours}h</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ╔══════════════════════════════════════════════╗
               ║  SECTION 5 — AI Approval Gate                ║
               ╚══════════════════════════════════════════════╝ */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <Shield className="w-5 h-5 text-[#6366f1]" />
                <h2 className="text-lg font-bold text-white">AI Approval Gate</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Status card */}
                <div className="lg:col-span-2 rounded-2xl border border-emerald-500/30 bg-[#111622] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/[0.03] pointer-events-none" />
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">Auto-Approved</div>
                    <div className="text-4xl font-black text-white">92<span className="text-lg text-[#586c8f]">/100</span></div>
                    <p className="text-xs text-[#586c8f] mt-2">Score ≥ 85 → Auto-Approved</p>
                  </div>
                </div>

                {/* Breakdown + Flags */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="rounded-xl border border-[#1e2532] bg-[#111622] p-5">
                    <h3 className="text-sm font-bold text-white mb-4">Breakdown Scores</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Completeness', score: 95, color: '#10b981' },
                        { label: 'Risk Assessment', score: 88, color: '#f59e0b' },
                        { label: 'Feasibility', score: 94, color: '#6366f1' },
                        { label: 'Dependency Resolution', score: 91, color: '#8b5cf6' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3">
                          <span className="text-xs text-[#8b9bb4] w-40 flex-shrink-0">{item.label}</span>
                          <div className="flex-1 h-2 rounded-full bg-[#0b0e14] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${item.score}%`, background: item.color }}
                            />
                          </div>
                          <span className="text-xs font-bold text-white w-8 text-right">{item.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#1e2532] bg-[#111622] p-5">
                    <h3 className="text-sm font-bold text-white mb-3">Flags & Recommendations</h3>
                    <div className="space-y-2">
                      {APPROVAL_FLAGS.map((flag, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs">
                          {flag.type === 'warning' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                          )}
                          <span className="text-[#8b9bb4] leading-relaxed">{flag.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ╔══════════════════════════════════════════════╗
               ║  SECTION 6 — Agent Assignment Matrix          ║
               ╚══════════════════════════════════════════════╝ */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <Users className="w-5 h-5 text-[#6366f1]" />
                <h2 className="text-lg font-bold text-white">Agent Assignment Matrix</h2>
                <span className="text-xs text-[#586c8f] ml-1">— Gita AI Personalities</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {AGENTS.map((agent) => (
                  <div
                    key={agent.name}
                    className={`rounded-2xl border ${agent.borderColor} bg-[#111622] p-5 relative overflow-hidden transition-transform hover:scale-[1.01]`}
                  >
                    {/* Accent glow */}
                    <div
                      className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-15 pointer-events-none"
                      style={{ background: agent.color }}
                    />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border"
                          style={{ background: `${agent.color}15`, borderColor: `${agent.color}30` }}
                        >
                          {agent.emoji}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-sm">{agent.name}</h3>
                          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: agent.color }}>{agent.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-3 text-[10px]">
                        <span className="text-[#586c8f]">
                          <Layers className="w-3 h-3 inline mr-0.5" /> {agent.assignedModules.length} modules
                        </span>
                        <span className="text-[#586c8f]">
                          <Zap className="w-3 h-3 inline mr-0.5" /> {agent.tokenUsage}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {agent.assignedModules.map((m) => (
                          <span
                            key={m}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                            style={{ color: agent.color, borderColor: `${agent.color}30`, background: `${agent.color}10` }}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ╔══════════════════════════════════════════════╗
               ║  SECTION 7 — Agent Skills Overview            ║
               ╚══════════════════════════════════════════════╝ */}
            <section className="pb-12">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="w-5 h-5 text-[#6366f1]" />
                <h2 className="text-lg font-bold text-white">Agent Skills Overview</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {AGENTS.map((agent) => (
                  <div
                    key={agent.name}
                    className="rounded-2xl border border-[#1e2532] bg-[#111622] p-5 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">{agent.emoji}</span>
                      <span className="text-white font-bold text-sm">{agent.name}</span>
                      <span className="text-[10px] font-bold ml-auto uppercase tracking-wider" style={{ color: agent.color }}>
                        {agent.role}
                      </span>
                    </div>

                    {/* Skill bars */}
                    <div className="space-y-2.5 mb-4">
                      {agent.skills.map((skill) => (
                        <div key={skill.name} className="flex items-center gap-2">
                          <span className="text-[11px] text-[#586c8f] w-24 truncate flex-shrink-0">{skill.name}</span>
                          <div className="flex-1 flex gap-[3px]">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <div
                                key={i}
                                className="h-[14px] flex-1 rounded-sm transition-colors"
                                style={{
                                  background: i < skill.value ? agent.color : '#1e2532',
                                  opacity: i < skill.value ? 0.6 + (i / skill.value) * 0.4 : 1,
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-bold text-white w-5 text-right">{skill.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Rationale */}
                    <div className="rounded-lg bg-[#0b0e14]/60 border border-[#1e2532] p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3 h-3" style={{ color: agent.color }} />
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: agent.color }}>
                          Why this agent?
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8b9bb4] leading-relaxed">{agent.rationale}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
