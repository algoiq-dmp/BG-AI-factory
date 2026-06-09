'use client';

import { Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';

const modes = [
  {
    id: 'krishna',
    name: 'Krishna',
    role: 'Strategic Advisor',
    color: 'bg-blue-500',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    active: true,
    desc: 'Thinks strategically about market positioning, competitive moats, business model sustainability, and 5-year vision. Best for initial planning and business decisions.',
    triggers: 'start, Dashboard, projects, competitive'
  },
  {
    id: 'arjun',
    name: 'Arjun',
    role: 'Question Master',
    color: 'bg-yellow-500',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/5',
    active: false,
    desc: 'Questions everything relentlessly. Challenges assumptions, finds contradictions, demands specifics, and detects ambiguity. Best for MCQ rounds and requirement clarification.',
    triggers: 'mcq, meeting, req-intel, user-stories'
  },
  {
    id: 'bhishma',
    name: 'Bhishma',
    role: 'Risk Governor',
    color: 'bg-red-500',
    border: 'border-red-500/30',
    bg: 'bg-red-500/5',
    active: false,
    desc: 'Identifies all risks: compliance gaps, scalability limits, single points of failure, security vulnerabilities, vendor lock-in. Best for audit and risk analysis.',
    triggers: 'audit, risk, testing, sop, compliance, deploy-checklist'
  },
  {
    id: 'chanakya',
    name: 'Chanakya',
    role: 'Cost Optimizer',
    color: 'bg-emerald-500',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    active: false,
    desc: 'Optimizes ruthlessly. Cuts unnecessary costs, finds cheaper alternatives, maximizes ROI, reduces infrastructure spend. Best for estimation and vendor selection.',
    triggers: 'estimation, skills, research, sprint-planner, proposal'
  },
  {
    id: 'hanuman',
    name: 'Hanuman',
    role: 'Speed Executor',
    color: 'bg-orange-500',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/5',
    active: false,
    desc: 'Prioritizes speed and shipping. MVP-first thinking, generate clean code fast, iterate later. Best for prompt generation and rapid prototyping.',
    triggers: 'phase-prompts, prompt-compiler, prompts, changelog'
  },
  {
    id: 'vishwakarma',
    name: 'Vishwakarma',
    role: 'System Architect',
    color: 'bg-purple-500',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/5',
    active: false,
    desc: 'Designs scalable systems. Plans microservices, creates diagrams, thinks in design patterns, considers performance at scale. Best for architecture planning.',
    triggers: 'architect, knowledgebase, dependencies, master, db-designer, api-blueprint, wireframes, ui-preview'
  }
];

export default function GitaModesPage() {
  const [autoMode, setAutoMode] = useState(true);

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
            <span className="w-8 h-8 rounded-lg bg-[#5b5fd8]/20 flex items-center justify-center text-[#5b5fd8]">
              🕉️
            </span>
            Gita Modes
          </h1>
          <p className="text-[#8b9bb4] text-sm mt-1">
            6 AI personalities for different thinking styles. Select a mode or enable auto-switching.
          </p>
        </div>
        <button 
          onClick={() => setAutoMode(!autoMode)}
          className={`px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2 transition-all border ${
            autoMode 
              ? 'bg-[#1a4d2e] text-[#51cf66] border-[#51cf66]/30 shadow-[0_0_15px_rgba(81,207,102,0.1)]' 
              : 'bg-[#1e2532] text-[#8b9bb4] border-[#8b9bb4]/30'
          }`}
        >
          <Zap className={`w-4 h-4 ${autoMode ? 'text-[#51cf66]' : ''}`} />
          {autoMode ? 'Auto Mode ON' : 'Auto Mode OFF'}
        </button>
      </div>

      {/* Auto Mode Banner */}
      {autoMode && (
        <div className="bg-[#0b0e14]/60 border border-[#5b5fd8]/30 rounded-lg p-4 flex items-start gap-3">
          <span className="text-[#51cf66] font-bold text-sm shrink-0">Auto Mode —</span>
          <p className="text-[#8b9bb4] text-sm leading-relaxed">
            AI personality switches automatically based on the page you're on. MCQ uses Arjun, Audit uses Bhishma, Prompts use Hanuman, Architecture uses Vishwakarma.
          </p>
        </div>
      )}

      {/* Grid of Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {modes.map((mode) => (
          <div 
            key={mode.id} 
            className={`rounded-xl p-5 border cursor-pointer transition-all ${
              mode.active 
                ? `border-[#5b5fd8] bg-[#1a1b3b] shadow-[0_0_20px_rgba(91,95,216,0.15)]` 
                : `border-[#1e2532] bg-[#0b0e14] hover:border-[#586c8f]`
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-4 h-4 rounded-full ${mode.color} shadow-[0_0_10px_${mode.color}]`} />
              <div>
                <h3 className="text-white font-bold flex items-center gap-2">
                  {mode.name}
                  {mode.active && <span className="text-[9px] font-extrabold tracking-widest text-[#5b5fd8] uppercase bg-[#5b5fd8]/20 px-1.5 py-0.5 rounded">Active</span>}
                </h3>
                <p className={`text-xs font-semibold ${mode.color.replace('bg-', 'text-')}`}>
                  {mode.role}
                </p>
              </div>
            </div>
            
            <p className="text-sm text-[#8b9bb4] leading-relaxed mb-4 min-h-[80px]">
              {mode.desc}
            </p>
            
            <div className="text-[10px] text-[#586c8f] uppercase tracking-wider font-bold">
              Auto-activates on: <span className="text-[#8b9bb4] font-medium lowercase tracking-normal">{mode.triggers}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Mode Switches */}
      <div className="mt-8">
        <h3 className="text-[10px] font-bold text-[#586c8f] uppercase tracking-widest mb-4">
          RECENT MODE SWITCHES
        </h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[#8b9bb4]">Krishna <span className="text-[#586c8f]">• 04:30 pm</span></span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-[#8b9bb4]">Arjun <span className="text-[#586c8f]">• 04:30 pm</span></span>
          </div>
        </div>
      </div>

    </div>
  );
}
