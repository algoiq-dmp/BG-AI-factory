'use client';
import { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Loader2, FolderOpen, FileText, GitBranch, Code, Layers } from 'lucide-react';

const sections = [
  { id: 'readme', name: 'README Generator', desc: 'Auto-generate README.md for every module', icon: FileText, prompt: 'You are a Technical Writer. Generate a comprehensive README.md with: project overview, tech stack, installation steps, environment variables, API documentation, folder structure, contributing guidelines, and license. Use proper markdown formatting with badges.' },
  { id: 'api-docs', name: 'API Documentation', desc: 'OpenAPI/Swagger specs from code', icon: Code, prompt: 'You are an API Documentation Expert. Generate complete OpenAPI 3.0 specification for all API endpoints. Include: paths, methods, request/response schemas, authentication, error codes, and example payloads. Output in YAML format.' },
  { id: 'changelog', name: 'Changelog Generator', desc: 'Auto changelog from git commits', icon: GitBranch, prompt: 'You are a Release Manager. Generate a CHANGELOG.md following Keep a Changelog format. Include: Added, Changed, Deprecated, Removed, Fixed, Security sections. Use semantic versioning. Output markdown.' },
  { id: 'architecture', name: 'Architecture Docs', desc: 'System design documentation', icon: Layers, prompt: 'You are a Solutions Architect. Generate comprehensive architecture documentation including: system overview, component diagrams (in mermaid), data flow, technology decisions, deployment architecture, and scaling strategy. Output markdown.' },
];

export default function DocumentationAIPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState('readme');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<Record<string, boolean>>({});

  useEffect(() => { const id = localStorage.getItem('activeProjectId'); setProjectId(id); fetch('/api/projects').then(r=>r.json()).then(d=>{if(d.success)setProjects(d.projects)}).catch(()=>{}); }, []);

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      fetch(`/api/documents?projectId=${projectId}`)
        .then(r => r.json())
        .then(d => {
          if (d.success && d.project && d.project.documents) {
            const docs = d.project.documents;
            const currentTitle = activeSection === 'readme' ? 'README.md' : activeSection === 'api-docs' ? 'openapi.yaml' : activeSection === 'changelog' ? 'CHANGELOG.md' : 'ARCHITECTURE.md';
            const doc = docs.find((x: any) => x.title === currentTitle);
            if (doc && doc.content) {
              setOutput(doc.content);
              setGenerated(prev=>({...prev,[activeSection]:true}));
            } else {
              setOutput('');
            }
          } else {
            setOutput('');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [projectId, activeSection]);

  const handleGenerate = async () => {
    if (!projectId) return alert('Please select a project first.');
    const section = sections.find(s=>s.id===activeSection); if(!section) return;
    setIsGenerating(true); setOutput('');
    const currentTitle = activeSection === 'readme' ? 'README.md' : activeSection === 'api-docs' ? 'openapi.yaml' : activeSection === 'changelog' ? 'CHANGELOG.md' : 'ARCHITECTURE.md';
    try { 
      const res = await fetch('/api/tools/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({task:section.name,context:`Documentation: ${section.name}`,systemPrompt:section.prompt})}); 
      if(!res.body)throw new Error('No body'); 
      const reader=res.body.getReader(); const decoder=new TextDecoder(); let done=false; 
      let fullText = '';
      while(!done){
        const{value,done:d}=await reader.read();
        done=d;
        if(value){
          const chunk = decoder.decode(value);
          fullText += chunk;
          setOutput(p=>p+chunk)
        }
      }
      setGenerated(prev=>({...prev,[activeSection]:true})); 
      
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, title: currentTitle, type: 'DOCUMENTATION', content: fullText })
      });
    } catch{setOutput('Error. Check API keys in Settings.')} finally{setIsGenerating(false)}
  };

  return (
    <div className="h-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center"><BookOpen className="w-6 h-6 text-amber-400" /></div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Documentation AI</h1>
            <p className="text-sm text-[#8b9bb4] mt-0.5">Phase 10 — Complete technical docs, README, API specs</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111622] border border-[#1e2532] rounded-lg px-3 py-1.5"><FolderOpen className="w-4 h-4 text-[#586c8f]"/><select value={projectId||''} onChange={e=>{setProjectId(e.target.value);localStorage.setItem('activeProjectId',e.target.value)}} className="bg-transparent text-sm text-white font-bold focus:outline-none">{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <button onClick={handleGenerate} disabled={isGenerating} className="bg-[#f59e0b] hover:bg-[#d97706] text-black px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 text-sm">{isGenerating?<Loader2 className="w-4 h-4 animate-spin"/>:<Sparkles className="w-4 h-4"/>}{isGenerating?'Generating...':'Generate Docs'}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {sections.map(s=>(<button key={s.id} onClick={()=>setActiveSection(s.id)} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all relative ${activeSection===s.id?'bg-amber-500/10 border-amber-500/30 text-white':'bg-[#111622] border-[#1e2532] text-[#8b9bb4] hover:text-white'}`}>{generated[s.id]&&<div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400"/>}<s.icon className="w-5 h-5"/><span className="text-xs font-bold">{s.name}</span><span className="text-[10px] text-[#586c8f]">{s.desc}</span></button>))}
      </div>

      <div className="flex-1 bg-[#0b0e14] border border-[#1e2532] rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-8 bg-[#1a1b3b]/50 border-b border-[#1e2532] flex items-center px-4"><span className="text-xs font-mono text-[#586c8f]">{activeSection === 'readme' ? 'README.md' : activeSection === 'api-docs' ? 'openapi.yaml' : activeSection === 'changelog' ? 'CHANGELOG.md' : 'ARCHITECTURE.md'}</span></div>
        {output?(<textarea value={output} onChange={e=>setOutput(e.target.value)} className="w-full h-full bg-transparent text-[#e2e8f0] font-mono text-sm p-6 pt-12 resize-none focus:outline-none" spellCheck={false}/>):(<div className="absolute inset-0 flex flex-col items-center justify-center opacity-50 pointer-events-none"><BookOpen className="w-16 h-16 text-[#586c8f] mb-4"/><p className="text-[#8b9bb4] text-lg font-bold">Select doc type & Generate</p></div>)}
      </div>
    </div>
  );
}
