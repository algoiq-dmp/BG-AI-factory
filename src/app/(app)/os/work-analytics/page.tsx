'use client';

import { useWorkAnalyticsStore } from '@/store/useWorkAnalyticsStore';
import { 
  BarChart3, Activity, Clock, Zap, GitBranch,
  FileCode, BrainCircuit, Bug, Users, Calendar,
  TrendingUp, AlertTriangle, ChevronRight, CheckCircle2
} from 'lucide-react';
import { useOsStore } from '@/store/useOsStore';

export default function WorkAnalyticsPage() {
  const { mode } = useOsStore();
  const {
    developerMetrics,
    timeline,
    performanceScores,
    dailyReport,
    generateDailyReport,
    reportGenerating,
    reportProgress
  } = useWorkAnalyticsStore();

  if (mode === 'STARTUP') {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#0b0e14] text-[#8b9bb4]">
        <div className="w-16 h-16 rounded-2xl bg-[#a855f7]/10 flex items-center justify-center mb-6">
          <Zap className="w-8 h-8 text-[#a855f7]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Enterprise Analytics Hidden</h2>
        <p className="text-sm max-w-md text-center">
          You are currently in Startup mode. Switch to Enterprise mode using the top-right toggle to access deep work analytics and productivity metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-[#0b0e14] text-[#8b9bb4] animate-in fade-in slide-in-from-bottom-4 duration-500 custom-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-[#1e2532] bg-[#0b0e14]/95 backdrop-blur-md px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-[#06b6d4]" />
              Work Analytics
            </h1>
            <p className="text-sm mt-1 text-[#8b9bb4]">
              Deep telemetry into developer productivity, AI utilization, and code stability.
            </p>
          </div>
          <button 
            onClick={generateDailyReport}
            disabled={reportGenerating}
            className="px-4 py-2 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50"
          >
            {reportGenerating ? `Generating (${reportProgress}%)...` : 'Generate Daily Report'}
          </button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-8">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <KpiCard
            title="Productivity Score"
            value={developerMetrics.productivityScore}
            suffix="/100"
            icon={<TrendingUp className="w-5 h-5 text-[#10b981]" />}
            trend="+5% this week"
            color="#10b981"
          />
          <KpiCard
            title="Active Coding Hours"
            value={developerMetrics.activeCodingHours}
            suffix="h"
            icon={<Clock className="w-5 h-5 text-[#3b82f6]" />}
            trend="Avg 6.2h/day"
            color="#3b82f6"
          />
          <KpiCard
            title="AI Acceptance Rate"
            value={developerMetrics.aiAcceptancePercent}
            suffix="%"
            icon={<BrainCircuit className="w-5 h-5 text-[#a855f7]" />}
            trend={`${developerMetrics.aiPromptsUsed} Prompts Used`}
            color="#a855f7"
          />
          <KpiCard
            title="Tasks Completed"
            value={developerMetrics.tasksCompleted}
            icon={<CheckCircle2 className="w-5 h-5 text-[#f59e0b]" />}
            trend={`${developerMetrics.commitsDone} Commits`}
            color="#f59e0b"
          />
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column: Timeline */}
          <div className="xl:col-span-2 space-y-6">
            <div className="rounded-2xl border border-[#1e2532] bg-[#111622] p-6 shadow-xl relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#06b6d4]/10 blur-3xl rounded-full pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-5 h-5 text-[#06b6d4]" />
                <h2 className="text-lg font-bold text-white">Daily Timeline Engine</h2>
              </div>
              
              <div className="space-y-0 relative">
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-[#1e2532] z-0" />
                {timeline.map((event, i) => {
                  const isAi = event.aiAssisted;
                  return (
                    <div key={event.id} className="relative z-10 flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#111622] flex-shrink-0
                        ${isAi ? 'bg-[#a855f7]' : 'bg-[#3b82f6]'}
                      `}>
                        {isAi ? <BrainCircuit className="w-3.5 h-3.5 text-white" /> : <FileCode className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-white group-hover:text-[#06b6d4] transition-colors">{event.activity}</span>
                          <span className="text-xs font-mono text-[#586c8f]">{event.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#586c8f]">
                          <span className="uppercase tracking-wider font-extrabold text-[10px] bg-[#1e2532] px-2 py-0.5 rounded text-[#8b9bb4]">
                            {event.type}
                          </span>
                          {event.duration && <span>Duration: {event.duration}</span>}
                          {isAi && <span className="text-[#a855f7] font-semibold flex items-center gap-1"><Zap className="w-3 h-3" /> AI Assisted</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Performance Scores & Reports */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#1e2532] bg-[#111622] p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-5 h-5 text-[#10b981]" />
                <h2 className="text-lg font-bold text-white">Performance Matrix</h2>
              </div>
              <div className="space-y-4">
                <ScoreBar label="Code Stability" score={performanceScores.codeStability} color="#10b981" />
                <ScoreBar label="AI Efficiency" score={performanceScores.aiUsageEfficiency} color="#a855f7" />
                <ScoreBar label="Delivery Speed" score={performanceScores.deliverySpeed} color="#3b82f6" />
                <ScoreBar label="Docs Discipline" score={performanceScores.documentationDiscipline} color="#f59e0b" />
                <ScoreBar label="Low Bug Rate" score={performanceScores.bugRate} color="#06b6d4" />
              </div>
            </div>

            {dailyReport && (
              <div className="rounded-2xl border border-[#10b981]/30 bg-[#10b981]/5 p-6 shadow-xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <FileCode className="w-5 h-5 text-[#10b981]" />
                  <h2 className="text-lg font-bold text-white">Latest Daily Report</h2>
                </div>
                <p className="text-sm text-[#c9d1d9] leading-relaxed mb-4">
                  {dailyReport.summary}
                </p>
                <div className="bg-[#0b0e14]/50 rounded-lg p-3 border border-[#1e2532]">
                  <div className="text-xs font-semibold text-[#8b9bb4] mb-2 uppercase tracking-wider">Work Breakdown</div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="text-lg font-bold text-[#a855f7]">{dailyReport.aiTasks}</div>
                      <div className="text-[10px] text-[#586c8f] uppercase">AI Tasks</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-bold text-[#3b82f6]">{dailyReport.manualTasks}</div>
                      <div className="text-[10px] text-[#586c8f] uppercase">Manual Tasks</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-bold text-[#10b981]">{dailyReport.bugsFixed}</div>
                      <div className="text-[10px] text-[#586c8f] uppercase">Bugs Fixed</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, suffix = '', icon, trend, color }: any) {
  return (
    <div className="rounded-2xl border border-[#1e2532] bg-[#111622] p-5 shadow-lg relative overflow-hidden group">
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" 
        style={{ background: `linear-gradient(135deg, ${color}, transparent)` }}
      />
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-[#0b0e14] border border-[#1e2532] flex items-center justify-center">
          {icon}
        </div>
        <span className="text-xs font-semibold text-[#586c8f] px-2 py-1 bg-[#0b0e14] rounded-lg border border-[#1e2532]">
          {trend}
        </span>
      </div>
      <div className="relative z-10">
        <h3 className="text-sm font-semibold text-[#8b9bb4] mb-1">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
          <span className="text-sm font-bold text-[#586c8f]">{suffix}</span>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, color }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-semibold text-[#8b9bb4]">{label}</span>
        <span className="text-xs font-bold text-white">{score}%</span>
      </div>
      <div className="h-1.5 w-full bg-[#1e2532] rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function Target(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
