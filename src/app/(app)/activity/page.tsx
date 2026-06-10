'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, Brain, PenTool, Monitor, Server, Database, FlaskConical, 
  BookOpen, Eye, Rocket, Activity, Lightbulb, ListTree, FolderOpen,
  CheckCircle2, AlertTriangle, FileCode2, Users, Briefcase, PlayCircle, BarChart
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';

interface ActivityEntry {
  id: string;
  stage: string;
  action: string;
  status: 'success' | 'warning' | 'error' | 'info';
  timestamp: Date;
  details?: string;
}

const stageIcons: Record<string, any> = {
  'Idea Input': Lightbulb, 'Requirement AI': Brain, 'Architecture AI': PenTool,
  'Task Breakdown': ListTree, 'Frontend AI': Monitor, 'Backend AI': Server,
  'Database AI': Database, 'Testing AI': FlaskConical, 'Documentation AI': BookOpen,
  'Code Review': Eye, 'Deployment AI': Rocket, 'Monitoring AI': Activity,
  'Project Initialization': Rocket, 'Team Assembly': Users,
  'Task Management': Briefcase, 'Development': PlayCircle,
  'Project Status': BarChart
};

const generateMockActivities = () => {
  const now = new Date();
  return [
    {
      id: 'm6',
      stage: 'Project Status',
      action: 'EOD Project Status',
      status: 'success',
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      details: 'All daily milestones achieved. Project is on track.'
    },
    {
      id: 'm5',
      stage: 'Development',
      action: 'Work Completed',
      status: 'success',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      details: 'Activity UI components successfully merged.'
    },
    {
      id: 'm4',
      stage: 'Development',
      action: 'Work Started',
      status: 'info',
      timestamp: new Date(now.getTime() - 22 * 60 * 60 * 1000), // Almost 1 day ago
      details: 'Frontend team started working on Activity UI.'
    },
    {
      id: 'm3',
      stage: 'Task Management',
      action: 'Work Assign',
      status: 'info',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
      details: 'Assigned UI component tasks to frontend team.'
    },
    {
      id: 'm2',
      stage: 'Team Assembly',
      action: 'Team Assign',
      status: 'success',
      timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000), // 2 days ago
      details: 'Assigned Lead Frontend and Backend engineers.'
    },
    {
      id: 'm1',
      stage: 'Project Initialization',
      action: 'Start Project',
      status: 'success',
      timestamp: new Date(now.getTime() - 49 * 60 * 60 * 1000),
      details: 'Project repository initialized and environment setup complete.'
    }
  ] as ActivityEntry[];
};

export default function ActivityPage() {
  const { activeProjectId } = useProjectStore();
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchLogs = async () => {
      if (!activeProjectId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const url = `/api/activity?projectId=${activeProjectId}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          let mappedLogs = data.logs.map((log: any) => ({
            id: log.id,
            stage: log.action.split(':')[0] || 'System',
            action: log.action,
            status: log.status,
            timestamp: new Date(log.createdAt),
            details: log.details
          }));

          if (mappedLogs.length === 0) {
            mappedLogs = generateMockActivities();
          }
          
          setActivities(mappedLogs);
        }
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [activeProjectId]);

  const filtered = filter === 'all' ? activities : activities.filter(a => a.status === filter);

  const successCount = activities.filter(a => a.status === 'success').length;
  const warningCount = activities.filter(a => a.status === 'warning').length;
  const errorCount = activities.filter(a => a.status === 'error').length;

  return (
    <div className="h-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto w-full overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b]/20 to-[#f59e0b]/5 border border-[#f59e0b]/30 flex items-center justify-center">
            <Clock className="w-6 h-6 text-[#f59e0b]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Activity & Audit Trail</h1>
            <p className="text-[#8b9bb4] text-sm mt-1">Every AI action logged · Date-wise timeline view</p>
          </div>
        </div>
      </div>

      {/* Stats + Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-3">
          {[
            { label: 'All', value: 'all', count: activities.length, color: 'text-white' },
            { label: 'Success', value: 'success', count: successCount, color: 'text-green-400' },
            { label: 'Warnings', value: 'warning', count: warningCount, color: 'text-yellow-400' },
            { label: 'Errors', value: 'error', count: errorCount, color: 'text-red-400' },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                filter === f.value ? 'bg-[#5b5fd8]/20 border border-[#5b5fd8] text-white' : 'bg-[#111622] border border-[#1e2532] text-[#8b9bb4] hover:text-white'
              }`}
            >
              <span className={f.color}>{f.count}</span> {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8 pb-8">
        {loading ? (
           <div className="text-center py-10 text-[#586c8f]">Loading activity logs...</div>
        ) : filtered.length === 0 ? (
           <div className="text-center py-10 text-[#586c8f]">No activity logs found.</div>
        ) : (
          Object.entries(
            filtered.reduce((acc, entry) => {
              const dateStr = entry.timestamp.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
              if (!acc[dateStr]) acc[dateStr] = [];
              acc[dateStr].push(entry);
              return acc;
            }, {} as Record<string, ActivityEntry[]>)
          ).map(([date, entries]) => (
            <div key={date} className="relative">
              {/* Date Header */}
              <div className="sticky top-0 z-10 bg-[#0b0e14]/90 backdrop-blur-sm py-3 mb-4 flex items-center gap-4">
                <div className="h-px bg-[#1e2532] flex-1"></div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#8b9bb4]">{date}</h3>
                <div className="h-px bg-[#1e2532] flex-1"></div>
              </div>
              
              <div className="space-y-3 pl-2">
                {entries.map((entry, idx) => {
                  const Icon = stageIcons[entry.stage] || FileCode2;
                  return (
                    <div key={entry.id} className="relative">
                      {/* Timeline Line connecting items */}
                      {idx !== entries.length - 1 && (
                        <div className="absolute left-5 top-12 bottom-[-16px] w-px bg-[#1e2532] z-0"></div>
                      )}
                      <div className={`relative z-10 flex items-start gap-4 p-4 rounded-xl border transition-all hover:bg-white/5 ${
                        entry.status === 'error' ? 'border-red-500/20 bg-red-500/5' :
                        entry.status === 'warning' ? 'border-yellow-500/20 bg-yellow-500/5' :
                        'border-[#1e2532] bg-[#111622]'
                      }`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          entry.status === 'success' ? 'bg-green-500/10 border border-green-500/20' :
                          entry.status === 'error' ? 'bg-red-500/10 border border-red-500/20' :
                          entry.status === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                          entry.status === 'info' ? 'bg-[#3b82f6]/10 border border-[#3b82f6]/20' :
                          'bg-[#5b5fd8]/10 border border-[#5b5fd8]/20'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            entry.status === 'success' ? 'text-green-400' :
                            entry.status === 'error' ? 'text-red-400' :
                            entry.status === 'warning' ? 'text-yellow-400' :
                            entry.status === 'info' ? 'text-[#3b82f6]' :
                            'text-[#5b5fd8]'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-[#5b5fd8] uppercase tracking-wider">{entry.stage}</span>
                            {entry.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
                            {entry.status === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                            {entry.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />}
                          </div>
                          <p className="text-base text-white font-bold">{entry.action}</p>
                          {entry.details && <p className="text-sm text-[#8b9bb4] mt-1.5">{entry.details}</p>}
                        </div>
                        <div className="text-[11px] text-[#586c8f] font-mono whitespace-nowrap bg-[#0b0e14] px-2 py-1 rounded border border-[#1e2532]">
                          {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
