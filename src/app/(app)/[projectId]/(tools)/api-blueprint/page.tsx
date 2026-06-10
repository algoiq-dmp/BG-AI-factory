'use client';

import { useState, useEffect } from 'react';
import { Network, Plus, Server, Code, Play, Check, Copy, RefreshCcw, Loader2, Sparkles, Database } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { MarkdownViewer } from '@/components/ui/MarkdownViewer';

interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  status: 'draft' | 'generated';
  aiOutput?: string;
}

const methodColors = {
  GET: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  POST: 'text-green-400 bg-green-400/10 border-green-400/30',
  PUT: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  DELETE: 'text-red-400 bg-red-400/10 border-red-400/30',
  PATCH: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
};

export default function APIBlueprintPage() {
  const { activeProjectId, getActiveProject } = useProjectStore();
  const currentProject = getActiveProject();

  const [endpoints, setEndpoints] = useState<Endpoint[]>([
    { id: '1', method: 'GET', path: '/api/v1/users', description: 'Fetch a paginated list of users', status: 'draft' },
    { id: '2', method: 'POST', path: '/api/v1/auth/login', description: 'Authenticate user and return JWT', status: 'draft' },
  ]);
  const [activeEndpointId, setActiveEndpointId] = useState<string>('1');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeEndpoint = endpoints.find(e => e.id === activeEndpointId);

  const handleGenerate = async (endpoint: Endpoint) => {
    if (!activeProjectId) return alert('Please select a project first.');
    setIsGenerating(true);

    try {
      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProjectId,
          task: 'Generate API Endpoint Specification',
          context: `Method: ${endpoint.method}\nPath: ${endpoint.path}\nDescription: ${endpoint.description}`,
          systemPrompt: 'You are an expert API Architect. Generate a detailed OpenAPI/Swagger style markdown specification for this single endpoint. Include Request body (if applicable), Path/Query Parameters, Response schema (success and error), and curl example. Use markdown code blocks.'
        })
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let output = '';

      setEndpoints(prev => prev.map(e => e.id === endpoint.id ? { ...e, status: 'generated', aiOutput: '' } : e));

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          output += chunk;
          setEndpoints(prev => prev.map(e => e.id === endpoint.id ? { ...e, aiOutput: output } : e));
        }
      }
      
      // Save to DB
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: activeProjectId, title: `API: ${endpoint.method} ${endpoint.path}`, type: 'ARCHITECTURE', content: output })
      });

    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddEndpoint = () => {
    const newId = Date.now().toString();
    setEndpoints(prev => [...prev, { id: newId, method: 'GET', path: '/api/v1/new-resource', description: 'Describe the endpoint...', status: 'draft' }]);
    setActiveEndpointId(newId);
  };

  const updateActiveEndpoint = (updates: Partial<Endpoint>) => {
    setEndpoints(prev => prev.map(e => e.id === activeEndpointId ? { ...e, ...updates } : e));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-[#1e2532] bg-[#0b0e14] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#5b5fd8]/10 border border-[#5b5fd8]/30 flex items-center justify-center">
              <Network className="w-6 h-6 text-[#5b5fd8]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">API Blueprint Designer</h1>
              <p className="text-[#8b9bb4] text-sm mt-1">
                Design, document, and generate RESTful endpoint specifications
              </p>
            </div>
          </div>
          <button 
            onClick={handleAddEndpoint}
            className="bg-[#111622] hover:bg-[#1a1b3b] border border-[#1e2532] text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Endpoint
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Endpoints List */}
        <div className="w-80 border-r border-[#1e2532] bg-[#0b0e14] flex flex-col">
          <div className="p-4 border-b border-[#1e2532] bg-[#111622]">
            <h3 className="text-xs font-bold text-[#8b9bb4] uppercase tracking-wider">Endpoints ({endpoints.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {endpoints.map(e => {
              const isActive = e.id === activeEndpointId;
              return (
                <button
                  key={e.id}
                  onClick={() => setActiveEndpointId(e.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isActive ? 'bg-[#1a1b3b] border-[#5b5fd8]/50 shadow-[0_0_10px_rgba(91,95,216,0.1)]' : 'bg-[#111622] border-[#1e2532] hover:border-[#586c8f]/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${methodColors[e.method]}`}>
                      {e.method}
                    </span>
                    <span className={`text-xs truncate ${isActive ? 'text-white' : 'text-[#8b9bb4]'}`}>{e.path}</span>
                  </div>
                  <div className="text-[10px] text-[#586c8f] truncate">{e.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Area - Editor & Output */}
        <div className="flex-1 flex flex-col bg-[#0b0e14]">
          {activeEndpoint ? (
            <>
              {/* Endpoint Editor */}
              <div className="p-6 border-b border-[#1e2532] bg-[#111622]">
                <div className="flex items-center gap-3 mb-4">
                  <select 
                    value={activeEndpoint.method}
                    onChange={e => updateActiveEndpoint({ method: e.target.value as any })}
                    className="bg-[#0b0e14] border border-[#1e2532] text-white px-3 py-2 rounded-lg text-sm font-bold focus:outline-none focus:border-[#5b5fd8]"
                  >
                    {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <input 
                    type="text" 
                    value={activeEndpoint.path}
                    onChange={e => updateActiveEndpoint({ path: e.target.value })}
                    className="flex-1 bg-[#0b0e14] border border-[#1e2532] text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-[#5b5fd8] font-mono"
                  />
                  <button 
                    onClick={() => handleGenerate(activeEndpoint)}
                    disabled={isGenerating}
                    className="bg-[#5b5fd8] hover:bg-[#4a4fcf] text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(91,95,216,0.3)] disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isGenerating ? 'Generating...' : 'Generate Spec'}
                  </button>
                </div>
                <textarea 
                  value={activeEndpoint.description}
                  onChange={e => updateActiveEndpoint({ description: e.target.value })}
                  placeholder="Describe the endpoint purpose, payload, and expected responses..."
                  className="w-full bg-[#0b0e14] border border-[#1e2532] text-[#8b9bb4] p-3 rounded-lg text-sm focus:outline-none focus:border-[#5b5fd8] min-h-[80px] resize-none"
                />
              </div>

              {/* Output View */}
              <div className="flex-1 relative overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-6 py-3 bg-[#111622] border-b border-[#1e2532] shrink-0">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-[#586c8f]" />
                    <span className="text-xs font-bold text-[#8b9bb4] uppercase tracking-wider">AI Specification</span>
                  </div>
                  {activeEndpoint.aiOutput && (
                    <button 
                      onClick={() => handleCopy(activeEndpoint.aiOutput!)}
                      className="text-xs text-[#8b9bb4] hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy markdown'}
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-0 relative custom-scrollbar bg-[#0b0e14]">
                   {isGenerating && !activeEndpoint.aiOutput ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b0e14]/80 backdrop-blur-sm z-10">
                       <Loader2 className="w-10 h-10 text-[#5b5fd8] animate-spin mb-4" />
                       <h3 className="text-white font-bold text-lg">Architecting API Spec...</h3>
                       <p className="text-[#8b9bb4] text-sm">Deepseek is writing the OpenAPI documentation</p>
                     </div>
                   ) : activeEndpoint.aiOutput ? (
                     <MarkdownViewer content={activeEndpoint.aiOutput} />
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center opacity-50">
                       <Server className="w-16 h-16 text-[#586c8f] mb-4" />
                       <p className="text-[#8b9bb4] text-lg font-bold">No Spec Generated</p>
                       <p className="text-[#586c8f] text-sm">Click "Generate Spec" to create documentation.</p>
                     </div>
                   )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-50">
               <Network className="w-16 h-16 text-[#586c8f] mb-4" />
               <p className="text-[#8b9bb4] text-lg font-bold">No Endpoint Selected</p>
               <p className="text-[#586c8f] text-sm">Select an endpoint from the sidebar or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
