'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen, Plus, Search, Filter, CheckCircle2, Clock,
  XCircle, FileText, ChevronDown, ArrowUpRight, Layers,
  SlidersHorizontal
} from 'lucide-react';

/** Stat card for the vault header */
interface VaultStat {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const stats: VaultStat[] = [
  { label: 'Total Requirements', value: 0, icon: FileText, color: '#3b82f6', bgColor: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.3)' },
  { label: 'Approved', value: 0, icon: CheckCircle2, color: '#10b981', bgColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)' },
  { label: 'Pending Review', value: 0, icon: Clock, color: '#eab308', bgColor: 'rgba(234,179,8,0.12)', borderColor: 'rgba(234,179,8,0.3)' },
  { label: 'Rejected', value: 0, icon: XCircle, color: '#ef4444', bgColor: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)' },
];

const statusFilters = ['All', 'Draft', 'Pending Review', 'Approved', 'Rejected'];
const priorityFilters = ['All', 'Critical', 'High', 'Medium', 'Low'];
const categoryFilters = ['All', 'Functional', 'Non-Functional', 'Technical', 'Business', 'UI/UX'];

/**
 * Requirements Vault page.
 * Centralized repository of all project requirements with search and filtering.
 */
export default function RequirementsVaultPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [requirements, setRequirements] = useState<any[]>([]);

  useEffect(() => {
    const projectId = localStorage.getItem('activeProjectId');
    if (projectId) {
      fetch(`/api/documents?projectId=${projectId}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.project && data.project.documents) {
            const reqs = data.project.documents.filter((d: any) => d.type === 'PRD' || d.type === 'BRD');
            setRequirements(reqs);
          }
        });
    }
  }, []);

  const selectStyle: React.CSSProperties = {
    backgroundColor: 'rgba(11,14,20,0.8)',
    border: '1px solid #1e2532',
    color: '#8b9bb4',
    borderRadius: '0.5rem',
    padding: '0.5rem 2rem 0.5rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    outline: 'none',
    appearance: 'none' as const,
  };

  return (
    <div className="h-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full overflow-y-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05))',
              border: '1px solid rgba(59,130,246,0.3)',
            }}
          >
            <BookOpen className="w-6 h-6" style={{ color: '#3b82f6' }} />
          </div>
          <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Requirements Vault</h1>
              <p className="text-sm text-[#8b9bb4] mt-0.5">
                Phase 11 — Immutable record of all original requirements and change requests
              </p>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm text-white transition-all hover:brightness-110 hover:scale-105"
          style={{ backgroundColor: '#3b82f6' }}
        >
          <Plus className="w-4 h-4" />
          Add Requirement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
            style={{
              backgroundColor: 'rgba(17,22,34,0.8)',
              border: '1px solid #1e2532',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: s.bgColor, border: `1px solid ${s.borderColor}` }}
              >
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#586c8f] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-3xl font-black text-white">{s.value}</div>
            <div className="text-[10px] uppercase tracking-widest font-bold mt-1" style={{ color: '#586c8f' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#586c8f' }} />
            <input
              type="text"
              placeholder="Search requirements by title, ID, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                backgroundColor: 'rgba(11,14,20,0.8)',
                border: '1px solid #1e2532',
                color: '#fff',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.target.style.borderColor = '#1e2532')}
            />
          </div>
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: showFilters ? 'rgba(59,130,246,0.12)' : 'rgba(17,22,34,0.8)',
              border: `1px solid ${showFilters ? 'rgba(59,130,246,0.3)' : '#1e2532'}`,
              color: showFilters ? '#3b82f6' : '#8b9bb4',
            }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 rounded-xl" style={{ backgroundColor: 'rgba(17,22,34,0.6)', border: '1px solid #1e2532' }}>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: '#586c8f' }}>Status</label>
              <div className="relative">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
                  {statusFilters.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#586c8f' }} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: '#586c8f' }}>Priority</label>
              <div className="relative">
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={selectStyle}>
                  {priorityFilters.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#586c8f' }} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: '#586c8f' }}>Category</label>
              <div className="relative">
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={selectStyle}>
                  {categoryFilters.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#586c8f' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State / List */}
      <div className="flex-1 overflow-y-auto">
        {requirements.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full mt-20">
            <div className="text-center max-w-md">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.03))',
                  border: '1px solid rgba(59,130,246,0.2)',
                }}
              >
                <BookOpen className="w-10 h-10" style={{ color: '#3b82f6' }} />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">No Requirements Yet</h2>
              <p className="text-[#586c8f] text-sm leading-relaxed mb-6">
                Start by creating your first requirement or import from a BRD document.
              </p>
              <button
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm text-white transition-all hover:brightness-110 hover:scale-105"
                style={{ backgroundColor: '#3b82f6' }}
              >
                <Plus className="w-4 h-4" />
                Add Requirement
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {requirements.map(req => (
              <div key={req.id} className="bg-[#111622] border border-[#1e2532] rounded-xl p-5 hover:border-[#3b82f6]/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-bold mb-1">{req.title}</h3>
                    <div className="text-xs text-[#586c8f] font-mono">{req.type}</div>
                  </div>
                  <button className="text-[#3b82f6] text-xs font-bold px-3 py-1.5 rounded-lg bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 transition-colors">
                    View Document
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-[#1e2532] flex items-center gap-4 text-xs font-bold text-[#586c8f]">
                  <span>Updated: {new Date(req.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
