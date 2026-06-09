'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Bot, PlayCircle, Settings, CheckCircle, ShieldAlert, Cpu, Network } from 'lucide-react';
import { SwarmPlan, SwarmAgent, ExecutionPhase } from '@/lib/ai/swarm-orchestrator';

export default function AgentSwarmPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const [loading, setLoading] = useState(false);
  const [swarmPlan, setSwarmPlan] = useState<SwarmPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);

  React.useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const p = d.projects.find((x: any) => x.id === projectId);
          setProject(p);
        }
      })
      .catch(() => {});
  }, [projectId]);

  const initializeSwarm = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/swarm/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          projectName: project?.name || 'Unknown Project',
          projectDescription: project?.description || '',
          domain: 'E-Commerce',
          action: 'initialize'
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setSwarmPlan(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const executePhase = async (phaseId: number) => {
    try {
      // Opt UI update to show running state
      setSwarmPlan(prev => prev ? {
        ...prev,
        executionPlan: prev.executionPlan.map(p => p.phaseId === phaseId ? { ...p, status: 'in_progress' } : p)
      } : prev);

      const res = await fetch('/api/swarm/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          projectName: project?.name || 'Unknown Project',
          projectDescription: project?.description || '',
          domain: 'E-Commerce',
          action: 'executePhase',
          phaseId
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      setSwarmPlan(data.updatedPlan);
      alert(`Phase ${phaseId} completed! Output saved to: ${data.result.outputFile}`);
    } catch (err: any) {
      setError(`Phase ${phaseId} failed: ${err.message}`);
      // Re-fetch plan to sync status
      initializeSwarm(); 
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Network className="w-8 h-8 text-cyan-400" />
            Autonomous Agent Swarm
          </h1>
          <p className="text-gray-400 mt-2">Master Orchestrator managing 300+ specialized AI Agents.</p>
        </div>
        
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors">
            <Settings className="w-4 h-4" /> API Settings
          </button>
          <button 
            onClick={initializeSwarm}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-bold transition-all disabled:opacity-50"
          >
            {loading ? <Cpu className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
            {loading ? 'Orchestrating...' : 'Initialize Swarm'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center gap-3 mb-8">
          <ShieldAlert className="w-5 h-5" />
          {error}
        </div>
      )}

      {!swarmPlan && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-900/50 border border-gray-800 rounded-xl">
          <Bot className="w-16 h-16 text-gray-700 mb-4" />
          <h3 className="text-xl font-bold text-gray-300">Swarm Dormant</h3>
          <p className="text-gray-500 mt-2">Click Initialize to awaken the Master Orchestrator and assign agents.</p>
        </div>
      )}

      {swarmPlan && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Executive Summary */}
          <section className="p-6 bg-gray-900/80 border border-gray-800 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">Project Understanding</h2>
            <p className="text-gray-300 leading-relaxed">{swarmPlan.projectUnderstanding}</p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Agent Roster */}
            <section className="p-6 bg-gray-900/80 border border-gray-800 rounded-xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                Assigned Swarm Roster ({swarmPlan.assignedAgents.length} Agents)
              </h2>
              <div className="space-y-3">
                {swarmPlan.assignedAgents.map((agent, i) => (
                  <div key={i} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">{agent.role}</h4>
                        <span className="text-xs text-gray-400">ID: {agent.id} | Model: {agent.model}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {agent.skills.map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-cyan-900/30 text-cyan-400 text-[10px] rounded uppercase font-bold tracking-wider">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Execution Plan */}
            <section className="p-6 bg-gray-900/80 border border-gray-800 rounded-xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                10-Phase Pipeline
              </h2>
              <div className="space-y-4">
                {swarmPlan.executionPlan.map((phase) => (
                  <div key={phase.phaseId} className="flex gap-4 items-start relative group">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-colors ${
                      phase.status === 'completed' ? 'bg-green-900/50 border-green-500 text-green-400' :
                      phase.status === 'in_progress' ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400 animate-pulse' :
                      phase.status === 'failed' ? 'bg-red-900/50 border-red-500 text-red-400' :
                      'bg-gray-800 border-gray-700 text-gray-400'
                    }`}>
                      {phase.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs font-bold">{phase.phaseId}</span>}
                    </div>
                    <div className="flex-1 pb-4 border-l-2 border-gray-800 -ml-6 pl-10 flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">{phase.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">Assigned: {phase.assignedAgents.join(', ')}</p>
                        {phase.status === 'completed' && <p className="text-xs text-green-400 mt-1">✓ Output generated and saved.</p>}
                      </div>
                      <button 
                        onClick={() => executePhase(phase.phaseId)}
                        disabled={phase.status === 'in_progress' || phase.status === 'completed'}
                        className={`text-xs px-3 py-1.5 rounded font-bold transition-all ${
                          phase.status === 'completed' ? 'bg-gray-800 text-gray-500 cursor-not-allowed' :
                          phase.status === 'in_progress' ? 'bg-cyan-900/50 text-cyan-500 cursor-wait' :
                          'bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/40 border border-cyan-700/50'
                        }`}
                      >
                        {phase.status === 'in_progress' ? 'Executing...' : 
                         phase.status === 'completed' ? 'Done' : 'Start Phase'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
