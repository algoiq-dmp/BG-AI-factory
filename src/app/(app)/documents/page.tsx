'use client';

import { useState, useEffect } from "react";
import { FileText, Download, Eye, FileCode2, BookOpen, Loader2, BookMarked, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DocumentsPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem('activeProjectId');
    setProjectId(id);
    if (!id) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchDocuments();
    }
  }, [projectId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/documents?projectId=${projectId}`);
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
      } else if (data.error === 'Unauthorized' || data.error === 'Forbidden') {
        router.push('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'PRD': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'BRD': return <BookOpen className="w-5 h-5 text-green-400" />;
      case 'HLD': return <FileCode2 className="w-5 h-5 text-purple-400" />;
      default: return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleExportWorkbook = () => {
    setIsExporting(true);
    // Mock PDF generation delay for UI demonstration
    setTimeout(() => {
      setIsExporting(false);
      alert('Master Project Workbook (PDF) exported successfully.');
    }, 2500);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#5b5fd8]" />
      </div>
    );
  }

  if (!projectId || !project) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <FileText className="w-16 h-16 text-[#586c8f] opacity-50 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Project Selected</h2>
        <p className="text-[#8b9bb4]">Please select a project from the "My Projects" page or the Dropdown.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
          <BookMarked className="w-6 h-6 text-[#a855f7]" />
          Knowledge Base & Documentation
        </h1>
        <p className="text-[#8b9bb4] text-sm mt-1">
          Auto-updating project documentation, architecture specs, and tool manuals.
        </p>
      </div>

      {/* MASTER WORKBOOK CARD */}
      <div className="mb-10 bg-gradient-to-r from-[#111622] to-[#0b0e14] border border-[#a855f7]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#a855f7]/10 blur-3xl rounded-full pointer-events-none" />
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-[#a855f7]" />
                <h2 className="text-lg font-bold text-white">Master Project Workbook</h2>
                <span className="bg-[#a855f7]/20 text-[#c4b5fd] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border border-[#a855f7]/30">Auto-Synced</span>
              </div>
              <p className="text-sm text-[#8b9bb4] max-w-xl leading-relaxed">
                A compiled, downloadable master document containing all Page Documentation, APIs, Workflows, AI Agents, System Architecture, and Security Designs for this project.
              </p>
            </div>
            
            <button 
              onClick={handleExportWorkbook}
              disabled={isExporting}
              className="px-6 py-3 bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isExporting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Compiling PDF...</>
              ) : (
                <><Download className="w-5 h-5" /> Export Workbook (PDF)</>
              )}
            </button>
         </div>
      </div>

      <h3 className="text-sm font-bold uppercase tracking-widest text-[#586c8f] mb-4">Generated Documents</h3>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {project.documents.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-[#1e2532] rounded-xl bg-[#0b0e14]/50">
            <FileText className="w-12 h-12 text-[#586c8f] mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-white mb-2">No Documents Yet</h3>
            <p className="text-[#8b9bb4]">
              The AI Engine has not generated any documents for this project yet.
            </p>
          </div>
        ) : (
          project.documents.map((doc: any) => (
            <div key={doc.id} className="bg-[#0b0e14] border border-[#1e2532] rounded-xl p-5 hover:border-[#5b5fd8] hover:bg-[#1a1b3b]/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#1a1b3b] border border-[#1e2532] flex items-center justify-center">
                  {getIconForType(doc.type)}
                </div>
                <span className="bg-[#5b5fd8]/10 text-[#5b5fd8] px-2 py-1 rounded text-[10px] font-bold tracking-wider">
                  {doc.type}
                </span>
              </div>
              
              <h3 className="text-white font-bold mb-2 line-clamp-1 group-hover:text-[#5b5fd8] transition-colors">
                {doc.title}
              </h3>
              
              <div className="text-xs text-[#586c8f] mb-6 font-medium">
                Generated {new Date(doc.createdAt).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-[#1a1b3b] hover:bg-[#2a2c7a] text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors border border-[#1e2532] hover:border-[#5b5fd8]">
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <button className="flex-1 bg-[#1a4d2e]/20 hover:bg-[#1a4d2e] text-[#51cf66] text-xs font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors border border-[#51cf66]/20">
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
