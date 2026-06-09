/**
 * @file Project Store Tests
 * @description Unit tests for the project Zustand store
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProjectStore } from '@/store/useProjectStore';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useProjectStore', () => {
  beforeEach(() => {
    useProjectStore.setState({
      activeProjectId: null,
      projects: [],
      isLoading: false,
    });
    vi.clearAllMocks();
  });

  it('should start with no active project', () => {
    const state = useProjectStore.getState();
    expect(state.activeProjectId).toBeNull();
    expect(state.projects).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it('should set active project', () => {
    useProjectStore.getState().setActiveProject('proj-123');
    expect(useProjectStore.getState().activeProjectId).toBe('proj-123');
  });

  it('should set projects list', () => {
    const projects = [
      { id: 'p1', name: 'Project 1', description: null, domainTemplate: null, tier: 'FREE', status: 'PLANNING', pipelineStatus: 'IDLE', progress: 0, createdAt: '', updatedAt: '' },
      { id: 'p2', name: 'Project 2', description: null, domainTemplate: null, tier: 'PRO', status: 'IN_PROGRESS', pipelineStatus: 'BUILDING', progress: 50, createdAt: '', updatedAt: '' },
    ];
    useProjectStore.getState().setProjects(projects);
    expect(useProjectStore.getState().projects).toHaveLength(2);
  });

  it('should fetch projects from API', async () => {
    const mockProjects = [
      { id: 'p1', name: 'Fetched Project', description: null, domainTemplate: null, tier: 'FREE', status: 'PLANNING', pipelineStatus: 'IDLE', progress: 0, createdAt: '', updatedAt: '' },
    ];
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true, projects: mockProjects }),
    });

    await useProjectStore.getState().fetchProjects();

    expect(mockFetch).toHaveBeenCalledWith('/api/projects');
    expect(useProjectStore.getState().projects).toHaveLength(1);
    expect(useProjectStore.getState().projects[0].name).toBe('Fetched Project');
    expect(useProjectStore.getState().isLoading).toBe(false);
  });

  it('should auto-select first project when none selected', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        projects: [{ id: 'auto-1', name: 'Auto Select', description: null, domainTemplate: null, tier: 'FREE', status: 'PLANNING', pipelineStatus: 'IDLE', progress: 0, createdAt: '', updatedAt: '' }],
      }),
    });

    await useProjectStore.getState().fetchProjects();
    expect(useProjectStore.getState().activeProjectId).toBe('auto-1');
  });

  it('should get active project object', () => {
    const projects = [
      { id: 'p1', name: 'First', description: null, domainTemplate: null, tier: 'FREE', status: 'PLANNING', pipelineStatus: 'IDLE', progress: 0, createdAt: '', updatedAt: '' },
      { id: 'p2', name: 'Second', description: null, domainTemplate: null, tier: 'PRO', status: 'IN_PROGRESS', pipelineStatus: 'BUILDING', progress: 50, createdAt: '', updatedAt: '' },
    ];
    useProjectStore.setState({ projects, activeProjectId: 'p2' });

    const active = useProjectStore.getState().getActiveProject();
    expect(active?.name).toBe('Second');
  });

  it('should return null for getActiveProject when no match', () => {
    useProjectStore.setState({ projects: [], activeProjectId: 'nonexistent' });
    expect(useProjectStore.getState().getActiveProject()).toBeNull();
  });

  it('should handle fetch error gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    await useProjectStore.getState().fetchProjects();
    expect(useProjectStore.getState().projects).toEqual([]);
    expect(useProjectStore.getState().isLoading).toBe(false);
  });
});
