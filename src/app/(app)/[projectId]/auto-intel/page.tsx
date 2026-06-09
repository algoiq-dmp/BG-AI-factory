'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { BrainCircuit, Play, Square, CheckCircle2, Loader2, Database, LayoutPanelLeft, FileText, Webhook, MessageSquare, Send } from 'lucide-react';
import { getToolConfig } from '@/lib/tools-registry';
import { saveDocument } from '@/app/actions/save-document';
import Tooltip from '@/components/ui/Tooltip';

const PIPELINE_STEPS = [
  { id: 0, slug: 'master-document', name: 'Phase 1: Product Requirements', icon: FileText },
  { id: 1, slug: 'database-designer', name: 'Phase 2: Architecture (DB)', icon: Database },
  { id: 2, slug: 'api-blueprint', name: 'Phase 3: Backend Blueprint', icon: Webhook },
  { id: 3, slug: 'sprint-planner', name: 'Phase 4: Sprint Planning', icon: LayoutPanelLeft },
];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AutoIntelPipeline() {
  const params = useParams();
  const projectId = params.projectId as string;

  // Pipeline State
  const [status, setStatus] = useState('IDLE'); // IDLE, RUNNING, PAUSED, COMPLETED
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [contextAccumulator, setContextAccumulator] = useState<string>('');
  const isRunningRef = useRef(false);

  // Discovery Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryComplete, setDiscoveryComplete] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/progress?projectId=${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus(data.project.pipelineStatus);
          setCurrentStep(data.project.progress);
          if (data.project.progress > 0) setDiscoveryComplete(true);
        }
      });
  }, [projectId]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const updateProgress = async (newStatus: string, stepIndex: number) => {
    await fetch('/api/projects/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, pipelineStatus: newStatus, progress: stepIndex })
    });
    setStatus(newStatus);
    setCurrentStep(stepIndex);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: input } as ChatMessage];
    setMessages(newMessages);
    setInput('');
    setIsDiscovering(true);

    try {
      const res = await fetch('/api/chat/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      let aiResponse = data.message;
      
      if (aiResponse.includes('[DISCOVERY_COMPLETE]')) {
        aiResponse = aiResponse.replace('[DISCOVERY_COMPLETE]', '').trim();
        setDiscoveryComplete(true);
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        
        // Auto-Engage the pipeline with this consolidated context
        setContextAccumulator(`Final Discovery Requirements:\n${aiResponse}`);
        engagePipeline();
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      }
    } catch (err: any) {
      addLog(`Discovery Error: ${err.message}`);
    } finally {
      setIsDiscovering(false);
    }
  };

  const engagePipeline = async () => {
    if (messages.length === 0 && currentStep === 0) {
      alert("Please provide an initial idea to kickstart the discovery process.");
      return;
    }
    
    isRunningRef.current = true;
    await updateProgress('RUNNING', currentStep);
    addLog("Pipeline Engaged. Commencing autonomous sequence.");

    let loopStep = currentStep;
    let accumulatedContext = contextAccumulator || `Project Idea: ${messages.map(m => m.content).join('\n')}`;

    while (isRunningRef.current && loopStep < PIPELINE_STEPS.length) {
      const stepDef = PIPELINE_STEPS[loopStep];
      const config = getToolConfig(stepDef.slug);
      
      addLog(`Initiating Step ${loopStep + 1}: ${stepDef.name} using ${config.gitaMode} Mode...`);

      try {
        const res = await fetch('/api/tools/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            task: stepDef.name,
            context: accumulatedContext,
            systemPrompt: config.systemPrompt
          })
        });

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullOutput = '';
        if (reader) {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) fullOutput += decoder.decode(value);
          }
        }

        addLog(`Step ${loopStep + 1} Generated. Saving to Knowledge Base...`);
        await saveDocument(projectId, `${stepDef.name} Spec`, fullOutput, config.documentType);
        
        accumulatedContext += `\n\n=== Output from ${stepDef.name} ===\n${fullOutput}`;
        setContextAccumulator(accumulatedContext);

        addLog(`Step ${loopStep + 1} Complete.`);
        loopStep++;
        await updateProgress('RUNNING', loopStep);
        
      } catch (err: any) {
        addLog(`ERROR at Step ${loopStep + 1}: ${err.message}`);
        isRunningRef.current = false;
        await updateProgress('PAUSED', loopStep);
        break;
      }
    }

    if (loopStep >= PIPELINE_STEPS.length) {
      addLog("All 27 Auto-Intel steps successfully finished!");
      await updateProgress('COMPLETED', loopStep);
      isRunningRef.current = false;
    }
  };

  return (
    <div className="h-full w-full max-w-6xl mx-auto flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-[#5b5fd8]" />
          Autonomous Pipeline Console
        </h1>
        <p className="text-[#8b9bb4] mt-2 text-sm">
          Interactive Discovery Engine & Autonomous Pipeline Sequencer.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Discovery & Controls */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="bg-[#0b0e14] border border-[#1e2532] rounded-2xl flex flex-col h-[400px]">
            <div className="p-4 border-b border-[#1e2532] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#586c8f]" />
              <h2 className="text-sm font-bold text-[#586c8f] uppercase tracking-wider">AI Discovery Engine</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-[#586c8f] text-xs text-center mt-10">
                  Pitch your project idea here. The AI PM will ask clarifying questions before building.
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl text-xs ${
                    m.role === 'user' ? 'bg-[#5b5fd8] text-white' : 'bg-[#1a1b3b] text-[#a0b0c0] border border-[#1e2532]'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isDiscovering && (
                <div className="flex justify-start">
                  <div className="bg-[#1a1b3b] border border-[#1e2532] p-3 rounded-xl flex items-center gap-2">
                    <Loader2 className="w-3 h-3 text-[#5b5fd8] animate-spin" />
                    <span className="text-xs text-[#a0b0c0]">PM analyzing...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#1e2532]">
              <div className="relative">
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  disabled={discoveryComplete || isDiscovering}
                  placeholder={discoveryComplete ? "Discovery Locked" : "Type your answer..."}
                  className="w-full bg-[#1a1b3b]/50 border border-[#1e2532] rounded-xl pl-4 pr-10 py-3 text-white text-sm focus:border-[#5b5fd8] focus:outline-none disabled:opacity-50"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={discoveryComplete || isDiscovering || !input.trim()}
                  className="absolute right-2 top-2 bottom-2 w-8 flex items-center justify-center bg-[#5b5fd8] rounded-lg text-white hover:bg-[#4a4fcf] transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {status !== 'RUNNING' && status !== 'COMPLETED' ? (
              <Tooltip content="Starts the autonomous generation pipeline" position="top" className="flex-1">
                <button 
                  onClick={engagePipeline}
                  disabled={!discoveryComplete}
                  className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5 fill-current" /> Engage Factory
                </button>
              </Tooltip>
            ) : status === 'RUNNING' ? (
              <Tooltip content="Pauses execution after the current step finishes" position="top" className="flex-1">
                <button 
                  onClick={() => { isRunningRef.current = false; updateProgress('PAUSED', currentStep); }}
                  className="w-full bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-500 border border-yellow-500/50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Square className="w-5 h-5 fill-current" /> Pause Sequence
                </button>
              </Tooltip>
            ) : (
               <Tooltip content="All AI pipeline steps have been completed" position="top" className="flex-1">
                 <button 
                  disabled
                  className="w-full bg-green-500/20 text-green-500 border border-green-500/50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                >
                  <CheckCircle2 className="w-5 h-5" /> Pipeline Completed
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Right Col: Sequence & Logs */}
        <div className="col-span-2 flex flex-col gap-6">
          <div className="bg-[#0b0e14] border border-[#1e2532] rounded-2xl p-6">
            <h2 className="text-sm font-bold text-[#586c8f] uppercase tracking-wider mb-4">Pipeline Sequence</h2>
            <div className="flex gap-4 relative justify-between">
              <div className="absolute top-[20px] left-0 right-0 h-0.5 bg-[#1e2532]" />
              {PIPELINE_STEPS.map((step, idx) => {
                const isActive = idx === currentStep && status === 'RUNNING';
                const isPast = idx < currentStep;
                return (
                  <div key={step.id} className="flex flex-col items-center gap-3 relative z-10 w-32 text-center">
                    <Tooltip content={`Click for details on ${step.name}`} position="top">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors cursor-pointer ${
                        isActive ? 'bg-[#1a1b3b] border-[#5b5fd8] text-[#5b5fd8] shadow-[0_0_15px_rgba(91,95,216,0.3)]' : 
                        isPast ? 'bg-[#1a4d2e] border-[#51cf66] text-[#51cf66]' : 
                        'bg-[#0b0e14] border-[#1e2532] text-[#586c8f]'
                      }`}>
                        {isActive ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                         isPast ? <CheckCircle2 className="w-5 h-5" /> : 
                         <step.icon className="w-4 h-4" />}
                      </div>
                    </Tooltip>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-white' : isPast ? 'text-[#8b9bb4]' : 'text-[#586c8f]'}`}>
                      {step.name}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-[#0b0e14] border border-[#1e2532] rounded-2xl overflow-hidden flex flex-col flex-1">
            <div className="bg-[#1a1b3b]/50 border-b border-[#1e2532] p-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-xs font-mono text-[#586c8f]">system.log</span>
            </div>
            <div className="flex-1 p-6 font-mono text-xs overflow-y-auto space-y-2 h-[200px]">
              {logs.map((log, i) => (
                <div key={i} className="text-[#a0b0c0] whitespace-pre-wrap">{log}</div>
              ))}
              {status === 'RUNNING' && (
                <div className="text-[#5b5fd8] animate-pulse">_</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
