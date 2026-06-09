'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FolderOpen, Plus, CheckCircle2, Rocket, FileText, Clock, Trash2, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyProjectsPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActiveProjectId(localStorage.getItem('activeProjectId'));
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProjects();
    }
  }, [status, router]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-screen bg-[#0b0e14]">
        <Loader2 className="animate-spin w-8 h-8 text-[#5b5fd8]" />
      </div>
    );
  }

  const handleSetActive = (id: string) => {
    localStorage.setItem('activeProjectId', id);
    setActiveProjectId(id);
  };

  return (
    <div className="min-h-full bg-[#0b0e14] p-8 md:p-12 text-white">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
            <FolderOpen className="w-6 h-6 text-[#586c8f]" />
            My Projects
          </h1>
          <p className="text-[#586c8f] text-sm mt-1">
            {projects.length} projects saved • Current: #{projects.length > 0 ? '1' : '0'}
          </p>
        </div>
        <Link 
          href="/start"
          className="bg-gradient-to-r from-[#4a4fcf] to-[#2a2c7a] hover:from-[#5b5fd8] hover:to-[#4a4fcf] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(91,95,216,0.5)] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Active Project Notice */}
      {projects.length > 0 && (
        <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-4 flex items-center gap-3 mb-8">
          <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
          <p className="text-[#10b981] text-sm">
            <span className="font-bold">Active Project: #1</span> — All changes auto-save to this project
          </p>
        </div>
      )}

      {/* Project List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-[#111622] rounded-xl border border-[#1e2532]">
            <p className="text-[#586c8f]">No projects found. Click "New Project" to start.</p>
          </div>
        ) : (
          projects.map((project, idx) => {
            const isActive = project.id === activeProjectId;
            const progress = project.progress || 0;
            const isAdvanced = progress > 0;
            
            return (
              <div 
                key={project.id} 
                className={`group flex items-center justify-between p-5 rounded-xl transition-all cursor-pointer bg-[#111622]/80 backdrop-blur-sm border ${
                  isActive ? 'border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-[#1e2532] hover:bg-[#1a202c]'
                }`}
                onClick={() => {
                  handleSetActive(project.id);
                  router.push('/analysis');
                }}
              >
                <div className="flex items-start gap-4 w-2/3">
                  <div className="mt-1">
                    {isActive ? (
                      <Rocket className="w-5 h-5 text-[#f43f5e]" />
                    ) : (
                      <FileText className="w-5 h-5 text-[#8b9bb4]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-3">
                      {project.name}
                      {isActive && (
                        <span className="bg-[#10b981]/20 text-[#10b981] text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider font-bold">
                          ACTIVE
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-[#586c8f] mt-1 truncate">
                      {project.description || 'No idea description'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    {isAdvanced ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] border border-[#10b981]/30 text-[#10b981] px-2 py-0.5 rounded uppercase tracking-wider font-bold bg-[#10b981]/10">
                          Prompts Ready
                        </span>
                        <span className="text-yellow-400 font-bold text-sm">{progress}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] border border-[#586c8f]/30 text-[#8b9bb4] px-2 py-0.5 rounded uppercase tracking-wider font-bold bg-[#1e2532]/50">
                          Input
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#586c8f] font-mono whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(project.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                      className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetActive(project.id);
                        router.push('/analysis');
                      }}
                      className="p-2 bg-[#1a1b3b] text-[#5b5fd8] hover:bg-[#5b5fd8] hover:text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
                    >
                      Open <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
