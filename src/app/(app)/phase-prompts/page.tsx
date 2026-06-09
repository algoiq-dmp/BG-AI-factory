'use client';

import { 
  Cpu, 
  Sparkles, 
  Zap, 
  Heart, 
  Diamond, 
  Waves, 
  Bot,
  Circle,
  Code2
} from 'lucide-react';
import { useState } from 'react';

const platforms = [
  { id: 'claude', name: 'Claude (Antigravity)', icon: Circle, color: 'text-purple-400', bg: 'bg-purple-400' },
  { id: 'gpt4', name: 'GPT-4 / ChatGPT', icon: Circle, color: 'text-green-400', bg: 'bg-green-400' },
  { id: 'gemini', name: 'Google Gemini 3.1 Pro High', icon: Sparkles, color: 'text-blue-300', bg: 'bg-blue-300' },
  { id: 'cursor', name: 'Cursor AI', icon: Circle, color: 'text-blue-400', bg: 'bg-blue-400' },
  { id: 'bolt', name: 'Bolt.new', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-400' },
  { id: 'lovable', name: 'Lovable', icon: Heart, color: 'text-fuchsia-400', bg: 'bg-fuchsia-400' },
  { id: 'replit', name: 'Replit Agent', icon: Diamond, color: 'text-blue-500', bg: 'bg-blue-500' },
  { id: 'windsurf', name: 'Windsurf', icon: Waves, color: 'text-cyan-400', bg: 'bg-cyan-400' },
  { id: 'devin', name: 'Devin', icon: Bot, color: 'text-pink-400', bg: 'bg-pink-400' },
  { id: 'deepseek', name: 'DeepSeek Coder V2', icon: Circle, color: 'text-indigo-400', bg: 'bg-indigo-400' },
  { id: 'copilot', name: 'GitHub Copilot', icon: Circle, color: 'text-gray-300', bg: 'bg-gray-300' },
  { id: 'cline', name: 'Roo Code / Cline', icon: Bot, color: 'text-amber-400', bg: 'bg-amber-400' },
];

export default function PromptCompilerPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
          <Cpu className="w-6 h-6 text-[#5b5fd8]" />
          Multi-Platform Prompt Compiler
        </h1>
        <p className="text-[#8b9bb4] text-sm mt-1">
          Generate optimized prompts for 12 AI development platforms
        </p>
      </div>

      {/* Grid of Platforms */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setSelectedPlatform(platform.id)}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
              selectedPlatform === platform.id
                ? 'bg-[#1a1b3b] border-[#5b5fd8] shadow-[0_0_15px_rgba(91,95,216,0.2)]'
                : 'bg-[#0b0e14] border-[#1e2532] hover:border-[#586c8f]'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-b from-white/10 to-transparent shadow-inner border border-white/5`}>
              {platform.icon === Circle ? (
                <div className={`w-4 h-4 rounded-full ${platform.bg} shadow-[0_0_10px_${platform.bg.replace('bg-', '')}]`} />
              ) : (
                <platform.icon className={`w-5 h-5 ${platform.color}`} />
              )}
            </div>
            <span className={`text-xs font-bold text-center ${selectedPlatform === platform.id ? 'text-white' : 'text-[#8b9bb4]'}`}>
              {platform.name}
            </span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 mt-4 rounded-xl border border-[#1e2532] bg-[#0b0e14] flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
        {selectedPlatform ? (
          <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center">
            <Cpu className="w-12 h-12 text-[#5b5fd8] mb-4 animate-pulse" />
            <h2 className="text-xl font-bold text-white mb-2">Generating Prompt...</h2>
            <p className="text-[#8b9bb4] text-sm">Compiling context from Knowledge Base for {platforms.find(p => p.id === selectedPlatform)?.name}</p>
          </div>
        ) : (
          <>
            <Cpu className="w-12 h-12 text-[#1e2532] mb-4" />
            <p className="text-[#586c8f] text-sm font-medium">
              Select a platform above to generate an optimized prompt
            </p>
          </>
        )}
      </div>

    </div>
  );
}
