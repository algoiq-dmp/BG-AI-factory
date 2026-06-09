'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Activity,
  Clock,
  Bot,
  BarChart3,
  Users,
  AlertTriangle,
  Sparkles,
  Shield,
  Code2,
  GitCommit,
  FileCode,
  Zap,
  Brain,
  Target,
  Coffee,
  LogIn,
  LogOut,
  Bug,
  Rocket,
  FileText,
  Send,
  Download,
  Share2,
  Plus,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  EyeOff,
  RotateCcw,
  Flag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer,
  Award,
  Crown,
  Mail,
} from 'lucide-react';
import {
  useWorkAnalyticsStore,
  type TimelineEntryType,
  type EscalationEntry,
} from '@/store/useWorkAnalyticsStore';

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const TABS = [
  { id: 'dev', label: 'Developer Activity', icon: Activity, emoji: '👨‍💻' },
  { id: 'timeline', label: 'Hourly Timeline', icon: Clock, emoji: '⏱' },
  { id: 'report', label: 'AI Daily Report', icon: Bot, emoji: '🤖' },
  { id: 'perf', label: 'Performance Review', icon: BarChart3, emoji: '📊' },
  { id: 'team', label: 'Team Intelligence', icon: Users, emoji: '👥' },
  { id: 'escalation', label: 'Escalation Center', icon: AlertTriangle, emoji: '⚠' },
  { id: 'predict', label: 'Predictive AI', icon: Sparkles, emoji: '🔮' },
  { id: 'privacy', label: 'Privacy Controls', icon: Shield, emoji: '🔐' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const TYPE_COLORS: Record<TimelineEntryType, string> = {
  login: '#10b981',
  code: '#3b82f6',
  ai: '#8b5cf6',
  review: '#f59e0b',
  deploy: '#ec4899',
  break: '#586c8f',
  logout: '#ef4444',
  'bug-fix': '#ef4444',
  docs: '#06b6d4',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#eab308',
  low: '#10b981',
};

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function generateHeatmap(): number[][] {
  const rows: number[][] = [];
  for (let d = 0; d < 7; d++) {
    const row: number[] = [];
    for (let h = 0; h < 12; h++) {
      row.push(Math.random());
    }
    rows.push(row);
  }
  return rows;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p'];
const WEEKLY_HOURS = [5.2, 6.8, 7.1, 5.9, 6.4, 2.1, 0];

function heatColor(v: number): string {
  if (v < 0.15) return '#111622';
  if (v < 0.35) return '#064e3b';
  if (v < 0.55) return '#047857';
  if (v < 0.75) return '#10b981';
  return '#34d399';
}

/* ================================================================== */
/*  Small reusable UI                                                  */
/* ================================================================== */

function Card({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-xl border border-[#1e2532] bg-[#111622] p-5 ${className}`} style={style}>
      {children}
    </div>
  );
}

function ProgressBar({
  value,
  color = '#6366f1',
  height = 8,
  className = '',
}: {
  value: number;
  color?: string;
  height?: number;
  className?: string;
}) {
  return (
    <div className={`w-full rounded-full bg-[#1e2532] ${className}`} style={{ height }}>
      <div
        className="rounded-full transition-all duration-700"
        style={{ width: `${Math.min(value, 100)}%`, height, backgroundColor: color }}
      />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${checked ? 'bg-indigo-500' : 'bg-[#1e2532]'}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

/* ================================================================== */
/*  PAGE COMPONENT                                                     */
/* ================================================================== */

export default function WorkAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('dev');
  const store = useWorkAnalyticsStore();

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      {/* Header */}
      <div className="border-b border-[#1e2532] bg-[#0b0e14]/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="mx-auto max-w-[1400px] px-6 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Work Analytics &amp; AI Governance
          </h1>
          <p className="text-sm text-[#586c8f] mt-1">Real-time developer intelligence · AI-powered insights · Privacy-first</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-[#1e2532] bg-[#0b0e14]/60 backdrop-blur sticky top-[73px] z-20 overflow-x-auto">
        <div className="mx-auto max-w-[1400px] px-6 flex gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  active
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-[#586c8f] hover:text-[#8b9bb4] hover:border-[#1e2532]'
                }`}
              >
                <Icon size={16} />
                <span className="hidden lg:inline">{t.label}</span>
                <span className="lg:hidden">{t.emoji}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        {activeTab === 'dev' && <DeveloperActivityTab />}
        {activeTab === 'timeline' && <HourlyTimelineTab />}
        {activeTab === 'report' && <AIDailyReportTab />}
        {activeTab === 'perf' && <PerformanceReviewTab />}
        {activeTab === 'team' && <TeamIntelligenceTab />}
        {activeTab === 'escalation' && <EscalationCenterTab />}
        {activeTab === 'predict' && <PredictiveAITab />}
        {activeTab === 'privacy' && <PrivacyControlsTab />}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB 1 — Developer Activity                                        */
/* ================================================================== */

function DeveloperActivityTab() {
  const m = useWorkAnalyticsStore((s) => s.developerMetrics);
  const heatmap = useMemo(() => generateHeatmap(), []);

  const metrics = [
    { label: 'Active Hours', value: `${m.activeCodingHours}h`, icon: Clock, color: '#10b981' },
    { label: 'Idle Time', value: `${m.idleTimeMinutes}m`, icon: Coffee, color: '#f59e0b' },
    { label: 'Files Modified', value: m.filesModified, icon: FileCode, color: '#3b82f6' },
    { label: 'Commits', value: m.commitsDone, icon: GitCommit, color: '#8b5cf6' },
    { label: 'Tasks Done', value: m.tasksCompleted, icon: Target, color: '#ec4899' },
    { label: 'AI Prompts', value: m.aiPromptsUsed, icon: Brain, color: '#06b6d4' },
    { label: 'AI Accept %', value: `${m.aiAcceptancePercent}%`, icon: Zap, color: '#10b981' },
    { label: 'Manual Override', value: `${m.manualOverridePercent}%`, icon: Code2, color: '#f59e0b' },
    { label: 'Productivity', value: `${m.productivityScore}/100`, icon: Activity, color: '#6366f1' },
  ];

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold">
            {m.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{m.name}</h2>
            <p className="text-sm text-[#8b9bb4]">Logged in at {m.loginTime}</p>
          </div>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-1.5 text-sm font-medium text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Online
        </span>
      </Card>

      {/* 3×3 metric grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((mt) => {
          const Icon = mt.icon;
          return (
            <Card key={mt.label} className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${mt.color}20` }}>
                <Icon size={20} style={{ color: mt.color }} />
              </div>
              <div>
                <p className="text-xs text-[#586c8f] uppercase tracking-wider">{mt.label}</p>
                <p className="text-lg font-bold" style={{ color: mt.color }}>{mt.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Heatmap */}
      <Card>
        <h3 className="text-sm font-semibold text-[#8b9bb4] uppercase tracking-wider mb-4">Daily Activity Heatmap (7 days × 12 hours)</h3>
        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* Hour labels */}
            <div className="flex gap-1 ml-12 mb-1">
              {HOURS.map((h) => (
                <span key={h} className="w-8 text-center text-[10px] text-[#586c8f]">{h}</span>
              ))}
            </div>
            {heatmap.map((row, di) => (
              <div key={di} className="flex items-center gap-1 mb-1">
                <span className="w-10 text-xs text-[#586c8f] text-right pr-2">{WEEKDAYS[di]}</span>
                {row.map((v, hi) => (
                  <div
                    key={hi}
                    className="w-8 h-8 rounded-sm transition-colors"
                    style={{ backgroundColor: heatColor(v) }}
                    title={`${WEEKDAYS[di]} ${HOURS[hi]}: ${Math.round(v * 100)}%`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Weekly trend bar chart */}
      <Card>
        <h3 className="text-sm font-semibold text-[#8b9bb4] uppercase tracking-wider mb-4">Weekly Trend — Coding Hours per Day</h3>
        <div className="flex items-end gap-3 h-40">
          {WEEKLY_HOURS.map((h, i) => {
            const pct = (h / 8) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-[#8b9bb4] font-medium">{h}h</span>
                <div className="w-full rounded-t-md bg-[#1e2532] relative" style={{ height: '120px' }}>
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all"
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-[#586c8f]">{WEEKDAYS[i]}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ================================================================== */
/*  TAB 2 — Hourly Timeline                                            */
/* ================================================================== */

function HourlyTimelineTab() {
  const timeline = useWorkAnalyticsStore((s) => s.timeline);
  const [filter, setFilter] = useState<'all' | 'code' | 'ai' | 'review' | 'deploy'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return timeline;
    return timeline.filter((e) => e.type === filter);
  }, [timeline, filter]);

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'code', label: 'Code' },
    { key: 'ai', label: 'AI' },
    { key: 'review', label: 'Review' },
    { key: 'deploy', label: 'Deploy' },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                : 'bg-[#111622] text-[#586c8f] border border-[#1e2532] hover:text-[#8b9bb4]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <Card>
        <div className="relative">
          {filtered.map((entry, idx) => {
            const color = TYPE_COLORS[entry.type];
            const isLast = idx === filtered.length - 1;
            return (
              <div key={entry.id} className="flex gap-4">
                {/* Time col */}
                <div className="w-14 shrink-0 text-right">
                  <span className="text-sm font-mono text-[#8b9bb4]">{entry.time}</span>
                </div>

                {/* Dot & line */}
                <div className="flex flex-col items-center">
                  <div className="h-3.5 w-3.5 rounded-full border-2 shrink-0 z-10" style={{ borderColor: color, backgroundColor: `${color}40` }} />
                  {!isLast && <div className="w-0.5 flex-1 min-h-[40px]" style={{ backgroundColor: `${color}30` }} />}
                </div>

                {/* Content */}
                <div className={`pb-6 flex-1 ${isLast ? '' : ''}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">{entry.activity}</span>
                    {entry.aiAssisted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-semibold text-purple-400 uppercase tracking-wider">
                        <Bot size={10} /> AI
                      </span>
                    )}
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      {entry.type}
                    </span>
                  </div>
                  {entry.duration && entry.duration !== '-' && (
                    <p className="text-xs text-[#586c8f] mt-1 flex items-center gap-1">
                      <Timer size={10} /> {entry.duration}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ================================================================== */
/*  TAB 3 — AI Daily Report                                            */
/* ================================================================== */

function AIDailyReportTab() {
  const {
    dailyReport,
    reportGenerating,
    reportProgress,
    generateDailyReport,
  } = useWorkAnalyticsStore();

  return (
    <div className="space-y-6">
      {/* Generate button */}
      {!dailyReport && !reportGenerating && (
        <button
          onClick={generateDailyReport}
          className="w-full rounded-xl border border-dashed border-indigo-500/40 bg-indigo-500/5 py-12 text-center hover:bg-indigo-500/10 transition-all group"
        >
          <Bot size={40} className="mx-auto text-indigo-400 group-hover:scale-110 transition-transform" />
          <p className="mt-3 text-lg font-semibold text-indigo-400">Generate Today&apos;s Report</p>
          <p className="text-sm text-[#586c8f] mt-1">AI will analyze your full workday activity</p>
        </button>
      )}

      {/* Progress bar */}
      {reportGenerating && (
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <Bot size={20} className="text-indigo-400 animate-spin" />
            <span className="text-sm font-medium text-[#8b9bb4]">Generating AI report… {reportProgress}%</span>
          </div>
          <ProgressBar value={reportProgress} color="#6366f1" />
        </Card>
      )}

      {/* Report */}
      {dailyReport && (
        <div className="space-y-5">
          {/* Header */}
          <Card className="border-indigo-500/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold">{dailyReport.developerName}</h2>
                <p className="text-sm text-[#8b9bb4]">{dailyReport.project}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#8b9bb4]">{dailyReport.date}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 mt-1">
                  <TrendingUp size={12} /> +{dailyReport.qualityChange}% improvement
                </span>
              </div>
            </div>
          </Card>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Productive Time', value: dailyReport.productiveTime, color: '#10b981' },
              { label: 'AI Tasks', value: dailyReport.aiTasks, color: '#8b5cf6' },
              { label: 'Manual Tasks', value: dailyReport.manualTasks, color: '#3b82f6' },
              { label: 'Bugs Fixed', value: dailyReport.bugsFixed, color: '#ec4899' },
            ].map((s) => (
              <Card key={s.label}>
                <p className="text-xs text-[#586c8f] uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
              </Card>
            ))}
          </div>

          {/* Pending risks */}
          <Card>
            <h3 className="text-sm font-semibold text-[#8b9bb4] uppercase tracking-wider mb-3">Pending Risk Areas</h3>
            <ul className="space-y-2">
              {dailyReport.pendingRisks.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-400">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </Card>

          {/* AI Summary */}
          <Card className="border-purple-500/20">
            <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Brain size={14} /> AI Summary
            </h3>
            <p className="text-sm text-[#8b9bb4] leading-relaxed">{dailyReport.aiSummary}</p>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Export PDF', icon: Download, color: 'indigo' },
              { label: 'Send Email', icon: Mail, color: 'emerald' },
              { label: 'Share', icon: Share2, color: 'purple' },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.label}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all
                    ${a.color === 'indigo' ? 'border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10' : ''}
                    ${a.color === 'emerald' ? 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10' : ''}
                    ${a.color === 'purple' ? 'border-purple-500/40 text-purple-400 hover:bg-purple-500/10' : ''}
                  `}
                >
                  <Icon size={16} />
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  TAB 4 — Performance Review                                        */
/* ================================================================== */

function PerformanceReviewTab() {
  const p = useWorkAnalyticsStore((s) => s.performanceScores);

  const cards = [
    { label: 'Productivity', score: p.productivity, color: '#10b981', delta: '+3%', trend: 'up' as const },
    { label: 'Code Stability', score: p.codeStability, color: '#3b82f6', delta: '+1%', trend: 'up' as const },
    { label: 'AI Usage Efficiency', score: p.aiUsageEfficiency, color: '#f59e0b', delta: '-2%', trend: 'down' as const, note: 'Needs improvement' },
    { label: 'Documentation Discipline', score: p.documentationDiscipline, color: '#8b5cf6', delta: '+5%', trend: 'up' as const },
    { label: 'Delivery Speed', score: p.deliverySpeed, color: '#06b6d4', delta: '+2%', trend: 'up' as const },
    { label: 'Bug Rate', score: p.bugRate, color: '#10b981', delta: '+1%', trend: 'up' as const, note: 'High = fewer bugs' },
  ];

  const overall = Math.round(
    (p.productivity * 0.25 + p.codeStability * 0.2 + p.aiUsageEfficiency * 0.15 + p.documentationDiscipline * 0.1 + p.deliverySpeed * 0.15 + p.bugRate * 0.15)
  );

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'same' }) => {
    if (trend === 'up') return <TrendingUp size={14} className="text-emerald-400" />;
    if (trend === 'down') return <TrendingDown size={14} className="text-red-400" />;
    return <Minus size={14} className="text-[#586c8f]" />;
  };

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-[#8b9bb4]">{c.label}</p>
              <div className="flex items-center gap-1">
                <TrendIcon trend={c.trend} />
                <span className={`text-xs font-semibold ${c.trend === 'up' ? 'text-emerald-400' : c.trend === 'down' ? 'text-red-400' : 'text-[#586c8f]'}`}>
                  {c.delta}
                </span>
              </div>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold" style={{ color: c.color }}>{c.score}%</span>
              {c.note && <span className="text-[10px] text-[#586c8f] uppercase tracking-wider mb-1">{c.note}</span>}
            </div>
            <ProgressBar value={c.score} color={c.color} />
            <p className="text-[10px] text-[#586c8f] mt-2">This week vs last week: {c.delta}</p>
          </Card>
        ))}
      </div>

      {/* Overall score */}
      <Card className="text-center border-indigo-500/20">
        <p className="text-sm font-semibold text-[#8b9bb4] uppercase tracking-wider mb-2">Overall Performance Score</p>
        <div className="relative inline-flex items-center justify-center">
          <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
            <circle cx="80" cy="80" r="70" stroke="#1e2532" strokeWidth="10" fill="none" />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#6366f1"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - overall / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-indigo-400">{overall}</span>
            <span className="text-xs text-[#586c8f]">/ 100</span>
          </div>
        </div>
        <p className="text-sm text-[#8b9bb4] mt-2">Weighted average across all metrics</p>
      </Card>
    </div>
  );
}

/* ================================================================== */
/*  TAB 5 — Team Intelligence                                         */
/* ================================================================== */

function TeamIntelligenceTab() {
  const team = useWorkAnalyticsStore((s) => s.teamMembers);

  const mostProductive = [...team].sort((a, b) => b.productivity - a.productivity)[0];
  const bestAI = [...team].sort((a, b) => b.aiEfficiency - a.aiEfficiency)[0];
  const bugHero = [...team].sort((a, b) => (b.bugsFixed - b.bugsCreated) - (a.bugsFixed - a.bugsCreated))[0];

  const statusColor = (s: string) => (s === 'online' ? '#10b981' : s === 'away' ? '#f59e0b' : '#586c8f');

  return (
    <div className="space-y-6">
      {/* Member cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {team.map((m) => (
          <Card key={m.id}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold shrink-0">
                {m.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">{m.name}</p>
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: statusColor(m.status) }} />
                </div>
                <p className="text-xs text-[#586c8f]">{m.role}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#586c8f]">Productivity</span>
                  <span className="text-[#8b9bb4] font-medium">{m.productivity}%</span>
                </div>
                <ProgressBar value={m.productivity} color="#10b981" height={6} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#586c8f]">AI Efficiency</span>
                  <span className="text-[#8b9bb4] font-medium">{m.aiEfficiency}%</span>
                </div>
                <ProgressBar value={m.aiEfficiency} color="#8b5cf6" height={6} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#586c8f]">Bug ratio: <span className="text-red-400">{m.bugsCreated} created</span> / <span className="text-emerald-400">{m.bugsFixed} fixed</span></span>
                <span className="text-[#8b9bb4] font-medium">{m.tasksCompleted} tasks ✓</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Most Productive', member: mostProductive, icon: Crown, color: '#f59e0b', stat: `${mostProductive.productivity}%` },
          { label: 'Best AI Efficiency', member: bestAI, icon: Brain, color: '#8b5cf6', stat: `${bestAI.aiEfficiency}%` },
          { label: 'Bug Hero', member: bugHero, icon: Bug, color: '#10b981', stat: `${bugHero.bugsFixed} fixed` },
        ].map((r) => {
          const Icon = r.icon;
          return (
            <Card key={r.label} className="text-center">
              <Icon size={28} className="mx-auto mb-2" style={{ color: r.color }} />
              <p className="text-xs text-[#586c8f] uppercase tracking-wider">{r.label}</p>
              <p className="text-lg font-bold mt-1">{r.member.name}</p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: r.color }}>{r.stat}</p>
            </Card>
          );
        })}
      </div>

      {/* Bottleneck Detection */}
      <Card>
        <h3 className="text-sm font-semibold text-[#8b9bb4] uppercase tracking-wider mb-4">Bottleneck Detection</h3>
        <div className="space-y-3">
          {[
            { text: 'Backend API team at 94% capacity', severity: 'high' },
            { text: 'Frontend blocked by design approval', severity: 'medium' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-[#0b0e14] p-3 border border-[#1e2532]">
              <AlertCircle size={16} style={{ color: b.severity === 'high' ? '#ef4444' : '#f59e0b' }} />
              <span className="text-sm text-[#8b9bb4]">{b.text}</span>
              <span
                className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                style={{
                  backgroundColor: b.severity === 'high' ? '#ef444420' : '#f59e0b20',
                  color: b.severity === 'high' ? '#ef4444' : '#f59e0b',
                }}
              >
                {b.severity}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Delivery confidence */}
      <Card className="text-center">
        <p className="text-sm font-semibold text-[#8b9bb4] uppercase tracking-wider mb-3">Delivery Confidence</p>
        <div className="relative inline-flex items-center justify-center">
          <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
            <circle cx="60" cy="60" r="50" stroke="#1e2532" strokeWidth="8" fill="none" />
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="#06b6d4"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - 0.78)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-cyan-400">78%</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ================================================================== */
/*  TAB 6 — Escalation Center                                         */
/* ================================================================== */

function EscalationCenterTab() {
  const { escalations, createEscalation } = useWorkAnalyticsStore();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<EscalationEntry['type']>('delay');
  const [formSubject, setFormSubject] = useState('');
  const [formDev, setFormDev] = useState('');
  const [generated, setGenerated] = useState(false);

  const handleGenerate = useCallback(() => {
    setGenerated(true);
  }, []);

  const handleSend = useCallback(() => {
    createEscalation(formType, formSubject || 'Untitled Escalation', formDev || 'Unassigned');
    setShowForm(false);
    setGenerated(false);
    setFormSubject('');
    setFormDev('');
  }, [createEscalation, formType, formSubject, formDev]);

  const statusBadge = (s: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      open: { bg: '#ef444420', text: '#ef4444' },
      'in-progress': { bg: '#f59e0b20', text: '#f59e0b' },
      resolved: { bg: '#10b98120', text: '#10b981' },
    };
    const c = map[s] || map.open;
    return (
      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ backgroundColor: c.bg, color: c.text }}>
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* New escalation button */}
      <button
        onClick={() => { setShowForm(!showForm); setGenerated(false); }}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        <Plus size={16} /> New Escalation
      </button>

      {/* Form */}
      {showForm && (
        <Card className="border-orange-500/20 space-y-4">
          <h3 className="font-semibold text-sm text-orange-400 uppercase tracking-wider">Create Escalation</h3>

          <div>
            <label className="text-xs text-[#586c8f] block mb-1">Type</label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as EscalationEntry['type'])}
              className="w-full rounded-lg bg-[#0b0e14] border border-[#1e2532] px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="delay">Delay</option>
              <option value="quality">Quality</option>
              <option value="conflict">Conflict</option>
              <option value="resource">Resource</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-[#586c8f] block mb-1">Subject</label>
            <input
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              placeholder="Brief description of the issue"
              className="w-full rounded-lg bg-[#0b0e14] border border-[#1e2532] px-3 py-2 text-sm text-white placeholder:text-[#586c8f] focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-[#586c8f] block mb-1">Developer</label>
            <input
              value={formDev}
              onChange={(e) => setFormDev(e.target.value)}
              placeholder="Developer name"
              className="w-full rounded-lg bg-[#0b0e14] border border-[#1e2532] px-3 py-2 text-sm text-white placeholder:text-[#586c8f] focus:outline-none focus:border-indigo-500"
            />
          </div>

          {!generated && (
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <Sparkles size={14} /> AI Analyze &amp; Generate
            </button>
          )}

          {/* Generated content */}
          {generated && (
            <div className="space-y-4 pt-2 border-t border-[#1e2532]">
              {/* AI Analysis */}
              <div className="rounded-lg bg-purple-500/5 border border-purple-500/20 p-4">
                <h4 className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1"><Brain size={12} /> AI Analysis</h4>
                <p className="text-sm text-[#8b9bb4] leading-relaxed">
                  AI analysis indicates the issue stems from resource allocation gaps in the current sprint. Historical data shows similar patterns in Q1 that were resolved with additional staffing.
                </p>
              </div>

              {/* Suggested actions */}
              <div>
                <h4 className="text-xs text-[#8b9bb4] font-semibold uppercase tracking-wider mb-2">Suggested Actions</h4>
                <ul className="space-y-2">
                  {['Reassign 2 tasks from the overloaded developer', 'Schedule a 1:1 with the team lead', 'Consider bringing in a contractor for the sprint'].map((a, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#8b9bb4]">
                      <ChevronRight size={12} className="text-indigo-400 shrink-0" /> {a}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Email draft */}
              <div className="rounded-lg bg-[#0b0e14] border border-[#1e2532] p-4">
                <h4 className="text-xs text-[#8b9bb4] font-semibold uppercase tracking-wider mb-3 flex items-center gap-1"><Mail size={12} /> Email Draft</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-[#586c8f]">Subject: <span className="text-white">[Escalation] {formSubject || 'Issue'} — {formType}</span></p>
                  <p className="text-[#586c8f]">To: <span className="text-white">manager@company.com</span></p>
                  <div className="mt-2 border-t border-[#1e2532] pt-2">
                    <p className="text-[#8b9bb4] whitespace-pre-line leading-relaxed">
                      {`Hi Manager,\n\nThis is to escalate the following issue regarding ${formDev || 'the team'}:\n\n${formSubject || 'No subject provided'}\n\nType: ${formType}\n\nAI has analyzed the situation and recommends immediate attention.\n\nBest regards,\nWork Analytics AI`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSend}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Send size={14} /> Send Escalation
                </button>
                <button
                  onClick={() => setGenerated(false)}
                  className="flex items-center gap-2 rounded-lg border border-[#1e2532] px-4 py-2 text-sm text-[#8b9bb4] hover:text-white transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Escalation history */}
      <Card>
        <h3 className="text-sm font-semibold text-[#8b9bb4] uppercase tracking-wider mb-4">Escalation History</h3>
        <div className="space-y-3">
          {escalations.map((esc) => (
            <div key={esc.id} className="flex items-center gap-4 rounded-lg bg-[#0b0e14] p-4 border border-[#1e2532]">
              <AlertTriangle size={16} className="text-orange-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{esc.subject}</p>
                <p className="text-xs text-[#586c8f]">{esc.developer} · {esc.createdAt}</p>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase bg-[#1e2532] text-[#8b9bb4]">{esc.type}</span>
              {statusBadge(esc.status)}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ================================================================== */
/*  TAB 7 — Predictive AI                                             */
/* ================================================================== */

function PredictiveAITab() {
  const alerts = useWorkAnalyticsStore((s) => s.predictiveAlerts);

  return (
    <div className="space-y-6">
      {/* Risk cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {alerts.map((a) => {
          const color = SEVERITY_COLORS[a.severity];
          return (
            <Card key={a.id} className="border-l-4" style={{ borderLeftColor: color }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">{a.title}</h3>
                  {a.module && <p className="text-xs text-[#586c8f] mt-0.5">Module: {a.module}</p>}
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {a.severity}
                </span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#586c8f]">Probability</span>
                  <span style={{ color }} className="font-medium">{a.probability}%</span>
                </div>
                <ProgressBar value={a.probability} color={color} height={6} />
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-[#0b0e14] p-3 border border-[#1e2532]">
                <Sparkles size={12} className="text-indigo-400 mt-0.5 shrink-0" />
                <p className="text-xs text-[#8b9bb4] leading-relaxed">{a.recommendation}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Project Timeline Prediction */}
      <Card className="border-indigo-500/20">
        <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Rocket size={14} /> Project Timeline Prediction
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#8b9bb4]">Estimated completion</p>
            <p className="text-lg font-bold text-white">June 28, 2026</p>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#586c8f]">Confidence</span>
              <span className="text-indigo-400 font-medium">78%</span>
            </div>
            <ProgressBar value={78} color="#6366f1" height={6} />
          </div>
          <div>
            <p className="text-xs text-[#586c8f] uppercase tracking-wider mb-2">Risk Factors</p>
            <ul className="space-y-1.5">
              {['API integration complexity higher than estimated', 'Pending design approval could delay frontend work', 'Test coverage below threshold for release'].map((r, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[#8b9bb4]">
                  <AlertCircle size={12} className="text-amber-400 shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Sprint Delay Forecast */}
      <Card className="border-cyan-500/20">
        <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Timer size={14} /> Sprint Delay Forecast
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#8b9bb4]">Current Sprint</p>
            <p className="text-sm font-bold text-white">Sprint 3 — AI Integration</p>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#586c8f]">On-track probability</span>
              <span className="text-cyan-400 font-medium">65%</span>
            </div>
            <ProgressBar value={65} color="#06b6d4" height={6} />
          </div>
          <div>
            <p className="text-xs text-[#586c8f] uppercase tracking-wider mb-2">Delay Factors</p>
            <ul className="space-y-1.5">
              {['AI model training pipeline taking longer than expected', 'Integration testing requires additional QA resources'].map((r, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[#8b9bb4]">
                  <AlertTriangle size={12} className="text-red-400 shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ================================================================== */
/*  TAB 8 — Privacy Controls                                           */
/* ================================================================== */

function PrivacyControlsTab() {
  const { privacySettings, updatePrivacySetting } = useWorkAnalyticsStore();
  const [disputeToggle, setDisputeToggle] = useState(true);

  const auditLogs = [
    { date: '2026-06-02 09:12', action: 'Activity tracking started', user: 'System' },
    { date: '2026-06-01 17:30', action: 'Daily report generated and shared', user: 'AI System' },
    { date: '2026-05-31 14:05', action: 'Privacy settings updated', user: 'Darshan Patel' },
    { date: '2026-05-30 10:00', action: 'Manager accessed activity data', user: 'Rahul Singh (Manager)' },
    { date: '2026-05-29 09:15', action: 'Consent renewed for 90 days', user: 'Darshan Patel' },
  ];

  return (
    <div className="space-y-6">
      {/* Tracking toggles */}
      <Card>
        <h3 className="text-sm font-semibold text-[#8b9bb4] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Eye size={14} /> Tracking Preferences
        </h3>
        <div className="space-y-4">
          {[
            { key: 'trackActivity' as const, label: 'Track Activity', desc: 'Monitor coding hours, commits, and task completion', icon: Activity },
            { key: 'shareWithManagers' as const, label: 'Share with Managers', desc: 'Allow managers to view your activity dashboard', icon: Users },
            { key: 'allowAIReports' as const, label: 'Allow AI Reports', desc: 'Enable AI-generated daily performance reports', icon: Bot },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-center justify-between rounded-lg bg-[#0b0e14] p-4 border border-[#1e2532]">
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-[#586c8f]" />
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-[#586c8f]">{item.desc}</p>
                  </div>
                </div>
                <Toggle
                  checked={privacySettings[item.key] as boolean}
                  onChange={(v) => updatePrivacySetting(item.key, v)}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Data Retention */}
      <Card>
        <h3 className="text-sm font-semibold text-[#8b9bb4] uppercase tracking-wider mb-4">Data Retention</h3>
        <select
          value={privacySettings.dataRetentionDays}
          onChange={(e) => updatePrivacySetting('dataRetentionDays', Number(e.target.value))}
          className="w-full max-w-xs rounded-lg bg-[#0b0e14] border border-[#1e2532] px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
        >
          <option value={30}>30 days</option>
          <option value={60}>60 days</option>
          <option value={90}>90 days</option>
          <option value={180}>180 days</option>
        </select>
        <p className="text-xs text-[#586c8f] mt-2">Activity data older than this period will be automatically deleted</p>
      </Card>

      {/* Consent Management */}
      <Card>
        <h3 className="text-sm font-semibold text-[#8b9bb4] uppercase tracking-wider mb-4">Consent Management</h3>
        <div className="flex items-center justify-between rounded-lg bg-[#0b0e14] p-4 border border-[#1e2532]">
          <div>
            <p className="text-sm text-[#8b9bb4]">Last consent given</p>
            <p className="text-lg font-semibold text-white mt-0.5">{privacySettings.lastConsentDate}</p>
          </div>
          <button
            onClick={() => updatePrivacySetting('lastConsentDate', new Date().toISOString().split('T')[0])}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <RotateCcw size={14} /> Renew Consent
          </button>
        </div>
      </Card>

      {/* Audit History */}
      <Card>
        <h3 className="text-sm font-semibold text-[#8b9bb4] uppercase tracking-wider mb-4">Audit History</h3>
        <div className="space-y-2">
          {auditLogs.map((log, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-[#0b0e14] p-3 border border-[#1e2532]">
              <div className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{log.action}</p>
                <p className="text-xs text-[#586c8f]">{log.user}</p>
              </div>
              <span className="text-xs text-[#586c8f] shrink-0 font-mono">{log.date}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Dispute Mechanism */}
      <Card className="border-amber-500/20">
        <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Flag size={14} /> Dispute Mechanism
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-[#0b0e14] p-4 border border-[#1e2532]">
            <div>
              <p className="text-sm font-medium">Employees can edit AI-generated reports</p>
              <p className="text-xs text-[#586c8f]">Allow corrections before manager review</p>
            </div>
            <Toggle checked={disputeToggle} onChange={setDisputeToggle} />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-amber-500/40 px-4 py-2.5 text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-colors">
            <Flag size={14} /> Flag Inaccurate Data
          </button>
          <p className="text-xs text-[#586c8f]">
            Flagging will notify your manager and the AI governance team. All disputes are reviewed within 48 hours.
          </p>
        </div>
      </Card>
    </div>
  );
}
