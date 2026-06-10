'use client';

import { useState } from 'react';
import { Database, Plus, Table, Code, Play, Check, Copy, Loader2, Sparkles, Server } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { MarkdownViewer } from '@/components/ui/MarkdownViewer';

interface DBModel {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'generated';
  aiOutput?: string;
}

export default function DatabaseDesignerPage() {
  const { activeProjectId, getActiveProject } = useProjectStore();
  const currentProject = getActiveProject();

  const [models, setModels] = useState<DBModel[]>([
    { id: '1', name: 'Users & Auth', description: 'User accounts, roles, and session tracking', status: 'draft' },
    { id: '2', name: 'Billing Core', description: 'Subscriptions, invoices, and payment history', status: 'draft' },
  ]);
  const [activeModelId, setActiveModelId] = useState<string>('1');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeModel = models.find(m => m.id === activeModelId);

  const handleGenerate = async (model: DBModel) => {
    if (!activeProjectId) return alert('Please select a project first.');
    setIsGenerating(true);

    try {
      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProjectId,
          task: 'Generate Database Schema & ERD',
          context: `Model Domain: ${model.name}\nDescription: ${model.description}`,
          systemPrompt: 'You are an expert Database Architect. Generate a detailed database schema for the specified domain. Include: 1) A Mermaid ERD diagram. 2) SQL table definitions with data types, primary keys, foreign keys, and indexes. Use markdown code blocks.'
        })
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let output = '';

      setModels(prev => prev.map(m => m.id === model.id ? { ...m, status: 'generated', aiOutput: '' } : m));

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          output += chunk;
          setModels(prev => prev.map(m => m.id === model.id ? { ...m, aiOutput: output } : m));
        }
      }
      
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: activeProjectId, title: `Schema: ${model.name}`, type: 'ARCHITECTURE', content: output })
      });

    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddModel = () => {
    const newId = Date.now().toString();
    setModels(prev => [...prev, { id: newId, name: 'New Entity Domain', description: 'Describe the entities and relationships...', status: 'draft' }]);
    setActiveModelId(newId);
  };

  const updateActiveModel = (updates: Partial<DBModel>) => {
    setModels(prev => prev.map(m => m.id === activeModelId ? { ...m, ...updates } : m));
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
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center">
              <Database className="w-6 h-6 text-[#10b981]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Database Designer</h1>
              <p className="text-[#8b9bb4] text-sm mt-1">
                Design entity domains and generate schemas with ERD visualizations
              </p>
            </div>
          </div>
          <button 
            onClick={handleAddModel}
            className="bg-[#111622] hover:bg-[#1a1b3b] border border-[#1e2532] text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Domain
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <div className="w-80 border-r border-[#1e2532] bg-[#0b0e14] flex flex-col">
          <div className="p-4 border-b border-[#1e2532] bg-[#111622]">
            <h3 className="text-xs font-bold text-[#8b9bb4] uppercase tracking-wider">Entity Domains ({models.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {models.map(m => {
              const isActive = m.id === activeModelId;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveModelId(m.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isActive ? 'bg-[#10b981]/10 border-[#10b981]/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-[#111622] border-[#1e2532] hover:border-[#10b981]/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Table className={`w-3.5 h-3.5 ${isActive ? 'text-[#10b981]' : 'text-[#586c8f]'}`} />
                    <span className={`text-xs font-bold truncate ${isActive ? 'text-[#10b981]' : 'text-[#8b9bb4]'}`}>{m.name}</span>
                  </div>
                  <div className="text-[10px] text-[#586c8f] truncate pl-5">{m.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Area */}
        <div className="flex-1 flex flex-col bg-[#0b0e14]">
          {activeModel ? (
            <>
              {/* Editor */}
              <div className="p-6 border-b border-[#1e2532] bg-[#111622]">
                <div className="flex items-center gap-3 mb-4">
                  <input 
                    type="text" 
                    value={activeModel.name}
                    onChange={e => updateActiveModel({ name: e.target.value })}
                    className="flex-1 bg-[#0b0e14] border border-[#1e2532] text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-[#10b981] font-bold"
                  />
                  <button 
                    onClick={() => handleGenerate(activeModel)}
                    disabled={isGenerating}
                    className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isGenerating ? 'Generating...' : 'Generate Schema'}
                  </button>
                </div>
                <textarea 
                  value={activeModel.description}
                  onChange={e => updateActiveModel({ description: e.target.value })}
                  placeholder="Describe the entities, their properties, and the relationships between them..."
                  className="w-full bg-[#0b0e14] border border-[#1e2532] text-[#8b9bb4] p-3 rounded-lg text-sm focus:outline-none focus:border-[#10b981] min-h-[80px] resize-none"
                />
              </div>

              {/* Output View */}
              <div className="flex-1 relative overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-6 py-3 bg-[#111622] border-b border-[#1e2532] shrink-0">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-[#586c8f]" />
                    <span className="text-xs font-bold text-[#8b9bb4] uppercase tracking-wider">AI Schema & ERD</span>
                  </div>
                  {activeModel.aiOutput && (
                    <button 
                      onClick={() => handleCopy(activeModel.aiOutput!)}
                      className="text-xs text-[#8b9bb4] hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy output'}
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-0 relative custom-scrollbar bg-[#0b0e14]">
                   {isGenerating && !activeModel.aiOutput ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b0e14]/80 backdrop-blur-sm z-10">
                       <Loader2 className="w-10 h-10 text-[#10b981] animate-spin mb-4" />
                       <h3 className="text-white font-bold text-lg">Designing Database Schema...</h3>
                       <p className="text-[#8b9bb4] text-sm">Deepseek is crafting the tables and ERD</p>
                     </div>
                   ) : activeModel.aiOutput ? (
                     <MarkdownViewer content={activeModel.aiOutput} />
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center opacity-50">
                       <Server className="w-16 h-16 text-[#586c8f] mb-4" />
                       <p className="text-[#8b9bb4] text-lg font-bold">No Schema Generated</p>
                       <p className="text-[#586c8f] text-sm">Click "Generate Schema" to create database structures.</p>
                     </div>
                   )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-50">
               <Database className="w-16 h-16 text-[#586c8f] mb-4" />
               <p className="text-[#8b9bb4] text-lg font-bold">No Domain Selected</p>
               <p className="text-[#586c8f] text-sm">Select an entity domain from the sidebar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
