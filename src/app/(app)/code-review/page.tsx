'use client';
import { useState, useEffect } from 'react';
import { Eye, Sparkles, Loader2, FolderOpen, ShieldCheck, AlertTriangle, Zap, Bug } from 'lucide-react';

const reviewTypes = [
  { id: 'security', name: 'Security Audit', desc: 'Vulnerabilities & injection risks', icon: ShieldCheck, color: 'red', prompt: 'You are a Security Engineer. Perform a thorough security code review looking for: SQL injection, XSS, CSRF, authentication flaws, sensitive data exposure, insecure dependencies, and misconfigured headers. For each finding provide: severity (Critical/High/Medium/Low), location, description, and remediation. Output markdown.' },
  { id: 'performance', name: 'Performance Review', desc: 'Bottlenecks & optimization', icon: Zap, color: 'yellow', prompt: 'You are a Performance Engineer. Review code for: N+1 queries, unnecessary re-renders, large bundle sizes, missing memoization, unoptimized images, blocking operations, memory leaks. For each finding provide: impact, location, current code, suggested fix. Output markdown.' },
  { id: 'quality', name: 'Code Quality', desc: 'Clean code & best practices', icon: Eye, color: 'blue', prompt: 'You are a Senior Code Reviewer. Review for: SOLID principles, DRY violations, code complexity (cyclomatic), naming conventions, error handling patterns, TypeScript strict mode compliance, proper async/await usage. Rate each file A-F. Output markdown.' },
  { id: 'bugs', name: 'Bug Detection', desc: 'Logic errors & edge cases', icon: Bug, color: 'purple', prompt: 'You are a QA Engineer specializing in bug detection. Analyze code for: logic errors, off-by-one errors, race conditions, null pointer exceptions, type coercion bugs, missing error boundaries, unhandled promise rejections. For each bug provide: severity, reproduction steps, fix. Output markdown.' },
];

const mockFindings = [
  { severity: 'critical', title: 'Missing CSRF protection on API routes', file: 'src/app/api/', status: 'open' },
  { severity: 'high', title: 'SQL injection via unsanitized input', file: 'src/lib/prisma.ts', status: 'open' },
  { severity: 'medium', title: 'Unnecessary re-renders in Dashboard', file: 'src/app/page.tsx', status: 'fixed' },
  { severity: 'low', title: 'Console.log left in production', file: 'src/components/', status: 'open' },
  { severity: 'medium', title: 'Missing error boundary in layout', file: 'src/app/layout.tsx', status: 'open' },
];

export default function CodeReviewPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeType, setActiveType] = useState('security');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { const id = localStorage.getItem('activeProjectId'); setProjectId(id); fetch('/api/projects').then(r=>r.json()).then(d=>{if(d.success)setProjects(d.projects)}).catch(()=>{}); }, []);

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      fetch(`/api/code-review?projectId=${projectId}`)
        .then(r => r.json())
        .then(d => {
          if (d.success && d.reviews) {
            setFindings(d.reviews.length > 0 ? d.reviews : []);
          } else {
            setFindings([]);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [projectId]);

  const handleGenerate = async () => {
    if (!projectId) return alert('Please select a project first.');
    const t = reviewTypes.find(s=>s.id===activeType); if(!t) return;
    setIsGenerating(true); setOutput('');
    try { 
      const res = await fetch('/api/tools/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({task:t.name,context:`Code Review: ${t.name}`,systemPrompt:t.prompt})}); 
      if(!res.body)throw new Error('No body'); 
      const reader=res.body.getReader(); 
      const decoder=new TextDecoder(); 
      let done=false; 
      let fullText = '';
      while(!done){
        const{value,done:d}=await reader.read();
        done=d;
        if(value) {
          const chunk = decoder.decode(value);
          fullText += chunk;
          setOutput(p=>p+chunk)
        }
      }
      
      const newFinding = { severity: 'high', title: `AI Finding: ${t.name}`, description: 'Detected by AI review.', file: 'src/app/page.tsx', status: 'open' };
      const updatedFindings = [newFinding, ...findings];
      setFindings(updatedFindings);
      
      await fetch('/api/code-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, reviews: updatedFindings })
      });
      
    } catch{setOutput('Error. Check API keys in Settings.')} finally{setIsGenerating(false)}
  };

  const severityColor: Record<string, string> = { critical: 'bg-red-500/20 text-red-400 border-red-500/30', high: 'bg-orange-500/20 text-orange-400 border-orange-500/30', medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', low: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };

  return (
    <div className="h-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/30 flex items-center justify-center"><Eye className="w-6 h-6 text-teal-400" /></div>
          <div><h1 className="text-2xl font-bold text-white tracking-tight">Code Review AI Agent</h1><p className="text-[#8b9bb4] text-sm mt-1">Stage 10 · Security, Performance, Quality & Bug Detection</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111622] border border-[#1e2532] rounded-lg px-3 py-1.5"><FolderOpen className="w-4 h-4 text-[#586c8f]"/><select value={projectId||''} onChange={e=>{setProjectId(e.target.value);localStorage.setItem('activeProjectId',e.target.value)}} className="bg-transparent text-sm text-white font-bold focus:outline-none">{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <button onClick={handleGenerate} disabled={isGenerating} className="bg-[#14b8a6] hover:bg-[#0d9488] text-black px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 text-sm">{isGenerating?<Loader2 className="w-4 h-4 animate-spin"/>:<Sparkles className="w-4 h-4"/>}{isGenerating?'Reviewing...':'Start Review'}</button>
        </div>
      </div>

      {/* Review Types */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {reviewTypes.map(t=>(<button key={t.id} onClick={()=>setActiveType(t.id)} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${activeType===t.id?'bg-teal-500/10 border-teal-500/30 text-white':'bg-[#111622] border-[#1e2532] text-[#8b9bb4] hover:text-white'}`}><t.icon className="w-5 h-5"/><div><div className="text-xs font-bold">{t.name}</div><div className="text-[10px] text-[#586c8f]">{t.desc}</div></div></button>))}
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Findings Panel */}
        <div className="w-72 bg-[#0b0e14] border border-[#1e2532] rounded-xl p-4 overflow-y-auto">
          <h3 className="text-xs font-bold text-[#586c8f] uppercase tracking-wider mb-3">Findings ({findings.length})</h3>
          <div className="space-y-2">
            {findings.length === 0 ? (
              <div className="text-[#586c8f] text-[10px] text-center mt-4">No findings yet. Click Start Review.</div>
            ) : findings.map((f,i)=>(<div key={i} className="p-3 rounded-lg bg-[#111622] border border-[#1e2532]"><div className="flex items-center justify-between mb-1"><span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${severityColor[f.severity]}`}>{f.severity}</span>{f.status==='fixed'?<span className="text-[10px] text-green-400 font-bold">FIXED</span>:<span className="text-[10px] text-yellow-400 font-bold">OPEN</span>}</div><div className="text-xs text-white font-medium mt-1">{f.title}</div><div className="text-[10px] text-[#586c8f] font-mono mt-1">{f.file}</div></div>))}
          </div>
        </div>

        {/* Output */}
        <div className="flex-1 bg-[#0b0e14] border border-[#1e2532] rounded-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-8 bg-[#1a1b3b]/50 border-b border-[#1e2532] flex items-center px-4"><span className="text-xs font-mono text-[#586c8f]">review-{activeType}.md</span></div>
          {output?(<textarea value={output} onChange={e=>setOutput(e.target.value)} className="w-full h-full bg-transparent text-[#e2e8f0] font-mono text-sm p-6 pt-12 resize-none focus:outline-none" spellCheck={false}/>):(<div className="absolute inset-0 flex flex-col items-center justify-center opacity-50 pointer-events-none"><Eye className="w-16 h-16 text-[#586c8f] mb-4"/><p className="text-[#8b9bb4] text-lg font-bold">Select review type & Start</p></div>)}
        </div>
      </div>
    </div>
  );
}
