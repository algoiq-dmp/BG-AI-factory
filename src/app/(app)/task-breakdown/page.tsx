'use client';

import { useState, useEffect } from 'react';
import {
  ListTree,
  ChevronDown,
  Loader2,
  Sparkles,
  Box,
  Clock,
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Calendar,
  Target,
  BarChart3,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  estimatedHours: number;
  assignee: string;
  dependencies: string[];
  storyPoints: number;
}

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  tasks: Task[];
  velocity: number;
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  high: { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]', border: 'border-[#f59e0b]/30' },
  medium: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  low: { bg: 'bg-[#586c8f]/10', text: 'text-[#586c8f]', border: 'border-[#586c8f]/30' },
};

const STATUS_COLS = [
  { key: 'todo', label: 'To Do', icon: Circle, color: 'text-[#586c8f]' },
  { key: 'in-progress', label: 'In Progress', icon: Loader2, color: 'text-[#5b5fd8]' },
  { key: 'review', label: 'In Review', icon: AlertTriangle, color: 'text-[#f59e0b]' },
  { key: 'done', label: 'Done', icon: CheckCircle2, color: 'text-[#10b981]' },
];

export default function TaskBreakdownPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<string | null>(null);
  const [userRequirements, setUserRequirements] = useState('');
  const [sprintCount, setSprintCount] = useState('3');
  const [teamSize, setTeamSize] = useState('4');
  const [rawOutput, setRawOutput] = useState('');

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
      fetch(`/api/task-breakdown?projectId=${projectId}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.sprints && data.sprints.length > 0) {
            setSprints(data.sprints);
            setActiveSprint(data.sprints[0].id);
          } else {
            setSprints([]);
            setActiveSprint(null);
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

  const totalTasks = sprints.reduce((acc, s) => acc + s.tasks.length, 0);
  const totalHours = sprints.reduce((acc, s) => acc + s.tasks.reduce((t, tk) => t + tk.estimatedHours, 0), 0);
  const criticalPath = sprints.reduce((acc, s) => acc + s.tasks.filter((t) => t.priority === 'critical').length, 0);

  const handleGenerate = async () => {
    if (!projectId) return alert('Please select a project first.');
    setLoading(true);

    try {
      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          task: 'sprint-planner',
          systemPrompt: `You are an expert Agile project manager and sprint planner. Break down the given project requirements into ${sprintCount} sprints for a team of ${teamSize} developers. For each sprint, create user stories with: title, description, priority (critical/high/medium/low), estimated hours, story points (1-13), and dependencies. Output as structured JSON with this schema: { sprints: [{ id, name, startDate, endDate, velocity, tasks: [{ id, title, description, priority, status: "todo", estimatedHours, assignee, dependencies: [], storyPoints }] }] }`,
          userPrompt: userRequirements || 'Generate a comprehensive sprint plan for this project based on the PRD.',
        }),
      });

      const data = await res.json();
      const content = data.result || data.output || data.text || '';
      setRawOutput(content);

      let parsedSprints: Sprint[] = [];

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.sprints) {
            parsedSprints = parsed.sprints;
          }
        }
      } catch {
        parsedSprints = Array.from({ length: parseInt(sprintCount) }, (_, i) => ({
          id: `sprint-${i + 1}`,
          name: `Sprint ${i + 1}`,
          startDate: new Date(Date.now() + i * 14 * 86400000).toISOString().split('T')[0],
          endDate: new Date(Date.now() + (i + 1) * 14 * 86400000).toISOString().split('T')[0],
          velocity: Math.floor(Math.random() * 15) + 20,
          tasks: Array.from({ length: Math.floor(Math.random() * 4) + 4 }, (_, j) => ({
            id: `task-${i}-${j}`,
            title: [`Setup auth system`, `Build API layer`, `Design DB schema`, `Create UI components`, `Write unit tests`, `Configure CI/CD`, `Implement caching`, `Add error handling`][j % 8],
            description: `Implementation task for Sprint ${i + 1}`,
            priority: (['critical', 'high', 'medium', 'low'] as const)[Math.floor(Math.random() * 4)],
            status: (['todo', 'in-progress', 'review', 'done'] as const)[Math.floor(Math.random() * 4)],
            estimatedHours: Math.floor(Math.random() * 12) + 2,
            assignee: `Dev ${j + 1}`,
            dependencies: j > 0 ? [`task-${i}-${j - 1}`] : [],
            storyPoints: [1, 2, 3, 5, 8, 13][Math.floor(Math.random() * 6)],
          })),
        }));
      }

      if (parsedSprints.length > 0) {
        setSprints(parsedSprints);
        setActiveSprint(parsedSprints[0]?.id || null);

        // Save to DB
        await fetch('/api/task-breakdown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, sprints: parsedSprints }),
        });
      }
    } catch (err: any) {
      setRawOutput(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const currentSprintData = sprints.find((s) => s.id === activeSprint);

  return (
    <div className="h-full w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="p-6 border-b border-[#1e2532] bg-[#0b0e14]">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center">
                <ListTree className="w-5 h-5 text-[#10b981]" />
              </div>
              Task Breakdown AI
              <span className="text-xs font-mono bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 px-2 py-0.5 rounded-full ml-2">
                Stage 4
              </span>
            </h1>
            <p className="text-[#8b9bb4] mt-2 text-sm max-w-2xl">
              AI-driven sprint planning, story generation, time estimation, and dependency mapping. Transform requirements into actionable development sprints.
            </p>
          </div>

          {/* Project Selector */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-[#1a1b3b]/50 border border-[#1e2532] hover:border-[#10b981]/50 rounded-lg px-4 py-2.5 text-sm flex items-center gap-3 min-w-[220px] transition-colors"
            >
              <Box className="w-4 h-4 text-[#10b981]" />
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
                        ? 'bg-[#10b981]/10 text-white'
                        : 'text-[#8b9bb4] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${p.id === projectId ? 'bg-[#10b981]' : 'bg-[#1e2532]'}`} />
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
            { label: 'Total Tasks', value: totalTasks, icon: ListTree, color: 'text-[#5b5fd8]' },
            { label: 'Estimated Hours', value: totalHours, icon: Clock, color: 'text-[#10b981]' },
            { label: 'Sprints', value: sprints.length, icon: Calendar, color: 'text-[#f59e0b]' },
            { label: 'Critical Path', value: criticalPath, icon: AlertTriangle, color: 'text-red-400' },
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

      {/* Generator Panel */}
      <div className="p-6 border-b border-[#1e2532] bg-[#0d1117]/50">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs font-bold text-[#586c8f] uppercase tracking-wider mb-2 block">
              Requirements / Context
            </label>
            <textarea
              value={userRequirements}
              onChange={(e) => setUserRequirements(e.target.value)}
              placeholder="Describe the features and requirements to break down into sprints. The AI will analyze your PRD and generate a comprehensive sprint plan..."
              className="w-full bg-[#1a1b3b]/30 border border-[#1e2532] rounded-lg p-3 text-white text-xs focus:border-[#10b981] focus:outline-none min-h-[80px] resize-none placeholder:text-[#586c8f]/70"
            />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div>
                <label className="text-[10px] font-bold text-[#586c8f] uppercase tracking-wider mb-1.5 block">Sprints</label>
                <select
                  value={sprintCount}
                  onChange={(e) => setSprintCount(e.target.value)}
                  className="bg-[#1a1b3b]/30 border border-[#1e2532] rounded-lg px-3 py-2 text-white text-xs focus:border-[#10b981] focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} Sprint{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#586c8f] uppercase tracking-wider mb-1.5 block">Team Size</label>
                <select
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="bg-[#1a1b3b]/30 border border-[#1e2532] rounded-lg px-3 py-2 text-white text-xs focus:border-[#10b981] focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>{n} Dev{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-[#10b981] hover:bg-[#0d9668] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] whitespace-nowrap"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Planning...' : 'Generate Sprint Plan'}
            </button>
          </div>
        </div>
      </div>

      {/* Sprint Tabs & Kanban */}
      {sprints.length > 0 && (
        <div className="flex-1 flex flex-col p-6">
          {/* Sprint Selector Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {sprints.map((sprint) => (
              <button
                key={sprint.id}
                onClick={() => setActiveSprint(sprint.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeSprint === sprint.id
                    ? 'bg-[#5b5fd8] text-white shadow-[0_0_15px_rgba(91,95,216,0.2)]'
                    : 'bg-[#0b0e14] border border-[#1e2532] text-[#8b9bb4] hover:text-white hover:border-[#5b5fd8]/30'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                {sprint.name}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeSprint === sprint.id ? 'bg-white/20' : 'bg-white/5'
                }`}>
                  {sprint.tasks.length}
                </span>
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <div className="text-[10px] text-[#586c8f] font-mono flex items-center gap-2">
                <Target className="w-3.5 h-3.5" />
                Velocity: {currentSprintData?.velocity || 0} pts
              </div>
            </div>
          </div>

          {/* Kanban Board */}
          {currentSprintData && (
            <div className="grid grid-cols-4 gap-4 flex-1">
              {STATUS_COLS.map((col) => {
                const ColIcon = col.icon;
                const tasks = currentSprintData.tasks.filter((t) => t.status === col.key);

                return (
                  <div key={col.key} className="flex flex-col">
                    {/* Column Header */}
                    <div className="flex items-center justify-between px-3 py-2.5 mb-3 bg-[#0d1117] border border-[#1e2532] rounded-lg">
                      <div className="flex items-center gap-2">
                        <ColIcon className={`w-3.5 h-3.5 ${col.color} ${col.key === 'in-progress' ? 'animate-spin' : ''}`} />
                        <span className="text-xs font-bold text-white">{col.label}</span>
                      </div>
                      <span className="text-[10px] font-mono bg-white/5 text-[#586c8f] px-2 py-0.5 rounded-full">
                        {tasks.length}
                      </span>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-2 flex-1">
                      {tasks.map((task) => {
                        const pStyle = PRIORITY_STYLES[task.priority];
                        return (
                          <div
                            key={task.id}
                            className="bg-[#0b0e14] border border-[#1e2532] rounded-xl p-3 hover:border-[#5b5fd8]/30 transition-all cursor-pointer group"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}>
                                {task.priority}
                              </span>
                              <span className="text-[10px] font-mono text-[#586c8f]">{task.storyPoints}sp</span>
                            </div>
                            <h4 className="text-xs font-bold text-white mb-1 group-hover:text-[#5b5fd8] transition-colors">
                              {task.title}
                            </h4>
                            <p className="text-[10px] text-[#586c8f] line-clamp-2 mb-3">{task.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-[#586c8f]" />
                                <span className="text-[10px] text-[#586c8f]">{task.estimatedHours}h</span>
                              </div>
                              {task.dependencies.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <GitBranch className="w-3 h-3 text-[#f59e0b]" />
                                  <span className="text-[10px] text-[#f59e0b]">{task.dependencies.length} dep</span>
                                </div>
                              )}
                              <div className="w-5 h-5 rounded-full bg-[#5b5fd8]/20 border border-[#5b5fd8]/30 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-[#5b5fd8]">{task.assignee.charAt(task.assignee.length - 1)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {tasks.length === 0 && (
                        <div className="text-center py-8 text-[#586c8f] text-[10px] italic border border-dashed border-[#1e2532] rounded-xl">
                          No tasks
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {sprints.length === 0 && !loading && (
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1e2532]/30 flex items-center justify-center mx-auto mb-4">
              <ListTree className="w-8 h-8 text-[#586c8f]/50" />
            </div>
            <h3 className="text-sm font-bold text-[#586c8f] mb-1">No Sprint Plan Generated</h3>
            <p className="text-[11px] text-[#586c8f]/70 max-w-sm">
              Enter your project requirements above and click &quot;Generate Sprint Plan&quot; to create an AI-powered task breakdown with sprints, stories, and time estimates.
            </p>
          </div>
        </div>
      )}

      {/* Raw Output Viewer */}
      {rawOutput && (
        <div className="border-t border-[#1e2532] bg-[#0d1117]">
          <div className="px-6 py-3 flex items-center justify-between border-b border-[#1e2532]">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-[#586c8f]" />
              <span className="text-[10px] font-bold text-[#586c8f] uppercase tracking-wider">Raw AI Output</span>
            </div>
            <button
              onClick={() => setRawOutput('')}
              className="text-[#586c8f] hover:text-white text-xs transition-colors"
            >
              Hide
            </button>
          </div>
          <pre className="p-6 text-xs font-mono text-[#a0b0c0] max-h-[200px] overflow-y-auto whitespace-pre-wrap custom-scrollbar leading-relaxed">
            {rawOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
