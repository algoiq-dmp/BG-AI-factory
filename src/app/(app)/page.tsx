'use client';

/**
 * @file Dashboard Page
 * @description Main dashboard with live telemetry stats, Get Started CTA,
 *              Shloka banner, module grids organized by category, and quick links.
 *              Matches the reference site's dashboard layout.
 */
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useOsStore } from '@/store/useOsStore';
import {
  Folder, Book, Rocket, FileText, Shield,
  Sparkles, Target, BrainCircuit, Search,
  Settings, ShieldCheck, Award, Layers,
  Calculator, GitBranch, Terminal, Clock,
  AlertCircle, Cpu, Activity, Gauge, Monitor,
  Database, Eye, FlaskConical, Users, Bug,
  ArrowRight, Play, Zap, BarChart3, ClipboardList
} from "lucide-react";
import dynamic from "next/dynamic";

const DashboardGrid = dynamic(() => import('@/components/dashboard/DashboardGrid'), { ssr: false });

export default function DashboardPage() {
  const { data: session } = useSession();
  const { mode } = useOsStore();
  const karmaTokens = (session?.user as any)?.karmaTokens || 0;
  const karmaPercentage = Math.min(100, Math.max(0, (karmaTokens / 1000) * 100));

  const stats = [
    { label: 'AI IDE Est. Time', value: '48', unit: 'Hours', icon: Clock, color: 'text-orange-400', border: 'border-orange-500/20' },
    { label: 'Pending Work', value: '24%', unit: '', icon: AlertCircle, color: 'text-yellow-400', border: 'border-yellow-500/20' },
    { label: 'Projects', value: '4', unit: '', icon: Folder, color: 'text-blue-400', border: 'border-blue-500/20' },
    { label: 'Active KB Size', value: '32K', unit: '', icon: Book, color: 'text-green-400', border: 'border-green-500/20' },
    ...(mode === 'ENTERPRISE' 
      ? [{ label: 'Karma Tokens', value: karmaTokens.toString(), unit: 'TKN', icon: Cpu, color: 'text-purple-400', border: 'border-purple-500/20' }]
      : [{ label: 'Usage Tier', value: 'Pro', unit: '', icon: Zap, color: 'text-yellow-400', border: 'border-yellow-500/20' }]
    ),
    { label: 'Code Quality', value: '94%', unit: '', icon: Shield, color: 'text-blue-500', border: 'border-blue-500/20' },
    { label: 'Swarm Health', value: 'Optimal', unit: '', icon: Activity, color: 'text-teal-400', border: 'border-teal-500/20' },
    { label: 'Pipeline', value: '10', unit: 'Phases', icon: Rocket, color: 'text-red-400', border: 'border-red-500/20' },
  ];

  const sections = [
    {
      title: 'INTELLIGENCE', color: '#10b981', items: [
        { title: 'AI Suggestions', desc: 'Accept/reject AI concern cards', icon: Sparkles, href: '/mcq' },
        { title: 'AI Analysis', desc: 'MCQ interrogation (optional)', icon: Target, href: '/analysis' },
        { title: 'Auto Intelligence', desc: '27-step autonomous pipeline', icon: BrainCircuit, href: '/auto-intelligence' },
        { title: 'Knowledgebase', desc: 'Auto-generated project KB', icon: Book, href: '/knowledgebase' },
        { title: 'Risk Analyzer', desc: 'Bhishma Mode risk scanning', icon: ShieldCheck, href: '/risk-analyzer' },
        { title: 'Skills Analyzer', desc: 'Skills, hiring, upskilling', icon: Award, href: '/skills-analyzer' },
      ]
    },
    {
      title: 'ARCHITECTURE', color: '#8b5cf6', items: [
        { title: 'Solution Architect', desc: 'HLD, LLD, DB, API Spec', icon: Layers, href: '/architecture' },
        { title: 'Auto Research', desc: 'API/SDK/library discovery', icon: Search, href: '/competitive-analysis' },
        { title: 'Estimation', desc: 'Timeline, cost, sprints', icon: Calculator, href: '/feature-engine' },
        { title: 'Dependencies', desc: 'Build order, critical path', icon: GitBranch, href: '/feature-engine' },
      ]
    },
    {
      title: 'PROMPTS', color: '#ec4899', items: [
        { title: 'Prompt Compiler', desc: '9+ AI platforms supported', icon: Sparkles, href: '/prompt-compiler' },
        { title: 'Phase Prompts', desc: '10-phase dev prompts', icon: Rocket, href: '/phase-prompts' },
        { title: 'Project Summary', desc: 'BRD/FRD/SRS export', icon: FileText, href: '/summary' },
      ]
    },
    {
      title: 'PIPELINE', color: '#f97316', items: [
        { title: 'Pipeline Orchestrator', desc: '12-stage autonomous pipeline', icon: Rocket, href: '/pipeline' },
        { title: 'Execution Studio', desc: 'Monaco editor + terminal', icon: Terminal, href: '/execution-studio' },
        { title: 'Frontend AI', desc: 'React/Next.js generation', icon: Monitor, href: '/frontend-ai' },
        { title: 'Backend AI', desc: 'API routes + services', icon: Database, href: '/backend-ai' },
        { title: 'Testing AI', desc: 'Unit/E2E test generation', icon: FlaskConical, href: '/testing-ai' },
        { title: 'Code Review AI', desc: 'Automated code review', icon: Eye, href: '/code-review' },
      ]
    },
    {
      title: 'QUALITY & CODE REVIEW', color: '#ef4444', items: [
        { title: 'Quality Dashboard', desc: '6-dimension quality scoring', icon: ShieldCheck, href: '/quality-dashboard' },
        { title: 'Quality Swarm', desc: 'Multi-agent code analysis', icon: Users, href: '/quality-swarm' },
      ]
    },
    {
      title: 'CHANGE OPS', color: '#f59e0b', items: [
        { title: 'CR Dashboard', desc: 'Track bugs, CRs, features', icon: BarChart3, href: '/cr-dashboard' },
        { title: 'File CR / Bug', desc: 'Submit change requests', icon: Bug, href: '/file-cr-bug' },
        { title: 'Requirements Vault', desc: 'Requirements repository', icon: ClipboardList, href: '/requirements-vault' },
        { title: 'Impact Analysis', desc: 'Change impact assessment', icon: Zap, href: '/impact-analysis' },
      ]
    },
  ];

  return (
    <div className="min-h-full p-6 text-white space-y-8 bg-[#0b0e14]">

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold flex items-center gap-2.5">
          <Sparkles className="text-yellow-400 w-7 h-7" />
          Bhagwat Gita AI
        </h1>
        <p className="text-sm text-[#8b9bb4]">
          From Human Thought to Development Intelligence — 20 AI modules powering your project lifecycle.
        </p>
      </div>

      {/* Shloka Banner */}
      <div className="relative bg-[#1a1b3b]/30 p-5 rounded-2xl border border-[#2a2c7a]/50 flex items-center gap-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4a4fcf]/5 to-transparent" />
        <div className="w-20 h-20 rounded-lg overflow-hidden relative z-10 border border-yellow-500/30 flex-shrink-0 bg-[#1a1b3b]">
          <img src="https://images.unsplash.com/photo-1599839619722-39751411ea63?w=200&h=200&fit=crop" alt="Krishna" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
        </div>
        <div className="relative z-10 space-y-1 min-w-0 flex-1">
          <h2 className="text-yellow-400 font-bold text-base truncate">&quot;योगः कर्मसु कौशलम्&quot; <span className="text-[#586c8f] text-xs font-normal">— 2.50</span></h2>
          <p className="text-xs text-gray-300">योग कार्य की कुशलता है <span className="text-[#586c8f]">•</span> Yoga is skill in action</p>
        </div>
        <div className="relative z-10 ml-auto hidden md:flex items-center gap-1.5 text-[10px] font-mono text-yellow-400/80 flex-shrink-0">
          <Sparkles className="w-3 h-3" /> Excellence in execution — plan smart, build fast.
        </div>
      </div>

      {/* Live Telemetry Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-[#111622]/80 backdrop-blur-sm border ${stat.border} rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-[#1a202c] transition-all group cursor-pointer`}>
            <stat.icon className={`w-5 h-5 ${stat.color} group-hover:scale-110 transition-transform`} />
            <div className="text-center">
              <div className="text-xl font-black text-white leading-none">
                {stat.value}
                {stat.unit && <span className="text-xs font-bold text-[#586c8f] ml-1">{stat.unit}</span>}
              </div>
              <div className="text-[9px] uppercase tracking-widest text-[#586c8f] font-bold mt-1">{stat.label}</div>
              {stat.label === 'Usage Tier' && (
                <div className="w-full mt-2 h-1.5 bg-[#0b0e14] rounded-full overflow-hidden border border-[#1e2532]">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${karmaPercentage}%` }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Get Started CTA */}
      <div className="bg-gradient-to-r from-[#111622] to-[#1a1b3b]/50 border border-[#1e2532] rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-[#10b981]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Get Started</h3>
            <p className="text-xs text-[#586c8f]">Create a project to unlock all AI modules</p>
          </div>
        </div>
        <Link
          href="/start"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#10b981] hover:bg-[#0d9669] text-white text-sm font-bold rounded-lg transition-all group"
        >
          <Play className="w-4 h-4" />
          Start Project
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Module Sections */}
      <div className="pb-8 mt-8">
        <DashboardGrid sections={sections} />
      </div>

    </div>
  );
}
