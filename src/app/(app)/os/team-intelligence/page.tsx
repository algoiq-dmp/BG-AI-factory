'use client';

import { useWorkAnalyticsStore, TeamMember } from '@/store/useWorkAnalyticsStore';
import { 
  Users, Trophy, Target, Bug, CheckCircle2, Zap,
  TrendingUp, Clock, ShieldCheck, Plus, X, Trash2
} from 'lucide-react';
import { useOsStore } from '@/store/useOsStore';
import { useState } from 'react';

export default function TeamIntelligencePage() {
  const { mode } = useOsStore();
  const { teamMembers, addTeamMember, removeTeamMember } = useWorkAnalyticsStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: '',
    role: '',
    status: 'online',
    productivityScore: 80,
    productivity: 80,
    aiEfficiency: 75,
    bugsCreated: 0,
    bugsFixed: 0,
    tasksCompleted: 0,
    activeCodingHours: 0
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.role) return;
    
    // Auto-generate avatar initials
    const initials = newMember.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    addTeamMember({
      ...(newMember as Omit<TeamMember, 'id' | 'avatar'>),
      avatar: initials,
    });
    setShowAddModal(false);
    setNewMember({ ...newMember, name: '', role: '' });
  };

  if (mode === 'STARTUP') {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#0b0e14] text-[#8b9bb4]">
        <div className="w-16 h-16 rounded-2xl bg-[#a855f7]/10 flex items-center justify-center mb-6">
          <Zap className="w-8 h-8 text-[#a855f7]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Team Intelligence Hidden</h2>
        <p className="text-sm max-w-md text-center">
          You are currently in Startup mode. Switch to Enterprise mode to access team leaderboards, AI utilization stats, and individual developer analytics.
        </p>
      </div>
    );
  }

  const sortedByProductivity = [...teamMembers].sort((a, b) => b.productivityScore - a.productivityScore);

  return (
    <div className="h-full w-full overflow-y-auto bg-[#0b0e14] text-[#8b9bb4] animate-in fade-in slide-in-from-bottom-4 duration-500 custom-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-[#1e2532] bg-[#0b0e14]/95 backdrop-blur-md px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users className="w-6 h-6 text-[#3b82f6]" />
            Team Intelligence
          </h1>
          <p className="text-sm mt-1 text-[#8b9bb4]">
            Developer leaderboards, AI utilization efficiency, and individual performance metrics.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#5b5fd8] hover:bg-[#4a4fcf] text-white px-4 py-2 rounded-lg font-bold transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      <div className="px-8 py-6 space-y-8">
        {/* Top Performers Podiums */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedByProductivity.slice(0, 3).map((member, index) => (
            <div key={member.id} className={`rounded-2xl border ${index === 0 ? 'border-[#f59e0b]' : 'border-[#1e2532]'} bg-[#111622] p-6 relative overflow-hidden`}>
              {index === 0 && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#f59e0b]/10 blur-2xl rounded-full" />
              )}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  ${index === 0 ? 'bg-[#f59e0b] text-white' : index === 1 ? 'bg-[#94a3b8] text-white' : 'bg-[#b45309] text-white'}
                `}>
                  {index + 1}
                </div>
                {index === 0 && <Trophy className="w-5 h-5 text-[#f59e0b]" />}
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">{member.name}</h3>
                <p className="text-xs text-[#586c8f]">{member.role}</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#8b9bb4] flex items-center gap-2"><Target className="w-4 h-4" /> Productivity</span>
                  <span className="font-bold text-white">{member.productivityScore}/100</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#8b9bb4] flex items-center gap-2"><Zap className="w-4 h-4 text-[#a855f7]" /> AI Efficiency</span>
                  <span className="font-bold text-[#a855f7]">{member.aiEfficiency}%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#8b9bb4] flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10b981]" /> Tasks</span>
                  <span className="font-bold text-[#10b981]">{member.tasksCompleted}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full Roster Table */}
        <div className="rounded-2xl border border-[#1e2532] bg-[#111622] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e2532] bg-[#1a2130]">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Full Team Roster</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0b0e14]/50 border-b border-[#1e2532]">
                <tr>
                  <th className="px-6 py-4 font-semibold text-[#8b9bb4]">Developer</th>
                  <th className="px-6 py-4 font-semibold text-[#8b9bb4]">Status</th>
                  <th className="px-6 py-4 font-semibold text-[#8b9bb4]">Score</th>
                  <th className="px-6 py-4 font-semibold text-[#8b9bb4]">AI %</th>
                  <th className="px-6 py-4 font-semibold text-[#8b9bb4]">Bugs Fixed</th>
                  <th className="px-6 py-4 font-semibold text-[#8b9bb4]">Active Hours</th>
                  <th className="px-6 py-4 font-semibold text-[#8b9bb4]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2532]">
                {sortedByProductivity.map((member) => (
                  <tr key={member.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1e2532] flex items-center justify-center font-bold text-white text-xs border border-[#30363d]">
                          {member.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-white">{member.name}</div>
                          <div className="text-[10px] text-[#586c8f]">{member.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${member.status === 'online' ? 'bg-[#10b981]' : member.status === 'idle' ? 'bg-[#f59e0b]' : 'bg-[#586c8f]'}`} />
                        <span className="text-xs capitalize">{member.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-[#e2e8f0]">{member.productivityScore}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-[#a855f7]">{member.aiEfficiency}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-[#10b981]">{member.bugsFixed}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-[#3b82f6]">{member.activeCodingHours}h</span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => removeTeamMember(member.id)}
                        className="p-1.5 text-[#586c8f] hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111622] border border-[#1e2532] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2532] bg-[#1a2130]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#3b82f6]" /> Add Team Member
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#8b9bb4] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8b9bb4] uppercase tracking-wider mb-2">Developer Name</label>
                <input 
                  type="text" 
                  value={newMember.name || ''}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className="w-full bg-[#0b0e14] border border-[#1e2532] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5b5fd8] transition-colors"
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8b9bb4] uppercase tracking-wider mb-2">Role / Title</label>
                <input 
                  type="text" 
                  value={newMember.role || ''}
                  onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                  className="w-full bg-[#0b0e14] border border-[#1e2532] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5b5fd8] transition-colors"
                  placeholder="e.g. Senior Frontend Engineer"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8b9bb4] uppercase tracking-wider mb-2">Productivity</label>
                  <input 
                    type="number" 
                    value={newMember.productivityScore || 0}
                    onChange={(e) => setNewMember({...newMember, productivityScore: Number(e.target.value), productivity: Number(e.target.value)})}
                    className="w-full bg-[#0b0e14] border border-[#1e2532] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#5b5fd8]"
                    min="0" max="100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8b9bb4] uppercase tracking-wider mb-2">AI Efficiency</label>
                  <input 
                    type="number" 
                    value={newMember.aiEfficiency || 0}
                    onChange={(e) => setNewMember({...newMember, aiEfficiency: Number(e.target.value)})}
                    className="w-full bg-[#0b0e14] border border-[#1e2532] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#5b5fd8]"
                    min="0" max="100"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-[#1e2532] flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-[#8b9bb4] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-[#5b5fd8] hover:bg-[#4a4fcf] text-white px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-[0_0_15px_rgba(91,95,216,0.2)]"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
