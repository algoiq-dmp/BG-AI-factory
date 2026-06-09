'use client';

import { useState, useEffect } from 'react';
import { 
  Workflow, Play, Pause, CheckCircle2, XCircle, Clock, Loader2, 
  Lightbulb, Brain, PenTool, ListTree, Monitor, Server, Database, 
  FlaskConical, BookOpen, Eye, Rocket, Activity, FolderOpen, RotateCcw
} from 'lucide-react';

const pipelineStages = [
  { id: 1, name: 'Idea Input', icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-500', route: '/start' },
  { id: 2, name: 'Requirement AI', icon: Brain, color: 'text-blue-400', bg: 'bg-blue-500', route: '/analysis' },
  { id: 3, name: 'Architecture AI', icon: PenTool, color: 'text-purple-400', bg: 'bg-purple-500', route: '/architecture' },
  { id: 4, name: 'Task Breakdown AI', icon: ListTree, color: 'text-orange-400', bg: 'bg-orange-500', route: '/task-breakdown' },
  { id: 5, name: 'Frontend AI', icon: Monitor, color: 'text-cyan-400', bg: 'bg-cyan-500', route: '/frontend-ai' },
  { id: 6, name: 'Backend AI', icon: Server, color: 'text-indigo-400', bg: 'bg-indigo-500', route: '/backend-ai' },
  { id: 7, name: 'Database AI', icon: Database, color: 'text-green-400', bg: 'bg-green-500', route: '/database-ai' },
  { id: 8, name: 'Testing AI', icon: FlaskConical, color: 'text-red-400', bg: 'bg-red-500', route: '/testing-ai' },
  { id: 9, name: 'Documentation AI', icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-500', route: '/documentation-ai' },
  { id: 10, name: 'Code Review AI', icon: Eye, color: 'text-pink-400', bg: 'bg-pink-500', route: '/code-review' },
  { id: 11, name: 'Deployment AI', icon: Rocket, color: 'text-rose-400', bg: 'bg-rose-500', route: '/deployment' },
  { id: 12, name: 'Monitoring AI', icon: Activity, color: 'text-teal-400', bg: 'bg-teal-500', route: '/monitoring' },
];

type StageStatus = 'idle' | 'running' | 'completed' | 'failed';

export default function PipelinePage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [stageStatuses, setStageStatuses] = useState<Record<number, StageStatus>>({});
  const [currentStage, setCurrentStage] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const id = localStorage.getItem('activeProjectId');
    setProjectId(id);
    fetch('/api/projects').then(r => r.json()).then(d => {
      if (d.success) setProjects(d.projects);
    });
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const runFullPipeline = async () => {
    setIsRunning(true);
    setStageStatuses({});
    setLogs([]);
    addLog('🚀 Initiating Full Autonomous Pipeline...');

    for (const stage of pipelineStages) {
      setCurrentStage(stage.id);
      setStageStatuses(prev => ({ ...prev, [stage.id]: 'running' }));
      addLog(`⚙️ Stage ${stage.id}: ${stage.name} — RUNNING`);

      // Simulate stage execution
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

      const success = Math.random() > 0.1; // 90% success rate
      setStageStatuses(prev => ({ ...prev, [stage.id]: success ? 'completed' : 'failed' }));
      addLog(success 
        ? `✅ Stage ${stage.id}: ${stage.name} — COMPLETED` 
        : `❌ Stage ${stage.id}: ${stage.name} — FAILED (Auto-retry queued)`
      );

      if (!success) {
        // Auto-retry once
        addLog(`🔄 Stage ${stage.id}: Auto-retrying...`);
        await new Promise(resolve => setTimeout(resolve, 600));
        setStageStatuses(prev => ({ ...prev, [stage.id]: 'completed' }));
        addLog(`✅ Stage ${stage.id}: ${stage.name} — COMPLETED (retry)`);
      }
    }

    setCurrentStage(null);
    setIsRunning(false);
    addLog('🏁 Full Pipeline Execution Complete! All 12 stages processed.');
  };

  const completedCount = Object.values(stageStatuses).filter(s => s === 'completed').length;
  const progress = pipelineStages.length > 0 ? Math.round((completedCount / pipelineStages.length) * 100) : 0;

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="p-6 border-b border-[#1e2532] bg-[#0b0e14] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5b5fd8]/20 to-[#5b5fd8]/5 border border-[#5b5fd8]/30 flex items-center justify-center">
            <Workflow className="w-6 h-6 text-[#5b5fd8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Pipeline Orchestrator</h1>
            <p className="text-[#8b9bb4] text-sm mt-1">12-Stage Autonomous AI Factory · One-Click Full Execution</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111622] border border-[#1e2532] rounded-lg px-3 py-1.5">
            <FolderOpen className="w-4 h-4 text-[#586c8f]" />
            <select 
              value={projectId || ''} 
              onChange={e => { setProjectId(e.target.value); localStorage.setItem('activeProjectId', e.target.value); }}
              className="bg-transparent text-sm text-white font-bold focus:outline-none"
            >
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button 
            onClick={runFullPipeline} 
            disabled={isRunning}
            className="bg-[#5b5fd8] hover:bg-[#4a4fcf] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(91,95,216,0.3)] disabled:opacity-50 text-sm"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {isRunning ? 'Pipeline Running...' : 'Run Full Pipeline'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-3 bg-[#111622]/50 border-b border-[#1e2532]">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-[#8b9bb4] font-bold">Overall Progress</span>
          <span className="text-white font-mono font-bold">{progress}% ({completedCount}/{pipelineStages.length})</span>
        </div>
        <div className="h-2 w-full bg-[#1e2532] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#5b5fd8] to-[#10b981] transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Pipeline Stages */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pipelineStages.map(stage => {
              const status = stageStatuses[stage.id] || 'idle';
              const isActive = currentStage === stage.id;
              
              return (
                <a 
                  key={stage.id} 
                  href={stage.route}
                  className={`relative bg-[#0b0e14] border rounded-xl p-5 transition-all group cursor-pointer hover:shadow-lg ${
                    isActive ? 'border-[#5b5fd8] shadow-[0_0_20px_rgba(91,95,216,0.3)] scale-[1.02]' :
                    status === 'completed' ? 'border-green-500/30' :
                    status === 'failed' ? 'border-red-500/30' :
                    'border-[#1e2532] hover:border-[#586c8f]'
                  }`}
                >
                  {isActive && <div className="absolute inset-0 bg-[#5b5fd8]/5 rounded-xl animate-pulse" />}
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg ${stage.bg}/10 border border-${stage.bg}/20 flex items-center justify-center`}>
                        <stage.icon className={`w-5 h-5 ${stage.color}`} />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-[#586c8f]">#{stage.id}</span>
                        {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                        {status === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}
                        {status === 'running' && <Loader2 className="w-4 h-4 text-[#5b5fd8] animate-spin" />}
                        {status === 'idle' && <Clock className="w-4 h-4 text-[#586c8f]" />}
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#5b5fd8] transition-colors">{stage.name}</h3>
                    <div className="mt-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        status === 'running' ? 'bg-[#5b5fd8]/20 text-[#5b5fd8]' :
                        status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-white/5 text-[#586c8f]'
                      }`}>{status}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Live Logs */}
        <div className="w-[380px] border-l border-[#1e2532] bg-[#07090c] flex flex-col">
          <div className="p-3 border-b border-[#1e2532] bg-[#1a1b3b]/30 flex items-center justify-between">
            <span className="text-xs font-bold text-[#586c8f] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Pipeline Execution Log
            </span>
            {isRunning && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
          </div>
          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1 custom-scrollbar">
            {logs.length === 0 && <div className="text-[#586c8f] italic">Click "Run Full Pipeline" to begin autonomous execution...</div>}
            {logs.map((log, i) => (
              <div key={i} className={
                log.includes('✅') ? 'text-green-400' :
                log.includes('❌') ? 'text-red-400' :
                log.includes('🔄') ? 'text-yellow-400' :
                log.includes('🚀') || log.includes('🏁') ? 'text-[#5b5fd8]' :
                'text-[#8b9bb4]'
              }>{log}</div>
            ))}
            {isRunning && <div className="text-[#5b5fd8] animate-pulse">_</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
