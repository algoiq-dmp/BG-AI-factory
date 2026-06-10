'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getToolConfig } from '@/lib/tools-registry';
import { saveDocument } from '@/app/actions/save-document';
import { Sparkles, Save, Loader2, BrainCircuit, Activity, CheckCircle2, Clock, Eye, Code, Zap, Settings2, Download, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useProjectStore } from '@/store/useProjectStore';
import { MarkdownViewer } from '@/components/ui/MarkdownViewer';

export default function UniversalToolRunner() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  
  const pathParts = pathname.split('/').filter(Boolean);
  const slug = pathParts[pathParts.length - 1] || 'tool';
  
  const config = getToolConfig(slug);
  
  const { activeProjectId, getActiveProject } = useProjectStore();
  const activeProject = getActiveProject();
  
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Idle');

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 95) return 95;
          return p + 2;
        });
      }, 500);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!activeProjectId) return alert('Please select a project first from the top header');
    setIsGenerating(true);
    setSaved(false);
    setOutput('');
    setCurrentStep('Analyzing Context...');
    setProgress(5);

    try {
      setTimeout(() => setCurrentStep('Synthesizing Output...'), 2000);

      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: `Run the ${config.title} Tool`,
          context: `You are running the ${config.title} tool. Please analyze the active project context to provide the best output.`,
          systemPrompt: config.systemPrompt,
          projectId: activeProjectId
        })
      });

      if (!res.body) throw new Error("No response body");

      setCurrentStep('Streaming Data...');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          setOutput(prev => prev + chunk);
        }
      }
      
      setCurrentStep('Completed');
      setProgress(100);
      setTimeout(() => setCurrentStep('Idle'), 2000);
    } catch (error) {
      console.error(error);
      setOutput('Error generating output. Please check your AI API Keys.');
      setCurrentStep('Failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!output || !activeProjectId) return;
    setIsSaving(true);
    try {
      await saveDocument(activeProjectId, `${config.title} Document`, output, config.documentType);
      setSaved(true);
    } catch (error) {
      alert("Failed to save document");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto w-full">
      
      {/* Dynamic Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-[#5b5fd8]" />
          {config.title}
        </h1>
        <p className="text-[#8b9bb4] mt-2 max-w-3xl leading-relaxed text-sm">
          Configure and execute the AI orchestration pipeline for this module.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT PANE: Orchestration Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Active Context Card */}
          <div className="bg-[#0b0e14] border border-[#1e2532] rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#586c8f] mb-4 flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> Orchestration Context
            </h3>
            
            <div className="space-y-4">
              <div className="bg-[#111622] rounded-xl p-4 border border-[#1e2532]">
                <div className="text-[10px] uppercase font-bold text-[#586c8f] mb-1">Target Project</div>
                <div className="font-bold text-white flex items-center gap-2">
                  {activeProject ? (
                    <><CheckCircle2 className="w-4 h-4 text-[#10b981]" /> {activeProject.name}</>
                  ) : (
                    <><AlertCircle className="w-4 h-4 text-red-400" /> No Project Selected</>
                  )}
                </div>
              </div>

              <div className="bg-[#111622] rounded-xl p-4 border border-[#1e2532]">
                <div className="text-[10px] uppercase font-bold text-[#586c8f] mb-1">Engine Mode</div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#5b5fd8]/10 text-[#5b5fd8] px-2 py-0.5 rounded text-xs font-bold border border-[#5b5fd8]/20 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" /> {config.gitaMode || 'Analysis'}
                  </span>
                </div>
              </div>

              {/* Dynamic Generation Button */}
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || session?.user?.role !== 'ADMIN' || !activeProjectId}
                className="w-full mt-4 bg-gradient-to-r from-[#4a4fcf] to-[#2a2c7a] hover:from-[#5b5fd8] hover:to-[#4a4fcf] text-white px-5 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(91,95,216,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Synthesizing...</>
                ) : (
                  <><Sparkles className="w-5 h-5 group-hover:animate-pulse" /> Initialize Engine</>
                )}
                
                {/* Progress bar overlay during generation */}
                {isGenerating && (
                  <div className="absolute bottom-0 left-0 h-1 bg-[#10b981] transition-all duration-300" style={{ width: `${progress}%` }} />
                )}
              </button>
            </div>
          </div>

          {/* Telemetry Status Card */}
          <div className="bg-[#0b0e14] border border-[#1e2532] rounded-2xl p-5 flex-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Activity className="w-32 h-32 text-[#5b5fd8]" />
            </div>
            
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#586c8f] mb-4 flex items-center gap-2 relative z-10">
              <Activity className="w-4 h-4" /> Live Telemetry
            </h3>

            <div className="space-y-6 relative z-10">
              <div>
                <div className="flex justify-between text-xs font-bold text-[#8b9bb4] mb-2">
                  <span>Engine Status</span>
                  <span className={isGenerating ? 'text-amber-400' : 'text-[#10b981]'}>{currentStep}</span>
                </div>
                <div className="h-1.5 bg-[#111622] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${isGenerating ? 'bg-amber-400' : 'bg-[#10b981]'}`} style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#111622] rounded-xl p-3 border border-[#1e2532]">
                  <div className="text-[10px] text-[#586c8f] uppercase font-bold mb-1">Tokens</div>
                  <div className="text-lg font-mono text-white font-bold">{output.length}</div>
                </div>
                <div className="bg-[#111622] rounded-xl p-3 border border-[#1e2532]">
                  <div className="text-[10px] text-[#586c8f] uppercase font-bold mb-1">Latency</div>
                  <div className="text-lg font-mono text-white font-bold">{isGenerating ? '...' : '124ms'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Output Viewer */}
        <div className="lg:col-span-8 flex flex-col bg-[#0b0e14] border border-[#1e2532] rounded-2xl overflow-hidden shadow-2xl relative">
          
          {/* Output Toolbar */}
          <div className="h-14 bg-[#111622]/80 border-b border-[#1e2532] flex items-center justify-between px-5 shrink-0 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#10b981]"></span>
              <span className="text-xs font-bold text-white tracking-wider uppercase">Output Pipeline</span>
            </div>

            <div className="flex items-center gap-3">
              {output && (
                <button 
                  onClick={handleSave}
                  disabled={isSaving || saved}
                  className="bg-[#1a4d2e]/20 hover:bg-[#1a4d2e] text-[#51cf66] border border-[#51cf66]/30 px-4 py-1.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 text-xs"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {saved ? 'Saved to Knowledgebase' : 'Save Document'}
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Content Area */}
          <div className="flex-1 overflow-hidden relative bg-[#0b0e14]">
            {output ? (
              <MarkdownViewer content={output} className="absolute inset-0" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                <BrainCircuit className="w-20 h-20 text-[#586c8f] mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">System Ready</h3>
                <p className="text-[#8b9bb4] text-center max-w-md">
                  Click 'Initialize Engine' to trigger the autonomous AI pipeline and generate your {config.documentType} specifications.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
