'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, Target, Activity, FileCode2, Network, ShieldAlert, Sparkles, RefreshCcw } from 'lucide-react';

interface AuditResult {
  fileId: string;
  path: string;
  status: string;
  adherenceScore: number;
  vulnerabilities: number;
  lastAudited: string;
  retryCount: number;
}

export default function QualitySwarmDashboard() {
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    setProjectId(localStorage.getItem('activeProjectId'));
  }, []);
  
  const [audits, setAudits] = useState<AuditResult[]>([]);
  const [vectorNodes, setVectorNodes] = useState(0);
  const [health, setHealth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fixingFile, setFixingFile] = useState<string | null>(null);

  const fetchAudits = async () => {
    if (!projectId) return;
    setLoading(true);
    const res = await fetch(`/api/quality-audit?projectId=${projectId}`);
    const data = await res.json();
    if (data.success) {
      setAudits(data.audits);
      setVectorNodes(data.vectorNodes);
      setHealth(data.overallHealth || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!projectId) return;
    
    fetchAudits();

    const eventSource = new EventSource(`/api/stream/quality?projectId=${projectId}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === 'connected') return;
      
      setAudits(data.audits);
      setVectorNodes(data.vectorNodes);
      setHealth(data.overallHealth || 0);
      setLoading(false);
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [projectId]);

  const handleAutoFix = async (path: string) => {
    setFixingFile(path);
    try {
      const res = await fetch('/api/studio/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, filePath: path, task: `Fix vulnerabilities in ${path}` })
      });
      
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Auto-Fix failed");
      }
    } catch (e) {
      console.error(e);
    }
    setFixingFile(null);
  };

  return (
    <div className="h-full w-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto custom-scrollbar">
      
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-green-500" />
            Ollama Quality Swarm
          </h1>
          <p className="text-[#8b9bb4] mt-2 text-sm">
            Live local AI agents continuously auditing generated code against the PRD Knowledge Graph.
          </p>
        </div>
        <button onClick={fetchAudits} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm">
          <RefreshCcw className="w-4 h-4" /> Force Audit Sweep
        </button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0b0e14] border border-[#1e2532] rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Network className="w-32 h-32 text-white" />
          </div>
          <div className="text-sm font-bold text-[#586c8f] uppercase tracking-wider mb-2 flex items-center gap-2">
            <Network className="w-4 h-4" /> Vector Nodes
          </div>
          <div className="text-4xl font-extrabold text-white">
            {loading ? '-' : vectorNodes}
          </div>
          <p className="text-xs text-[#8b9bb4] mt-2">Embeddings loaded in Vector DB</p>
        </div>

        <div className="bg-[#0b0e14] border border-[#1e2532] rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Target className="w-32 h-32 text-green-500" />
          </div>
          <div className="text-sm font-bold text-[#586c8f] uppercase tracking-wider mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-green-500" /> PRD Adherence
          </div>
          <div className="text-4xl font-extrabold text-green-500">
            {loading ? '-' : `${health.toFixed(1)}%`}
          </div>
          <p className="text-xs text-[#8b9bb4] mt-2">Average match with PRD specs</p>
        </div>

        <div className="bg-[#0b0e14] border border-[#1e2532] rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="w-32 h-32 text-white" />
          </div>
          <div className="text-sm font-bold text-[#586c8f] uppercase tracking-wider mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Files Audited
          </div>
          <div className="text-4xl font-extrabold text-white">
            {loading ? '-' : audits.length}
          </div>
          <p className="text-xs text-[#8b9bb4] mt-2">Source files tracked by Swarm</p>
        </div>
      </div>

      {/* Audit List */}
      <div className="bg-[#0b0e14] border border-[#1e2532] rounded-2xl overflow-hidden">
        <div className="bg-[#1a1b3b]/30 p-4 border-b border-[#1e2532] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" /> Live Audit Log
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-500 font-mono">SWARM ACTIVE</span>
          </div>
        </div>
        
        <div className="divide-y divide-[#1e2532]">
          {audits.length === 0 && !loading && (
            <div className="p-8 text-center text-[#586c8f] text-sm">
              No source files generated yet. Use the Execution Studio to generate code.
            </div>
          )}
          
          {audits.map((audit) => {
            const isTripped = audit.status === 'CIRCUIT_TRIPPED';
            
            return (
              <div key={audit.fileId} className={`p-4 flex items-center justify-between transition-colors ${isTripped ? 'bg-red-950/40' : 'hover:bg-white/5'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    isTripped ? 'bg-red-900/50 border-red-500 text-red-500' :
                    audit.vulnerabilities > 0 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-green-500/10 border-green-500/30 text-green-500'
                  }`}>
                    {isTripped ? <ShieldAlert className="w-5 h-5" /> : 
                     audit.vulnerabilities > 0 ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-[#8b9bb4]" /> {audit.path}
                      {isTripped && <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">Locked</span>}
                    </div>
                    <div className="text-xs text-[#586c8f] mt-1 font-mono flex items-center gap-3">
                      <span>Last Sweep: {new Date(audit.lastAudited).toLocaleTimeString()}</span>
                      <span className={isTripped ? 'text-red-400' : 'text-slate-400'}>
                        Retries: {audit.retryCount || 0}/3
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-[#586c8f] uppercase tracking-wider mb-1">Score</div>
                    <div className={`text-lg font-mono font-bold ${audit.adherenceScore >= 90 ? 'text-green-500' : isTripped ? 'text-red-500' : 'text-yellow-500'}`}>
                      {audit.adherenceScore}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-[#586c8f] uppercase tracking-wider mb-1">Issues</div>
                    <div className={`text-lg font-mono font-bold ${audit.vulnerabilities > 0 ? 'text-red-500' : 'text-white'}`}>
                      {audit.vulnerabilities}
                    </div>
                  </div>
                  
                  {isTripped ? (
                    <div className="bg-red-500/10 text-red-500 px-3 py-1.5 rounded font-bold text-xs border border-red-500/30 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" /> HUMAN REQUIRED
                    </div>
                  ) : audit.vulnerabilities > 0 ? (
                    <button 
                      onClick={() => handleAutoFix(audit.path)}
                      disabled={fixingFile === audit.path}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded font-bold text-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {fixingFile === audit.path ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} 
                      {fixingFile === audit.path ? 'Fixing...' : 'Auto-Fix'}
                    </button>
                  ) : (
                    <div className="w-24 text-right pr-2">
                      <span className="text-green-500 text-xs font-bold uppercase tracking-wider">Passed</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
