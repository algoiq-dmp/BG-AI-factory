'use client';

import { useState, useEffect } from 'react';
import { 
  Gauge, CheckCircle2, XCircle, AlertTriangle, FileCode2, 
  MessageSquare, BookOpen, GitBranch, Shield, Cpu, TestTube,
  FolderOpen, Loader2, RefreshCcw
} from 'lucide-react';

const standards = [
  { id: 'comments', name: 'Detailed Comments', desc: 'JSDoc/TSDoc on every exported function, class, and type', icon: MessageSquare, target: '100% coverage' },
  { id: 'readme', name: 'README Everywhere', desc: 'README.md in every module/package directory', icon: BookOpen, target: 'All directories' },
  { id: 'changelog', name: 'Auto Changelog', desc: 'Conventional Commits + auto CHANGELOG.md generation', icon: GitBranch, target: 'Every release' },
  { id: 'api-docs', name: 'API Documentation', desc: 'OpenAPI/Swagger specs auto-generated from code', icon: FileCode2, target: '100% endpoints' },
  { id: 'logging', name: 'Structured Logging', desc: 'Winston/Pino with JSON structured logs in every service', icon: Cpu, target: 'All services' },
  { id: 'error-handling', name: 'Error Handling', desc: 'Try/catch, error boundaries, graceful degradation', icon: Shield, target: '100% routes' },
  { id: 'reusable', name: 'Reusable Modules', desc: 'DRY patterns, shared utils, component library', icon: FolderOpen, target: '>90% reuse' },
  { id: 'test-coverage', name: 'Test Coverage >80%', desc: 'Unit, integration, and E2E test coverage', icon: TestTube, target: '80%+' },
  { id: 'type-safety', name: 'Type Safety', desc: 'TypeScript strict mode, no any types, full inference', icon: Shield, target: '100% typed' },
  { id: 'cicd', name: 'CI/CD Mandatory', desc: 'GitHub Actions or equivalent pipeline on every push', icon: GitBranch, target: 'All repos' },
  { id: 'git-commits', name: 'Git Commit Standards', desc: 'Conventional Commits: feat:, fix:, docs:, refactor:', icon: GitBranch, target: '100% commits' },
  { id: 'versioning', name: 'Versioning Standards', desc: 'Semantic Versioning (semver) with auto-bump', icon: GitBranch, target: 'All packages' },
  { id: 'security', name: 'Security Scan', desc: 'Dependency audit, OWASP checks, secret scanning', icon: Shield, target: '0 critical' },
];

export default function QualityDashboardPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [results, setResults] = useState<Record<string, 'pass' | 'fail' | 'partial'>>({});
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('activeProjectId');
    setProjectId(id);
    fetch('/api/projects').then(r => r.json()).then(d => {
      if (d.success) setProjects(d.projects);
    });
  }, []);

  const runScan = () => {
    setScanning(true);
    // Simulate progressive scanning
    const statuses: ('pass' | 'fail' | 'partial')[] = ['pass', 'fail', 'partial'];
    let i = 0;
    const interval = setInterval(() => {
      if (i >= standards.length) {
        clearInterval(interval);
        setScanning(false);
        return;
      }
      const s = standards[i];
      setResults(prev => ({ ...prev, [s.id]: statuses[Math.floor(Math.random() * 3)] }));
      i++;
    }, 300);
  };

  const passCount = Object.values(results).filter(v => v === 'pass').length;
  const failCount = Object.values(results).filter(v => v === 'fail').length;
  const partialCount = Object.values(results).filter(v => v === 'partial').length;
  const totalScanned = Object.keys(results).length;
  const score = totalScanned > 0 ? Math.round((passCount / totalScanned) * 100) : 0;

  return (
    <div className="h-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10b981]/20 to-[#10b981]/5 border border-[#10b981]/30 flex items-center justify-center">
            <Gauge className="w-6 h-6 text-[#10b981]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Quality Standards Dashboard</h1>
            <p className="text-[#8b9bb4] text-sm mt-1">13 Mandatory Standards · Autonomous Compliance Engine</p>
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
          <button onClick={runScan} disabled={scanning} className="bg-[#10b981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 text-sm">
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            {scanning ? 'Scanning...' : 'Run Full Scan'}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-4 text-center">
          <div className="text-3xl font-black text-white">{score}%</div>
          <div className="text-[10px] uppercase tracking-widest text-[#586c8f] font-bold mt-1">Quality Score</div>
        </div>
        <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-4 text-center">
          <div className="text-3xl font-black text-green-400">{passCount}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#586c8f] font-bold mt-1">Passed</div>
        </div>
        <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-4 text-center">
          <div className="text-3xl font-black text-yellow-400">{partialCount}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#586c8f] font-bold mt-1">Partial</div>
        </div>
        <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-4 text-center">
          <div className="text-3xl font-black text-red-400">{failCount}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#586c8f] font-bold mt-1">Failed</div>
        </div>
        <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-4 text-center">
          <div className="text-3xl font-black text-white">{standards.length}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#586c8f] font-bold mt-1">Total Standards</div>
        </div>
      </div>

      {/* Standards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
        {standards.map(s => {
          const status = results[s.id];
          return (
            <div key={s.id} className={`bg-[#0b0e14] border rounded-xl p-5 transition-all ${
              status === 'pass' ? 'border-green-500/30 bg-green-500/5' :
              status === 'fail' ? 'border-red-500/30 bg-red-500/5' :
              status === 'partial' ? 'border-yellow-500/30 bg-yellow-500/5' :
              'border-[#1e2532]'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#1a1b3b] border border-[#1e2532] flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-[#5b5fd8]" />
                </div>
                {status === 'pass' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                {status === 'fail' && <XCircle className="w-5 h-5 text-red-400" />}
                {status === 'partial' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                {!status && scanning && <Loader2 className="w-4 h-4 text-[#586c8f] animate-spin" />}
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{s.name}</h3>
              <p className="text-xs text-[#586c8f] mb-3">{s.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8b9bb4] uppercase tracking-wider">Target: {s.target}</span>
                {status && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    status === 'pass' ? 'bg-green-500/20 text-green-400' :
                    status === 'fail' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>{status}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
