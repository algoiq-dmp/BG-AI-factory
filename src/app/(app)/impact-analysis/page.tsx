'use client';

import { useState } from 'react';
import {
  Activity, ChevronDown, FileCode2, Layers, TestTube,
  AlertTriangle, ArrowRight, GitBranch, Zap, Network,
  Shield, Search
} from 'lucide-react';

/** Impact metric displayed in the right panel */
interface ImpactMetric {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const impactMetrics: ImpactMetric[] = [
  { label: 'Files Affected', value: 0, icon: FileCode2, color: '#eab308', bgColor: 'rgba(234,179,8,0.12)', borderColor: 'rgba(234,179,8,0.3)' },
  { label: 'Components Impacted', value: 0, icon: Layers, color: '#3b82f6', bgColor: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.3)' },
  { label: 'Test Cases to Update', value: 0, icon: TestTube, color: '#a855f7', bgColor: 'rgba(168,85,247,0.12)', borderColor: 'rgba(168,85,247,0.3)' },
  { label: 'Risk Level', value: '—', icon: AlertTriangle, color: '#10b981', bgColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)' },
];

const riskLevels = [
  { level: 'Low', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  { level: 'Medium', color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
  { level: 'High', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  { level: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
];

/** Columns for the impact matrix table */
const matrixHeaders = ['Component', 'Risk', 'Effort', 'Dependencies'];

/**
 * Impact Analysis page.
 * Assesses the ripple effect of changes across the codebase with visualization and matrix.
 */
export default function ImpactAnalysisPage() {
  const [selectedCR, setSelectedCR] = useState('');

  return (
    <div className="h-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full overflow-y-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(234,179,8,0.05))',
              border: '1px solid rgba(234,179,8,0.3)',
            }}
          >
            <Activity className="w-6 h-6" style={{ color: '#eab308' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Impact Analysis</h1>
            <p className="text-[#8b9bb4] text-sm mt-1">
              Assess the ripple effect of changes across your codebase
            </p>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm text-white transition-all hover:brightness-110"
          style={{ backgroundColor: '#eab308' }}
        >
          <Zap className="w-4 h-4" />
          Run Analysis
        </button>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Left Panel — Select Change */}
        <div
          className="rounded-xl p-6"
          style={{ backgroundColor: 'rgba(17,22,34,0.8)', border: '1px solid #1e2532' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <GitBranch className="w-4 h-4" style={{ color: '#eab308' }} />
            <h3 className="text-sm font-bold text-white">Select Change</h3>
          </div>

          {/* CR Dropdown */}
          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: '#586c8f' }}>
              Change Request
            </label>
            <div className="relative">
              <select
                value={selectedCR}
                onChange={(e) => setSelectedCR(e.target.value)}
                className="w-full py-2.5 px-3 rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: 'rgba(11,14,20,0.8)',
                  border: '1px solid #1e2532',
                  color: selectedCR ? '#fff' : '#586c8f',
                  appearance: 'none' as const,
                  paddingRight: '2.5rem',
                }}
              >
                <option value="">Select a change request...</option>
                <option value="cr-001">CR-001: Authentication Flow Refactor</option>
                <option value="cr-002">CR-002: Dashboard Performance Fix</option>
                <option value="cr-003">CR-003: API Gateway Migration</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#586c8f' }} />
            </div>
          </div>

          {/* Description Area */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: '#586c8f' }}>
              Change Description
            </label>
            <div
              className="rounded-lg p-4 min-h-[120px]"
              style={{ backgroundColor: 'rgba(11,14,20,0.6)', border: '1px solid #1e2532' }}
            >
              {selectedCR ? (
                <p className="text-sm text-[#8b9bb4] leading-relaxed">
                  Selected change request details and scope description would appear here once the system loads the CR data.
                </p>
              ) : (
                <p className="text-sm italic" style={{ color: '#586c8f' }}>
                  Select a change request to view its description and scope...
                </p>
              )}
            </div>
          </div>

          {/* Dependency Graph Mockup */}
          <div className="mt-4">
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: '#586c8f' }}>
              Dependency Graph
            </label>
            <div
              className="rounded-lg p-6 flex items-center justify-center min-h-[100px]"
              style={{ backgroundColor: 'rgba(11,14,20,0.4)', border: '1px dashed #1e2532' }}
            >
              <div className="text-center">
                <Network className="w-8 h-8 mx-auto mb-2" style={{ color: '#586c8f' }} />
                <p className="text-xs" style={{ color: '#586c8f' }}>
                  Dependency visualization will render here
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — Impact Visualization */}
        <div
          className="rounded-xl p-6"
          style={{ backgroundColor: 'rgba(17,22,34,0.8)', border: '1px solid #1e2532' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4" style={{ color: '#eab308' }} />
            <h3 className="text-sm font-bold text-white">Impact Overview</h3>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {impactMetrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]"
                style={{ backgroundColor: 'rgba(11,14,20,0.6)', border: '1px solid #1e2532' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: m.bgColor, border: `1px solid ${m.borderColor}` }}
                  >
                    <m.icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">{m.value}</div>
                <div className="text-[10px] uppercase tracking-widest font-bold mt-0.5" style={{ color: '#586c8f' }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>

          {/* Risk Level Badges */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-3" style={{ color: '#586c8f' }}>
              Risk Assessment Scale
            </label>
            <div className="flex gap-2">
              {riskLevels.map((r) => (
                <div
                  key={r.level}
                  className="flex-1 text-center py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: r.bg,
                    border: `1px solid ${r.color}40`,
                    color: r.color,
                  }}
                >
                  {r.level}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Impact Matrix Table */}
      <div
        className="rounded-xl overflow-hidden mb-8"
        style={{ backgroundColor: 'rgba(17,22,34,0.8)', border: '1px solid #1e2532' }}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#1e2532' }}>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: '#eab308' }} />
            <h3 className="text-sm font-bold text-white">Impact Matrix</h3>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#586c8f' }} />
            <input
              type="text"
              placeholder="Search components..."
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none"
              style={{
                backgroundColor: 'rgba(11,14,20,0.8)',
                border: '1px solid #1e2532',
                color: '#8b9bb4',
                width: '200px',
              }}
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 px-5 py-3" style={{ backgroundColor: 'rgba(11,14,20,0.5)', borderBottom: '1px solid #1e2532' }}>
          {matrixHeaders.map((h) => (
            <div key={h} className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#586c8f' }}>
              {h}
            </div>
          ))}
        </div>

        {/* Empty Table State */}
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <Activity className="w-8 h-8 mx-auto mb-3" style={{ color: '#586c8f' }} />
            <p className="text-sm font-medium" style={{ color: '#586c8f' }}>
              Select a change request to analyze its impact
            </p>
            <p className="text-xs mt-1" style={{ color: '#3d4f6b' }}>
              The matrix will populate with affected components, risk levels, and effort estimates
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8">
        {[
          { icon: FileCode2, color: '#eab308', title: 'Code Impact', desc: 'Identifies files, functions, and modules directly affected by the change' },
          { icon: TestTube, color: '#a855f7', title: 'Test Impact', desc: 'Maps test cases that need updating or creation for the change' },
          { icon: Layers, color: '#3b82f6', title: 'Dependency Map', desc: 'Traces upstream and downstream dependencies in the module graph' },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
            style={{ backgroundColor: 'rgba(17,22,34,0.8)', border: '1px solid #1e2532' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: `${item.color}15`,
                  border: `1px solid ${item.color}30`,
                }}
              >
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <h4 className="text-sm font-bold text-white">{item.title}</h4>
              <ArrowRight className="w-4 h-4 ml-auto text-[#586c8f] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#586c8f' }}>{item.desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
