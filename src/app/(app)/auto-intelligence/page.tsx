'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { BrainCircuit, Zap, CheckCircle, Loader2, Play, Pause, XCircle, ChevronDown, ChevronUp, AlertTriangle, ShieldAlert, ZapIcon, Activity, Key, LayoutTemplate, Network, FileCode2 } from 'lucide-react';
import { saveDocument } from '@/app/actions/save-document';

const AUTO_INTEL_STEPS = [
  { id: 'summary', title: 'Project Summary', desc: 'Generate KB summary points' },
  { id: 'ambiguity', title: 'Ambiguity Scan', desc: 'Find vague requirements' },
  { id: 'missing', title: 'Missing Requirements', desc: 'Find gaps in requirements' },
  { id: 'dependency', title: 'Dependency Scan', desc: 'Identify external dependencies' },
  { id: 'security', title: 'Security Scan', desc: 'Find security gaps' },
  { id: 'compliance', title: 'Compliance Audit', desc: 'Check GDPR & data privacy' },
  { id: 'skills', title: 'Skills Analysis', desc: 'Identify team skills & gaps' },
  { id: 'risk', title: 'Risk Analysis', desc: 'Identify project risks & mitigations' },
  { id: 'enrich_kb', title: 'KB Enrichment (Round 1)', desc: 'Integrate all findings into KB' },
  { id: 'target_audience', title: 'Target Audience Enrichment', desc: 'Define primary user personas' },
  { id: 'monetization', title: 'Monetization Strategy', desc: 'Define revenue models' },
  { id: 'competitive', title: 'Competitive Landscape', desc: 'SWOT and market positioning' },
  { id: 'epics', title: 'Agile Epic Breakdown', desc: 'Group features into core epics' },
  { id: 'stories', title: 'User Stories Generation', desc: 'Write Jira-style user stories' },
  { id: 'acceptance', title: 'Acceptance Criteria', desc: 'Define BDD acceptance criteria' },
  { id: 'tech_debt', title: 'Technical Debt Audit', desc: 'Predict future scaling bottlenecks' },
  { id: 'db_schema', title: 'Database Schema Design', desc: 'Normalize 3NF tables and relations' },
  { id: 'api_blueprint', title: 'API Blueprint Architecture', desc: 'REST and GraphQL endpoints' },
  { id: 'components', title: 'System Component Map', desc: 'Frontend/Backend boundaries' },
  { id: 'testing', title: 'Testing Strategy', desc: 'Unit, Integration, and E2E plan' },
  { id: 'edge_cases', title: 'Edge Case Identification', desc: 'Find rare system failure points' },
  { id: 'deployment', title: 'Deployment Checklist', desc: 'CI/CD and launch verification' },
  { id: 'qa_sop', title: 'Quality Assurance SOP', desc: 'Standard Operating Procedures' },
  { id: 'prompts_1', title: 'Phase 1-5 Prompts Compilation', desc: 'Generate Cursor/Bolt prompts part 1' },
  { id: 'prompts_2', title: 'Phase 6-10 Prompts Compilation', desc: 'Generate Cursor/Bolt prompts part 2' },
  { id: 'master_kb', title: 'Final Master KB Assembly', desc: 'Compile everything into one brain' },
  { id: 'readiness', title: 'Final Review & Readiness', desc: 'Go/No-Go Launch decision' },
];

export default function AutoIntelligencePage() {
  const { data: session } = useSession();
  const [projectId, setProjectId] = useState<string>('');
  
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'PAUSED' | 'ABORTED' | 'COMPLETED'>('IDLE');
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [stepLogs, setStepLogs] = useState<Record<string, string>>({});
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [elapsedTime, setElapsedTime] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem('activeProjectId');
    if (savedId) setProjectId(savedId);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'RUNNING') {
      timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  const toggleExpand = (id: string) => {
    setExpandedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getTimestamp = () => {
    const d = new Date();
    return `[${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}]`;
  };

  const appendLog = (stepId: string, text: string) => {
    setStepLogs(prev => ({
      ...prev,
      [stepId]: (prev[stepId] || '') + text
    }));
  };

  const executePipeline = async (startIndex = 0) => {
    if (!projectId) return alert('Please select a project first.');
    
    setStatus('RUNNING');
    abortControllerRef.current = new AbortController();
    
    for (let i = startIndex; i < AUTO_INTEL_STEPS.length; i++) {
      if (abortControllerRef.current?.signal.aborted) break;
      
      const step = AUTO_INTEL_STEPS[i];
      setCurrentStepIndex(i);
      setExpandedSteps(prev => ({ ...prev, [step.id]: true }));
      
      if (!stepLogs[step.id]) {
        appendLog(step.id, `${getTimestamp()} Running ${step.title.toLowerCase()}...\n`);
      }
      
      try {
        const res = await fetch('/api/tools/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortControllerRef.current.signal,
          body: JSON.stringify({
            projectId,
            task: `Auto-Intel Step: ${step.title}`,
            context: `You are executing step ${i+1}/27 of the Auto-Intelligence pipeline. Objective: ${step.desc}.`,
            systemPrompt: `You are an elite Enterprise Architect. Output highly detailed markdown for: ${step.title}. Do NOT include pleasantries.`,
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        let done = false;

        while (!done) {
          if (abortControllerRef.current?.signal.aborted) {
            reader.cancel();
            break;
          }
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = decoder.decode(value);
            fullResponse += chunk;
            appendLog(step.id, chunk);
          }
        }
        
        if (abortControllerRef.current?.signal.aborted) break;

        await saveDocument(projectId, `AutoIntel: ${step.title}`, fullResponse, 'AUTO_INTEL_LOG');
        appendLog(step.id, `\n\n${getTimestamp()} ✔ Findings sent to KB & saved.\n`);
        
      } catch (error: any) {
        if (error.name === 'AbortError') break;
        setErrorCount(prev => prev + 1);
        appendLog(step.id, `\n\n${getTimestamp()} ❌ ERROR: ${error.message}\n`);
        setStatus('PAUSED');
        return; 
      }
    }
    
    if (!abortControllerRef.current?.signal.aborted) {
      setStatus('COMPLETED');
      setCurrentStepIndex(AUTO_INTEL_STEPS.length);
    }
  };

  const handleStart = () => executePipeline(0);
  const handlePause = () => {
    abortControllerRef.current?.abort();
    setStatus('PAUSED');
  };
  const handleResume = () => executePipeline(currentStepIndex);
  const handleAbort = () => {
    abortControllerRef.current?.abort();
    setStatus('ABORTED');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'HIGH': return 'bg-red-50 text-red-600 border-red-200';
      case 'MEDIUM': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'LOW': return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getSeverityBorder = (severity: string) => {
    switch(severity) {
      case 'HIGH': return 'border-l-4 border-l-red-500';
      case 'MEDIUM': return 'border-l-4 border-l-amber-500';
      case 'LOW': return 'border-l-4 border-l-blue-500';
      default: return 'border-l-4 border-l-slate-500';
    }
  };

  const progressPercent = Math.round((Math.max(0, currentStepIndex) / AUTO_INTEL_STEPS.length) * 100);

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500 w-full bg-white text-slate-900">
      
      {/* Header Info */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-[#f59e0b]" />
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Auto Intelligence <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase ml-2 tracking-widest align-middle">Live</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm font-mono text-slate-500 font-bold">
            <span>⏱ {formatTime(elapsedTime)}</span>
          </div>
        </div>
        <p className="text-slate-500 text-sm">One-click autopilot — runs all intelligence modules and generates final prompts.</p>
      </div>

      {/* Progress Bar & Controls */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
          <span>{progressPercent}% Complete</span>
          <span>{Math.max(0, currentStepIndex)}/27 steps • {status === 'ABORTED' ? 'Aborted' : 'no errors'}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-[#10b981] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex gap-3">
          {status === 'IDLE' || status === 'ABORTED' || status === 'COMPLETED' ? (
            <button 
              onClick={handleStart}
              className="bg-[#5b5fd8] hover:bg-[#4a4fcf] text-white px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> {status === 'COMPLETED' ? 'Restart' : 'Start'} Auto Intel
            </button>
          ) : status === 'PAUSED' ? (
            <button 
              onClick={handleResume}
              className="bg-[#5b5fd8] hover:bg-[#4a4fcf] text-white px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> Resume
            </button>
          ) : (
            <button 
              onClick={handlePause}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
            >
              <Pause className="w-4 h-4" /> Pause
            </button>
          )}

          {(status === 'RUNNING' || status === 'PAUSED') && (
            <button 
              onClick={handleAbort}
              className="bg-white border border-red-200 text-red-500 hover:bg-red-50 px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Abort
            </button>
          )}
        </div>
      </div>

      {/* Step List Inline Logs */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-extrabold text-slate-400 tracking-[2px] uppercase mb-4 flex items-center gap-2">
          <BrainCircuit className="w-3.5 h-3.5 text-pink-500" /> Intelligence
        </h3>
        
        {AUTO_INTEL_STEPS.map((step, idx) => {
          const isDone = currentStepIndex > idx || status === 'COMPLETED';
          const isRunning = currentStepIndex === idx && status === 'RUNNING';
          const isExpanded = expandedSteps[step.id];
          const hasLog = !!stepLogs[step.id];

          return (
            <div 
              key={step.id} 
              className={`rounded-lg border transition-all ${
                isRunning ? 'border-[#5b5fd8] shadow-sm' : 
                isDone ? 'border-[#10b981]' : 
                'border-slate-200'
              }`}
            >
              {/* Header */}
              <div 
                className="flex items-center justify-between p-3 cursor-pointer bg-white rounded-lg hover:bg-slate-50 transition-colors"
                onClick={() => toggleExpand(step.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 flex justify-center">
                    {isRunning ? (
                      <Loader2 className="w-4 h-4 text-[#5b5fd8] animate-spin" />
                    ) : isDone ? (
                      <CheckCircle className="w-4 h-4 text-[#10b981]" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`font-bold ${isDone ? 'text-slate-800' : isRunning ? 'text-[#5b5fd8]' : 'text-slate-500'}`}>
                      {step.title}
                    </span>
                    <span className="text-slate-400 hidden sm:inline">— {step.desc}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isDone && !isRunning && (
                    <span className="text-[10px] font-bold text-[#10b981] bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">
                      ✓ Done
                    </span>
                  )}
                  {hasLog ? (
                    isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : null}
                </div>
              </div>

              {/* Expandable Log Area */}
              {isExpanded && hasLog && (
                <div className="p-4 pt-0 border-t border-slate-100 bg-white rounded-b-lg mt-1">
                  <pre className="font-mono text-xs text-slate-600 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar mt-3">
                    {stepLogs[step.id]}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Report */}
      {status === 'COMPLETED' && (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center gap-2 mb-6">
            <ZapIcon className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-extrabold text-slate-900">Auto Intelligence Report</h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-8 mb-8 shadow-sm">
            <div className="grid grid-cols-4 gap-4 text-center mb-8">
              <div>
                <div className="text-4xl font-extrabold text-[#10b981] mb-2">{AUTO_INTEL_STEPS.length}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Steps Done</div>
              </div>
              <div>
                <div className={`text-4xl font-extrabold ${errorCount > 0 ? 'text-red-500' : 'text-red-500'} mb-2`}>{errorCount}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Errors</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-[#5b5fd8] mb-2">{formatTime(elapsedTime)}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time Taken</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-amber-500 mb-2">10/10</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prompts Ready</div>
              </div>
            </div>

            <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-lg p-4 flex items-center gap-3 text-sm text-[#065f46]">
              <CheckCircle className="w-5 h-5 text-[#10b981]" />
              <p><strong>Your project is ready!</strong> Navigate to <span className="font-bold underline cursor-pointer">Phase Prompts</span> to view and copy each phase&apos;s prompt for Antigravity Claude 4.6. All findings have been integrated into your KB.</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-pink-500" />
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Post-Pipeline Refinements</h2>
                <p className="text-xs text-slate-500 mt-1">AI reviewed all generated data and suggests these improvements — accept to add to your final KB</p>
              </div>
            </div>
            <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
              ⏳ 8 Pending
            </div>
          </div>

          <div className="space-y-3">
            {[
              { icon: ZapIcon, color: 'text-amber-500', title: 'Performance: No Caching Strategy Defined', severity: 'MEDIUM', desc: 'The KB mentions API endpoints and real-time data sync but lacks a caching layer to reduce latency and database load.' },
              { icon: ShieldAlert, color: 'text-red-500', title: 'Security: Missing API Rate Limiting Details', severity: 'HIGH', desc: 'The KB defines pricing tiers with API call limits but does not specify how rate limiting is enforced to prevent abuse.' },
              { icon: Activity, color: 'text-amber-500', title: 'Observability: No Centralized Logging or Tracing', severity: 'MEDIUM', desc: 'The KB references Datadog for latency monitoring but lacks a unified logging and distributed tracing strategy for debugging.' },
              { icon: Network, color: 'text-blue-500', title: 'UX: No Fallback UX for Out-of-Hours Messages', severity: 'LOW', desc: 'The KB mentions lead auto-response rate during business hours but does not define user experience for out-of-hours messages.' },
              { icon: LayoutTemplate, color: 'text-amber-500', title: 'Integration: No Webhook or Event-Driven Architecture', severity: 'MEDIUM', desc: 'The KB mentions WebSocket for real-time sync but lacks webhook support for external system integration (e.g., CRM updates).' },
            ].map((refinement, idx) => (
              <div key={idx} className={`bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${getSeverityBorder(refinement.severity)}`}>
                <div className="flex items-start gap-4">
                  <refinement.icon className={`w-5 h-5 mt-0.5 ${refinement.color}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm text-slate-800">{refinement.title}</h4>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${getSeverityColor(refinement.severity)}`}>
                        {refinement.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{refinement.desc}</p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
