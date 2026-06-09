'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getToolConfig } from '@/lib/tools-registry';
import { saveDocument } from '@/app/actions/save-document';
import { Sparkles, Save, Loader2, ArrowRight, BrainCircuit, FolderOpen } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function UniversalToolRunner() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  
  const pathParts = pathname.split('/').filter(Boolean);
  const slug = pathParts[pathParts.length - 1] || 'tool';
  
  const config = getToolConfig(slug);
  
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (data.success && data.projects.length > 0) {
          setProjects(data.projects);
          // Try to load from localStorage, otherwise default to first project
          const savedId = localStorage.getItem('activeProjectId');
          if (savedId && data.projects.find((p: any) => p.id === savedId)) {
            setProjectId(savedId);
          } else {
            setProjectId(data.projects[0].id);
            localStorage.setItem('activeProjectId', data.projects[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };
    fetchProjects();
  }, []);

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setProjectId(newId);
    localStorage.setItem('activeProjectId', newId);
  };

  const handleGenerate = async () => {
    if (!projectId) return alert('Please select a project first');
    setIsGenerating(true);
    setSaved(false);
    setOutput('');

    try {
      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: "Run Intelligence Module",
          context: `You are running the ${config.title} tool.`,
          systemPrompt: config.systemPrompt
        })
      });

      if (!res.body) throw new Error("No response body");

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
    } catch (error) {
      console.error(error);
      setOutput('Error generating output. Please check your AI API Keys.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!output || !projectId) return;
    setIsSaving(true);
    try {
      await saveDocument(projectId, `${config.title} Document`, output, config.documentType);
      setSaved(true);
    } catch (error) {
      alert("Failed to save document");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 bg-[#0b0e14] border border-[#1e2532] p-6 rounded-2xl gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a1b3b] to-[#0b0e14] border border-[#1e2532] flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-[#5b5fd8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{config.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-[#1a4d2e]/20 text-[#51cf66] border border-[#51cf66]/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                {config.gitaMode || 'Analysis'} Mode Active
              </span>
              <span className="text-[#8b9bb4] text-xs">AI Orchestration Engine</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
          {/* Project Selector */}
          <div className="flex items-center gap-2 bg-[#111622] border border-[#1e2532] rounded-lg px-3 py-1.5">
            <FolderOpen className="w-4 h-4 text-[#586c8f]" />
            <select 
              value={projectId} 
              onChange={handleProjectChange}
              className="bg-transparent text-sm text-white font-bold focus:outline-none w-[180px] truncate"
            >
              {projects.length === 0 && <option value="">Loading projects...</option>}
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || session?.user?.role !== 'ADMIN' || !projectId}
              className="bg-[#5b5fd8] hover:bg-[#4a4fcf] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(91,95,216,0.3)] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? 'Synthesizing...' : 'Generate Output'}
            </button>
            
            <button 
              onClick={handleSave}
              disabled={!output || isSaving || saved || session?.user?.role !== 'ADMIN'}
              className="bg-[#1a4d2e]/20 hover:bg-[#1a4d2e] text-[#51cf66] border border-[#51cf66]/30 px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved to Docs' : 'Save to DB'}
            </button>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-[#0b0e14] border border-[#1e2532] rounded-2xl overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-8 bg-[#1a1b3b]/50 border-b border-[#1e2532] flex items-center px-4">
          <span className="text-xs font-mono text-[#586c8f]">output.md</span>
        </div>
        
        {output ? (
          <textarea 
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            className="w-full h-full bg-transparent text-[#e2e8f0] font-mono text-sm p-6 pt-12 resize-none focus:outline-none custom-scrollbar"
            spellCheck={false}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50 pointer-events-none">
            <BrainCircuit className="w-16 h-16 text-[#586c8f] mb-4" />
            <p className="text-[#8b9bb4] text-lg font-bold">Awaiting AI Execution</p>
            <p className="text-[#586c8f] text-sm">Select a project and click Generate</p>
          </div>
        )}
      </div>

    </div>
  );
}
