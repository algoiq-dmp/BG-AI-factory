'use client';
import { useState, useEffect } from 'react';
import { Activity, Sparkles, Loader2, FolderOpen, Cpu, HardDrive, Wifi, AlertTriangle, CheckCircle2, Clock, TrendingUp, TrendingDown } from 'lucide-react';

const monitors = [
  { id: 'health', name: 'Health Monitor', desc: 'Uptime & endpoint health', prompt: 'You are a Site Reliability Engineer. Generate a comprehensive health monitoring setup including: health check endpoints, uptime monitoring script (with cron), response time tracking, database connection checks, memory/CPU alerting thresholds, and Slack/email notification integration. Output TypeScript and bash scripts.' },
  { id: 'logs', name: 'Log Analyzer', desc: 'Error patterns & insights', prompt: 'You are a Log Analysis Expert. Generate a structured logging system with: Winston/Pino logger configuration, log levels (error/warn/info/debug), request/response logging middleware, error aggregation, log rotation, and a log analysis script that identifies error patterns and anomalies. Output TypeScript.' },
  { id: 'metrics', name: 'Metrics Dashboard', desc: 'Custom Prometheus/Grafana', prompt: 'You are a Monitoring Engineer. Generate Prometheus metrics collection setup with: custom metrics (request duration, error rate, active users), Prometheus client configuration, Grafana dashboard JSON, and alerting rules for SLA violations. Output TypeScript and JSON configs.' },
  { id: 'alerts', name: 'Alert Rules', desc: 'Threshold-based notifications', prompt: 'You are a DevOps Engineer. Generate an alerting system with: configurable threshold rules (CPU >80%, Memory >90%, Error Rate >5%, Response Time >2s), notification channels (Slack webhook, email, SMS), escalation policies, and incident tracking. Output TypeScript.' },
];

const liveMetrics = [
  { label: 'CPU Usage', value: '12%', trend: 'down', icon: Cpu, color: 'green' },
  { label: 'Memory', value: '186MB', trend: 'stable', icon: HardDrive, color: 'blue' },
  { label: 'Uptime', value: '99.9%', trend: 'up', icon: Wifi, color: 'green' },
  { label: 'Avg Response', value: '142ms', trend: 'down', icon: Clock, color: 'green' },
];

const recentEvents = [
  { time: '2 min ago', event: 'Health check passed', severity: 'ok' },
  { time: '5 min ago', event: 'PM2 process restarted', severity: 'warning' },
  { time: '12 min ago', event: 'Deployment completed', severity: 'ok' },
  { time: '15 min ago', event: 'npm run build succeeded', severity: 'ok' },
  { time: '18 min ago', event: 'Prisma migration applied', severity: 'ok' },
  { time: '20 min ago', event: 'Git pull from master', severity: 'ok' },
  { time: '1 hr ago', event: 'High memory warning (92%)', severity: 'critical' },
  { time: '2 hr ago', event: 'SSL certificate renewed', severity: 'ok' },
];

export default function MonitoringPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeMonitor, setActiveMonitor] = useState('health');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uptime] = useState(99.97);

  useEffect(() => { const id = localStorage.getItem('activeProjectId'); setProjectId(id); fetch('/api/projects').then(r=>r.json()).then(d=>{if(d.success)setProjects(d.projects)}).catch(()=>{}); }, []);

  const handleGenerate = async () => {
    const m = monitors.find(s=>s.id===activeMonitor); if(!m) return;
    setIsGenerating(true); setOutput('');
    try { const res = await fetch('/api/tools/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({task:m.name,context:`Monitoring: ${m.name}`,systemPrompt:m.prompt})}); if(!res.body)throw new Error('No body'); const reader=res.body.getReader(); const decoder=new TextDecoder(); let done=false; while(!done){const{value,done:d}=await reader.read();done=d;if(value)setOutput(p=>p+decoder.decode(value))} } catch{setOutput('Error. Check API keys in Settings.')} finally{setIsGenerating(false)}
  };

  return (
    <div className="h-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 flex items-center justify-center"><Activity className="w-6 h-6 text-cyan-400" /></div>
          <div><h1 className="text-2xl font-bold text-white tracking-tight">Monitoring AI Agent</h1><p className="text-[#8b9bb4] text-sm mt-1">Stage 12 · Health, Logs, Metrics & Alerts</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/><span className="text-xs font-bold text-green-400">LIVE · {uptime}% Uptime</span></div>
          <button onClick={handleGenerate} disabled={isGenerating} className="bg-[#06b6d4] hover:bg-[#0891b2] text-black px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 text-sm">{isGenerating?<Loader2 className="w-4 h-4 animate-spin"/>:<Sparkles className="w-4 h-4"/>}{isGenerating?'Generating...':'Generate Config'}</button>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {liveMetrics.map(m=>(<div key={m.label} className="bg-[#111622] border border-[#1e2532] rounded-xl p-4"><div className="flex items-center justify-between mb-2"><m.icon className={`w-4 h-4 text-${m.color}-400`}/>{m.trend==='up'?<TrendingUp className="w-3 h-3 text-green-400"/>:m.trend==='down'?<TrendingDown className="w-3 h-3 text-green-400"/>:<Activity className="w-3 h-3 text-blue-400"/>}</div><div className="text-xl font-black text-white">{m.value}</div><div className="text-[10px] uppercase tracking-widest text-[#586c8f] font-bold">{m.label}</div></div>))}
      </div>

      {/* Monitor Types */}
      <div className="flex gap-2 mb-4">
        {monitors.map(m=>(<button key={m.id} onClick={()=>setActiveMonitor(m.id)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeMonitor===m.id?'bg-cyan-500/20 border border-cyan-500/30 text-white':'bg-[#111622] border border-[#1e2532] text-[#8b9bb4] hover:text-white'}`}>{m.name}</button>))}
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Event Log */}
        <div className="w-72 bg-[#0b0e14] border border-[#1e2532] rounded-xl p-4 overflow-y-auto">
          <h3 className="text-xs font-bold text-[#586c8f] uppercase tracking-wider mb-3">Recent Events</h3>
          <div className="space-y-2">
            {recentEvents.map((e,i)=>(<div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-[#111622]"><div className="flex-shrink-0 mt-0.5">{e.severity==='ok'?<CheckCircle2 className="w-3.5 h-3.5 text-green-400"/>:e.severity==='warning'?<AlertTriangle className="w-3.5 h-3.5 text-yellow-400"/>:<AlertTriangle className="w-3.5 h-3.5 text-red-400"/>}</div><div><div className="text-xs text-white">{e.event}</div><div className="text-[10px] text-[#586c8f]">{e.time}</div></div></div>))}
          </div>
        </div>

        {/* Output */}
        <div className="flex-1 bg-[#0b0e14] border border-[#1e2532] rounded-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-8 bg-[#1a1b3b]/50 border-b border-[#1e2532] flex items-center px-4"><span className="text-xs font-mono text-[#586c8f]">{activeMonitor}-config.ts</span></div>
          {output?(<textarea value={output} onChange={e=>setOutput(e.target.value)} className="w-full h-full bg-transparent text-[#e2e8f0] font-mono text-sm p-6 pt-12 resize-none focus:outline-none" spellCheck={false}/>):(<div className="absolute inset-0 flex flex-col items-center justify-center opacity-50 pointer-events-none"><Activity className="w-16 h-16 text-[#586c8f] mb-4"/><p className="text-[#8b9bb4] text-lg font-bold">Select monitor & Generate</p></div>)}
        </div>
      </div>
    </div>
  );
}
