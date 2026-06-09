/**
 * @file Project Store — Zustand state management for active project
 * @description Manages project selection, project list, and active project context.
 *              Persisted to localStorage for session continuity.
 * @module store/useProjectStore
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Project data shape matching API response */
interface Project {
  id: string;
  name: string;
  description: string | null;
  domainTemplate: string | null;
  tier: string;
  status: string;
  pipelineStatus: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
    tasks: number;
    codeFiles: number;
    knowledgeNodes: number;
  };
}

interface ProjectState {
  /** Currently selected project ID */
  activeProjectId: string | null;
  /** All user projects */
  projects: Project[];
  /** Loading state for project fetching */
  isLoading: boolean;

  /** Set the active project */
  setActiveProject: (id: string | null) => void;
  /** Update the projects list */
  setProjects: (projects: Project[]) => void;
  /** Fetch projects from API */
  fetchProjects: () => Promise<void>;
  /** Get the active project object */
  getActiveProject: () => Project | null;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      activeProjectId: null,
      projects: [],
      isLoading: false,

      setActiveProject: (id) => set({ activeProjectId: id }),

      setProjects: (projects) => set({ projects }),

      fetchProjects: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/projects');
          const data = await res.json();
          if (data.success && data.projects) {
            set({ projects: data.projects });
            // Auto-select first project if none selected
            const state = get();
            if (!state.activeProjectId && data.projects.length > 0) {
              set({ activeProjectId: data.projects[0].id });
            }
          }
        } catch (error) {
          console.error('[ProjectStore] Failed to fetch projects:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      getActiveProject: () => {
        const state = get();
        return state.projects.find((p) => p.id === state.activeProjectId) || null;
      },
    }),
    {
      name: 'bg-factory-project',
      partialize: (state) => ({
        activeProjectId: state.activeProjectId,
      }),
    }
  )
);
