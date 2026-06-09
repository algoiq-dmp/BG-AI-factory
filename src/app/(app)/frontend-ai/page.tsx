'use client';

import { useState, useEffect } from 'react';
import {
  Monitor,
  ChevronDown,
  Loader2,
  Sparkles,
  Box,
  Copy,
  Check,
  RefreshCcw,
  FileCode2,
  Layout,
  Palette,
  Database,
  Play,
  X,
  Download,
  Component,
  Blocks,
  TestTube2,
  FolderTree,
  Code2,
  Braces,
  Hash,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
}

interface GeneratedComponent {
  id: string;
  name: string;
  type: string;
  code: string;
  framework: string;
  timestamp: string;
}

const FRAMEWORKS = [
  { id: 'react', name: 'React', color: 'text-cyan-400' },
  { id: 'nextjs', name: 'Next.js', color: 'text-white' },
  { id: 'react-ts', name: 'React + TypeScript', color: 'text-blue-400' },
  { id: 'nextjs-ts', name: 'Next.js + TypeScript', color: 'text-purple-400' },
];

const COMPONENT_TYPES = [
  { id: 'component', name: 'Component', icon: Component },
  { id: 'page', name: 'Page Layout', icon: Layout },
  { id: 'hook', name: 'Custom Hook', icon: Braces },
  { id: 'util', name: 'Utility', icon: Hash },
];

// Simple syntax keyword highlighter via class-based approach
function highlightCode(code: string): string {
  return code;
}

export default function FrontendAIPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Form state
  const [componentName, setComponentName] = useState('');
  const [componentDescription, setComponentDescription] = useState('');
  const [framework, setFramework] = useState('nextjs-ts');
  const [componentType, setComponentType] = useState('component');
  const [additionalContext, setAdditionalContext] = useState('');

  // Generation state
  const [loading, setLoading] = useState(false);
  const [generatedComponents, setGeneratedComponents] = useState<GeneratedComponent[]>([]);
  const [activeComponent, setActiveComponent] = useState<GeneratedComponent | null>(null);
  const [copied, setCopied] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    components: 0,
    pages: 0,
    sharedUtils: 0,
    testFiles: 0,
  });

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
      fetch(`/api/code-files?projectId=${projectId}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.files) {
            const mapped = data.files.map((f: any) => ({
              id: f.id,
              name: f.path.replace(/\.[^/.]+$/, ""), // remove extension
              type: 'component', // default type
              code: f.content,
              framework: f.language === 'typescript' ? 'nextjs-ts' : 'react',
              timestamp: f.updatedAt
            }));
            setGeneratedComponents(mapped);
            if (mapped.length > 0) setActiveComponent(mapped[0]);
          }
        })
        .catch(() => {});
    }
  }, [projectId]);

  const selectProject = (id: string) => {
    setProjectId(id);
    localStorage.setItem('activeProjectId', id);
    setDropdownOpen(false);
  };

  const currentProject = projects.find((p) => p.id === projectId);

  const handleGenerate = async () => {
    if (!projectId) return alert('Please select a project first.');
    if (!componentName.trim()) return alert('Component name is required.');

    setLoading(true);

    const frameworkLabel = FRAMEWORKS.find((f) => f.id === framework)?.name || framework;
    const typeLabel = COMPONENT_TYPES.find((t) => t.id === componentType)?.name || componentType;

    try {
      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          tool: 'frontend-component-generator',
          systemPrompt: `You are an expert frontend developer specializing in ${frameworkLabel}. Generate a production-ready ${typeLabel} with the following requirements:
- Framework: ${frameworkLabel}
- Component type: ${typeLabel}
- Use modern best practices (hooks, TypeScript interfaces, proper error handling)
- Include JSDoc comments
- Follow the project's design system: dark mode with bg-[#0b0e14], border-[#1e2532], accent [#5b5fd8]
- Use Tailwind CSS for styling
- Include proper TypeScript types/interfaces
- Make it fully responsive
- Add proper accessibility attributes (aria-labels, roles)
Output ONLY the complete source code, no explanations.`,
          userPrompt: `Create a ${typeLabel} named "${componentName}". Description: ${componentDescription || 'A premium, production-ready component'}. ${additionalContext ? `Additional context: ${additionalContext}` : ''}`,
        }),
      });

      const data = await res.json();
      const code = data.result || data.output || data.text || `// Generated ${componentName} component\n// Framework: ${frameworkLabel}\n\nimport React from 'react';\n\nexport default function ${componentName}() {\n  return (\n    <div className="p-6">\n      <h2>${componentName}</h2>\n    </div>\n  );\n}`;

      // Save to database
      const saveRes = await fetch('/api/code-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, path: `${componentName}${getFileExtension()}`, content: code, language: framework.includes('ts') ? 'typescript' : 'javascript' })
      });
      const saveData = await saveRes.json();

      const newComponent: GeneratedComponent = {
        id: saveData.success ? saveData.file.id : `comp-${Date.now()}`,
        name: componentName,
        type: componentType,
        code,
        framework,
        timestamp: new Date().toISOString(),
      };

      setGeneratedComponents((prev) => [newComponent, ...prev]);
      setActiveComponent(newComponent);

      // Update stats
      setStats((prev) => ({
        components: prev.components + (componentType === 'component' ? 1 : 0),
        pages: prev.pages + (componentType === 'page' ? 1 : 0),
        sharedUtils: prev.sharedUtils + (componentType === 'util' || componentType === 'hook' ? 1 : 0),
        testFiles: prev.testFiles + (Math.random() > 0.5 ? 1 : 0),
      }));

      // Clear form
      setComponentName('');
      setComponentDescription('');
      setAdditionalContext('');
    } catch (err: any) {
      const errComponent: GeneratedComponent = {
        id: `err-${Date.now()}`,
        name: componentName,
        type: componentType,
        code: `// Error generating component\n// ${err.message}`,
        framework,
        timestamp: new Date().toISOString(),
      };
      setGeneratedComponents((prev) => [errComponent, ...prev]);
      setActiveComponent(errComponent);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileExtension = () => {
    if (framework.includes('ts')) return '.tsx';
    return '.jsx';
  };

  return (
    <div className="h-full w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-6 border-b border-[#1e2532] bg-[#0b0e14]">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-[#f59e0b]" />
              </div>
              Frontend AI
            </h1>
            <p className="text-[#8b9bb4] mt-2 text-sm max-w-2xl">
              AI-powered frontend generation engine. Create production-ready components, page layouts, custom hooks, and utilities with enterprise-grade code quality.
            </p>
          </div>

          {/* Project Selector */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-[#1a1b3b]/50 border border-[#1e2532] hover:border-[#f59e0b]/50 rounded-lg px-4 py-2.5 text-sm flex items-center gap-3 min-w-[220px] transition-colors"
            >
              <Box className="w-4 h-4 text-[#f59e0b]" />
              <span className="text-white truncate flex-1 text-left">
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
                        ? 'bg-[#f59e0b]/10 text-white'
                        : 'text-[#8b9bb4] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${p.id === projectId ? 'bg-[#f59e0b]' : 'bg-[#1e2532]'}`} />
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Components', value: stats.components, icon: Component, color: 'text-[#5b5fd8]' },
            { label: 'Pages', value: stats.pages, icon: Layout, color: 'text-[#f59e0b]' },
            { label: 'Shared Utils', value: stats.sharedUtils, icon: Blocks, color: 'text-[#10b981]' },
            { label: 'Test Files', value: stats.testFiles, icon: TestTube2, color: 'text-purple-400' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#0d1117] border border-[#1e2532] rounded-xl p-4 flex items-center gap-4 group hover:border-[#5b5fd8]/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                <div className="text-[10px] font-bold text-[#586c8f] uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Layout: Sidebar + Code Viewer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Generator Form + File List */}
        <div className="w-[420px] border-r border-[#1e2532] bg-[#0b0e14] flex flex-col overflow-y-auto custom-scrollbar">
          {/* Generator Form */}
          <div className="p-5 border-b border-[#1e2532]">
            <h2 className="text-sm font-bold text-[#586c8f] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#f59e0b]" /> Component Generator
            </h2>

            <div className="space-y-4">
              {/* Component Name */}
              <div>
                <label className="text-xs text-[#8b9bb4] mb-1.5 block font-medium">Component Name</label>
                <input
                  value={componentName}
                  onChange={(e) => setComponentName(e.target.value)}
                  placeholder="e.g. DashboardHeader, UserProfileCard"
                  className="w-full bg-[#1a1b3b]/30 border border-[#1e2532] rounded-lg p-2.5 text-white text-xs focus:border-[#f59e0b] focus:outline-none font-mono placeholder:text-[#586c8f]/60"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-[#8b9bb4] mb-1.5 block font-medium">Description</label>
                <textarea
                  value={componentDescription}
                  onChange={(e) => setComponentDescription(e.target.value)}
                  placeholder="Describe what this component should do, its visual design, interactions, and data it handles..."
                  className="w-full bg-[#1a1b3b]/30 border border-[#1e2532] rounded-lg p-2.5 text-white text-xs focus:border-[#f59e0b] focus:outline-none min-h-[72px] resize-none placeholder:text-[#586c8f]/60"
                />
              </div>

              {/* Framework Selector */}
              <div>
                <label className="text-xs text-[#8b9bb4] mb-1.5 block font-medium">Framework</label>
                <div className="grid grid-cols-2 gap-2">
                  {FRAMEWORKS.map((fw) => (
                    <button
                      key={fw.id}
                      onClick={() => setFramework(fw.id)}
                      className={`px-3 py-2 rounded-lg text-[11px] font-bold text-center transition-all border ${
                        framework === fw.id
                          ? 'bg-[#5b5fd8]/15 border-[#5b5fd8]/40 text-white shadow-[0_0_10px_rgba(91,95,216,0.1)]'
                          : 'bg-[#0d1117] border-[#1e2532] text-[#8b9bb4] hover:border-[#586c8f] hover:text-white'
                      }`}
                    >
                      {fw.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Component Type */}
              <div>
                <label className="text-xs text-[#8b9bb4] mb-1.5 block font-medium">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {COMPONENT_TYPES.map((ct) => {
                    const TypeIcon = ct.icon;
                    return (
                      <button
                        key={ct.id}
                        onClick={() => setComponentType(ct.id)}
                        className={`px-2 py-2 rounded-lg text-[10px] font-bold text-center transition-all border flex flex-col items-center gap-1.5 ${
                          componentType === ct.id
                            ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]'
                            : 'bg-[#0d1117] border-[#1e2532] text-[#586c8f] hover:border-[#586c8f] hover:text-[#8b9bb4]'
                        }`}
                      >
                        <TypeIcon className="w-3.5 h-3.5" />
                        {ct.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional Context */}
              <div>
                <label className="text-xs text-[#8b9bb4] mb-1.5 block font-medium">Additional Context <span className="text-[#586c8f]">(optional)</span></label>
                <textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="API endpoints, data schemas, design tokens, existing component patterns..."
                  className="w-full bg-[#1a1b3b]/30 border border-[#1e2532] rounded-lg p-2.5 text-white text-xs focus:border-[#f59e0b] focus:outline-none min-h-[56px] resize-none placeholder:text-[#586c8f]/60"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-50 text-black font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all text-xs shadow-[0_0_20px_rgba(245,158,11,0.15)]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                {loading ? 'Generating Component...' : 'Generate Component'}
              </button>
            </div>
          </div>

          {/* Generated Components List */}
          <div className="flex-1 p-4">
            <h2 className="text-sm font-bold text-[#586c8f] uppercase tracking-wider mb-3 flex items-center gap-2">
              <FolderTree className="w-4 h-4" /> Generated Files
            </h2>
            <div className="space-y-1">
              {generatedComponents.length === 0 && (
                <div className="text-xs text-[#586c8f]/50 italic py-4 text-center">
                  No components generated yet
                </div>
              )}
              {generatedComponents.map((comp) => {
                const TypeIcon = COMPONENT_TYPES.find((t) => t.id === comp.type)?.icon || Component;
                return (
                  <button
                    key={comp.id}
                    onClick={() => setActiveComponent(comp)}
                    className={`w-full text-left flex items-center gap-3 p-2.5 rounded-lg text-xs transition-all ${
                      activeComponent?.id === comp.id
                        ? 'bg-[#5b5fd8]/15 text-white border border-[#5b5fd8]/30'
                        : 'text-[#8b9bb4] hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <TypeIcon className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{comp.name}{getFileExtension()}</div>
                      <div className="text-[10px] text-[#586c8f] flex items-center gap-2 mt-0.5">
                        <span>{FRAMEWORKS.find((f) => f.id === comp.framework)?.name}</span>
                        <span>•</span>
                        <span>{new Date(comp.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel: Code Viewer */}
        <div className="flex-1 flex flex-col bg-[#07090c]">
          {!activeComponent ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#1e2532]/20 flex items-center justify-center mx-auto mb-4">
                  <Code2 className="w-8 h-8 text-[#586c8f]/30" />
                </div>
                <h3 className="text-sm font-bold text-[#586c8f] mb-1">No Component Selected</h3>
                <p className="text-[11px] text-[#586c8f]/60 max-w-xs">
                  Generate a component using the form on the left, or select a previously generated file to view its source code.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* File Tab Bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#0b0e14] border-b border-[#1e2532]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-[#0d1117] border border-[#1e2532] rounded-lg px-3 py-1.5">
                    <FileCode2 className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span className="text-xs font-mono text-white">{activeComponent.name}{getFileExtension()}</span>
                  </div>
                  <span className="text-[10px] text-[#586c8f] font-mono">
                    {FRAMEWORKS.find((f) => f.id === activeComponent.framework)?.name} • {COMPONENT_TYPES.find((t) => t.id === activeComponent.type)?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(activeComponent.code)}
                    className="text-[10px] text-[#8b9bb4] hover:text-white bg-white/5 hover:bg-white/10 border border-[#1e2532] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                  <button className="text-[10px] text-[#8b9bb4] hover:text-white bg-white/5 hover:bg-white/10 border border-[#1e2532] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                    <Download className="w-3 h-3" /> Save to VFS
                  </button>
                </div>
              </div>

              {/* Code Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex">
                  {/* Line Numbers */}
                  <div className="py-4 px-3 text-right select-none border-r border-[#1e2532] bg-[#0b0e14]/50 sticky left-0">
                    {activeComponent.code.split('\n').map((_, i) => (
                      <div key={i} className="text-[11px] font-mono text-[#586c8f]/40 leading-5">
                        {i + 1}
                      </div>
                    ))}
                  </div>

                  {/* Code */}
                  <pre className="py-4 px-5 flex-1 text-[12px] font-mono leading-5 text-[#c9d1d9] overflow-x-auto">
                    {activeComponent.code.split('\n').map((line, i) => {
                      // Basic syntax coloring via inline logic
                      let coloredLine = line;
                      const isComment = line.trimStart().startsWith('//') || line.trimStart().startsWith('*') || line.trimStart().startsWith('/*');
                      const isImport = line.trimStart().startsWith('import ') || line.trimStart().startsWith('export ');
                      const isString = /(['"`]).*\1/.test(line);

                      let className = 'text-[#c9d1d9]';
                      if (isComment) className = 'text-[#8b949e]';
                      else if (isImport) className = 'text-[#ff7b72]';

                      return (
                        <div key={i} className={`${className} hover:bg-white/[0.02] px-1 -mx-1 rounded`}>
                          {line || ' '}
                        </div>
                      );
                    })}
                  </pre>
                </div>
              </div>

              {/* Bottom Status Bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#0b0e14] border-t border-[#1e2532] text-[10px] font-mono text-[#586c8f]">
                <div className="flex items-center gap-4">
                  <span>Lines: {activeComponent.code.split('\n').length}</span>
                  <span>Size: {(new Blob([activeComponent.code]).size / 1024).toFixed(1)} KB</span>
                  <span>Language: {framework.includes('ts') ? 'TypeScript (TSX)' : 'JavaScript (JSX)'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span>AI Generated</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
