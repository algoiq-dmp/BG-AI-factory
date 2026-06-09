'use client';
import { useState, useEffect } from 'react';
import { Server, Sparkles, Loader2, FolderOpen, Shield, Layers, Database, Key } from 'lucide-react';

const sections = [
  { id: 'routes', name: 'API Route Generator', desc: 'REST & GraphQL endpoint scaffolding', icon: Server, prompt: 'You are a Backend Engineer. Generate complete Next.js API route handlers with validation, error handling, and typed responses. Include middleware for auth and rate limiting. Output TypeScript code.' },
  { id: 'middleware', name: 'Middleware Builder', desc: 'Auth, logging, rate-limit middleware', icon: Shield, prompt: 'You are a Backend Engineer. Generate production-ready middleware functions for authentication (JWT), request logging (structured JSON), rate limiting, and CORS. Output TypeScript.' },
  { id: 'services', name: 'Service Layer', desc: 'Business logic, repositories, DTOs', icon: Layers, prompt: 'You are a Backend Architect. Generate a clean service layer with repository pattern, DTOs, and dependency injection. Include error handling and transaction support. Output TypeScript.' },
  { id: 'auth', name: 'Authentication Logic', desc: 'JWT, OAuth, sessions, RBAC', icon: Key, prompt: 'You are a Security Engineer. Generate complete authentication and authorization logic: JWT token generation/validation, OAuth2 flow, session management, and role-based access control. Output TypeScript.' },
];

export default function BackendAIPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState('routes');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('activeProjectId'); setProjectId(id);
    fetch('/api/projects').then(r => r.json()).then(d => { if (d.success) setProjects(d.projects); });
  }, []);

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      fetch(`/api/code-files?projectId=${projectId}&path=${activeSection}.ts`)
        .then(r => r.json())
        .then(d => {
          if (d.success && d.files && d.files.length > 0) {
            setOutput(d.files[0].content);
          } else {
            setOutput('');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [projectId, activeSection]);

  const handleGenerate = async () => {
    if (!projectId) return alert('Please select a project first.');
    const section = sections.find(s => s.id === activeSection); if (!section) return;
    setIsGenerating(true); setOutput('');
    try {
      const res = await fetch('/api/tools/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: section.name, context: `Backend: ${section.name}`, systemPrompt: section.prompt }) });
      if (!res.body) throw new Error('No body');
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let done = false;
      let fullText = '';
      while (!done) { 
        const { value, done: d } = await reader.read(); 
        done = d; 
        if (value) {
          const chunk = decoder.decode(value);
          fullText += chunk;
          setOutput(p => p + chunk);
        }
      }
      
      await fetch('/api/code-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, path: `${activeSection}.ts`, content: fullText, language: 'typescript' })
      });
    } catch { setOutput('Error generating. Check API keys in Settings.'); } finally { setIsGenerating(false); }
  };

  return (
    <div className="h-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/30 flex items-center justify-center"><Server className="w-6 h-6 text-indigo-400" /></div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">API Blueprint (Backend AI)</h1>
            <p className="text-sm text-[#8b9bb4] mt-0.5">
              Phase 5 — RESTful endpoints with request/response schemas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111622] border border-[#1e2532] rounded-lg px-3 py-1.5"><FolderOpen className="w-4 h-4 text-[#586c8f]" /><select value={projectId||''} onChange={e=>{setProjectId(e.target.value);localStorage.setItem('activeProjectId',e.target.value)}} className="bg-transparent text-sm text-white font-bold focus:outline-none">{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <button onClick={handleGenerate} disabled={isGenerating} className="bg-[#5b5fd8] hover:bg-[#4a4fcf] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(91,95,216,0.3)] disabled:opacity-50 text-sm">{isGenerating?<Loader2 className="w-4 h-4 animate-spin"/>:<Sparkles className="w-4 h-4"/>}{isGenerating?'Generating...':'Generate'}</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {sections.map(s=>(<button key={s.id} onClick={()=>setActiveSection(s.id)} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${activeSection===s.id?'bg-[#5b5fd8]/10 border-[#5b5fd8] text-white':'bg-[#111622] border-[#1e2532] text-[#8b9bb4] hover:text-white'}`}><s.icon className="w-5 h-5"/><span className="text-xs font-bold">{s.name}</span><span className="text-[10px] text-[#586c8f]">{s.desc}</span></button>))}
      </div>
      <div className="flex-1 bg-[#0b0e14] border border-[#1e2532] rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-8 bg-[#1a1b3b]/50 border-b border-[#1e2532] flex items-center px-4"><span className="text-xs font-mono text-[#586c8f]">{activeSection}.ts</span></div>
        {output?(<textarea value={output} onChange={e=>setOutput(e.target.value)} className="w-full h-full bg-transparent text-[#e2e8f0] font-mono text-sm p-6 pt-12 resize-none focus:outline-none" spellCheck={false}/>):(<div className="absolute inset-0 flex flex-col items-center justify-center opacity-50 pointer-events-none"><Server className="w-16 h-16 text-[#586c8f] mb-4"/><p className="text-[#8b9bb4] text-lg font-bold">Select a section & click Generate</p></div>)}
      </div>
    </div>
  );
}
