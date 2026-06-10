'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Key, Save, CheckCircle, Users, UserPlus, Trash2, Shield } from 'lucide-react';

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const [keys, setKeys] = useState({
    kimi: '',
    gpt4: '',
    claude: '',
    gemini: ''
  });
  
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'John Doe', role: 'Project Owner', email: 'john@example.com' },
    { id: '2', name: 'AI Swarm Coordinator', role: 'System', email: 'swarm@bg-ai.com' }
  ]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKeys: keys })
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail) return;
    setTeamMembers([...teamMembers, { 
      id: Date.now().toString(), 
      name: newMemberEmail.split('@')[0], 
      role: 'Member', 
      email: newMemberEmail 
    }]);
    setNewMemberEmail('');
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Left Column: API Settings */}
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Key className="w-6 h-6 text-amber-400" />
            Swarm API Settings
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Configure AI model endpoints.</p>
        </div>

        <div className="space-y-5 bg-gray-900/50 p-6 rounded-xl border border-gray-800">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Moonshot (Kimi K2.6) API Key</label>
            <input 
              type="password"
              value={keys.kimi}
              onChange={(e) => setKeys({...keys, kimi: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              placeholder="sk-..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">OpenAI (GPT-4o) API Key</label>
            <input 
              type="password"
              value={keys.gpt4}
              onChange={(e) => setKeys({...keys, gpt4: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              placeholder="sk-..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Anthropic (Claude 3.5) API Key</label>
            <input 
              type="password"
              value={keys.claude}
              onChange={(e) => setKeys({...keys, claude: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              placeholder="sk-ant-..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Google (Gemini 1.5) API Key</label>
            <input 
              type="password"
              value={keys.gemini}
              onChange={(e) => setKeys({...keys, gemini: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              placeholder="AIza..."
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-4">
            {saved && <span className="text-green-400 flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4"/> Saved</span>}
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white font-bold transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Keys'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Team Management */}
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-[#10b981]" />
            Project Team Members
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Add or delete members collaborating on this project.</p>
        </div>

        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 flex flex-col h-full min-h-[400px]">
          
          <form onSubmit={handleAddMember} className="flex gap-2 mb-6">
            <input 
              type="email"
              required
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="Enter member email..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#10b981]"
            />
            <button type="submit" className="bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] border border-[#10b981]/50 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all">
              <UserPlus className="w-4 h-4" /> Add
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-3">
            {teamMembers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No team members added yet.</div>
            ) : (
              teamMembers.map(member => (
                <div key={member.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-gray-300">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        {member.name}
                        {member.role === 'Project Owner' && <Shield className="w-3 h-3 text-amber-400" />}
                      </div>
                      <div className="text-xs text-gray-400">{member.email} • {member.role}</div>
                    </div>
                  </div>
                  {member.role !== 'Project Owner' && (
                    <button 
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
