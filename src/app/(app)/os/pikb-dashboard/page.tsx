"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { ShieldAlert, Database, BarChart3, Rocket, Activity, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function PIKBDashboardContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchPIKB = async () => {
      try {
        const res = await fetch(`/api/pikb?projectId=${projectId}`);
        const json = await res.json();
        if (json.success) setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPIKB();
  }, [projectId]);

  const handleAudit = async () => {
    if (!projectId) return;
    try {
      await fetch('/api/pikb/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  if (!projectId) {
    return <div className="p-8 text-center text-[#586c8f]">Please select a project to view its PIKB Governance.</div>;
  }

  if (loading) {
    return <div className="p-8 text-center text-[#586c8f] animate-pulse">Loading Project Intelligence...</div>;
  }

  const state = data?.state || {};
  const risks = data?.risks || [];
  const drift = data?.drift || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-[#111622] p-6 rounded-2xl border border-[#1e2532]">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Database className="w-6 h-6 text-[#a855f7]" /> 
            PIKB Executive Governance
          </h1>
          <p className="text-sm text-[#586c8f] mt-1">Autonomous Knowledge Base & Continuous Audit Engine</p>
        </div>
        <button 
          onClick={handleAudit}
          className="px-5 py-2.5 bg-[#a855f7] hover:bg-[#9333ea] text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          Trigger Re-Audit
        </button>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="KB Health Score" value={`${state.healthScore || 0}%`} icon={<Activity />} color="#10b981" />
        <MetricCard title="Coverage Score" value={`${state.coverageScore || 0}%`} icon={<CheckCircle2 />} color="#3b82f6" />
        <MetricCard title="Drift Score" value={`${state.driftScore || 0}%`} icon={<BarChart3 />} color="#f59e0b" />
        <MetricCard title="Risk Score" value={`${state.riskScore || 0}%`} icon={<AlertTriangle />} color="#ef4444" />
      </div>

      {/* RISKS & DRIFT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Risks */}
        <div className="bg-[#111622] p-6 rounded-2xl border border-[#1e2532]">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" /> Active Show Stoppers
          </h2>
          {risks.length === 0 ? (
            <div className="text-center py-8 text-[#586c8f] text-sm">No critical risks detected.</div>
          ) : (
            <div className="space-y-3">
              {risks.map((r: any) => (
                <div key={r.id} className="p-4 bg-[#1a2130] border border-red-500/20 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-red-400">{r.title}</span>
                    <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">{r.severity}</span>
                  </div>
                  <p className="text-sm text-[#8b9bb4]">{r.impact}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drift */}
        <div className="bg-[#111622] p-6 rounded-2xl border border-[#1e2532]">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-orange-500" /> Code vs KB Drift
          </h2>
          {drift.length === 0 ? (
            <div className="text-center py-8 text-[#586c8f] text-sm">No drift detected. Perfect alignment.</div>
          ) : (
            <div className="space-y-3">
              {drift.map((d: any) => (
                <div key={d.id} className="p-4 bg-[#1a2130] border border-orange-500/20 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-orange-400">{d.feature}</div>
                    <div className="text-[11px] text-[#586c8f]">Expected: {d.kbStatus}</div>
                  </div>
                  <div className="text-xl font-black text-white">{d.alignment}%</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LAUNCH READINESS */}
      <div className="bg-gradient-to-r from-[#111622] to-[#1e2532] p-8 rounded-2xl border border-[#3b82f6]/30 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Rocket className="w-6 h-6 text-[#3b82f6]" /> Release Readiness
          </h2>
          <p className="text-sm text-[#8b9bb4] mt-2 max-w-lg">
            Beta and Production launches are strictly governed by objective PIKB scores. Alignment must exceed 90% and risk must be mitigated.
          </p>
        </div>
        <div className="flex gap-4 mt-6 md:mt-0">
          <div className={`px-6 py-3 rounded-xl border ${state.betaReady ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'} font-bold flex flex-col items-center`}>
            <span className="text-2xl">{state.betaReady ? 'GO' : 'NO-GO'}</span>
            <span className="text-[10px] uppercase tracking-wider">Beta</span>
          </div>
          <div className={`px-6 py-3 rounded-xl border ${state.prodReady ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'} font-bold flex flex-col items-center`}>
            <span className="text-2xl">{state.prodReady ? 'GO' : 'NO-GO'}</span>
            <span className="text-[10px] uppercase tracking-wider">Production</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function PIKBDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#586c8f] animate-pulse">Loading Dashboard...</div>}>
      <PIKBDashboardContent />
    </Suspense>
  );
}

function MetricCard({ title, value, icon, color }: { title: string, value: string, icon: any, color: string }) {
  return (
    <div className="bg-[#111622] p-6 rounded-2xl border border-[#1e2532] relative overflow-hidden group">
      <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl opacity-10 rounded-bl-full" style={{ backgroundImage: `linear-gradient(to bottom left, ${color}, transparent)` }} />
      <div className="text-[#8b9bb4] mb-4" style={{ color }}>{icon}</div>
      <div className="text-3xl font-black text-white">{value}</div>
      <div className="text-xs text-[#586c8f] font-bold uppercase tracking-wider mt-2">{title}</div>
    </div>
  );
}
