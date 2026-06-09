'use client';

import { useState } from 'react';
import {
  Sparkles, Bug, RefreshCcw, Rocket, Flame, Plus,
  ClipboardList, CheckCircle2, AlertTriangle, Clock,
  Filter, LayoutDashboard, Zap, ArrowUpRight
} from 'lucide-react';

/** Metric card type for the CR Dashboard */
interface MetricCard {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const metrics: MetricCard[] = [
  { label: 'Total', value: 0, icon: ClipboardList, color: '#f97316', bgColor: 'rgba(249,115,22,0.12)', borderColor: 'rgba(249,115,22,0.3)' },
  { label: 'Bugs', value: 0, icon: Bug, color: '#ef4444', bgColor: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)' },
  { label: 'Changes', value: 0, icon: RefreshCcw, color: '#3b82f6', bgColor: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.3)' },
  { label: 'Features', value: 0, icon: Rocket, color: '#10b981', bgColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)' },
  { label: 'Open', value: 0, icon: Clock, color: '#eab308', bgColor: 'rgba(234,179,8,0.12)', borderColor: 'rgba(234,179,8,0.3)' },
];

const filterTabs = [
  { id: 'all', label: 'All', icon: LayoutDashboard },
  { id: 'bugs', label: 'Bugs', icon: Bug },
  { id: 'changes', label: 'Changes', icon: RefreshCcw },
  { id: 'features', label: 'Features', icon: Rocket },
  { id: 'hotfixes', label: 'Hotfixes', icon: Flame },
  { id: 'new', label: 'New', icon: Sparkles },
  { id: 'in-progress', label: 'In Progress', icon: Zap },
  { id: 'deployed', label: 'Deployed', icon: CheckCircle2 },
];

/**
 * Change Request Dashboard page.
 * Tracks bugs, CRs, and feature requests with metric cards and filter tabs.
 */
export default function CRDashboardPage() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="h-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full overflow-y-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(249,115,22,0.05))',
              border: '1px solid rgba(249,115,22,0.3)',
            }}
          >
            <ClipboardList className="w-6 h-6" style={{ color: '#f97316' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Change Request Dashboard</h1>
            <p className="text-[#8b9bb4] text-sm mt-1">
              Karma Parivartan — Track bugs, CRs, and feature requests
            </p>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm text-white transition-all hover:brightness-110"
          style={{ backgroundColor: '#f97316' }}
        >
          <Plus className="w-4 h-4" />
          New CR
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
            style={{
              backgroundColor: 'rgba(17,22,34,0.8)',
              border: `1px solid #1e2532`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: m.bgColor, border: `1px solid ${m.borderColor}` }}
              >
                <m.icon className="w-4 h-4" style={{ color: m.color }} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#586c8f] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-3xl font-black text-white">{m.value}</div>
            <div className="text-[10px] uppercase tracking-widest font-bold mt-1" style={{ color: '#586c8f' }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filterTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                backgroundColor: isActive ? 'rgba(249,115,22,0.15)' : 'rgba(17,22,34,0.8)',
                border: `1px solid ${isActive ? 'rgba(249,115,22,0.4)' : '#1e2532'}`,
                color: isActive ? '#f97316' : '#8b9bb4',
              }}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.03))',
              border: '1px solid rgba(249,115,22,0.2)',
            }}
          >
            <Sparkles className="w-10 h-10" style={{ color: '#f97316' }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">No Change Requests Yet</h2>
          <p className="text-[#586c8f] text-sm leading-relaxed mb-6">
            When Adharma (bugs) arise in your system, file a Change Request to restore Dharma (order).
          </p>
          <button
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm text-white transition-all hover:brightness-110 hover:scale-105"
            style={{ backgroundColor: '#a855f7' }}
          >
            <Plus className="w-4 h-4" />
            File First CR
          </button>
        </div>
      </div>

    </div>
  );
}
