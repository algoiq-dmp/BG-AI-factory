'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Mic, Paperclip, Send, Bot, CheckCircle2, 
  ChevronRight, Database, Server, Code2, Users, FileText,
  Activity, ShieldCheck, Zap, Globe, Cpu, IndianRupee, Layers, Edit2
} from 'lucide-react';
import ProjectIntelligence from './ProjectIntelligence';
import EditableBlueprint from './EditableBlueprint';

/* ─── Mock Data & Types ──────────────────────────────────────── */

type ViewState = 'INPUT' | 'ANALYZING' | 'RESULTS';

const ANALYSIS_STEPS = [
  "Understanding business model...",
  "Detecting industry & domain...",
  "Identifying key features...",
  "Selecting tech stack...",
  "Estimating complexity...",
  "Mapping required modules...",
  "Detecting integrations & APIs...",
  "Analyzing scalability needs...",
  "Estimating timeline & cost..."
];

const WHY_RECOMMENDED = [
  { tech: 'PostgreSQL', reason: 'Best for financial transactional systems, high reliability, ACID compliance and advanced analytics support.', icon: <Database size={16} color="#3b82f6"/>, match: 'High Match' },
  { tech: 'Redis', reason: 'Required for fast live market data caching, sessions and real-time notifications.', icon: <Server size={16} color="#ef4444"/>, match: 'High Match' },
  { tech: 'Next.js', reason: 'SEO friendly, scalable frontend framework with excellent performance and ecosystem.', icon: <Code2 size={16} color="#e2e8f0"/>, match: 'High Match' },
  { tech: 'AWS', reason: 'Highly scalable, secure and enterprise ready cloud infrastructure.', icon: <Cloud size={16} color="#f59e0b"/>, match: 'High Match' }
];

function Cloud(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke={props.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.5 19c.8 0 1.5-.7 1.5-1.5 0-2.3-2.6-3-4-3-1.1 0-1.8.8-1.8 1.8 0 .4.3.7.7.7.4 0 .7-.3.7-.7 0-.3.3-.6.6-.6 1.4 0 2.5 1 2.5 2.5 0 .3-.2.5-.5.5h-11c-.3 0-.5-.2-.5-.5 0-1.5 1.1-2.5 2.5-2.5.3 0 .6.3.6.6 0 .4.3.7.7.7.4 0 .7-.3.7-.7 0-1-1.2-1.8-1.8-1.8-1.4 0-4 1.2-4 3 0 .8.7 1.5 1.5 1.5h11z"/><path d="M16 10c0-4.4-3.6-8-8-8S0 5.6 0 10c0 4 3 7.3 7 7.9M20.2 11.2c.4-.2.9-.2 1.4-.2 2.4 0 4.4 2 4.4 4.5 0 2.2-1.6 4-3.8 4.4"/></svg>;
}

const MULTIPLE_CHOICES = [
  {
    id: 'loginMethods',
    question: 'Login methods',
    multi: true,
    options: ['Email/password', 'Google OAuth', 'Magic link', 'OTP', 'SSO/SAML', 'Invite-only', 'Anonymous trial'],
    defaultActive: ['Email/password', 'Google OAuth']
  },
  {
    id: 'coreFeatures',
    question: 'Core features',
    multi: true,
    options: ['Dashboard', 'CRUD screens', 'Forms', 'Tables', 'Search/filter', 'Import/export', 'File upload', 'Comments', 'Activity history'],
    defaultActive: ['Dashboard', 'CRUD screens', 'Search/filter', 'Activity history']
  },
  {
    id: 'aiFeatures',
    question: 'AI features',
    multi: true,
    options: ['Question generator', 'Prompt builder', 'RAG knowledgebase', 'Chat assistant', 'Summarization', 'Workflow agent', 'Evaluation'],
    defaultActive: ['Question generator', 'Prompt builder', 'RAG knowledgebase']
  },
  {
    id: 'userManagement',
    question: 'User management',
    multi: true,
    options: ['Profiles', 'Teams', 'Organizations', 'Invitations', 'Permissions', 'Account deletion', 'Admin impersonation'],
    defaultActive: ['Profiles', 'Teams', 'Permissions']
  },
  {
    id: 'qualityOps',
    question: 'Quality and ops',
    multi: true,
    options: ['Loading states', 'Empty states', 'Error states', 'Validation', 'Audit logs', 'Rate limits', 'Tests', 'Seed data'],
    defaultActive: ['Loading states', 'Empty states', 'Error states', 'Validation']
  }
];

const DETECTED_MODULES = [
  'Authentication', 'Dashboard', 'Market Data', 'AI Signals', 'Portfolio', 'Orders', 'Payments', 'Notifications', 'AI Assistant', 'Reports', 'User Management', 'Settings'
];

/* ─── Main Component ─────────────────────────────────────────── */

export default function StartProjectPage() {
  const router = useRouter();
  const [viewState, setViewState] = useState<ViewState>('INPUT');
  const [idea, setIdea] = useState('');
  
  // Analyzing state
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0);
  
  // Results state
  const [answers, setAnswers] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    MULTIPLE_CHOICES.forEach(mc => {
      init[mc.id] = mc.defaultActive || [];
    });
    return init;
  });

  const getDynamicData = () => {
    const lower = idea.toLowerCase();
    const isSimple = lower.includes('website') || lower.includes('single page') || lower.includes('landing') || lower.includes('simple');
    
    let projName = "AI Project";
    if (idea) {
      const words = idea.replace(/[^a-zA-Z ]/g, "").split(' ').filter(w => w.length > 2);
      if (words.length > 0) {
        projName = words.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + (isSimple ? ' Site' : ' Platform');
      }
    }

    return {
      name: projName,
      industry: isSimple ? 'Web / Media' : (lower.includes('fin') || lower.includes('trade') ? 'FinTech' : 'SaaS / Tech'),
      platform: isSimple ? 'Web (SPA)' : 'Web + Mobile',
      architecture: isSimple ? 'Static / Serverless' : 'SaaS Multi-Tenant',
      complexity: isSimple ? 'Low' : 'High',
      team: isSimple ? '1 - 2 Members' : '8 - 12 Members',
      timeline: isSimple ? '2 - 4 Weeks' : '5 Months',
      priority: isSimple ? 'Speed to Market' : 'High Scalability',
      
      aiTime: isSimple ? '1 Week' : '4 Weeks',
      humanTime: isSimple ? '6 Weeks' : '16 Weeks',
      hybridTime: isSimple ? '2 Weeks' : '6 Weeks',
      
      analysis: isSimple 
        ? "This timeline is suggested because the core features rely heavily on standard frontend components. The main bottleneck will be finalizing the UI design. The recommended approach is to have AI generate the boilerplate React components while humans focus on brand identity."
        : "This timeline is suggested because the core features rely heavily on standard CRUD and established AI integrations. The main bottleneck will be setting up real-time WebSockets. The recommended approach is to have AI generate the boilerplate API layer while humans focus on the specialized logic."
    };
  };

  const dynamicData = getDynamicData();

  const PROJECT_SUMMARY = [
    { label: 'Project Name', value: dynamicData.name, icon: <Bot size={14}/> },
    { label: 'Industry', value: dynamicData.industry, icon: <Activity size={14}/> },
    { label: 'Platform', value: dynamicData.platform, icon: <Globe size={14}/> },
    { label: 'Architecture', value: dynamicData.architecture, icon: <Server size={14}/> },
    { label: 'Complexity', value: dynamicData.complexity, icon: <Zap size={14}/> },
    { label: 'Team Size', value: dynamicData.team, icon: <Users size={14}/> },
    { label: 'Estimated Timeline', value: dynamicData.timeline, icon: <Activity size={14}/> },
    { label: 'Priority', value: dynamicData.priority, icon: <ShieldCheck size={14}/> },
  ];

  // Dynamic values
  const [confidence, setConfidence] = useState(88);
  const [costIndex, setCostIndex] = useState(0);

  const costs = ['₹12–15 Lakhs', '₹18–25 Lakhs', '₹30–45 Lakhs', '₹50L+'];
  const times = ['3–4 Months', '4–5 Months', '6–8 Months', '9+ Months'];

  // Handle MCQ selection
  const toggleOption = (mcqId: string, option: string, multi?: boolean) => {
    setAnswers(prev => {
      const current = prev[mcqId] || [];
      let next;
      if (multi) {
        next = current.includes(option) ? current.filter(o => o !== option) : [...current, option];
      } else {
        next = [option];
      }
      return { ...prev, [mcqId]: next };
    });

    // Animate stats
    setConfidence(prev => Math.min(99, prev + Math.floor(Math.random() * 3)));
    if (Math.random() > 0.5) setCostIndex(prev => Math.min(3, prev + 1));
  };

  // Start analysis simulation
  const handleGenerate = () => {
    if (!idea.trim()) return;
    setViewState('ANALYZING');
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentAnalysisStep(step);
      if (step >= ANALYSIS_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => setViewState('RESULTS'), 600);
      }
    }, 800);
  };

  const [isSaving, setIsSaving] = useState(false);

  // Save project and launch
  const handleLaunch = async () => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: idea ? (idea.length > 40 ? idea.substring(0, 40) + '...' : idea) : 'New AI Project',
          description: idea || 'Created from AI Blueprint',
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Redirect to projects page to see it saved client-wise
        router.push('/projects');
      } else {
        alert('Failed to save project to database: ' + data.error);
        setIsSaving(false);
      }
    } catch (error) {
      console.error(error);
      alert('Network error saving project.');
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-full flex bg-[#0b0e14] text-white overflow-hidden relative">
      
      {/* ========================================== */}
      {/* STATE 1: IDEA INPUT (ChatGPT-style Landing)  */}
      {/* ========================================== */}
      {viewState === 'INPUT' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full relative z-10">
          
          <div className="w-16 h-16 bg-[#5b5fd8]/20 rounded-2xl flex items-center justify-center mb-8 border border-[#5b5fd8]/30 shadow-[0_0_30px_rgba(91,95,216,0.3)]">
            <Bot className="w-8 h-8 text-[#818cf8]" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center tracking-tight">
            What do you want to build today?
          </h1>
          <p className="text-[#8b9bb4] mb-12 text-center text-lg max-w-xl">
            Don't worry about forms or technical specs. Just describe your idea, and our AI Business Analyst will build the entire project foundation automatically.
          </p>

          <div className="w-full max-w-3xl relative">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="E.g. Build an AI trading platform for options traders with charts, signals, WhatsApp alerts..."
              className="w-full bg-[#111622]/80 border-2 border-[#1e2532] rounded-2xl p-6 pr-16 text-lg text-white focus:outline-none focus:border-[#5b5fd8] transition-all resize-none shadow-2xl"
              rows={4}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <button className="p-2 text-[#586c8f] hover:text-white transition-colors bg-[#0b0e14] rounded-full border border-[#1e2532]">
                <Paperclip size={18} />
              </button>
              <button className="p-2 text-[#586c8f] hover:text-white transition-colors bg-[#0b0e14] rounded-full border border-[#1e2532]">
                <Mic size={18} />
              </button>
              <button 
                onClick={handleGenerate}
                disabled={!idea.trim()}
                className="p-3 bg-[#5b5fd8] text-white rounded-full hover:bg-[#4f46e5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(91,95,216,0.4)]"
              >
                <Send size={18} className="ml-1" />
              </button>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-3 max-w-3xl">
            <span className="text-xs font-bold text-[#586c8f] uppercase tracking-widest w-full text-center mb-2">Try these examples</span>
            {[
              { t: 'AI CRM for real estate agents', i: <Users size={14}/> },
              { t: 'Food delivery app for city', i: <Sparkles size={14}/> },
              { t: 'AI stock analysis platform', i: <Activity size={14}/> },
              { t: 'SaaS for gym management', i: <Database size={14}/> }
            ].map((ex, i) => (
              <button key={i} onClick={() => setIdea(ex.t)} className="flex items-center gap-2 px-4 py-2 bg-[#111622] border border-[#1e2532] rounded-full text-sm text-[#c9d1d9] hover:border-[#5b5fd8] hover:text-white transition-all">
                <span className="text-[#8b9bb4]">{ex.i}</span> {ex.t}
              </button>
            ))}
          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* STATE 2: AI ANALYZING (Loading Screen)       */}
      {/* ========================================== */}
      {viewState === 'ANALYZING' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-xl mx-auto w-full relative z-10">
          
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-[#5b5fd8]/20 blur-3xl rounded-full animate-pulse" />
            <div className="w-24 h-24 bg-[#111622] rounded-full border-2 border-[#5b5fd8] flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(91,95,216,0.5)]">
              <Bot className="w-12 h-12 text-[#a5b4fc] animate-bounce" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#a5b4fc] to-[#6366f1]">
            AI is analyzing your idea...
          </h2>

          <div className="w-full space-y-4">
            {ANALYSIS_STEPS.map((step, idx) => {
              const isActive = idx === currentAnalysisStep;
              const isPast = idx < currentAnalysisStep;
              
              if (idx > currentAnalysisStep + 1) return null;

              return (
                <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${isActive ? 'bg-[#5b5fd8]/10 border border-[#5b5fd8]/30 scale-105' : isPast ? 'opacity-50' : 'opacity-0'}`}>
                  {isPast ? (
                    <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                  ) : isActive ? (
                    <div className="w-5 h-5 rounded-full border-2 border-[#5b5fd8] border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#1e2532]" />
                  )}
                  <span className={`font-medium ${isActive ? 'text-white' : 'text-[#8b9bb4]'}`}>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STATE 3: RESULTS & REFINEMENT                */}
      {/* ========================================== */}
      {viewState === 'RESULTS' && (
        <div className="flex-1 flex w-full h-full">
          
          {/* LEFT: Scrollable Content (Summary, Why, MCQs) */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative">
            <div className="max-w-3xl mx-auto">
              
              <div className="flex items-center gap-3 mb-8">
                <button onClick={() => setViewState('INPUT')} className="p-2 bg-[#111622] hover:bg-[#1e2532] rounded-lg border border-[#1e2532] text-[#8b9bb4] transition-colors">
                  <ChevronRight size={18} className="rotate-180" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-white">Project Blueprint</h2>
                  <p className="text-[#8b9bb4] text-sm">AI has mapped out your idea. Refine it below.</p>
                </div>
              </div>

              {/* PROJECT SUMMARY GRID */}
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-[#8b5cf6]" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#c9d1d9]">Project Summary</h3>
                  <span className="ml-2 text-[10px] bg-[#8b5cf6]/20 text-[#c4b5fd] px-2 py-0.5 rounded-full border border-[#8b5cf6]/30">AI GENERATED</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {PROJECT_SUMMARY.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-[#111622]/50 border border-[#1e2532] rounded-lg">
                      <div className="w-8 h-8 rounded-md bg-[#1e2532] flex items-center justify-center text-[#8b9bb4]">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-[10px] text-[#586c8f] uppercase font-bold">{item.label}</div>
                        <div className="text-sm font-semibold text-[#e2e8f0]">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* WHY AI RECOMMENDED THIS */}
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <Bot size={16} className="text-[#10b981]" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#c9d1d9]">Why AI Recommended This</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {WHY_RECOMMENDED.map((rec, i) => (
                    <div key={i} className="p-4 bg-gradient-to-br from-[#111622] to-[#0b0e14] border border-[#1e2532] rounded-xl relative overflow-hidden group hover:border-[#3b82f6]/50 transition-colors">
                      <div className="absolute top-0 right-0 p-3">
                        <span className="text-[9px] font-bold uppercase text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded-md border border-[#10b981]/20">{rec.match}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0b0e14] border border-[#1e2532] flex items-center justify-center">
                          {rec.icon}
                        </div>
                        <span className="font-bold text-[#e2e8f0]">{rec.tech}</span>
                      </div>
                      <p className="text-xs text-[#8b9bb4] leading-relaxed">
                        {rec.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-[#1e2532] mb-12" />

              {/* MULTIPLE CHOICES */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6 border-b border-[#1e2532] pb-3">
                  <h3 className="text-sm font-bold text-[#f59e0b] uppercase tracking-widest flex items-center gap-2">
                    MULTIPLE CHOICES
                  </h3>
                  <div className="h-px bg-gradient-to-r from-[#f59e0b]/50 to-transparent flex-1" />
                  <button className="text-xs font-bold text-[#818cf8] flex items-center gap-1.5 px-3 py-1 bg-[#5b5fd8]/10 rounded-full border border-[#5b5fd8]/30 hover:bg-[#5b5fd8]/20 transition-all">
                    <Edit2 size={12}/> Edit
                  </button>
                </div>

                <div className="space-y-8">
                  {MULTIPLE_CHOICES.map((category) => (
                    <div key={category.id} className="flex flex-col">
                      <div className="text-sm font-bold text-[#e2e8f0] mb-3">
                        {category.question}
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {category.options.map(opt => {
                          const isSelected = (answers[category.id] || []).includes(opt);
                          return (
                            <button
                              key={opt}
                              onClick={() => toggleOption(category.id, opt, category.multi)}
                              className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all border ${
                                isSelected 
                                  ? 'bg-[#5b5fd8]/20 border-[#5b5fd8] text-white shadow-[0_0_15px_rgba(91,95,216,0.15)]' 
                                  : 'bg-[#111622] border-[#1e2532] text-[#8b9bb4] hover:border-[#3b82f6]/50 hover:text-[#c9d1d9]'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${isSelected ? 'bg-[#5b5fd8] border-[#5b5fd8]' : 'bg-[#0b0e14] border-[#586c8f]'}`}>
                                  {isSelected && <CheckCircle2 size={10} color="#fff" strokeWidth={3} />}
                                </div>
                                {opt}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <EditableBlueprint />

              <ProjectIntelligence dynamicData={dynamicData} />

            </div>
          </div>

          {/* RIGHT: LIVE AI ARCHITECTURE SIDEBAR */}
          <div className="w-[340px] bg-gradient-to-b from-[#111622] to-[#0b0e14] border-l border-[#1e2532] flex flex-col">
            <div className="p-6 border-b border-[#1e2532] bg-[#111622]/50 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#10b981]">Live Architecture</h3>
              </div>
              <p className="text-xs text-[#586c8f]">Updates in real-time as you answer.</p>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              
              {/* Confidence Gauge */}
              <div className="bg-[#0b0e14] p-4 rounded-xl border border-[#1e2532] mb-6 shadow-inner">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-[#8b9bb4] uppercase tracking-wider">Project Confidence</span>
                  <span className="text-2xl font-black text-[#10b981]">{confidence}%</span>
                </div>
                <div className="h-1.5 bg-[#1e2532] rounded-full overflow-hidden">
                  <div className="h-full bg-[#10b981] transition-all duration-700 ease-out" style={{ width: `${confidence}%` }} />
                </div>
                <p className="text-[10px] text-[#586c8f] mt-2">
                  {confidence > 90 ? 'Great! Your project is well defined.' : 'Answer more questions to increase confidence.'}
                </p>
              </div>

              {/* Cost & Timeline */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#0b0e14] p-3 rounded-xl border border-[#1e2532]">
                  <div className="text-[10px] font-bold text-[#8b9bb4] uppercase mb-1 flex items-center gap-1"><IndianRupee size={10}/> Est. Cost</div>
                  <div className="text-sm font-bold text-[#f59e0b] transition-all">{costs[costIndex]}</div>
                </div>
                <div className="bg-[#0b0e14] p-3 rounded-xl border border-[#1e2532]">
                  <div className="text-[10px] font-bold text-[#8b9bb4] uppercase mb-1 flex items-center gap-1"><Activity size={10}/> Est. Time</div>
                  <div className="text-sm font-bold text-[#3b82f6] transition-all">{times[costIndex]}</div>
                </div>
              </div>

              {/* Detected Modules */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-[#8b9bb4] uppercase tracking-wider flex items-center gap-1.5"><Layers size={12}/> Detected Modules</span>
                  <span className="text-[10px] bg-[#1e2532] text-[#8b9bb4] px-2 py-0.5 rounded-full">{DETECTED_MODULES.length}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DETECTED_MODULES.map(mod => (
                    <span key={mod} className="text-[10px] bg-[#111622] border border-[#1e2532] text-[#c9d1d9] px-2 py-1 rounded-md">
                      {mod}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Team */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-[#8b9bb4] uppercase tracking-wider flex items-center gap-1.5"><Users size={12}/> Recommended Team</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs p-2 bg-[#0b0e14] border border-[#1e2532] rounded-lg">
                    <span className="text-[#c9d1d9]">Frontend Developers</span>
                    <span className="font-bold text-[#818cf8]">2</span>
                  </div>
                  <div className="flex justify-between text-xs p-2 bg-[#0b0e14] border border-[#1e2532] rounded-lg">
                    <span className="text-[#c9d1d9]">Backend / API</span>
                    <span className="font-bold text-[#818cf8]">2</span>
                  </div>
                  <div className="flex justify-between text-xs p-2 bg-[#0b0e14] border border-[#1e2532] rounded-lg">
                    <span className="text-[#c9d1d9]">AI Engineers</span>
                    <span className="font-bold text-[#818cf8]">1</span>
                  </div>
                  <div className="flex justify-between text-xs p-2 bg-[#0b0e14] border border-[#1e2532] rounded-lg">
                    <span className="text-[#c9d1d9]">DevOps / QA</span>
                    <span className="font-bold text-[#818cf8]">2</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleLaunch}
                disabled={isSaving}
                className="w-full py-4 bg-gradient-to-r from-[#5b5fd8] to-[#4f46e5] text-white rounded-xl font-bold hover:shadow-[0_0_20px_rgba(91,95,216,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving Project...' : 'Launch AI Agents'} <Sparkles size={16} />
              </button>

            </div>
          </div>

        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e2532; border-radius: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #30363d; }
      `}</style>

    </div>
  );
}
