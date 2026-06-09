'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Lightbulb, Brain, FileText, PenTool, Calendar, 
  Bot, Code2, BookOpen, ShieldCheck, Rocket, Search
} from 'lucide-react';
import { Suspense } from 'react';

const phases = [
  {
    id: 'define',
    name: 'Phase 01: Define',
    icon: Lightbulb,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    tools: [
      'Start Project', 'Tech Stack Selector', 'Blueprint Selection', 'Geeta Guidance'
    ]
  },
  {
    id: 'analyze',
    name: 'Phase 02: Analyze',
    icon: Brain,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    tools: [
      'AI Analysis', 'AI Suggestions', 'Knowledgebase', 'Review KB'
    ]
  },
  {
    id: 'summarize',
    name: 'Phase 03: Summarize',
    icon: FileText,
    color: 'text-gray-400',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/20',
    tools: [
      'Project Summary', 'Feature Engine', 'Ambiguity Scan', 'Missing Requirements'
    ]
  },
  {
    id: 'architect',
    name: 'Phase 04: Architect',
    icon: PenTool,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    tools: [
      'Solution Architect', 'API Blueprint', 'Database Designer', 'Wireframe Planner', 'UI Preview', 'Dependency Graph'
    ]
  },
  {
    id: 'plan',
    name: 'Phase 05: Plan',
    icon: Calendar,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    tools: [
      'Sprint Planner', 'Estimation', 'User Stories', 'Risk Analyzer', 'Client Proposal'
    ]
  },
  {
    id: 'intelligence',
    name: 'Phase 06: Intelligence',
    icon: Bot,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    tools: [
      'Auto Intelligence', 'Skills Analyzer', 'Competitive Analysis', 'Security Scan'
    ]
  },
  {
    id: 'compile',
    name: 'Phase 07: Compile',
    icon: Code2,
    color: 'text-accent-neon',
    bg: 'bg-accent-neon/10',
    border: 'border-accent-neon/20',
    tools: [
      'Phase Prompts', 'Prompt Workshop', 'Platform Exporter'
    ]
  },
  {
    id: 'document',
    name: 'Phase 08: Document',
    icon: BookOpen,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    tools: [
      'Master Document', 'PRD Generator', 'BRD Generator', 'Meeting Intelligence'
    ]
  },
  {
    id: 'validate',
    name: 'Phase 09: Validate',
    icon: ShieldCheck,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    tools: [
      'Testing Intelligence', 'Code Audit', 'Compliance', 'Audit Center'
    ]
  },
  {
    id: 'launch',
    name: 'Phase 10: Launch',
    icon: Rocket,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    tools: [
      'Deploy Checklist', 'SOP Generator', 'Changelog', 'Client Handoff'
    ]
  }
];

function getSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function HubContent() {
  const searchParams = useSearchParams();
  const filterPhase = searchParams.get('phase');

  const displayPhases = filterPhase 
    ? phases.filter(p => p.id === filterPhase) 
    : phases;

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-l-4 border-l-accent-neon">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">The 10-Phase Pipeline</h1>
          <p className="text-gray-400 text-sm mt-1">Access all 50+ enterprise intelligence modules. The core Bhagvat Gita engine.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search 50+ tools..." 
            className="w-full bg-black/40 border border-[var(--color-glass-border)] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent-neon transition-all"
          />
        </div>
      </div>

      {/* Phases Grid */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-8 pb-10">
        {displayPhases.map((phase) => (
          <div key={phase.id} className="space-y-4">
            <h2 className={`text-xl font-bold flex items-center gap-2 ${phase.color}`}>
              <div className={`p-2 rounded-lg ${phase.bg} ${phase.border} border`}>
                <phase.icon className="w-5 h-5" />
              </div>
              {phase.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {phase.tools.map((tool) => (
                <Link 
                  key={tool} 
                  href={`/tool/${getSlug(tool)}`}
                  className="glass-panel p-4 hover:border-accent-neon hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] cursor-pointer group transition-all block relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl -mr-8 -mt-8 group-hover:bg-accent-neon/10 transition-all" />
                  <h3 className="font-semibold text-gray-200 group-hover:text-white transition-colors relative z-10">{tool}</h3>
                  <div className="mt-4 flex justify-between items-center relative z-10">
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold group-hover:text-accent-neon transition-colors">Launch Module</span>
                    <div className={`w-6 h-6 rounded-full bg-white/5 flex items-center justify-center transition-colors group-hover:${phase.bg}`}>
                      <phase.icon className={`w-3 h-3 text-gray-400 group-hover:${phase.color}`} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
        
        {displayPhases.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            No phases found matching your criteria.
          </div>
        )}
      </div>

    </div>
  );
}

export default function HubPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading Pipeline...</div>}>
      <HubContent />
    </Suspense>
  );
}
