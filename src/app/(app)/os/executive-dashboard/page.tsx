'use client';

import { useWorkAnalyticsStore } from '@/store/useWorkAnalyticsStore';
import { 
  LayoutDashboard, TrendingUp, AlertTriangle, ShieldCheck, 
  BrainCircuit, Calendar, CheckCircle2, ChevronRight, Zap,
  Code2, FileCode2, Database, Users, Server, Clock, Activity
} from 'lucide-react';
import { useOsStore } from '@/store/useOsStore';

export default function ExecutiveDashboardPage() {
  const { mode } = useOsStore();
  
  if (mode === 'STARTUP') {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#0b0e14] text-[#8b9bb4]">
        <div className="w-16 h-16 rounded-2xl bg-[#a855f7]/10 flex items-center justify-center mb-6 border border-[#a855f7]/30">
          <Zap className="w-8 h-8 text-[#a855f7]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Executive Intelligence Locked</h2>
        <p className="text-sm max-w-md text-center text-[#586c8f]">
          You are currently in Startup mode designed for rapid execution. Switch to Enterprise mode to unlock CTO-level live development analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-[#0b0e14] text-[#8b9bb4] animate-in fade-in slide-in-from-bottom-4 duration-500 custom-scrollbar pb-12">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-[#1e2532] bg-[#0b0e14]/95 backdrop-blur-md px-8 py-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-[#a855f7]" />
            Project CEO Dashboard
          </h1>
          <p className="text-sm mt-1 text-[#8b9bb4]">Live Development Intelligence & Deep Analytics</p>
        </div>
        <div className="bg-[#111622] px-4 py-2 rounded-lg border border-[#1e2532] flex items-center gap-3 shadow-inner">
           <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
           <span className="text-sm font-bold text-[#e2e8f0]">Live Sync Active</span>
        </div>
      </div>

      <div className="px-8 py-6 space-y-8">
        
        {/* ROW 1: Core Intelligence KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <ExecKpiCard title="Estimated Completion" value="12 Days" icon={<Calendar color="#3b82f6"/>} trend="On Track" color="#3b82f6" />
          <ExecKpiCard title="AI Productivity" value="84%" icon={<BrainCircuit color="#a855f7"/>} trend="+12% vs Human" color="#a855f7" />
          <ExecKpiCard title="Risk Score" value="12/100" icon={<ShieldCheck color="#10b981"/>} trend="Low Risk" color="#10b981" />
          <ExecKpiCard title="Bottlenecks" value="2" icon={<AlertTriangle color="#f59e0b"/>} trend="Payment API" color="#f59e0b" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COL 1: Code Analytics */}
          <div className="rounded-2xl border border-[#1e2532] bg-[#111622] p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#3b82f6]" /> Code Analytics
            </h2>
            <div className="space-y-4">
              <MetricRow label="Total Pages" value="24" />
              <MetricRow label="Total Components" value="86" />
              <MetricRow label="Total APIs" value="32" />
              <MetricRow label="Database Tables" value="14" />
              <MetricRow label="AI Agents" value="5" />
              <MetricRow label="Workflows" value="12" />
            </div>
          </div>

          {/* COL 2: Coding Status */}
          <div className="rounded-2xl border border-[#1e2532] bg-[#111622] p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#10b981]" /> Coding Status
            </h2>
            <div className="space-y-4">
              <MetricRow label="Total Modules" value="18" />
              <MetricRow label="Completed Modules" value="12" highlight="text-[#10b981]" />
              <MetricRow label="Pending Modules" value="5" highlight="text-[#f59e0b]" />
              <MetricRow label="Failed Modules" value="1" highlight="text-[#ef4444]" />
              <MetricRow label="Testing Status" value="80% Pass" highlight="text-[#3b82f6]" />
              <MetricRow label="Documentation Status" value="95% Auto-Synced" highlight="text-[#a855f7]" />
            </div>
          </div>

          {/* COL 3: Code Size Analytics */}
          <div className="rounded-2xl border border-[#1e2532] bg-[#111622] p-6 shadow-xl relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ef4444]/10 blur-3xl rounded-full pointer-events-none" />
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Server className="w-5 h-5 text-[#ef4444]" /> Code Size Analytics
            </h2>
            <div className="space-y-4">
              <div className="p-3 bg-[#0b0e14] border border-[#ef4444]/30 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-[#ef4444] uppercase flex items-center gap-1"><AlertTriangle size={12}/> Heavy Page Detected</span>
                  <span className="text-xs font-mono text-white">420 KB</span>
                </div>
                <div className="text-xs text-[#8b9bb4]">src/app/(app)/dashboard/page.tsx</div>
              </div>
              <MetricRow label="Total Codebase Size" value="4.2 MB" />
              <MetricRow label="Duplicate Code" value="2.4%" />
              <MetricRow label="Unused Components" value="3" highlight="text-[#f59e0b]" />
            </div>
          </div>

        </div>

        {/* ROW 3: Team Productivity (AI vs Human) */}
        <div className="rounded-2xl border border-[#1e2532] bg-[#111622] p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#a855f7]" /> Workforce Productivity Engine
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 bg-[#0b0e14] rounded-xl border border-[#1e2532] p-6 flex flex-col justify-center items-center">
              {/* Mock Ring Chart */}
              <div className="relative w-32 h-32 flex justify-center items-center mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-[#1e2532]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#a855f7" strokeWidth="4" strokeDasharray="75, 100" />
                </svg>
                <div className="absolute text-center">
                  <div className="text-2xl font-black text-white">75%</div>
                  <div className="text-[10px] text-[#8b9bb4] uppercase">AI Generated</div>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 grid grid-cols-2 gap-4">
               <ExecKpiCard title="AI Generated Code" value="75%" icon={<BrainCircuit color="#a855f7"/>} trend="Dominant" color="#a855f7" />
               <ExecKpiCard title="Human Written Code" value="15%" icon={<Users color="#3b82f6"/>} trend="Review Phase" color="#3b82f6" />
               <ExecKpiCard title="Hybrid Code" value="10%" icon={<Activity color="#10b981"/>} trend="Pair Programming" color="#10b981" />
               <ExecKpiCard title="Reused Code" value="42%" icon={<FileCode2 color="#f59e0b"/>} trend="High Efficiency" color="#f59e0b" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ExecKpiCard({ title, value, icon, trend, color }: any) {
  return (
    <div className="rounded-2xl border border-[#1e2532] bg-[#0b0e14] p-5 shadow-lg relative overflow-hidden group hover:border-[#3b82f6]/50 transition-colors">
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" 
        style={{ background: `linear-gradient(135deg, ${color}, transparent)` }}
      />
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-[#111622] border border-[#1e2532] flex items-center justify-center">
          {icon}
        </div>
        <span className="text-[10px] font-bold text-[#8b9bb4] uppercase tracking-wider px-2 py-1 bg-[#111622] rounded-lg border border-[#1e2532]">
          {trend}
        </span>
      </div>
      <div className="relative z-10">
        <h3 className="text-sm font-semibold text-[#8b9bb4] mb-1">{title}</h3>
        <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
      </div>
    </div>
  );
}

function MetricRow({ label, value, highlight = 'text-white' }: { label: string, value: string, highlight?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#1e2532]/50 last:border-0">
      <span className="text-sm text-[#8b9bb4]">{label}</span>
      <span className={`text-sm font-bold ${highlight}`}>{value}</span>
    </div>
  );
}
