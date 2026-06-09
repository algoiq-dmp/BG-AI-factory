'use client';

import { Bot, CheckCircle2, CircleDashed, ServerCrash, Cpu } from 'lucide-react';

const agents = [
  { name: 'Requirement Agent', role: 'Idea & BRD', status: 'completed' },
  { name: 'System Architect', role: 'Architecture', status: 'completed' },
  { name: 'Frontend Agent', role: 'Development', status: 'active' },
  { name: 'Security Auditor', role: 'Ollama VPS', status: 'waiting' },
  { name: 'Deployment Agent', role: 'Docker Ops', status: 'waiting' },
];

export default function AgentStatusPanel() {
  return (
    <div className="glass-panel w-80 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-[var(--color-glass-border)] bg-black/20">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-accent-neon" />
          Live Swarm Telemetry
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Token Usage Stats */}
        <div className="p-4 rounded-lg bg-blue-900/10 border border-blue-500/20 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">DeepSeek Tokens</span>
            <span className="text-blue-400 font-mono">1.2M / 5M</span>
          </div>
          <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
            <div className="bg-accent-blue h-full w-[24%]" />
          </div>
        </div>

        {/* Agent List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Agents</h3>
          {agents.map((agent) => (
            <div 
              key={agent.name} 
              className={`p-3 rounded-lg border transition-all ${
                agent.status === 'active' 
                  ? 'bg-purple-900/10 border-purple-500/30 shadow-[0_0_10px_rgba(139,92,246,0.1)]' 
                  : 'bg-black/20 border-[var(--color-glass-border)]'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <Bot className={`w-4 h-4 ${
                    agent.status === 'active' ? 'text-accent-purple animate-pulse' : 
                    agent.status === 'completed' ? 'text-green-400' : 'text-gray-500'
                  }`} />
                  <span className="font-medium text-sm text-gray-200">{agent.name}</span>
                </div>
                {agent.status === 'active' && <CircleDashed className="w-4 h-4 text-accent-neon animate-spin" />}
                {agent.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {agent.status === 'waiting' && <span className="w-2 h-2 rounded-full bg-gray-600 mt-1" />}
              </div>
              <p className="text-xs text-gray-500 pl-6">{agent.role}</p>
            </div>
          ))}
        </div>

        {/* Quality Audit Mini-Dashboard */}
        <div className="mt-8 pt-4 border-t border-[var(--color-glass-border)] space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quality Score (Local Audit)</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-black/30 border border-green-500/20 rounded-lg text-center">
              <div className="text-xl font-bold text-green-400">92%</div>
              <div className="text-[10px] text-gray-500 uppercase mt-1">Code Quality</div>
            </div>
            <div className="p-3 bg-black/30 border border-orange-500/20 rounded-lg text-center">
              <div className="text-xl font-bold text-orange-400">88%</div>
              <div className="text-[10px] text-gray-500 uppercase mt-1">Security Scan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
