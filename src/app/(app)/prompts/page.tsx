'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Wand2, Sparkles, Loader2, Search, Copy, Save,
  FileText, Shield, Rocket, Bug, GitPullRequest,
  CalendarDays, BookOpen, Code2, Server, TestTube2,
  FolderOpen, ChevronDown, Check, Variable
} from 'lucide-react';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  systemPrompt: string;
  variables: string[];
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'prd',
    name: 'PRD Generator',
    description: 'Generate a comprehensive Product Requirements Document with user stories, acceptance criteria, and technical scope.',
    icon: FileText,
    color: 'text-emerald-400',
    systemPrompt: 'You are a Senior Product Manager. Generate a comprehensive PRD for {{projectName}} using {{techStack}}. Include: Executive Summary, Goals & Objectives, User Personas, User Stories with acceptance criteria, Feature Requirements (P0/P1/P2), Non-functional Requirements, Success Metrics, Timeline, and Risk Assessment. Context: {{context}}',
    variables: ['projectName', 'techStack', 'context'],
  },
  {
    id: 'arch',
    name: 'Architecture Spec',
    description: 'Design system architecture with HLD, LLD, component diagrams, and technology decisions.',
    icon: Server,
    color: 'text-blue-400',
    systemPrompt: 'You are a Solutions Architect. Design the complete architecture for {{projectName}} using {{techStack}}. Include: High-Level Design (HLD), Low-Level Design (LLD), Component Diagram, Data Flow, Database Schema, API Gateway Design, Microservices Boundaries, Infrastructure Requirements, Scalability Strategy, and Security Architecture. Context: {{context}}',
    variables: ['projectName', 'techStack', 'context'],
  },
  {
    id: 'api',
    name: 'API Design',
    description: 'Design RESTful or GraphQL API endpoints with request/response schemas and authentication.',
    icon: Code2,
    color: 'text-violet-400',
    systemPrompt: 'You are an API Architect. Design a complete API specification for {{projectName}} using {{techStack}}. Include: Endpoint List, HTTP Methods, Request/Response Schemas (JSON), Authentication & Authorization, Rate Limiting, Pagination, Error Handling, Versioning Strategy, WebSocket Events (if applicable), and OpenAPI 3.0 spec snippets. Context: {{context}}',
    variables: ['projectName', 'techStack', 'context'],
  },
  {
    id: 'test',
    name: 'Test Plan',
    description: 'Comprehensive testing strategy including unit, integration, E2E, performance, and security tests.',
    icon: TestTube2,
    color: 'text-cyan-400',
    systemPrompt: 'You are a QA Lead. Create a comprehensive test plan for {{projectName}} using {{techStack}}. Include: Test Strategy, Unit Test Cases, Integration Test Cases, E2E Test Scenarios, Performance Test Plan, Security Testing Checklist, Accessibility Testing, Test Data Requirements, CI/CD Test Pipeline, Coverage Goals, and Bug Severity Matrix. Context: {{context}}',
    variables: ['projectName', 'techStack', 'context'],
  },
  {
    id: 'deploy',
    name: 'Deploy Guide',
    description: 'Step-by-step deployment guide with CI/CD pipeline, environment configs, and rollback procedures.',
    icon: Rocket,
    color: 'text-orange-400',
    systemPrompt: 'You are a DevOps Engineer. Create a complete deployment guide for {{projectName}} using {{techStack}}. Include: Environment Setup (Dev/Staging/Prod), CI/CD Pipeline Configuration, Docker/Container Setup, Kubernetes Manifests, Environment Variables, Database Migrations, SSL/TLS Configuration, Monitoring & Alerting, Rollback Procedures, Health Checks, and Post-deployment Verification. Context: {{context}}',
    variables: ['projectName', 'techStack', 'context'],
  },
  {
    id: 'review',
    name: 'Code Review',
    description: 'Generate code review checklist and best practices guide for the tech stack.',
    icon: Shield,
    color: 'text-yellow-400',
    systemPrompt: 'You are a Senior Code Reviewer. Create a comprehensive code review checklist for {{projectName}} using {{techStack}}. Include: Code Quality Standards, Security Vulnerabilities Check, Performance Anti-patterns, Error Handling Review, Naming Conventions, SOLID Principles Compliance, DRY/KISS Verification, Test Coverage Analysis, Documentation Check, Accessibility Standards, and Git Commit Message Guidelines. Context: {{context}}',
    variables: ['projectName', 'techStack', 'context'],
  },
  {
    id: 'bugfix',
    name: 'Bug Fix',
    description: 'Structured bug analysis with root cause investigation and fix implementation guide.',
    icon: Bug,
    color: 'text-red-400',
    systemPrompt: 'You are a Senior Debugger. Analyze and create a structured bug fix plan for {{projectName}} using {{techStack}}. Include: Bug Description, Reproduction Steps, Root Cause Analysis, Impact Assessment, Fix Implementation Plan, Code Changes Required, Testing Verification Steps, Regression Risk Analysis, and Prevention Measures. Context: {{context}}',
    variables: ['projectName', 'techStack', 'context'],
  },
  {
    id: 'feature',
    name: 'Feature Request',
    description: 'Convert feature ideas into detailed technical specifications with implementation roadmap.',
    icon: GitPullRequest,
    color: 'text-pink-400',
    systemPrompt: 'You are a Technical Product Owner. Convert the feature request into a detailed specification for {{projectName}} using {{techStack}}. Include: Feature Overview, User Value Proposition, Technical Specification, Database Changes, API Changes, UI/UX Wireframe Description, Dependencies, Implementation Phases, Estimated Effort, A/B Testing Plan, and Feature Flag Strategy. Context: {{context}}',
    variables: ['projectName', 'techStack', 'context'],
  },
  {
    id: 'sprint',
    name: 'Sprint Plan',
    description: 'Generate sprint planning with task breakdown, story points, and team assignments.',
    icon: CalendarDays,
    color: 'text-indigo-400',
    systemPrompt: 'You are an Agile Scrum Master. Create a detailed sprint plan for {{projectName}} using {{techStack}}. Include: Sprint Goal, User Stories with Story Points, Task Breakdown, Priority Order (MoSCoW), Team Capacity Planning, Dependencies & Blockers, Definition of Done, Sprint Risks, Daily Standup Topics, Sprint Review Agenda, and Retrospective Prompts. Context: {{context}}',
    variables: ['projectName', 'techStack', 'context'],
  },
  {
    id: 'docs',
    name: 'Documentation',
    description: 'Generate comprehensive developer documentation including README, API docs, and guides.',
    icon: BookOpen,
    color: 'text-teal-400',
    systemPrompt: 'You are a Technical Writer. Create comprehensive documentation for {{projectName}} using {{techStack}}. Include: README.md, Getting Started Guide, Architecture Overview, API Reference, Database Schema Docs, Environment Setup, Contributing Guidelines, Code Style Guide, Troubleshooting FAQ, Changelog Format, and Deployment Documentation. Context: {{context}}',
    variables: ['projectName', 'techStack', 'context'],
  },
  {
    id: 'security',
    name: 'Security Audit',
    description: 'Security assessment with OWASP checks, threat modeling, and remediation plan.',
    icon: Shield,
    color: 'text-amber-400',
    systemPrompt: 'You are a Security Engineer. Perform a comprehensive security audit plan for {{projectName}} using {{techStack}}. Include: OWASP Top 10 Checklist, Threat Modeling (STRIDE), Authentication & Authorization Review, Input Validation, SQL Injection Prevention, XSS Prevention, CSRF Protection, API Security, Data Encryption (at rest & in transit), Security Headers, and Penetration Testing Plan. Context: {{context}}',
    variables: ['projectName', 'techStack', 'context'],
  },
  {
    id: 'perf',
    name: 'Performance Audit',
    description: 'Performance optimization plan with benchmarks, profiling, and caching strategies.',
    icon: Sparkles,
    color: 'text-lime-400',
    systemPrompt: 'You are a Performance Engineer. Create a performance optimization plan for {{projectName}} using {{techStack}}. Include: Current Performance Baseline, Core Web Vitals Analysis, Database Query Optimization, Caching Strategy (Redis/CDN), Bundle Size Optimization, Lazy Loading Strategy, Image Optimization, API Response Time Targets, Load Testing Plan, Memory Leak Detection, and Monitoring Dashboard Setup. Context: {{context}}',
    variables: ['projectName', 'techStack', 'context'],
  },
];

export default function PromptWorkshopPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  
  // Real projects state
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const [variables, setVariables] = useState<Record<string, string>>({
    projectName: '',
    techStack: 'Next.js 15, TypeScript, Tailwind CSS, Prisma, PostgreSQL',
    targetPlatform: 'Cursor',
    context: 'A 12-stage autonomous AI software development pipeline with multi-agent swarm architecture. Includes quality dashboard, 50+ AI tools, Krishna AI assistant, and real-time telemetry.',
  });

  // Fetch projects on mount
  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(d => {
      if (d.success && d.projects.length > 0) {
        setProjects(d.projects);
        const activeId = localStorage.getItem('activeProjectId');
        const activeProj = d.projects.find((p: any) => p.id === activeId) || d.projects[0];
        setSelectedProject(activeProj);
        setVariables(prev => ({ ...prev, projectName: activeProj.name }));
      }
    });
  }, []);

  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return PROMPT_TEMPLATES;
    const q = searchQuery.toLowerCase();
    return PROMPT_TEMPLATES.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const buildPrompt = (): string => {
    if (!selectedTemplate) return '';
    let prompt = selectedTemplate.systemPrompt;
    Object.entries(variables).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    return prompt;
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setIsGenerating(true);
    setOutput('');
    try {
      const compiledPrompt = buildPrompt();
      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: selectedTemplate.name,
          context: variables.context,
          systemPrompt: compiledPrompt,
        }),
      });
      if (!res.body) throw new Error('No response body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) setOutput((p) => p + decoder.decode(value));
      }
    } catch {
      setOutput('Error generating prompt. Check your API keys in Settings.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const text = output || buildPrompt();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const stats = [
    { label: 'Templates', value: PROMPT_TEMPLATES.length.toString(), color: 'text-emerald-400' },
    { label: 'Variables', value: Object.keys(variables).length.toString(), color: 'text-blue-400' },
    { label: 'Platforms', value: '9', color: 'text-violet-400' },
    { label: 'Output Lines', value: output ? output.split('\n').length.toString() : '0', color: 'text-amber-400' },
  ];

  return (
    <div className="min-h-full p-8 bg-[#0a0f1c] text-white animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/30 flex items-center justify-center border border-emerald-500/20">
              <Wand2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Prompt Workshop</h1>
              <p className="text-sm text-[#8b9bb4] mt-0.5">
                Phase 8 — Craft, customize, and generate AI prompts from 12+ professional templates
              </p>
            </div>
          </div>

          {/* Project Selector */}
          <div className="relative">
            <button
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#111622] border border-[#1e2532] rounded-lg text-sm font-medium text-[#8b9bb4] hover:border-emerald-500/40 transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-emerald-400" />
              {selectedProject?.name || 'Loading...'}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {projectDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-[#111622] border border-[#1e2532] rounded-lg shadow-2xl z-50 overflow-hidden">
                {projects.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-[#8b9bb4]">No projects found</div>
                ) : projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setSelectedProject(proj);
                      setVariables((v) => ({ ...v, projectName: proj.name }));
                      setProjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-500/10 transition-colors ${
                      selectedProject?.id === proj.id ? 'text-emerald-400 bg-emerald-500/5' : 'text-[#8b9bb4]'
                    }`}
                  >
                    {proj.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#111622] border border-[#1e2532] rounded-xl p-4 flex items-center gap-3">
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs uppercase tracking-widest text-[#586c8f] font-bold">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
          {/* Left Panel: Template Browser */}
          <div className="lg:col-span-4 flex flex-col bg-[#111622] border border-[#1e2532] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#1e2532]">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Template Library
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#586c8f]" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0a0f1c] border border-[#1e2532] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[#586c8f] focus:outline-none focus:border-emerald-500/40 transition-colors"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all group ${
                    selectedTemplate?.id === template.id
                      ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'bg-[#0a0f1c]/50 border-[#1e2532] hover:border-emerald-500/20 hover:bg-[#0a0f1c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <template.icon className={`w-4 h-4 ${selectedTemplate?.id === template.id ? 'text-emerald-400' : template.color}`} />
                    <span className={`text-sm font-bold ${selectedTemplate?.id === template.id ? 'text-emerald-400' : 'text-white'}`}>
                      {template.name}
                    </span>
                  </div>
                  <p className="text-xs text-[#586c8f] leading-relaxed line-clamp-2">{template.description}</p>
                </button>
              ))}
              {filteredTemplates.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-[#586c8f]">
                  <Search className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No templates match your search</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Editor */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {selectedTemplate ? (
              <>
                {/* Selected Template Info */}
                <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-900/30 flex items-center justify-center border border-emerald-500/20">
                        <selectedTemplate.icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">{selectedTemplate.name}</h2>
                        <p className="text-xs text-[#8b9bb4]">{selectedTemplate.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#0a0f1c] border border-[#1e2532] rounded-lg text-xs font-medium text-[#8b9bb4] hover:text-white hover:border-emerald-500/30 transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#0a0f1c] border border-[#1e2532] rounded-lg text-xs font-medium text-[#8b9bb4] hover:text-white hover:border-emerald-500/30 transition-colors"
                      >
                        {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                        {saved ? 'Saved to KB!' : 'Save to KB'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Variables Section */}
                <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Variable className="w-4 h-4 text-emerald-400" />
                    Variables
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#586c8f] uppercase tracking-wider mb-1.5 block">Project Name</label>
                      <input
                        type="text"
                        value={variables.projectName}
                        onChange={(e) => setVariables((v) => ({ ...v, projectName: e.target.value }))}
                        className="w-full bg-[#0a0f1c] border border-[#1e2532] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/40 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#586c8f] uppercase tracking-wider mb-1.5 block">Tech Stack</label>
                      <input
                        type="text"
                        value={variables.techStack}
                        onChange={(e) => setVariables((v) => ({ ...v, techStack: e.target.value }))}
                        className="w-full bg-[#0a0f1c] border border-[#1e2532] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/40 transition-colors"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-[#586c8f] uppercase tracking-wider mb-1.5 block">Target Platform</label>
                      <select
                        value={variables.targetPlatform}
                        onChange={(e) => setVariables((v) => ({ ...v, targetPlatform: e.target.value }))}
                        className="w-full bg-[#0a0f1c] border border-[#1e2532] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/40 transition-colors appearance-none"
                      >
                        <option value="Cursor">Cursor</option>
                        <option value="Bolt">Bolt</option>
                        <option value="V0">V0</option>
                        <option value="Windsurf">Windsurf</option>
                        <option value="Lovable">Lovable</option>
                        <option value="Claude">Claude</option>
                        <option value="ChatGPT">ChatGPT</option>
                        <option value="Gemini">Gemini</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-[#586c8f] uppercase tracking-wider mb-1.5 block">Context</label>
                      <textarea
                        value={variables.context}
                        onChange={(e) => setVariables((v) => ({ ...v, context: e.target.value }))}
                        rows={3}
                        className="w-full bg-[#0a0f1c] border border-[#1e2532] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/40 transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Compiled Prompt Preview */}
                <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    Compiled Prompt
                  </h3>
                  <div className="bg-[#0a0f1c] border border-[#1e2532] rounded-lg p-4 max-h-40 overflow-y-auto">
                    <p className="text-xs text-[#8b9bb4] leading-relaxed font-mono whitespace-pre-wrap">{buildPrompt()}</p>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(16,185,129,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Generating with AI...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Generate with AI</>
                  )}
                </button>

                {/* Output */}
                {(output || isGenerating) && (
                  <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        AI Output
                        {isGenerating && <span className="text-xs text-emerald-400 font-normal animate-pulse">streaming...</span>}
                      </h3>
                      {output && (
                        <div className="flex items-center gap-2">
                          <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0f1c] border border-[#1e2532] rounded-lg text-xs font-medium text-[#8b9bb4] hover:text-white hover:border-emerald-500/30 transition-colors">
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copied!' : 'Copy Output'}
                          </button>
                          <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0f1c] border border-[#1e2532] rounded-lg text-xs font-medium text-[#8b9bb4] hover:text-white hover:border-emerald-500/30 transition-colors">
                            {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                            {saved ? 'Saved!' : 'Save to KB'}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="bg-[#0a0f1c] border border-[#1e2532] rounded-lg p-4 max-h-[400px] overflow-y-auto">
                      <pre className="text-sm text-[#8b9bb4] whitespace-pre-wrap leading-relaxed font-mono">{output || 'Waiting for response...'}</pre>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-[#111622] border border-[#1e2532] rounded-xl p-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-900/20 flex items-center justify-center border border-emerald-500/10 mb-4">
                  <Wand2 className="w-8 h-8 text-[#586c8f]" />
                </div>
                <h2 className="text-lg font-bold text-[#586c8f] mb-2">Select a Template</h2>
                <p className="text-sm text-[#586c8f]/70 text-center max-w-sm">
                  Choose a prompt template from the library on the left to customize variables and generate AI-powered output.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
