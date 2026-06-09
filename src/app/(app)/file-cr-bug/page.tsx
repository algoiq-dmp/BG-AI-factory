'use client';

import { useState } from 'react';
import {
  Bug, RefreshCcw, Rocket, Flame, Send, Upload, Info,
  AlertTriangle, CheckCircle2, Lightbulb, FileText, ChevronDown
} from 'lucide-react';

/** CR type definition */
interface CRType {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const crTypes: CRType[] = [
  { id: 'bug', label: 'Bug Report', icon: Bug, color: '#ef4444', bgColor: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)' },
  { id: 'change', label: 'Change Request', icon: RefreshCcw, color: '#3b82f6', bgColor: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.3)' },
  { id: 'feature', label: 'Feature Request', icon: Rocket, color: '#10b981', bgColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)' },
  { id: 'hotfix', label: 'Hotfix', icon: Flame, color: '#f97316', bgColor: 'rgba(249,115,22,0.12)', borderColor: 'rgba(249,115,22,0.3)' },
];

const priorities = [
  { id: 'low', label: 'Low', color: '#22c55e' },
  { id: 'medium', label: 'Medium', color: '#eab308' },
  { id: 'high', label: 'High', color: '#f97316' },
  { id: 'critical', label: 'Critical', color: '#ef4444' },
];

const affectedModules = [
  'Dashboard', 'Board', 'Pipeline', 'Architecture', 'Feature Engine',
  'Execution Studio', 'Code Review', 'Testing AI', 'Deployment',
  'Documentation AI', 'Frontend AI', 'Backend AI', 'Database AI',
  'Quality Dashboard', 'Monitoring', 'Risk Analyzer', 'Settings',
  'Prompt Compiler', 'Knowledgebase', 'Chat', 'Admin',
];

const guidelines = [
  { icon: AlertTriangle, color: '#eab308', title: 'Be Specific', desc: 'Describe the issue with exact steps, inputs, and expected vs actual results.' },
  { icon: CheckCircle2, color: '#10b981', title: 'Include Evidence', desc: 'Attach screenshots, logs, or screen recordings to help reproduce the issue.' },
  { icon: Lightbulb, color: '#3b82f6', title: 'Suggest Solutions', desc: 'If you have ideas on how to fix or implement, include them in the description.' },
  { icon: FileText, color: '#a855f7', title: 'Reference Docs', desc: 'Link related requirements, user stories, or specifications if available.' },
];

const inputStyle: React.CSSProperties = {
  backgroundColor: 'rgba(11,14,20,0.8)',
  border: '1px solid #1e2532',
  color: '#fff',
  borderRadius: '0.5rem',
  padding: '0.625rem 0.875rem',
  fontSize: '0.875rem',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.2s',
};

/**
 * File Change Request / Bug page.
 * Form for filing bug reports, change requests, feature requests, and hotfixes.
 */
export default function FileCRBugPage() {
  const [selectedType, setSelectedType] = useState('bug');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [affectedModule, setAffectedModule] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');

  const activeType = crTypes.find((t) => t.id === selectedType) || crTypes[0];

  return (
    <div className="h-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full overflow-y-auto">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${activeType.bgColor}, transparent)`,
            border: `1px solid ${activeType.borderColor}`,
          }}
        >
          <activeType.icon className="w-6 h-6" style={{ color: activeType.color }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">File Change Request</h1>
          <p className="text-[#8b9bb4] text-sm mt-1">
            Report bugs, request changes, or propose features
          </p>
        </div>
      </div>

      {/* Main Content: Form + Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 pb-8">

        {/* Left — Form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Type Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[#586c8f] mb-3 block">
              Request Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {crTypes.map((t) => {
                const isActive = selectedType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      backgroundColor: isActive ? t.bgColor : 'rgba(17,22,34,0.8)',
                      border: `1px solid ${isActive ? t.borderColor : '#1e2532'}`,
                      color: isActive ? t.color : '#8b9bb4',
                    }}
                  >
                    <t.icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[#586c8f] mb-2 block">
              Title
            </label>
            <input
              type="text"
              placeholder="Brief summary of the issue or request..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = activeType.color)}
              onBlur={(e) => (e.target.style.borderColor = '#1e2532')}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[#586c8f] mb-2 block">
              Description
            </label>
            <textarea
              placeholder="Provide a detailed description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' as const }}
              onFocus={(e) => (e.target.style.borderColor = activeType.color)}
              onBlur={(e) => (e.target.style.borderColor = '#1e2532')}
            />
          </div>

          {/* Priority + Module Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Priority */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[#586c8f] mb-3 block">
                Priority
              </label>
              <div className="flex gap-2">
                {priorities.map((p) => {
                  const isActive = selectedPriority === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPriority(p.id)}
                      className="flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200"
                      style={{
                        backgroundColor: isActive ? `${p.color}20` : 'rgba(17,22,34,0.8)',
                        border: `1px solid ${isActive ? `${p.color}66` : '#1e2532'}`,
                        color: isActive ? p.color : '#586c8f',
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Affected Module */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[#586c8f] mb-3 block">
                Affected Module
              </label>
              <div className="relative">
                <select
                  value={affectedModule}
                  onChange={(e) => setAffectedModule(e.target.value)}
                  style={{ ...inputStyle, appearance: 'none' as const, paddingRight: '2.5rem' }}
                >
                  <option value="">Select module...</option>
                  {affectedModules.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#586c8f' }} />
              </div>
            </div>
          </div>

          {/* Steps to Reproduce (Bug only) */}
          {selectedType === 'bug' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[#586c8f] mb-2 block">
                Steps to Reproduce
              </label>
              <textarea
                placeholder="1. Go to '...'\n2. Click on '...'\n3. Scroll down to '...'\n4. See error"
                value={stepsToReproduce}
                onChange={(e) => setStepsToReproduce(e.target.value)}
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' as const }}
                onFocus={(e) => (e.target.style.borderColor = '#ef4444')}
                onBlur={(e) => (e.target.style.borderColor = '#1e2532')}
              />
            </div>
          )}

          {/* Expected Behavior */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[#586c8f] mb-2 block">
              Expected Behavior
            </label>
            <textarea
              placeholder="What should happen instead?"
              value={expectedBehavior}
              onChange={(e) => setExpectedBehavior(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' as const }}
              onFocus={(e) => (e.target.style.borderColor = activeType.color)}
              onBlur={(e) => (e.target.style.borderColor = '#1e2532')}
            />
          </div>

          {/* Screenshots Upload Zone */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[#586c8f] mb-2 block">
              Screenshots / Attachments
            </label>
            <div
              className="rounded-xl p-8 text-center cursor-pointer transition-all duration-200 hover:border-[#586c8f]"
              style={{
                backgroundColor: 'rgba(11,14,20,0.6)',
                border: '2px dashed #1e2532',
              }}
            >
              <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: '#586c8f' }} />
              <p className="text-sm text-[#8b9bb4] font-medium">
                Drag & drop files here, or <span style={{ color: activeType.color }} className="font-bold cursor-pointer">browse</span>
              </p>
              <p className="text-xs mt-1" style={{ color: '#586c8f' }}>
                PNG, JPG, GIF, MP4 up to 10MB
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:brightness-110 hover:scale-[1.01]"
            style={{ backgroundColor: activeType.color }}
          >
            <Send className="w-4 h-4" />
            Submit Change Request
          </button>
        </div>

        {/* Right — Guidelines */}
        <div className="space-y-4">
          <div
            className="rounded-xl p-6"
            style={{
              backgroundColor: 'rgba(17,22,34,0.8)',
              border: '1px solid #1e2532',
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Info className="w-4 h-4" style={{ color: '#f97316' }} />
              <h3 className="text-sm font-bold text-white">CR Guidelines</h3>
            </div>
            <div className="space-y-4">
              {guidelines.map((g, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      backgroundColor: `${g.color}15`,
                      border: `1px solid ${g.color}30`,
                    }}
                  >
                    <g.icon className="w-4 h-4" style={{ color: g.color }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1">{g.title}</h4>
                    <p className="text-xs leading-relaxed" style={{ color: '#586c8f' }}>
                      {g.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div
            className="rounded-xl p-5"
            style={{
              backgroundColor: 'rgba(17,22,34,0.8)',
              border: '1px solid #1e2532',
            }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#586c8f' }}>
              Type Distribution
            </h3>
            {crTypes.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-xs text-[#8b9bb4]">{t.label}</span>
                </div>
                <span className="text-xs font-bold text-white">0</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
