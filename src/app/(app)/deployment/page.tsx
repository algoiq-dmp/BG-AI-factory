'use client';
import { useState, useEffect } from 'react';
import { MarkdownViewer } from '@/components/ui/MarkdownViewer';
import { Rocket, Sparkles, Loader2, FolderOpen, Server, Shield, Globe, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const deployStages = [
  { id: 'checklist', name: 'Pre-Deploy Checklist', desc: 'Verify build, env, DB', icon: CheckCircle2, prompt: 'You are a DevOps Engineer. Generate a comprehensive pre-deployment checklist including: build verification, environment variables validation, database migrations, SSL certificates, backup verification, rollback plan, monitoring setup, and security headers. Output as a markdown checklist.' },
  { id: 'docker', name: 'Docker & CI/CD', desc: 'Dockerfile + GitHub Actions', icon: Server, prompt: 'You are a DevOps Architect. Generate: 1) A production Dockerfile (multi-stage build, Node 20, minimal image), 2) A docker-compose.yml with the app + database, 3) A GitHub Actions CI/CD pipeline (.github/workflows/deploy.yml) with build, test, and deploy stages. Output all files with proper formatting.' },
  { id: 'infra', name: 'Infrastructure Config', desc: 'Nginx, PM2, firewall', icon: Globe, prompt: 'You are an Infrastructure Engineer. Generate production configs for: 1) Nginx reverse proxy with SSL, security headers, rate limiting, and gzip, 2) PM2 ecosystem.config.js with clustering, 3) UFW firewall rules, 4) Logrotate config. Output all config files.' },
  { id: 'security', name: 'Security Hardening', desc: 'Headers, CORS, rate limits', icon: Shield, prompt: 'You are a Security Engineer. Generate security hardening configurations: 1) Next.js security headers middleware, 2) CORS policy, 3) Rate limiting setup, 4) CSP headers, 5) Environment secrets management, 6) SSH hardening for VPS. Output TypeScript and config files.' },
];

const deployTimeline = [
  { step: 'Build', status: 'done', time: '8.2s' },
  { step: 'TypeScript Check', status: 'done', time: '3.7s' },
  { step: 'Static Generation', status: 'done', time: '0.4s' },
  { step: 'Push to GitHub', status: 'done', time: '2.1s' },
  { step: 'VPS Pull & Install', status: 'done', time: '47s' },
  { step: 'Prisma Migrate', status: 'done', time: '0.5s' },
  { step: 'PM2 Start', status: 'done', time: '1.2s' },
  { step: 'Nginx Config', status: 'done', time: '0.3s' },
  { step: 'Health Check', status: 'active', time: '...' },
  { step: 'DNS Propagation', status: 'pending', time: '—' },
];

export default function DeploymentPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeStage, setActiveStage] = useState('checklist');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => { const id = localStorage.getItem('activeProjectId'); setProjectId(id); fetch('/api/projects').then(r=>r.json()).then(d=>{if(d.success)setProjects(d.projects)}).catch(()=>{}); }, []);

  const handleGenerate = async () => {
    const s = deployStages.find(s=>s.id===activeStage); if(!s) return;
    setIsGenerating(true); setOutput('');
    try { const res = await fetch('/api/tools/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({task:s.name,context:`Deployment: ${s.name}`,systemPrompt:s.prompt})}); if(!res.body)throw new Error('No body'); const reader=res.body.getReader(); const decoder=new TextDecoder(); let done=false; while(!done){const{value,done:d}=await reader.read();done=d;if(value)setOutput(p=>p+decoder.decode(value))} } catch{setOutput('Error. Check API keys in Settings.')} finally{setIsGenerating(false)}
  };

  return (
    <div className="h-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 flex items-center justify-center"><Rocket className="w-6 h-6 text-green-400" /></div>
          <div><h1 className="text-2xl font-extrabold text-white tracking-tight">Deployment AI</h1><p className="text-sm text-[#8b9bb4] mt-0.5">Phase 13 — CI/CD pipeline, Docker, cloud deployment strategy</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111622] border border-[#1e2532] rounded-lg px-3 py-1.5"><FolderOpen className="w-4 h-4 text-[#586c8f]"/><select value={projectId||''} onChange={e=>{setProjectId(e.target.value);localStorage.setItem('activeProjectId',e.target.value)}} className="bg-transparent text-sm text-white font-bold focus:outline-none">{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <button onClick={handleGenerate} disabled={isGenerating} className="bg-[#22c55e] hover:bg-[#16a34a] text-black px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 text-sm">{isGenerating?<Loader2 className="w-4 h-4 animate-spin"/>:<Sparkles className="w-4 h-4"/>}{isGenerating?'Generating...':'Generate Config'}</button>
        </div>
      </div>

      {/* Deploy Stages */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {deployStages.map(s=>(<button key={s.id} onClick={()=>setActiveStage(s.id)} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${activeStage===s.id?'bg-green-500/10 border-green-500/30 text-white':'bg-[#111622] border-[#1e2532] text-[#8b9bb4] hover:text-white'}`}><s.icon className="w-5 h-5"/><div><div className="text-xs font-bold">{s.name}</div><div className="text-[10px] text-[#586c8f]">{s.desc}</div></div></button>))}
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Timeline */}
        <div className="w-64 bg-[#0b0e14] border border-[#1e2532] rounded-xl p-4 overflow-y-auto">
          <h3 className="text-xs font-bold text-[#586c8f] uppercase tracking-wider mb-3">Deploy Timeline</h3>
          <div className="space-y-1">
            {deployTimeline.map((t,i)=>(<div key={i} className="flex items-center gap-3 p-2 rounded-lg"><div className="flex-shrink-0">{t.status==='done'?<CheckCircle2 className="w-4 h-4 text-green-400"/>:t.status==='active'?<Loader2 className="w-4 h-4 text-yellow-400 animate-spin"/>:<Clock className="w-4 h-4 text-[#586c8f]"/>}</div><div className="flex-1"><div className={`text-xs font-medium ${t.status==='done'?'text-white':t.status==='active'?'text-yellow-400':'text-[#586c8f]'}`}>{t.step}</div></div><div className="text-[10px] font-mono text-[#586c8f]">{t.time}</div></div>))}
          </div>
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"><div className="text-[10px] uppercase font-bold text-green-400 tracking-wider mb-1">Live Server</div><div className="text-xs text-white font-mono">148.230.66.71:3003</div><div className="text-[10px] text-[#586c8f] mt-1">PM2 · 45 pages · Nginx</div></div>
        </div>

        {/* Output */}
        <div className="flex-1 bg-[#0b0e14] border border-[#1e2532] rounded-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-8 bg-[#1a1b3b]/50 border-b border-[#1e2532] flex items-center px-4"><span className="text-xs font-mono text-[#586c8f]">{activeStage === 'docker' ? 'Dockerfile' : activeStage === 'infra' ? 'ecosystem.config.js' : activeStage === 'security' ? 'middleware.ts' : 'pre-deploy-checklist.md'}</span></div>
          {output?(<MarkdownViewer content={output} onChange={setOutput} className="absolute inset-0" />):(<div className="absolute inset-0 flex flex-col items-center justify-center opacity-50 pointer-events-none"><Rocket className="w-16 h-16 text-[#586c8f] mb-4"/><p className="text-[#8b9bb4] text-lg font-bold">Select config & Generate</p></div>)}
        </div>
      </div>
    </div>
  );
}
