'use client';

import { useState } from 'react';
import { Sparkles, Check, X, FileText, CheckCircle2, XCircle, LayoutGrid } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';

interface Feature {
  id: string;
  name: string;
  description: string;
  priority: 'must-have' | 'should-have' | 'good-to-have' | 'nice-to-have';
  category: string;
  approved: boolean;
}

const initialFeatures: Feature[] = [
  // MUST HAVES
  { id: 'f1', name: 'User Authentication', description: 'Login with ID, Password, and 2FA PIN', priority: 'must-have', category: 'auth', approved: true },
  { id: 'f2', name: 'Project Creation Wizard', description: 'Step-by-step project setup with idea input', priority: 'must-have', category: 'core', approved: true },
  { id: 'f3', name: 'AI Question Generator', description: 'Auto-generate structured questions from project idea', priority: 'must-have', category: 'ai', approved: true },
  { id: 'f4', name: 'Blueprint Builder', description: 'Tech stack and architecture selector with 30+ options', priority: 'must-have', category: 'core', approved: true },
  { id: 'f5', name: 'Knowledgebase System', description: 'Create, organize, and search KB articles', priority: 'must-have', category: 'kb', approved: true },
  { id: 'f6', name: 'Prompt Engine', description: 'Generate build, change, audit, debug, optimization prompts', priority: 'must-have', category: 'ai', approved: true },
  { id: 'f7', name: 'Master Document Generator', description: 'Auto-generate complete project specification document', priority: 'must-have', category: 'core', approved: true },
  { id: 'f8', name: 'Audit Engine', description: 'Run code and security audits autonomously', priority: 'must-have', category: 'ai', approved: true },
  
  // SHOULD HAVES
  { id: 'f11', name: 'Feature Engine', description: 'AI-suggested features with approve/reject', priority: 'should-have', category: 'ai', approved: true },
  { id: 'f12', name: 'UI Mockup Generator', description: 'Generate UI wireframes from project description', priority: 'should-have', category: 'ai', approved: false },
  { id: 'f13', name: 'Voice Input', description: 'Voice-to-text for idea capture', priority: 'should-have', category: 'input', approved: false },
  { id: 'f14', name: 'Role-Based Access', description: 'Different permissions for admin, developer, viewer', priority: 'should-have', category: 'auth', approved: true },
  { id: 'f15', name: 'Change Request Tracking', description: 'Track and version all project changes', priority: 'should-have', category: 'core', approved: true },
  { id: 'f16', name: 'API Endpoint Checker', description: 'Validate API endpoints for completeness', priority: 'should-have', category: 'audit', approved: false },

  // NICE TO HAVES
  { id: 'f17', name: 'DB Schema Visualizer', description: 'Visual database schema designer', priority: 'nice-to-have', category: 'core', approved: false },
  { id: 'f18', name: 'Test Case Generator', description: 'Auto-generate test cases from features', priority: 'nice-to-have', category: 'audit', approved: false },
  { id: 'f9', name: 'Dark Mode Framework', description: 'System-wide dark mode styling tokens', priority: 'good-to-have', category: 'ui', approved: false },
  { id: 'f10', name: 'Export to PDF', description: 'Export reports and documents to PDF format', priority: 'good-to-have', category: 'core', approved: false },
];

export default function FeatureEnginePage() {
  const { activeProjectId } = useProjectStore();
  const [features, setFeatures] = useState<Feature[]>(initialFeatures);

  const toggleFeature = (id: string) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, approved: !f.approved } : f));
  };

  const approvedCount = features.filter(f => f.approved).length;
  const rejectedCount = features.length - approvedCount;
  const progressPercentage = Math.round((approvedCount / features.length) * 100);

  const mustHaves = features.filter(f => f.priority === 'must-have');
  const shouldHaves = features.filter(f => f.priority === 'should-have');
  const goodToHaves = features.filter(f => f.priority === 'good-to-have');
  const niceToHaves = features.filter(f => f.priority === 'nice-to-have');

  const FeatureRow = ({ feature }: { feature: Feature }) => (
    <div className="flex items-center justify-between p-5 border-b border-[#1e2532] hover:bg-white/5 transition-colors group">
      <div className="flex items-start gap-4">
        {/* Custom Toggle Switch */}
        <button 
          onClick={() => toggleFeature(feature.id)}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out shrink-0 mt-0.5 ${
            feature.approved ? 'bg-[#10b981]' : 'bg-[#1e2532]'
          }`}
        >
          <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out shadow-sm flex items-center justify-center ${
            feature.approved ? 'transform translate-x-6' : ''
          }`}>
            {feature.approved && <Check className="w-3 h-3 text-[#10b981]" />}
          </div>
        </button>

        <div>
          <h3 className={`text-base font-bold transition-colors ${feature.approved ? 'text-white' : 'text-[#8b9bb4]'}`}>
            {feature.name}
          </h3>
          <p className="text-[#586c8f] text-sm mt-0.5">{feature.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
          feature.priority === 'must-have' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
          feature.priority === 'should-have' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
          feature.priority === 'nice-to-have' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
          'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }`}>
          {feature.priority.replace(/-/g, ' ')}
        </span>
        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#5b5fd8]/10 text-[#5b5fd8] border border-[#5b5fd8]/20">
          {feature.category}
        </span>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto w-full overflow-y-auto">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
            <LayoutGrid className="w-6 h-6 text-[#5b5fd8]" />
            Feature Engine
          </h1>
          <p className="text-[#8b9bb4] text-sm mt-1">
            AI-suggested features. Approve or reject each feature for your project.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-bold text-green-400">{approvedCount} Approved</span>
          </div>
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-bold text-red-400">{rejectedCount} Rejected</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between text-xs font-bold text-[#8b9bb4] mb-2 uppercase tracking-wider">
          <span>{approvedCount} / {features.length} features approved</span>
          <span className="text-white">{progressPercentage}%</span>
        </div>
        <div className="h-2 w-full bg-[#1e2532] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Lists */}
      <div className="space-y-10">
        {mustHaves.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              Must Have ({mustHaves.length})
            </h2>
            <div className="bg-[#111622] border border-[#1e2532] rounded-2xl overflow-hidden shadow-sm">
              {mustHaves.map(f => <FeatureRow key={f.id} feature={f} />)}
            </div>
          </div>
        )}

        {shouldHaves.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              Should Have ({shouldHaves.length})
            </h2>
            <div className="bg-[#111622] border border-[#1e2532] rounded-2xl overflow-hidden shadow-sm">
              {shouldHaves.map(f => <FeatureRow key={f.id} feature={f} />)}
            </div>
          </div>
        )}

        {goodToHaves.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              Good To Have ({goodToHaves.length})
            </h2>
            <div className="bg-[#111622] border border-[#1e2532] rounded-2xl overflow-hidden shadow-sm">
              {goodToHaves.map(f => <FeatureRow key={f.id} feature={f} />)}
            </div>
          </div>
        )}

        {niceToHaves.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              Nice To Have ({niceToHaves.length})
            </h2>
            <div className="bg-[#111622] border border-[#1e2532] rounded-2xl overflow-hidden shadow-sm">
              {niceToHaves.map(f => <FeatureRow key={f.id} feature={f} />)}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
