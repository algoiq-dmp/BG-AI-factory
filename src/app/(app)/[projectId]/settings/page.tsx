'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Key, Save, CheckCircle } from 'lucide-react';

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const [keys, setKeys] = useState({
    kimi: '',
    gpt4: '',
    claude: '',
    gemini: ''
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // In a real implementation, we would fetch the existing keys from the DB
  // via an API route (e.g. GET /api/projects/[id]/settings).
  // For security, APIs don't typically return full keys, but for this MVP,
  // we are just allowing them to set them.

  const handleSave = async () => {
    setLoading(true);
    try {
      // We need an API route for this. Let's assume /api/projects/[id]/settings
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

  return (
    <div className="p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Key className="w-8 h-8 text-amber-400" />
          Project API Settings
        </h1>
        <p className="text-gray-400 mt-2">Configure custom AI model endpoints for the Swarm Orchestrator.</p>
      </div>

      <div className="space-y-6 bg-gray-900/50 p-6 rounded-xl border border-gray-800">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Moonshot (Kimi K2.6) API Key</label>
          <input 
            type="password"
            value={keys.kimi}
            onChange={(e) => setKeys({...keys, kimi: e.target.value})}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            placeholder="sk-..."
          />
          <p className="text-xs text-gray-500 mt-1">Used for Master Agent Swarm Orchestration.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">OpenAI (GPT-4o) API Key</label>
          <input 
            type="password"
            value={keys.gpt4}
            onChange={(e) => setKeys({...keys, gpt4: e.target.value})}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            placeholder="sk-..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Anthropic (Claude 3.5) API Key</label>
          <input 
            type="password"
            value={keys.claude}
            onChange={(e) => setKeys({...keys, claude: e.target.value})}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            placeholder="sk-ant-..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Google (Gemini 1.5) API Key</label>
          <input 
            type="password"
            value={keys.gemini}
            onChange={(e) => setKeys({...keys, gemini: e.target.value})}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            placeholder="AIza..."
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-4">
          {saved && <span className="text-green-400 flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4"/> Saved successfully</span>}
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white font-bold transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Keys'}
          </button>
        </div>
      </div>
    </div>
  );
}
