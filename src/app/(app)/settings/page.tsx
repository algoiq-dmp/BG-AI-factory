'use client';

import { useSettingsStore } from '@/store/useSettingsStore';
import { Key, Server, Save, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { deepseekApiKey, ollamaUrl, ollamaAuthToken, setDeepseekApiKey, setOllamaUrl, setOllamaAuthToken } = useSettingsStore();
  
  // Local state for forms to avoid immediate saves/renders on typing
  const [localDeepseek, setLocalDeepseek] = useState('');
  const [localOllamaUrl, setLocalOllamaUrl] = useState('');
  const [localOllamaAuth, setLocalOllamaAuth] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setLocalDeepseek(deepseekApiKey);
    setLocalOllamaUrl(ollamaUrl);
    setLocalOllamaAuth(ollamaAuthToken);
  }, [deepseekApiKey, ollamaUrl, ollamaAuthToken]);

  const handleSave = () => {
    setDeepseekApiKey(localDeepseek);
    setOllamaUrl(localOllamaUrl);
    setOllamaAuthToken(localOllamaAuth);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Platform Settings</h1>
        <p className="text-gray-400">Configure credentials for the cloud AI layer and your local VPS execution engine.</p>
      </header>

      <div className="grid gap-6">
        {/* DeepSeek Panel */}
        <section className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-[var(--color-glass-border)] pb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Key className="w-6 h-6 text-accent-blue" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">DeepSeek V2 Pro</h2>
              <p className="text-sm text-gray-400">Cloud orchestration and reasoning engine</p>
            </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-gray-300">API Key</label>
            <input 
              type="password" 
              value={localDeepseek}
              onChange={(e) => setLocalDeepseek(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-black/40 border border-[var(--color-glass-border)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
            />
          </div>
        </section>

        {/* Ollama VPS Panel */}
        <section className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-[var(--color-glass-border)] pb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Server className="w-6 h-6 text-accent-purple" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">VPS Ollama Swarm</h2>
              <p className="text-sm text-gray-400">Local AI agents for validation, audits, and sandbox monitoring</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Host URL</label>
              <input 
                type="text" 
                value={localOllamaUrl}
                onChange={(e) => setLocalOllamaUrl(e.target.value)}
                placeholder="http://192.168.1.100:11434"
                className="w-full bg-black/40 border border-[var(--color-glass-border)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Auth Token (Optional)</label>
              <input 
                type="password" 
                value={localOllamaAuth}
                onChange={(e) => setLocalOllamaAuth(e.target.value)}
                placeholder="Bearer..."
                className="w-full bg-black/40 border border-[var(--color-glass-border)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all"
              />
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
            <p className="text-sm text-orange-200/80 leading-relaxed">
              Ensure your VPS firewall allows inbound connections from this dashboard if you are not running it locally. These credentials are saved securely in your browser's local storage.
            </p>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            className="glass-panel flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
          >
            {isSaved ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Saved Successfully
              </>
            ) : (
              <>
                <Save className="w-5 h-5 text-accent-neon" />
                Save Credentials
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
