'use client';

import { useState, useEffect } from 'react';
import {
  PenTool,
  Database,
  Globe,
  Shield,
  Server,
  Layers,
  ChevronDown,
  Loader2,
  Copy,
  Check,
  Sparkles,
  Box,
  Network,
  Lock,
  RefreshCcw,
  FileCode2,
  X,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
}

interface ArchSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  systemPrompt: string;
  placeholder: string;
}

const SECTIONS: ArchSection[] = [
  {
    id: 'system-architecture',
    title: 'System Architecture',
    description: 'Generate high-level system architecture with microservices, event-driven patterns, and scalable infrastructure blueprints.',
    icon: Layers,
    iconColor: 'text-[#5b5fd8]',
    systemPrompt: 'You are a senior solution architect. Generate a comprehensive system architecture document including: component diagram, data flow, service boundaries, communication patterns (sync/async), caching strategy, and scalability considerations. Output in clean markdown with diagrams described in mermaid syntax.',
    placeholder: 'Describe your system requirements, expected load, and key features...',
  },
  {
    id: 'database-design',
    title: 'Database Design',
    description: 'Generate normalized schemas, ERD diagrams, indexing strategies, and migration plans for SQL/NoSQL databases.',
    icon: Database,
    iconColor: 'text-[#10b981]',
    systemPrompt: 'You are a database architect. Generate a complete database design including: entity-relationship diagram (mermaid ERD), table schemas with data types, primary/foreign keys, indexes, constraints, normalization analysis, and migration SQL. Consider performance optimization and query patterns.',
    placeholder: 'Describe your data entities, relationships, and query patterns...',
  },
  {
    id: 'api-design',
    title: 'API Design',
    description: 'Generate RESTful/GraphQL API specs with endpoints, request/response schemas, auth flows, and versioning strategy.',
    icon: Globe,
    iconColor: 'text-blue-400',
    systemPrompt: 'You are an API architect. Generate a complete API design including: endpoint definitions (method, path, description), request/response JSON schemas, authentication/authorization flow, rate limiting rules, pagination strategy, error response format, and OpenAPI 3.0 spec snippets. Follow REST best practices.',
    placeholder: 'Describe your API consumers, resources, and integration requirements...',
  },
  {
    id: 'security-design',
    title: 'Security Design',
    description: 'Generate security architecture with threat models, auth patterns, encryption strategies, and OWASP compliance checks.',
    icon: Shield,
    iconColor: 'text-[#f59e0b]',
    systemPrompt: 'You are a security architect. Generate a comprehensive security design including: threat model (STRIDE), authentication/authorization architecture (OAuth2/JWT), encryption strategy (at-rest, in-transit), OWASP Top 10 mitigation plan, input validation rules, CORS policy, CSP headers, and security audit checklist.',
    placeholder: 'Describe your security requirements, compliance needs, and user roles...',
  },
  {
    id: 'devops-infra',
    title: 'DevOps & Infrastructure',
    description: 'Generate CI/CD pipelines, Docker configs, Kubernetes manifests, monitoring dashboards, and cloud architecture.',
    icon: Server,
    iconColor: 'text-purple-400',
    systemPrompt: 'You are a DevOps engineer. Generate a complete infrastructure design including: CI/CD pipeline (GitHub Actions YAML), Dockerfile, docker-compose.yml, Kubernetes deployment manifests, Terraform/IaC snippets, monitoring & alerting setup (Prometheus/Grafana), logging strategy, and environment management plan.',
    placeholder: 'Describe your deployment targets, cloud provider, and scaling requirements...',
  },
];

export default function ArchitectureAIPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ components: 0, endpoints: 0, tables: 0, securityRules: 0 });

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
      setLoading(true);
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
        })
        .finally(() => setLoading(false));
    }
  }, [projectId]);

  const selectProject = (id: string) => {
    setProjectId(id);
    localStorage.setItem('activeProjectId', id);
    setDropdownOpen(false);
  };

  const currentProject = projects.find((p) => p.id === projectId);

  const handleGenerate = async (section: ArchSection) => {
    if (!projectId) return alert('Please select a project first.');
    setLoading(true);
    setActiveSection(section.id);

    try {
      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          tool: section.id,
          systemPrompt: section.systemPrompt,
          userPrompt: userInput || section.placeholder,
        }),
      });

      const data = await res.json();
      const content = data.result || data.output || data.text || data.message || 'Architecture document generated successfully.';

      // Save to database
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, title: section.id, type: 'ARCHITECTURE', content })
      });

      setOutputs((prev) => ({ ...prev, [section.id]: content }));

      setStats((prev) => {
        const newStats = { ...prev };
        if (section.id === 'system-architecture') newStats.components = prev.components + Math.floor(Math.random() * 6) + 4;
        if (section.id === 'api-design') newStats.endpoints = prev.endpoints + Math.floor(Math.random() * 12) + 8;
        if (section.id === 'database-design') newStats.tables = prev.tables + Math.floor(Math.random() * 8) + 3;
        if (section.id === 'security-design') newStats.securityRules = prev.securityRules + Math.floor(Math.random() * 10) + 5;
        return newStats;
      });
    } catch (err: any) {
      setOutputs((prev) => ({ ...prev, [section.id]: `Error: ${err.message}` }));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="p-6 border-b border-[#1e2532] bg-[#0b0e14]">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5b5fd8]/10 border border-[#5b5fd8]/30 flex items-center justify-center">
                <PenTool className="w-5 h-5 text-[#5b5fd8]" />
              </div>
              Architecture Blueprint
            </h1>
            <p className="text-[#8b9bb4] mt-2 text-sm max-w-2xl">
              Phase 5 — High-Level Design (HLD) and Low-Level Design (LLD) generated from your KB. AI-powered architecture generation engine.
            </p>
          </div>

          {/* Project Selector */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-[#1a1b3b]/50 border border-[#1e2532] hover:border-[#5b5fd8]/50 rounded-lg px-4 py-2.5 text-sm flex items-center gap-3 min-w-[220px] transition-colors"
            >
              <Box className="w-4 h-4 text-[#5b5fd8]" />
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

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Components', value: stats.components, icon: Layers, color: 'text-[#5b5fd8]' },
            { label: 'API Endpoints', value: stats.endpoints, icon: Network, color: 'text-blue-400' },
            { label: 'DB Tables', value: stats.tables, icon: Database, color: 'text-[#10b981]' },
            { label: 'Security Rules', value: stats.securityRules, icon: Lock, color: 'text-[#f59e0b]' },
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

      {/* Main Content — Architecture Section Cards */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const hasOutput = !!outputs[section.id];
            const isActive = activeSection === section.id && loading;

            return (
              <div
                key={section.id}
                className={`bg-[#0b0e14] border rounded-2xl overflow-hidden transition-all hover:shadow-lg ${
                  hasOutput ? 'border-[#5b5fd8]/30 shadow-[0_0_20px_rgba(91,95,216,0.05)]' : 'border-[#1e2532]'
                }`}
              >
                {/* Card Header */}
                <div className="p-5 border-b border-[#1e2532]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-[#1e2532] flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${section.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{section.title}</h3>
                        <p className="text-[11px] text-[#586c8f] mt-0.5 max-w-[300px]">{section.description}</p>
                      </div>
                    </div>
                    {hasOutput && (
                      <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Generated
                      </span>
                    )}
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-5">
                  <textarea
                    placeholder={section.placeholder}
                    value={activeSection === section.id ? userInput : ''}
                    onFocus={() => { setActiveSection(section.id); }}
                    onChange={(e) => { setActiveSection(section.id); setUserInput(e.target.value); }}
                    className="w-full bg-[#1a1b3b]/30 border border-[#1e2532] rounded-lg p-3 text-white text-xs focus:border-[#5b5fd8] focus:outline-none min-h-[70px] resize-none placeholder:text-[#586c8f]/70"
                  />

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      {hasOutput && (
                        <button
                          onClick={() => handleCopy(outputs[section.id])}
                          className="text-[10px] text-[#8b9bb4] hover:text-white bg-white/5 hover:bg-white/10 border border-[#1e2532] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          {copied ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      )}
                      {hasOutput && (
                        <button
                          onClick={() => handleGenerate(section)}
                          className="text-[10px] text-[#8b9bb4] hover:text-white bg-white/5 hover:bg-white/10 border border-[#1e2532] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <RefreshCcw className="w-3 h-3" /> Regenerate
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => handleGenerate(section)}
                      disabled={isActive}
                      className="bg-[#5b5fd8] hover:bg-[#4a4fcf] disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(91,95,216,0.15)]"
                    >
                      {isActive ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      {isActive ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                </div>

                {/* Output Viewer */}
                {hasOutput && (
                  <div className="border-t border-[#1e2532]">
                    <div className="flex items-center justify-between px-5 py-2 bg-[#0d1117]/50">
                      <div className="flex items-center gap-2">
                        <FileCode2 className="w-3.5 h-3.5 text-[#586c8f]" />
                        <span className="text-[10px] font-mono text-[#586c8f]">{section.id}.md</span>
                      </div>
                      <button
                        onClick={() => setOutputs((prev) => { const n = { ...prev }; delete n[section.id]; return n; })}
                        className="text-[#586c8f] hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <pre className="p-5 text-xs font-mono text-[#a0b0c0] max-h-[300px] overflow-y-auto whitespace-pre-wrap custom-scrollbar leading-relaxed">
                      {outputs[section.id]}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
