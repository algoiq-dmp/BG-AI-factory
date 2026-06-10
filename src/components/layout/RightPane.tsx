'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOsStore } from '@/store/useOsStore';
import { useProjectStore } from '@/store/useProjectStore';
import {
  Activity, Zap, ShieldCheck, Brain, GitBranch,
  FileText, Clock, ChevronDown, ChevronRight, User,
  Timer, AlertTriangle as AlertTri, MessageCircle, Flag,
  BarChart3, TrendingUp, PanelRightClose, PanelRightOpen,
  Target, Cpu, Briefcase, Eye, Lock, Bug, Calendar, DollarSign,
  TrendingDown, CheckCircle2, Crosshair, Users, Sparkles, Loader2
} from 'lucide-react';

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
        maxHeight: open ? 2500 : 0, opacity: open ? 1 : 0, overflow: 'hidden',
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
  const [thinkingMode, setThinkingMode] = useState('deepseek-v4-pro');

  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchLiveTelemetry() {
      if (!activeProject?.id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${activeProject.id}/ceo-dashboard`);
        const result = await res.json();
        if (result.success) {
          setLiveData(result.data);
        }
      } catch (e) {
        console.error("Failed to fetch live telemetry:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchLiveTelemetry();
  }, [activeProject?.id]);

  const currentProjectInfo = {
    name: activeProject?.name || 'No Active Project',
    type: activeProject?.domainTemplate ? `${activeProject.domainTemplate} Project` : 'AI Generation Platform',
    status: (activeProject?.status?.toUpperCase() || 'IDLE') as any,
    healthScore: liveData?.hardMetrics?.healthScore || (activeProject?.progress ? Math.max(50, activeProject.progress) : 0),
  };

  const sts = STATUS_STYLES[currentProjectInfo.status] || STATUS_STYLES['IDLE'];
  
  // Safe Fallbacks
  const hm = liveData?.hardMetrics || {};
  const ins = liveData?.insights || {};

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
          <div title={`Critical Risks: ${hm.criticalRisks || 0}`} style={{
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
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{loading ? '--' : '94%'}</div>
          </div>
          <div style={{ flex: 1, padding: 8, borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Risk Level</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{hm.criticalRisks > 0 ? 'High' : (hm.mediumRisks > 0 ? 'Medium' : 'Low')}</div>
          </div>
        </div>
      </div>

      {/* ── Scrollable body ──────────────────────────────────── */}
      <div className="rp-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        
        {loading ? (
          <div style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0.7 }}>
             <Loader2 size={24} color="#3b82f6" className="animate-spin" />
             <div style={{ fontSize: 11, color: '#8b9bb4' }}>DeepSeek V4 Pro Analyzing Telemetry...</div>
          </div>
        ) : !activeProject ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#586c8f', fontSize: 12 }}>
            Select a project to view AI Intelligence
          </div>
        ) : (
          <>
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
                <option value="deepseek-v4-pro">🧠 DeepSeek V4 Pro</option>
                <option value="Architect Mode">🏗️ Architect Mode</option>
              </select>
            </div>
            <div style={{ padding: 10, borderRadius: 8, background: 'linear-gradient(135deg, rgba(59,130,246,0.1), transparent)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 9, color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase' }}>Smart Thinking Engine</span>
                <span style={{ fontSize: 9, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}><PulseDot color="#10b981" size={4} /> Multi-Step</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                <span style={{ color: '#8b9bb4' }}>Reasoning Depth</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>Advanced (DeepSeek)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 4 }}>
                <span style={{ color: '#8b9bb4' }}>Data Source</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>Live Telemetry</span>
              </div>
            </div>
          </div>
        )}

        {/* EXECUTIVE SUMMARY */}
        <div style={{ padding: 12, borderRadius: 8, background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', border: '1px solid #2a3441' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Sparkles size={12} color="#a855f7" />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#a855f7' }}>AI Executive Summary</span>
          </div>
          <p style={{ fontSize: 11, color: '#c9d1d9', lineHeight: 1.5, margin: 0 }}>
            {ins.EXECUTIVE_SUMMARY || 'Gathering insights...'}
          </p>
        </div>

        {/* 1. PROJECT HEALTH & PREDICTION */}
        <CollapsibleSection title="Live Project Health" icon={<Activity size={12} />} accent="#10b981" defaultOpen={true}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <CircularProgress percent={currentProjectInfo.healthScore} size={60} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 11, color: '#8b9bb4', marginBottom: 2 }}>Overall Health Score</div>
              <div style={{ fontSize: 10, color: '#c9d1d9' }}>Weighted index based on live DB metrics.</div>
            </div>
          </div>
          
          <div style={{ background: '#0f172a', padding: 10, borderRadius: 8, border: '1px solid #1e293b' }}>
            <h4 style={{ fontSize: 10, textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 8px 0' }}>AI Delivery Prediction</h4>
            <MetricBar label="Current Progress" value={activeProject?.progress || 0} color="#3b82f6" />
            <StatRow label="Predicted Delivery" value={ins.DELIVERY_PREDICTION?.expectedCompletion || 'TBD'} color="#f59e0b" />
            <StatRow label="On Time Probability" value={`${ins.DELIVERY_PREDICTION?.onTimeProb || 0}%`} color="#10b981" />
            <StatRow label="Risk of Delay" value={`${ins.DELIVERY_PREDICTION?.delayProb || 0}%`} color="#ef4444" />
          </div>
        </CollapsibleSection>

        {/* ENTERPRISE PANELS */}
        {osMode === 'ENTERPRISE' && (
          <>
            {/* 2. AI RISK DETECTION CENTER */}
            <CollapsibleSection title="Risk Detection Center" icon={<AlertTri size={12} />} accent="#ef4444" defaultOpen={false}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <div style={{ flex: 1, background: 'rgba(239,68,68,0.1)', padding: 6, borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>{hm.criticalRisks || 0}</div>
              <div style={{ fontSize: 9, color: '#ef4444', textTransform: 'uppercase' }}>Critical</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(245,158,11,0.1)', padding: 6, borderRadius: 6, border: '1px solid rgba(245,158,11,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f59e0b' }}>{hm.mediumRisks || 0}</div>
              <div style={{ fontSize: 9, color: '#f59e0b', textTransform: 'uppercase' }}>Medium</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(16,185,129,0.1)', padding: 6, borderRadius: 6, border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#10b981' }}>{hm.lowRisks || 0}</div>
              <div style={{ fontSize: 9, color: '#10b981', textTransform: 'uppercase' }}>Low</div>
            </div>
          </div>
          
          <div style={{ fontSize: 10, color: '#c9d1d9', marginBottom: 4, fontWeight: 700 }}>Technical Risks (Live)</div>
          <ul style={{ margin: '0 0 8px 0', paddingLeft: 16, fontSize: 11, color: '#8b9bb4' }}>
            <li>Untested Modules: {hm.untestedModules || 0}</li>
            {ins.FUTURE_PREDICTION?.map((r: string, i: number) => <li key={i}>{r}</li>)}
          </ul>
        </CollapsibleSection>

        {/* 3. CTO & ARCHITECT REVIEW */}
        <CollapsibleSection title="CTO & Architect Review" icon={<Cpu size={12} />} accent="#8b5cf6">
          <div style={{ fontSize: 10, fontWeight: 700, color: '#c9d1d9', marginBottom: 6, textTransform: 'uppercase' }}>Immediate Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ins.CTO_ADVICE?.map((item: any, idx: number) => (
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
        <CollapsibleSection title="Product Manager View" icon={<Briefcase size={12} />} accent="#06b6d4">
          <div style={{ fontSize: 10, color: '#c9d1d9', marginBottom: 6, fontWeight: 700 }}>Feature Task Status</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 10 }}>
            <StatRow label="Completed" value={hm.tasksCompleted || 0} color="#10b981" />
            <StatRow label="Pending" value={hm.tasksPending || 0} color="#f59e0b" />
          </div>
        </CollapsibleSection>

        {/* 6. TEAM PRODUCTIVITY & RESOURCES */}
        <CollapsibleSection title="Team Productivity" icon={<Users size={12} />} accent="#10b981">
          <div style={{ fontSize: 10, fontWeight: 700, color: '#c9d1d9', marginBottom: 6 }}>Current Work (Last 24h)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 12 }}>
            <StatRow label="Tasks Completed" value={hm.tasksToday || 0} color="#fff" />
            <StatRow label="Commits/Logs" value={hm.commits || 0} color="#3b82f6" />
            <StatRow label="Total Activity" value={hm.recentLogsCount || 0} color="#f59e0b" />
          </div>
        </CollapsibleSection>

        {/* 7. STRATEGIC ADVICE & FUTURE */}
        <CollapsibleSection title="Strategic Advice" icon={<Eye size={12} />} accent="#eab308" defaultOpen={false}>
          <div style={{ padding: 10, background: '#1a1403', borderRadius: 6, border: '1px solid #713f12', marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fde047', marginBottom: 6 }}>If I were running this project today:</div>
            <ol style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: '#fef08a', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {ins.CEO_STRATEGIC_ADVICE?.map((adv: string, i: number) => <li key={i}>{adv}</li>)}
            </ol>
          </div>
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
        </>
        )}
      </div>
    </div>
  );
}
