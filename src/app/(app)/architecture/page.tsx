'use client';

import { useState, useEffect } from 'react';
import { MarkdownViewer } from '@/components/ui/MarkdownViewer';
import {
  PenTool,
  Database,
  Globe,
  Settings,
  ChevronDown,
  Loader2,
  Copy,
  Check,
  Sparkles,
  Box,
  FileCode2,
  RefreshCcw
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
}

interface ArchTab {
  id: string;
  label: string;
  icon: any;
  iconColor: string;
  systemPrompt: string;
  placeholder: string;
}

const TABS: ArchTab[] = [
  {
    id: 'hld',
    label: 'HLD',
    icon: PenTool,
    iconColor: 'text-[#f59e0b]',
    systemPrompt: 'You are a senior solution architect. Generate a comprehensive High-Level Design (HLD) document including: component diagram, data flow, service boundaries, and communication patterns. Output in clean markdown with ASCII diagrams or mermaid syntax.',
    placeholder: 'Describe your system requirements, expected load, and key features to generate an HLD...',
  },
  {
    id: 'lld',
    label: 'LLD',
    icon: Settings,
    iconColor: 'text-[#8b9bb4]',
    systemPrompt: 'You are a senior technical lead. Generate a Low-Level Design (LLD) document including internal component logic, class structures, design patterns, and module interfaces in markdown.',
    placeholder: 'Describe the specific module or component you need an LLD for...',
  },
  {
    id: 'db-schema',
    label: 'DB Schema',
    icon: Database,
    iconColor: 'text-[#10b981]',
    systemPrompt: 'You are a database architect. Generate a complete database schema design including: ERD (mermaid), table schemas, primary/foreign keys, and indexes.',
    placeholder: 'Describe your data entities and relationships...',
  },
  {
    id: 'api-spec',
    label: 'API Spec',
    icon: Globe,
    iconColor: 'text-blue-400',
    systemPrompt: 'You are an API architect. Generate a complete RESTful API specification including endpoints, request/response schemas, and auth flows.',
    placeholder: 'Describe your API resources and endpoints...',
  }
];

export default function ArchitectureAIPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('hld');
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [generatingTab, setGeneratingTab] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('activeProjectId');
    if (stored) setProjectId(stored);

    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        if (data.projects) setProjects(data.projects);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (projectId) {
      fetch(`/api/documents?projectId=${projectId}`)
        .then(r => r.json())
        .then(d => {
          if (d.success && d.project && d.project.documents) {
            const newOutputs: Record<string, string> = {};
            d.project.documents.forEach((doc: any) => {
              if (doc.type === 'ARCHITECTURE') {
                newOutputs[doc.title] = doc.content || '';
              }
            });
            setOutputs(newOutputs);
          }
        });
    }
  }, [projectId]);

  const selectProject = (id: string) => {
    setProjectId(id);
    localStorage.setItem('activeProjectId', id);
    setDropdownOpen(false);
  };

  const currentProject = projects.find((p) => p.id === projectId);
  const activeTabData = TABS.find(t => t.id === activeTab)!;
  const hasOutput = !!outputs[activeTab];

  const handleGenerate = async () => {
    if (!projectId) return alert('Please select a project first from the top right.');
    setLoading(true);
    setGeneratingTab(activeTab);
    
    // Clear current output for this tab
    setOutputs(prev => ({ ...prev, [activeTab]: '' }));

    try {
      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          task: `Generate ${activeTabData.label}`,
          context: userInput || activeTabData.placeholder,
          systemPrompt: activeTabData.systemPrompt,
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let finalContent = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          finalContent += chunk;
          setOutputs((prev) => ({ ...prev, [activeTab]: (prev[activeTab] || '') + chunk }));
        }
      }

      // Save to database once complete
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, title: activeTab, type: 'ARCHITECTURE', content: finalContent })
      });

    } catch (err: any) {
      setOutputs((prev) => ({ ...prev, [activeTab]: `Error: ${err.message}` }));
    } finally {
      setLoading(false);
      setGeneratingTab(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#5b5fd8]/10 border border-[#5b5fd8]/30 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6 text-[#5b5fd8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Solution Architect</h1>
            <p className="text-[#8b9bb4] text-sm mt-1">
              AI-generated architecture documents using Vishwakarma Mode
            </p>
          </div>
        </div>

        {/* Project Selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-[#1a1b3b]/50 border border-[#1e2532] hover:border-[#5b5fd8]/50 rounded-lg px-4 py-2.5 text-sm flex items-center gap-3 min-w-[220px] transition-colors"
          >
            <Box className="w-4 h-4 text-[#5b5fd8]" />
            <span className="text-white truncate flex-1 text-left font-bold">
              {currentProject?.name || 'Select Project'}
            </span>
            <ChevronDown className={`w-4 h-4 text-[#586c8f] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-full bg-[#0f1219] border border-[#1e2532] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {projects.length === 0 && (
                <div className="p-4 text-xs text-[#586c8f] text-center">No projects found</div>
              )}
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectProject(p.id)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3 ${
                    p.id === projectId
                      ? 'bg-[#5b5fd8]/10 text-white'
                      : 'text-[#8b9bb4] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${p.id === projectId ? 'bg-[#5b5fd8]' : 'bg-[#1e2532]'}`} />
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 bg-[#0b0e14] border border-[#1e2532] p-1.5 rounded-xl w-fit">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;
          const isGen = generatingTab === tab.id;
          const hasDoc = !!outputs[tab.id] && !isGen;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-[#1a1b3b] text-white shadow-sm border border-[#5b5fd8]/20' 
                  : 'text-[#8b9bb4] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {isGen ? <Loader2 className={`w-4 h-4 animate-spin ${tab.iconColor}`} /> : <TabIcon className={`w-4 h-4 ${isActive ? tab.iconColor : 'text-[#586c8f]'}`} />}
              {tab.label}
              {hasDoc && <Check className="w-3.5 h-3.5 text-[#10b981] ml-1" />}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-[#0b0e14] border border-[#1e2532] rounded-2xl flex flex-col relative overflow-hidden">
        
        {/* Loading Overlay */}
        {generatingTab === activeTab && (
          <div className="absolute inset-0 z-20 bg-[#0b0e14]/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
            <Loader2 className={`w-12 h-12 animate-spin mb-4 ${activeTabData.iconColor}`} />
            <h2 className="text-xl font-bold text-white">Generating {activeTabData.label}...</h2>
            <p className="text-[#8b9bb4] text-sm mt-2">Vishwakarma Mode is designing your architecture</p>
          </div>
        )}

        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {!hasOutput && !loading ? (
            <div className="flex flex-col h-full items-center justify-center max-w-xl mx-auto text-center">
              <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-[#1e2532] flex items-center justify-center mb-6`}>
                <activeTabData.icon className={`w-8 h-8 ${activeTabData.iconColor}`} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Generate {activeTabData.label} Document</h2>
              <p className="text-[#8b9bb4] text-sm mb-8">{activeTabData.systemPrompt.split('.')[1]}.</p>
              
              <div className="w-full bg-[#111622] border border-[#1e2532] rounded-xl p-2 relative shadow-lg">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={activeTabData.placeholder}
                  className="w-full bg-transparent text-white text-sm p-3 focus:outline-none resize-none min-h-[100px] placeholder:text-[#586c8f]"
                />
                <div className="flex justify-end p-2 border-t border-[#1e2532]/50 mt-2">
                  <button
                    onClick={handleGenerate}
                    className="bg-[#5b5fd8] hover:bg-[#4a4fcf] text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(91,95,216,0.3)]"
                  >
                    <Sparkles className="w-4 h-4" /> Generate {activeTabData.label}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-2 text-sm font-mono text-[#586c8f] bg-[#111622] px-3 py-1.5 rounded-lg border border-[#1e2532]">
                  <FileCode2 className="w-4 h-4" /> {activeTab.toLowerCase()}.md
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(outputs[activeTab])}
                    className="text-xs text-[#8b9bb4] hover:text-white bg-[#111622] hover:bg-[#1a1b3b] border border-[#1e2532] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-bold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => { setOutputs(p => ({...p, [activeTab]: ''})); setUserInput(''); }}
                    className="text-xs text-[#8b9bb4] hover:text-white bg-[#111622] hover:bg-[#1a1b3b] border border-[#1e2532] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-bold"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" /> Regenerate
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-[#111622] border border-[#1e2532] rounded-xl relative">
                 <MarkdownViewer content={outputs[activeTab] || ''} />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Needed imports workaround
import { Layers } from 'lucide-react';
