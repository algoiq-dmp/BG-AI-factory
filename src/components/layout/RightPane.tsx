'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOsStore } from '@/store/useOsStore';
import { useProjectStore } from '@/store/useProjectStore';
import {
  Activity, Zap, ShieldCheck, Brain, GitBranch,
  FileText, Clock, ChevronDown, ChevronRight, User,
  Timer, AlertTriangle as AlertTri, MessageCircle, Flag,
  BarChart3, TrendingUp, PanelRightClose, PanelRightOpen,
  Target, Cpu, Briefcase, Eye, Lock, Bug, Calendar, DollarSign,
  TrendingDown, CheckCircle2, Crosshair, Users, Sparkles
} from 'lucide-react';

/* ─── Mock Data for AI CEO Dashboard ─────────────────────────── */

// Base mock data for AI CEO Dashboard (will be overridden by real project data)
const PROJECT_INFO = {
  name: 'No Active Project',
  type: 'AI Generation Platform',
  healthScore: 91,
  deliveryConfidence: 94,
  lastReview: '2 mins ago',
  status: 'IDLE' as const,
};

const EXECUTIVE_SUMMARY = `Project progressing normally. Frontend completion is ahead of schedule. Testing coverage requires improvement. No critical security issues detected. Estimated delivery: 3 days earlier than planned.`;

const HEALTH_BREAKDOWN = [
  { label: 'Code Quality', weight: '20%', value: 94, color: '#10b981' },
  { label: 'Task Completion', weight: '20%', value: 88, color: '#10b981' },
  { label: 'Test Coverage', weight: '15%', value: 62, color: '#f59e0b' },
  { label: 'Security', weight: '15%', value: 96, color: '#3b82f6' },
  { label: 'Performance', weight: '10%', value: 90, color: '#10b981' },
  { label: 'Documentation', weight: '10%', value: 78, color: '#a855f7' },
  { label: 'Team Productivity', weight: '10%', value: 85, color: '#10b981' },
];

const DELIVERY_PREDICTION = {
  currentProgress: 68,
  expectedCompletion: 'June 15',
  onTimeProb: 94,
  delayProb: 6,
};

const RISK_CENTER = {
  critical: 0,
  medium: 2,
  low: 5,
  technical: ['Large components in layout module', 'Duplicate code in API routes'],
  business: ['Missing edge case workflows in MCQ'],
  team: ['Slow progress on Testing AI', 'Unassigned QA tasks'],
};

const CTO_ADVICE = [
  { id: 1, text: 'Split Dashboard.tsx', impact: 'High', effort: 'Low', priority: 'High' },
  { id: 2, text: 'Add API validation layer', impact: 'High', effort: 'Medium', priority: 'High' },
  { id: 3, text: 'Increase testing coverage', impact: 'Medium', effort: 'High', priority: 'Medium' },
  { id: 4, text: 'Optimize database queries', impact: 'Medium', effort: 'Low', priority: 'Low' },
];

const QUALITY_CENTER = [
  { label: 'Code Quality', grade: 'A', color: '#10b981' },
  { label: 'Maintainability', grade: 'A-', color: '#10b981' },
  { label: 'Scalability', grade: 'B+', color: '#3b82f6' },
  { label: 'Documentation', grade: 'B', color: '#f59e0b' },
  { label: 'Security', grade: 'A+', color: '#8b5cf6' },
  { label: 'Accessibility', grade: 'C+', color: '#ef4444' },
  { label: 'Performance', grade: 'A', color: '#10b981' },
];

const PRODUCT_MANAGER_VIEW = {
  completed: 42,
  pending: 15,
  blocked: 2,
  unused: 1,
  clientNext: 'Custom Reporting Module',
  notNeeded: 'Legacy Auth Support',
};

const CLIENT_PERSPECTIVE = {
  satisfaction: 8.7,
  concerns: [
    'Reporting module incomplete',
    'Mobile responsiveness pending',
  ]
};

const ARCHITECT_REVIEW = {
  score: 92,
  folderStructure: 'Clean',
  dbDesign: 'Optimal',
  apiDesign: 'Scalable',
  reusability: 'High',
  componentArch: 'Needs refactoring in Dashboard',
};

const QA_REVIEW = {
  bugRisk: 'Low',
  untestedModules: 2,
  highRiskAreas: ['Checkout Flow', 'AI Router'],
  regressionRisk: 'Minimal',
};

const SECURITY_REVIEW = {
  score: 96,
  checks: [
    { label: 'Authentication', pass: true },
    { label: 'Authorization', pass: true },
    { label: 'Secrets Exposure', pass: true },
    { label: 'SQL Injection', pass: true },
    { label: 'XSS / CSRF', pass: true },
    { label: 'Rate Limiting', pass: false },
  ]
};

const RESOURCE_UTIL = {
  tokens: '1.2M',
  cost: '$24.50',
  buildTime: '45s',
  deployTime: '2m 10s',
  suggestion: 'Cache repeated AI prompts to reduce token usage by ~15%.'
};

const TEAM_PRODUCTIVITY = {
  efficiency: 88,
  tasksToday: 14,
  linesChanged: '+1,240 / -320',
  commits: 8,
  reviews: 4,
  bugFixes: 2,
};

const FUTURE_PREDICTION = [
  'Dashboard performance degradation as data grows.',
  'API scaling bottleneck during peak swarm execution.',
  'Testing backlog if not addressed this week.',
];

const CEO_STRATEGIC_ADVICE = [
  'Freeze new feature requests.',
  'Complete testing before UI refinements.',
  'Prioritize deployment readiness.',
  'Reduce technical debt in reporting module.',
];

/* ─── Helpers ────────────────────────────────────────────────── */

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; pulse: boolean }> = {
  RUNNING: { bg: 'rgba(234,179,8,0.12)', text: '#eab308', dot: '#eab308', pulse: true },
  COMPLETED: { bg: 'rgba(16,185,129,0.12)', text: '#10b981', dot: '#10b981', pulse: false },
  IDLE: { bg: 'rgba(88,108,143,0.12)', text: '#586c8f', dot: '#586c8f', pulse: false },
};

function PulseDot({ color, size = 6 }: { color: string; size?: number }) {
  return (
    <span
      style={{
        display: 'inline-block', width: size, height: size,
        borderRadius: '50%', backgroundColor: color,
        boxShadow: `0 0 ${size}px ${color}`,
        animation: 'pulseDot 2s ease-in-out infinite',
      }}
    />
  );
}

function MetricBar({ label, value, color, suffix = '%' }: { label: string; value: number | string; color: string; suffix?: string }) {
  const numericValue = typeof value === 'number' ? value : parseInt(value as string) || 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
        <span style={{ color: '#8b9bb4' }}>{label}</span>
        <span style={{ color, fontWeight: 600, fontFamily: 'monospace' }}>{value}{suffix}</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${numericValue}%`, borderRadius: 2,
          backgroundColor: color, transition: 'width 1s ease',
        }} />
      </div>
    </div>
  );
}

function CircularProgress({ percent, size = 72, color = '#10b981' }: { percent: number, size?: number, color?: string }) {
  const R = size * 0.4;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={size * 0.08} />
        <circle
          cx={size/2} cy={size/2} r={R} fill="none" stroke={color} strokeWidth={size * 0.08}
          strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1.2s ease' }}
        />
      </svg>
      <span style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.22, fontWeight: 700, fontFamily: 'monospace', color: '#e2e8f0',
      }}>
        {percent}%
      </span>
    </div>
  );
}

function CollapsibleSection({ title, icon, badge, accent, defaultOpen = false, children }: {
  title: string; icon: React.ReactNode; badge?: string; accent?: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const borderColor = accent || '#1e2532';

  return (
    <section style={{
      borderRadius: 8, border: `1px solid ${open ? borderColor : '#1e2532'}`,
      backgroundColor: open ? 'rgba(255,255,255,0.015)' : 'transparent',
      transition: 'all 0.25s ease', overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: '8px 10px',
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        {icon}
        <span style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: open ? (accent || '#8b9bb4') : '#586c8f', flex: 1, textAlign: 'left',
        }}>
          {title}
        </span>
        {badge && (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8,
            backgroundColor: 'rgba(99,102,241,0.18)', color: '#818cf8',
          }}>{badge}</span>
        )}
        <ChevronDown size={12} color={open ? (accent || '#8b9bb4') : '#586c8f'}
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s ease' }}
        />
      </button>
      <div style={{
        maxHeight: open ? 1200 : 0, opacity: open ? 1 : 0, overflow: 'hidden',
        transition: 'max-height 0.35s ease, opacity 0.25s ease', padding: open ? '0 10px 10px' : '0 10px',
      }}>
        {children}
      </div>
    </section>
  );
}

function StatRow({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8b9bb4', marginBottom: 5 }}>
      <span>{label}</span>
      <span style={{ fontWeight: 600, fontFamily: 'monospace', color: color || '#e2e8f0' }}>{value}</span>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */

export default function RightPane() {
  const router = useRouter();
  const { mode: osMode } = useOsStore();
  const { getActiveProject } = useProjectStore();
  const activeProject = getActiveProject();
  
  const [collapsed, setCollapsed] = useState(false);
  const [thinkingMode, setThinkingMode] = useState('DeepSeek Pro');

  // Dynamically override project info based on actual project selection
  const currentProjectInfo = {
    ...PROJECT_INFO,
    name: activeProject?.name || PROJECT_INFO.name,
    type: activeProject?.domainTemplate ? `${activeProject.domainTemplate} Project` : PROJECT_INFO.type,
    status: (activeProject?.status?.toUpperCase() || PROJECT_INFO.status) as any,
    healthScore: activeProject?.progress ? Math.max(50, activeProject.progress) : PROJECT_INFO.healthScore,
  };

  const sts = STATUS_STYLES[currentProjectInfo.status] || STATUS_STYLES['IDLE'];

  /* ── Collapsed view ──────────────────────────────────────── */
  if (collapsed) {
    return (
      <div style={{
        width: 44, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        backgroundColor: '#0b0e14', borderLeft: '1px solid #1e2532', fontFamily: 'inherit',
        flexShrink: 0, transition: 'width 0.3s ease',
      }}>
        <button onClick={() => setCollapsed(false)} style={{
          width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: '1px solid #1e2532', cursor: 'pointer', color: '#586c8f', margin: '10px 0 8px',
        }} title="Expand AI CEO">
          <PanelRightClose size={14} />
        </button>

        <div style={{
          writingMode: 'vertical-rl', textOrientation: 'mixed', fontSize: 9, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase', color: '#586c8f', marginBottom: 12,
        }}>
          AI CEO
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: 1, paddingTop: 4 }}>
          <div title={`Health: ${currentProjectInfo.healthScore}%`} style={{
            width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
          }}>
            <span style={{ fontSize: 9, fontWeight: 800, fontFamily: 'monospace', color: '#10b981' }}>{currentProjectInfo.healthScore}</span>
          </div>
          <div title="Critical Risks: 0" style={{
            width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
          }}>
            <AlertTri size={12} color="#f59e0b" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Expanded view ──────────────────────────────────────── */
  return (
    <div style={{
      width: 340, height: '100vh', display: 'flex', flexDirection: 'column',
      backgroundColor: '#0b0e14', borderLeft: '1px solid #1e2532', fontFamily: 'inherit',
      flexShrink: 0, transition: 'width 0.3s ease',
    }}>
      <style>{`
        @keyframes pulseDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .45; transform: scale(1.35); } }
        .rp-scrollbar::-webkit-scrollbar { width: 4px; }
        .rp-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .rp-scrollbar::-webkit-scrollbar-thumb { background: #1e2532; border-radius: 4px; }
        .rp-scrollbar::-webkit-scrollbar-thumb:hover { background: #30363d; }
        .ceo-action-btn {
          font-size: 10px; padding: 6px 10px; border-radius: 6px; border: 1px solid #1e2532;
          background: rgba(255,255,255,0.03); color: #c9d1d9; cursor: pointer; transition: all .2s; font-weight: 600;
          display: flex; justify-content: center; align-items: center; gap: 6px;
        }
        .ceo-action-btn:hover { background: rgba(255,255,255,0.08); border-color: #3b82f6; color: #fff; }
      `}</style>

      {/* ── AI CEO HEADER ──────────────────────────────────────────── */}
      <div style={{
        padding: '12px 14px', borderBottom: '1px solid #1e2532',
        background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={14} color="#fff" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#e2e8f0' }}>
              AI CEO Dashboard
            </span>
          </div>
          <button onClick={() => setCollapsed(true)} style={{
            width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: '1px solid #1e2532', cursor: 'pointer', color: '#586c8f',
          }}>
            <PanelRightOpen size={12} />
          </button>
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{currentProjectInfo.name}</div>
        <div style={{ fontSize: 11, color: '#8b9bb4', marginBottom: 12 }}>{currentProjectInfo.type}</div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, padding: 8, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ fontSize: 10, color: '#10b981', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Health</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{currentProjectInfo.healthScore}%</div>
          </div>
          <div style={{ flex: 1, padding: 8, borderRadius: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontSize: 10, color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Confidence</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{currentProjectInfo.deliveryConfidence}%</div>
          </div>
          <div style={{ flex: 1, padding: 8, borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Risk Level</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Low</div>
          </div>
        </div>
        <div style={{ fontSize: 9, color: '#586c8f', marginTop: 10, textAlign: 'right' }}>
          Last AI Review: {currentProjectInfo.lastReview}
        </div>
      </div>

      {/* ── Scrollable body ──────────────────────────────────── */}
      <div className="rp-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        
        {/* ENTERPRISE MODE: DEEPSEEK REASONING LAYER */}
        {osMode === 'ENTERPRISE' && (
          <div style={{ marginBottom: 4 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              <select 
                value={thinkingMode}
                onChange={(e) => setThinkingMode(e.target.value)}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #3b82f6',
                  borderRadius: 6, padding: '4px 8px', fontSize: 10, fontWeight: 700, outline: 'none'
                }}
              >
                <option value="DeepSeek Pro">🧠 DeepSeek Pro</option>
                <option value="CTO Mode">👔 CTO Mode</option>
                <option value="Architect Mode">🏗️ Architect Mode</option>
                <option value="Cost Optimizer">💰 Cost Optimizer</option>
                <option value="Fast Mode">⚡ Fast Mode</option>
              </select>
            </div>
            <div style={{ padding: 10, borderRadius: 8, background: 'linear-gradient(135deg, rgba(59,130,246,0.1), transparent)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 9, color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase' }}>Smart Thinking Engine</span>
                <span style={{ fontSize: 9, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}><PulseDot color="#10b981" size={4} /> Multi-Step</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                <span style={{ color: '#8b9bb4' }}>Reasoning Depth</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>Advanced (94%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 4 }}>
                <span style={{ color: '#8b9bb4' }}>Optimization Potential</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>High</span>
              </div>
            </div>
          </div>
        )}

        {/* EXECUTIVE SUMMARY */}
        <div style={{ padding: 12, borderRadius: 8, background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', border: '1px solid #2a3441' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Sparkles size={12} color="#a855f7" />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#a855f7' }}>AI Executive Summary (Simulation)</span>
          </div>
          <p style={{ fontSize: 11, color: '#c9d1d9', lineHeight: 1.5, margin: 0 }}>
            {EXECUTIVE_SUMMARY}
          </p>
        </div>

        {/* 1. PROJECT HEALTH & PREDICTION */}
        <CollapsibleSection title="Project Health (Simulated)" icon={<Activity size={12} />} accent="#10b981" defaultOpen={true}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <CircularProgress percent={currentProjectInfo.healthScore} size={60} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 11, color: '#8b9bb4', marginBottom: 2 }}>Overall Health Score</div>
              <div style={{ fontSize: 10, color: '#c9d1d9' }}>Weighted index based on 7 technical and team factors.</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
            {HEALTH_BREAKDOWN.map(item => (
              <div key={item.label} style={{ background: 'rgba(255,255,255,0.02)', padding: '4px 8px', borderRadius: 6, border: '1px solid #1e2532' }}>
                <div style={{ fontSize: 9, color: '#8b9bb4', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.label}</span>
                  <span style={{ opacity: 0.5 }}>{item.weight}</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: item.color }}>{item.value}/100</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#0f172a', padding: 10, borderRadius: 8, border: '1px solid #1e293b' }}>
            <h4 style={{ fontSize: 10, textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 8px 0' }}>AI Delivery Prediction</h4>
            <MetricBar label="Current Progress" value={activeProject?.progress || DELIVERY_PREDICTION.currentProgress} color="#3b82f6" />
            <StatRow label="Predicted Delivery" value={DELIVERY_PREDICTION.expectedCompletion} color="#f59e0b" />
            <StatRow label="On Time Probability" value={`${DELIVERY_PREDICTION.onTimeProb}%`} color="#10b981" />
            <StatRow label="Risk of Delay" value={`${DELIVERY_PREDICTION.delayProb}%`} color="#ef4444" />
          </div>
        </CollapsibleSection>

        {/* STARTUP MODE: Hide the heavy enterprise panels below this point to keep it simple */}
        {osMode === 'ENTERPRISE' && (
          <>
            <div style={{ fontSize: 9, textAlign: 'center', color: '#8b9bb4', marginTop: 4, marginBottom: -4 }}>
              --- SIMULATED DATA BELOW ---
            </div>
            {/* 2. AI RISK DETECTION CENTER */}
            <CollapsibleSection title="Risk Detection Center" icon={<AlertTri size={12} />} accent="#ef4444" defaultOpen={false}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <div style={{ flex: 1, background: 'rgba(239,68,68,0.1)', padding: 6, borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>{RISK_CENTER.critical}</div>
              <div style={{ fontSize: 9, color: '#ef4444', textTransform: 'uppercase' }}>Critical</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(245,158,11,0.1)', padding: 6, borderRadius: 6, border: '1px solid rgba(245,158,11,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f59e0b' }}>{RISK_CENTER.medium}</div>
              <div style={{ fontSize: 9, color: '#f59e0b', textTransform: 'uppercase' }}>Medium</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(16,185,129,0.1)', padding: 6, borderRadius: 6, border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#10b981' }}>{RISK_CENTER.low}</div>
              <div style={{ fontSize: 9, color: '#10b981', textTransform: 'uppercase' }}>Low</div>
            </div>
          </div>
          
          <div style={{ fontSize: 10, color: '#c9d1d9', marginBottom: 4, fontWeight: 700 }}>Technical Risks</div>
          <ul style={{ margin: '0 0 8px 0', paddingLeft: 16, fontSize: 11, color: '#8b9bb4' }}>
            {RISK_CENTER.technical.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
          
          <div style={{ fontSize: 10, color: '#c9d1d9', marginBottom: 4, fontWeight: 700 }}>Business Risks</div>
          <ul style={{ margin: '0 0 8px 0', paddingLeft: 16, fontSize: 11, color: '#8b9bb4' }}>
            {RISK_CENTER.business.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
          
          <div style={{ fontSize: 10, color: '#c9d1d9', marginBottom: 4, fontWeight: 700 }}>Team Risks</div>
          <ul style={{ margin: '0 0 4px 0', paddingLeft: 16, fontSize: 11, color: '#8b9bb4' }}>
            {RISK_CENTER.team.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </CollapsibleSection>

        {/* 3. CTO & ARCHITECT REVIEW */}
        <CollapsibleSection title="CTO & Architect Review" icon={<Cpu size={12} />} accent="#8b5cf6">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: 8, background: 'rgba(139,92,246,0.1)', borderRadius: 6, border: '1px solid rgba(139,92,246,0.2)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#c4b5fd' }}>Architecture Score</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#8b5cf6', fontFamily: 'monospace' }}>{ARCHITECT_REVIEW.score}%</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 12 }}>
            <StatRow label="Folder Struct" value={ARCHITECT_REVIEW.folderStructure} color="#10b981" />
            <StatRow label="DB Design" value={ARCHITECT_REVIEW.dbDesign} color="#10b981" />
            <StatRow label="API Design" value={ARCHITECT_REVIEW.apiDesign} color="#10b981" />
            <StatRow label="Reusability" value={ARCHITECT_REVIEW.reusability} color="#10b981" />
            <div style={{ gridColumn: '1 / -1' }}>
              <StatRow label="Component Arch" value={ARCHITECT_REVIEW.componentArch} color="#f59e0b" />
            </div>
          </div>
          
          <div style={{ fontSize: 10, fontWeight: 700, color: '#c9d1d9', marginBottom: 6, textTransform: 'uppercase' }}>Immediate Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {CTO_ADVICE.map((item, idx) => (
              <div key={idx} style={{ padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid #1e2532' }}>
                <div style={{ fontSize: 11, color: '#e2e8f0', marginBottom: 6 }}>{idx+1}. {item.text}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: '#1e1b4b', color: '#a5b4fc' }}>Impact: {item.impact}</span>
                  <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: '#14532d', color: '#86efac' }}>Effort: {item.effort}</span>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* 4. PRODUCT MANAGER & CLIENT VIEW */}
        <CollapsibleSection title="Product & Client View" icon={<Briefcase size={12} />} accent="#06b6d4">
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, padding: 8, borderRadius: 6, background: '#0f172a', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>Client Satisfaction</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#22d3ee' }}>{CLIENT_PERSPECTIVE.satisfaction} <span style={{fontSize: 12, color: '#64748b'}}>/ 10</span></div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: '#c9d1d9', marginBottom: 4, fontWeight: 700 }}>Potential Client Concerns:</div>
          <ul style={{ margin: '0 0 12px 0', paddingLeft: 16, fontSize: 11, color: '#8b9bb4' }}>
            {CLIENT_PERSPECTIVE.concerns.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
          
          <div style={{ fontSize: 10, color: '#c9d1d9', marginBottom: 6, fontWeight: 700 }}>Feature Status</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 10 }}>
            <StatRow label="Completed" value={PRODUCT_MANAGER_VIEW.completed} color="#10b981" />
            <StatRow label="Pending" value={PRODUCT_MANAGER_VIEW.pending} color="#f59e0b" />
            <StatRow label="Blocked" value={PRODUCT_MANAGER_VIEW.blocked} color="#ef4444" />
            <StatRow label="Unused" value={PRODUCT_MANAGER_VIEW.unused} color="#64748b" />
          </div>
          <div style={{ padding: 8, background: 'rgba(255,255,255,0.02)', borderRadius: 6, border: '1px solid #1e2532' }}>
            <div style={{ fontSize: 10, color: '#8b9bb4', marginBottom: 2 }}>Likely requested next:</div>
            <div style={{ fontSize: 11, color: '#c9d1d9', marginBottom: 6 }}>{PRODUCT_MANAGER_VIEW.clientNext}</div>
            <div style={{ fontSize: 10, color: '#8b9bb4', marginBottom: 2 }}>Likely not needed:</div>
            <div style={{ fontSize: 11, color: '#c9d1d9' }}>{PRODUCT_MANAGER_VIEW.notNeeded}</div>
          </div>
        </CollapsibleSection>

        {/* 5. QA & SECURITY REVIEW */}
        <CollapsibleSection title="QA & Security Center" icon={<ShieldCheck size={12} />} accent="#3b82f6">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 10, color: '#8b9bb4' }}>Security Score</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#3b82f6' }}>{SECURITY_REVIEW.score}%</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: 10, color: '#8b9bb4' }}>Bug Risk</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#10b981' }}>{QA_REVIEW.bugRisk}</span>
            </div>
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: '#c9d1d9', marginBottom: 6 }}>Quality Grades</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 12 }}>
            {QUALITY_CENTER.map((q, i) => (
              <StatRow key={i} label={q.label} value={q.grade} color={q.color} />
            ))}
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: '#c9d1d9', marginBottom: 6 }}>Security Checks</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 12 }}>
            {SECURITY_REVIEW.checks.map((chk, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#8b9bb4' }}>
                {chk.pass ? <CheckCircle2 size={10} color="#10b981" /> : <Bug size={10} color="#ef4444" />}
                {chk.label}
              </div>
            ))}
          </div>

          <div style={{ padding: 8, background: '#1e1111', borderRadius: 6, border: '1px solid #450a0a' }}>
            <div style={{ fontSize: 10, color: '#fca5a5', marginBottom: 4 }}>Critical Untested Modules: <strong>{QA_REVIEW.untestedModules}</strong></div>
            <div style={{ fontSize: 10, color: '#fca5a5' }}>High Risk: {QA_REVIEW.highRiskAreas.join(', ')}</div>
          </div>
        </CollapsibleSection>

        {/* 6. TEAM PRODUCTIVITY & RESOURCES */}
        <CollapsibleSection title="Team & Resources" icon={<Users size={12} />} accent="#10b981">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: 8, background: 'rgba(16,185,129,0.1)', borderRadius: 6, border: '1px solid rgba(16,185,129,0.2)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6ee7b7' }}>Team Efficiency</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#10b981', fontFamily: 'monospace' }}>{TEAM_PRODUCTIVITY.efficiency}%</span>
          </div>
          
          <div style={{ fontSize: 10, fontWeight: 700, color: '#c9d1d9', marginBottom: 6 }}>Current Work (Today)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 12 }}>
            <StatRow label="Tasks Completed" value={TEAM_PRODUCTIVITY.tasksToday} color="#fff" />
            <StatRow label="Lines Changed" value={TEAM_PRODUCTIVITY.linesChanged} color="#f59e0b" />
            <StatRow label="Commits" value={TEAM_PRODUCTIVITY.commits} color="#3b82f6" />
            <StatRow label="Reviews/Bug Fixes" value={`${TEAM_PRODUCTIVITY.reviews} / ${TEAM_PRODUCTIVITY.bugFixes}`} color="#10b981" />
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: '#c9d1d9', marginBottom: 6 }}>AI Utilization</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 8 }}>
            <StatRow label="Tokens Consumed" value={RESOURCE_UTIL.tokens} color="#a855f7" />
            <StatRow label="Est. AI Cost" value={RESOURCE_UTIL.cost} color="#10b981" />
            <StatRow label="Build Time" value={RESOURCE_UTIL.buildTime} />
            <StatRow label="Deploy Time" value={RESOURCE_UTIL.deployTime} />
          </div>
          <div style={{ fontSize: 10, color: '#8b9bb4', padding: 6, background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
            💡 {RESOURCE_UTIL.suggestion}
          </div>
        </CollapsibleSection>

        {/* 7. STRATEGIC ADVICE & FUTURE */}
        <CollapsibleSection title="Strategic Advice & Future" icon={<Eye size={12} />} accent="#eab308" defaultOpen={false}>
          <div style={{ padding: 10, background: '#1a1403', borderRadius: 6, border: '1px solid #713f12', marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fde047', marginBottom: 6 }}>If I were running this project today:</div>
            <ol style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: '#fef08a', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {CEO_STRATEGIC_ADVICE.map((adv, i) => <li key={i}>{adv}</li>)}
            </ol>
          </div>
          
          <div style={{ fontSize: 10, fontWeight: 700, color: '#c9d1d9', marginBottom: 6 }}>Possible Future Risks</div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: '#8b9bb4', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FUTURE_PREDICTION.map((fp, i) => <li key={i}>{fp}</li>)}
          </ul>
        </CollapsibleSection>

        {/* ENTERPRISE MODE: ESCALATION COMMAND CENTER */}
        <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #1e2532' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#586c8f', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>
            Escalation Center
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <button className="ceo-action-btn" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>
              <AlertTri size={12} /> I Disagree
            </button>
            <button className="ceo-action-btn">
              <User size={12} /> Escalate to CTO
            </button>
            <button className="ceo-action-btn">
              <FileText size={12} /> Gen Email
            </button>
            <button className="ceo-action-btn">
              <Flag size={12} /> Review Board
            </button>
          </div>
        </div>

        </>
        )}
      </div>
    </div>
  );
}
