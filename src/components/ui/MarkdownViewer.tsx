import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Code } from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
  className?: string;
  onChange?: (val: string) => void;
}

export function MarkdownViewer({ content, className = '', onChange }: MarkdownViewerProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');

  return (
    <div className={`flex flex-col h-full w-full ${className}`}>
      <div className="flex justify-end p-2 bg-[#0d1117]/50 border-b border-[#1e2532] shrink-0">
        <div className="flex bg-[#111622] rounded-lg border border-[#1e2532] p-0.5">
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${viewMode === 'preview' ? 'bg-[#2a2d46] text-white shadow-sm' : 'text-[#8b9bb4] hover:text-white'}`}
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${viewMode === 'raw' ? 'bg-[#2a2d46] text-white shadow-sm' : 'text-[#8b9bb4] hover:text-white'}`}
          >
            <Code className="w-3.5 h-3.5" /> Raw
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        {viewMode === 'raw' ? (
          <textarea 
            value={content}
            onChange={(e) => onChange ? onChange(e.target.value) : undefined}
            readOnly={!onChange}
            className="absolute inset-0 w-full h-full bg-[#0b0e14] text-[#e2e8f0] font-mono text-sm p-6 resize-none focus:outline-none custom-scrollbar"
            spellCheck={false}
          />
        ) : (
          <div className="p-6 max-w-none mx-auto prose prose-invert prose-headings:text-white prose-a:text-[#5b5fd8] prose-strong:text-white prose-table:border-collapse prose-th:border prose-th:border-[#1e2532] prose-th:bg-[#1a1b3b] prose-th:p-3 prose-td:border prose-td:border-[#1e2532] prose-td:p-3 prose-tr:hover:bg-[#1a1b3b]/30">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
