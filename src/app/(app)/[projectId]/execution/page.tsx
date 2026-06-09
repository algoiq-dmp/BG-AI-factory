'use client';

import { TerminalSquare, Play, Code2, Bot, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useSettingsStore } from '@/store/useSettingsStore';

type StepStatus = 'pending' | 'active' | 'completed' | 'error';

interface AutoIntelStep {
  id: number;
  name: string;
  phase: string;
  status: StepStatus;
}

const INITIAL_STEPS: AutoIntelStep[] = [
  { id: 1, name: 'Project Summary', phase: 'Intelligence', status: 'pending' },
  { id: 2, name: 'Ambiguity Scan', phase: 'Intelligence', status: 'pending' },
  { id: 3, name: 'Missing Requirements', phase: 'Intelligence', status: 'pending' },
  { id: 4, name: 'Security Scan', phase: 'Intelligence', status: 'pending' },
  { id: 5, name: 'Skills Analysis', phase: 'Intelligence', status: 'pending' },
  { id: 6, name: 'Risk Analysis', phase: 'Intelligence', status: 'pending' },
  { id: 7, name: 'KB Enrichment (R1)', phase: 'Knowledge', status: 'pending' },
  { id: 8, name: 'User Stories Generation', phase: 'Product', status: 'pending' },
  { id: 9, name: 'Competitive Snapshot', phase: 'Product', status: 'pending' },
  { id: 10, name: 'Audit Centre', phase: 'Pipeline', status: 'pending' },
];

export default function ExecutionStudioPage() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstance = useRef<Terminal | null>(null);
  
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<AutoIntelStep[]>(INITIAL_STEPS);
  const [currentCode, setCurrentCode] = useState<string>('// Waiting for pipeline to start...');
  const [currentFile, setCurrentFile] = useState<string>('system/idle.ts');
  
  const { deepseekApiKey } = useSettingsStore();

  useEffect(() => {
    if (!terminalRef.current || termInstance.current) return;
    
    const term = new Terminal({
      theme: { background: '#0a0a0a', foreground: '#00f0ff', cursor: '#8b5cf6' },
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 12,
    });
    
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    termInstance.current = term;
    
    term.writeln('\x1b[1;36m[Bhagvat Gita Engine]\x1b[0m Auto-Intel Pipeline Initialized.');
    term.writeln('\x1b[1;35m[System]\x1b[0m Ready to execute 27-step intelligence pipeline.');

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      termInstance.current = null;
    };
  }, []);

  const runNextStep = async () => {
    const term = termInstance.current;
    if (!term) return;

    const nextStepIndex = steps.findIndex(s => s.status === 'pending');
    if (nextStepIndex === -1) {
      setIsRunning(false);
      term.writeln('\x1b[1;32m[Success]\x1b[0m Pipeline Execution Complete.');
      return;
    }

    const step = steps[nextStepIndex];
    
    // Update UI to active
    setSteps(prev => prev.map((s, i) => i === nextStepIndex ? { ...s, status: 'active' } : s));
    term.writeln(`\x1b[1;33m[Executing]\x1b[0m Step ${step.id}: ${step.name}...`);
    setCurrentFile(`artifacts/${step.name.toLowerCase().replace(/ /g, '_')}.json`);
    setCurrentCode('// Generating intelligence...');

    try {
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId: step.id,
          stepName: step.name,
          apiKey: deepseekApiKey,
          model: 'deepseek',
          kbContext: {
            projectName: 'Fintech Trading Terminal',
            type: 'Enterprise SaaS',
            stack: ['Next.js', 'PostgreSQL', 'Redis', 'WebSockets']
          }
        })
      });

      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();
      
      setCurrentCode(JSON.stringify(data.result, null, 2));
      term.writeln(`\x1b[1;32m[Success]\x1b[0m Step ${step.id} completed.`);
      
      // Mark as completed
      setSteps(prev => prev.map((s, i) => i === nextStepIndex ? { ...s, status: 'completed' } : s));
      
    } catch (error: any) {
      term.writeln(`\x1b[1;31m[Error]\x1b[0m Failed Step ${step.id}: ${error.message}`);
      setSteps(prev => prev.map((s, i) => i === nextStepIndex ? { ...s, status: 'error' } : s));
      setIsRunning(false);
    }
  };

  // This effect acts as the pipeline loop when isRunning is true
  useEffect(() => {
    if (isRunning) {
      const activeStep = steps.find(s => s.status === 'active');
      if (!activeStep) {
        runNextStep();
      }
    }
  }, [isRunning, steps]);

  const togglePipeline = () => {
    if (!deepseekApiKey) {
      termInstance.current?.writeln('\x1b[1;31m[Error]\x1b[0m DeepSeek API Key is missing. Configure in Settings.');
      return;
    }
    setIsRunning(!isRunning);
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-center bg-black/40 p-4 border border-[var(--color-glass-border)] rounded-lg shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-accent-neon" />
            27-Step Auto Intelligence
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Running autonomous pipeline for PRJ-102 (Fintech Terminal)
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={togglePipeline}
            className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)] ${
              isRunning ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
          >
            <Play className={`w-4 h-4 ${isRunning ? 'hidden' : 'block'}`} />
            <div className={`w-4 h-4 bg-white rounded-sm ${isRunning ? 'block' : 'hidden'}`} />
            {isRunning ? 'Pause Pipeline' : 'Resume Pipeline'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        
        <div className="w-72 glass-panel flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[var(--color-glass-border)] bg-black/40">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-neon" />
              Pipeline Execution
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {steps.map((step) => (
              <div 
                key={step.id} 
                className={`flex items-center justify-between p-2 rounded border text-sm ${
                  step.status === 'completed' 
                    ? 'bg-green-500/5 border-green-500/20 text-green-400' 
                    : step.status === 'active'
                      ? 'bg-accent-neon/10 border-accent-neon/30 text-white shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                      : step.status === 'error'
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'bg-white/5 border-transparent text-gray-500'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {step.status === 'completed' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  {step.status === 'active' && <Loader2 className="w-4 h-4 shrink-0 animate-spin text-accent-neon" />}
                  {step.status === 'pending' && <Circle className="w-4 h-4 shrink-0" />}
                  {step.status === 'error' && <Circle className="w-4 h-4 shrink-0 text-red-400" />}
                  <span className="truncate">{step.id}. {step.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="glass-panel flex-1 flex flex-col overflow-hidden">
            <div className="bg-[#1e1e1e] px-4 py-2 text-xs font-mono text-gray-400 border-b border-gray-800 flex justify-between">
              <span>{currentFile}</span>
              {isRunning && <span className="text-accent-neon animate-pulse">Generating...</span>}
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="json"
                theme="vs-dark"
                value={currentCode}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                  padding: { top: 16 }
                }}
              />
            </div>
          </div>

          <div className="glass-panel h-48 flex flex-col overflow-hidden shrink-0">
            <div className="bg-[#0a0a0a] px-4 py-2 text-xs font-mono text-gray-400 border-b border-gray-800">
              Orchestrator Logs
            </div>
            <div className="flex-1 p-2 bg-[#0a0a0a]" ref={terminalRef} />
          </div>

        </div>
      </div>
    </div>
  );
}
