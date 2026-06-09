'use client';

import { useState, useEffect } from 'react';
import mermaid from 'mermaid';
import { 
  BarChart, Clock, ShieldCheck, Cpu, BrainCircuit, Activity, BookOpen, Layers
} from 'lucide-react';

const ARCHITECTURE_DIAGRAM = `
graph TD
  Client[Web / Mobile Client] -->|HTTPS| API[Next.js API Routes]
  API -->|Prisma| DB[(PostgreSQL)]
  API -->|Vercel AI SDK| LLM[DeepSeek / OpenAI]
  API -->|Redis| Cache[(Redis Cache)]
  LLM -.->|Vector Embeddings| VectorDB[(Pinecone DB)]
`;

export default function ProjectIntelligence({ dynamicData }: { dynamicData?: any }) {
  const [activeTab, setActiveTab] = useState<'ESTIMATION' | 'DOMAIN' | 'ARCHITECTURE'>('ESTIMATION');

  useEffect(() => {
    if (activeTab === 'ARCHITECTURE') {
      mermaid.initialize({ startOnLoad: true, theme: 'dark' });
      mermaid.contentLoaded();
    }
  }, [activeTab]);

  return (
    <div className="bg-[#111622]/30 border border-[#1e2532] rounded-xl overflow-hidden mt-8">
      {/* Tabs */}
      <div className="flex border-b border-[#1e2532] bg-[#0b0e14]/50 p-2 gap-2">
        <button 
          onClick={() => setActiveTab('ESTIMATION')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'ESTIMATION' ? 'bg-[#5b5fd8] text-white shadow-[0_0_15px_rgba(91,95,216,0.3)]' : 'text-[#8b9bb4] hover:text-[#c9d1d9] hover:bg-[#1e2532]'
          }`}
        >
          Estimation Engine
        </button>
        <button 
          onClick={() => setActiveTab('DOMAIN')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'DOMAIN' ? 'bg-[#5b5fd8] text-white shadow-[0_0_15px_rgba(91,95,216,0.3)]' : 'text-[#8b9bb4] hover:text-[#c9d1d9] hover:bg-[#1e2532]'
          }`}
        >
          Domain Knowledge Builder
        </button>
        <button 
          onClick={() => setActiveTab('ARCHITECTURE')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'ARCHITECTURE' ? 'bg-[#5b5fd8] text-white shadow-[0_0_15px_rgba(91,95,216,0.3)]' : 'text-[#8b9bb4] hover:text-[#c9d1d9] hover:bg-[#1e2532]'
          }`}
        >
          Flow Diagrams
        </button>
      </div>

      <div className="p-6">
        {/* ESTIMATION ENGINE */}
        {activeTab === 'ESTIMATION' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-[#a855f7]" /> Project Estimation Engine
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#0b0e14] border border-[#1e2532] p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#8b9bb4] uppercase">AI Only Timeline</span>
                  <BrainCircuit className="w-4 h-4 text-[#a855f7]" />
                </div>
                <div className="text-2xl font-black text-white">{dynamicData?.aiTime || '4 Weeks'}</div>
                <p className="text-[10px] text-[#586c8f] mt-1">Best Case Scenario. Requires clear prompts.</p>
              </div>
              <div className="bg-[#0b0e14] border border-[#1e2532] p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#8b9bb4] uppercase">Human Only Timeline</span>
                  <Clock className="w-4 h-4 text-[#ef4444]" />
                </div>
                <div className="text-2xl font-black text-white">{dynamicData?.humanTime || '16 Weeks'}</div>
                <p className="text-[10px] text-[#586c8f] mt-1">Worst Case. High manual coding effort.</p>
              </div>
              <div className="bg-[#0b0e14] border border-[#1e2532] p-4 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#10b981]/10 to-transparent pointer-events-none" />
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#8b9bb4] uppercase">Hybrid (AI + Human)</span>
                  <Activity className="w-4 h-4 text-[#10b981]" />
                </div>
                <div className="text-2xl font-black text-[#10b981]">{dynamicData?.hybridTime || '6 Weeks'}</div>
                <p className="text-[10px] text-[#586c8f] mt-1">Expected Timeline. High quality & speed.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ScoreCard title="Complexity" score={85} color="#f59e0b" />
              <ScoreCard title="Risk Score" score={32} color="#10b981" />
              <ScoreCard title="Maintenance" score={60} color="#3b82f6" />
              <ScoreCard title="Scalability" score={94} color="#a855f7" />
            </div>
            
            <div className="mt-6 p-4 bg-[#111622] border border-[#1e2532] rounded-xl text-sm text-[#8b9bb4]">
              <strong className="text-white">Analysis:</strong> {dynamicData?.analysis || 'This timeline is suggested because the core features rely heavily on standard CRUD and established AI integrations. The main bottleneck will be setting up real-time WebSockets for market data. The recommended approach is to have AI generate the boilerplate API layer while humans focus on the specialized WebSocket trading logic.'}
            </div>
          </div>
        )}

        {/* DOMAIN KNOWLEDGE BUILDER */}
        {activeTab === 'DOMAIN' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#3b82f6]" /> Auto Domain Knowledge Builder
            </h3>
            <div className="space-y-4">
              <DomainCard 
                title="Industry Knowledge: FinTech & Trading" 
                content="Platform caters to retail and institutional traders. Key aspects include order book matching, latency optimization, and margin calculations."
              />
              <DomainCard 
                title="Regulatory Requirements" 
                content="Must comply with KYC/AML regulations, SOC2 for data security, and SEC guidelines for trading platforms. Data retention policies mandate 7-year logging."
              />
              <DomainCard 
                title="Competitor Analysis" 
                content="Direct competitors include Zerodha, Robinhood, and Webull. Differentiator is the embedded AI execution and real-time custom algorithms."
              />
            </div>
          </div>
        )}

        {/* FLOW DIAGRAMS */}
        {activeTab === 'ARCHITECTURE' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#10b981]" /> System Architecture Diagram
              </h3>
              <div className="flex gap-2">
                <span className="text-[10px] uppercase font-bold text-[#8b9bb4] bg-[#0b0e14] border border-[#1e2532] px-2 py-1 rounded">Export PNG</span>
                <span className="text-[10px] uppercase font-bold text-[#8b9bb4] bg-[#0b0e14] border border-[#1e2532] px-2 py-1 rounded">Export PDF</span>
              </div>
            </div>
            <div className="bg-[#0b0e14] p-8 rounded-xl border border-[#1e2532] flex justify-center items-center overflow-auto">
              <div className="mermaid">
                {ARCHITECTURE_DIAGRAM}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreCard({ title, score, color }: { title: string, score: number, color: string }) {
  return (
    <div className="bg-[#0b0e14] border border-[#1e2532] p-4 rounded-xl flex flex-col items-center justify-center text-center">
      <div className="relative w-16 h-16 flex items-center justify-center mb-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-[#1e2532]"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
          />
        </svg>
        <span className="absolute text-sm font-bold text-white">{score}</span>
      </div>
      <span className="text-[10px] font-bold text-[#8b9bb4] uppercase tracking-wider">{title}</span>
    </div>
  );
}

function DomainCard({ title, content }: { title: string, content: string }) {
  return (
    <div className="p-4 bg-[#0b0e14] border border-[#1e2532] rounded-xl hover:border-[#3b82f6]/50 transition-colors">
      <h4 className="text-sm font-bold text-white mb-2">{title}</h4>
      <p className="text-xs text-[#8b9bb4] leading-relaxed">{content}</p>
    </div>
  );
}
