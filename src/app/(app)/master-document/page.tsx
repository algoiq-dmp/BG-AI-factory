'use client';

import { useState, useEffect } from 'react';
import { FileText, Copy, Download, Loader2, Server, Check, ChevronRight } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { MarkdownViewer } from '@/components/ui/MarkdownViewer';

const TOC_SECTIONS = [
  { id: 'overview', title: 'Project Overview' },
  { id: 'functional', title: 'Functional Flow' },
  { id: 'architecture', title: 'Technical Architecture' },
  { id: 'ai', title: 'AI Architecture' },
  { id: 'ui', title: 'UI Structure' },
  { id: 'features', title: 'Feature List' },
  { id: 'risks', title: 'Risk Points' },
  { id: 'scalability', title: 'Scalability Plan' },
  { id: 'security', title: 'Security Plan' },
  { id: 'testing', title: 'Testing Checklist' },
];

export default function MasterDocumentPage() {
  const { activeProjectId, getActiveProject } = useProjectStore();
  const currentProject = getActiveProject();

  const [activeSection, setActiveSection] = useState(TOC_SECTIONS[0].id);
  const [documents, setDocuments] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Whenever section changes, if we don't have it cached, generate it.
    if (!activeProjectId) return;
    if (!documents[activeSection] && !isGenerating) {
      generateSection(activeSection);
    }
  }, [activeSection, activeProjectId]);

  const generateSection = async (sectionId: string) => {
    if (!activeProjectId) return;
    setIsGenerating(true);
    
    const sectionTitle = TOC_SECTIONS.find(s => s.id === sectionId)?.title || sectionId;

    try {
      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProjectId,
          task: `Generate Master Document Section: ${sectionTitle}`,
          context: `You are generating the ${sectionTitle} section of the Master Project Document.`,
          systemPrompt: `Write a highly detailed, professional markdown document for the ${sectionTitle} section of this software project. Use appropriate markdown headings (##), lists, and formatting. Do not include markdown fences like \`\`\`markdown at the start.`
        })
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let output = '';

      setDocuments(prev => ({ ...prev, [sectionId]: '' }));

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          output += chunk;
          setDocuments(prev => ({ ...prev, [sectionId]: output }));
        }
      }
      
      // Save it automatically to the db
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: activeProjectId, title: `Master Doc: ${sectionTitle}`, type: 'ARCHITECTURE', content: output })
      });

    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAll = () => {
    const currentDoc = documents[activeSection];
    if (currentDoc) {
      navigator.clipboard.writeText(currentDoc);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!activeProjectId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <FileText className="w-16 h-16 text-[#586c8f] mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Project Selected</h2>
        <p className="text-[#8b9bb4]">Please select a project from the top header to view the Master Document.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden max-w-7xl mx-auto w-full">
      
      {/* Container */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* Left Sidebar - TOC */}
        <div className="w-64 flex-shrink-0 flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm h-full">
          <div className="p-4 border-b border-gray-200 flex items-center gap-2 bg-gray-50/50">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-gray-900">Table of Contents</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar bg-white">
            {TOC_SECTIONS.map((section) => {
              const isActive = activeSection === section.id;
              const hasContent = !!documents[section.id];
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90 text-indigo-500' : 'text-gray-400'}`} />
                  <span className="flex-1">{section.title}</span>
                  {hasContent && !isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Area - Document Viewer */}
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm h-full">
          
          {/* Editor Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
            <h1 className="text-2xl font-bold text-gray-900">Master Project Document</h1>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleCopyAll}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy All'}
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-indigo-500/20"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Document Content */}
          <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc] custom-scrollbar relative">
            <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl p-8 min-h-full shadow-sm">
              {isGenerating && !documents[activeSection] ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                  <h3 className="text-gray-900 font-bold text-lg">Synthesizing Section...</h3>
                  <p className="text-gray-500 text-sm">Deepseek is writing the {TOC_SECTIONS.find(s => s.id === activeSection)?.title} documentation</p>
                </div>
              ) : documents[activeSection] ? (
                <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-900 prose-a:text-indigo-600 prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900">
                  <MarkdownViewer content={documents[activeSection]} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <Server className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg font-bold">No Content Generated</p>
                  <p className="text-gray-400 text-sm">Select a section to generate its documentation.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
