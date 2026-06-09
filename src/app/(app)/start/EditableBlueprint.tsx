'use client';

import { useState } from 'react';
import { ChevronDown, Plus, Sparkles, X, Edit2 } from 'lucide-react';

const BLUEPRINT_CONFIG = [
  {
    id: 'projectType',
    label: 'PROJECT TYPE',
    options: ['AI thinking system', 'SaaS Platform', 'Internal Dashboard', 'E-commerce', 'Mobile App Backend', 'Microservice API'],
    default: 'AI thinking system',
    chips: ['Landing Page']
  },
  {
    id: 'targetUser',
    label: 'TARGET USER',
    options: ['Founders and builders', 'Enterprise Teams', 'Consumers (B2C)', 'Admins', 'Freelancers', 'Students'],
    default: 'Founders and builders',
    chips: []
  },
  {
    id: 'buildStage',
    label: 'BUILD STAGE',
    options: ['MVP', 'V1 Launch', 'Scaling', 'Prototype', 'Proof of Concept (PoC)'],
    default: 'MVP',
    chips: []
  },
  {
    id: 'uiUxType',
    label: 'UI/UX TYPE',
    options: ['Knowledgebase workspace', 'Data Dashboard', 'Social Feed', 'Kanban Board', 'Chat Interface', 'E-commerce Storefront'],
    default: 'Knowledgebase workspace',
    chips: []
  },
  {
    id: 'appShell',
    label: 'APP SHELL',
    options: ['Three pane workspace', 'Sidebar + Header', 'Top Navigation', 'Full Screen Map', 'Chat Window Only'],
    default: 'Three pane workspace',
    chips: []
  },
  {
    id: 'frontend',
    label: 'FRONTEND',
    options: ['Next.js', 'React SPA', 'Vue.js', 'SvelteKit', 'Angular', 'Astro', 'Nuxt.js'],
    default: 'Next.js',
    chips: ['HTML', 'React']
  },
  {
    id: 'backend',
    label: 'BACKEND',
    options: [
      'FastAPI (Open Source)',
      'Node.js (Express) (Open Source)',
      'Node.js (Fastify) (Open Source)',
      'Django (Open Source)',
      'Flask (Open Source)',
      'Go (Gin) (Open Source)',
      'Spring Boot (Open Source)',
      '.NET Core',
      'Asp.Net Core'
    ],
    default: 'FastAPI (Open Source)',
    chips: ['Asp.Net Core']
  },
  {
    id: 'database',
    label: 'DATABASE',
    options: ['PostgreSQL (Open Source)', 'MongoDB', 'MySQL', 'Redis', 'SQLite', 'DynamoDB', 'Supabase', 'Firebase'],
    default: 'PostgreSQL (Open Source)',
    chips: ['SQL']
  },
  {
    id: 'aiProvider',
    label: 'AI PROVIDER',
    options: ['OpenAI', 'Anthropic', 'Local Llama', 'Gemini', 'HuggingFace', 'Cohere'],
    default: 'OpenAI',
    chips: []
  },
  {
    id: 'kbFrontEnd',
    label: 'KNOWLEDGEBASE FRONT END',
    options: ['Article list + editor', 'Grid View', 'Tree Directory', 'Search only', 'Wiki Format'],
    default: 'Article list + editor',
    chips: []
  },
  {
    id: 'kbModel',
    label: 'KNOWLEDGE MODEL',
    options: ['Projects and prompts', 'Tags and Folders', 'Flat Hierarchy', 'Graph Nodes', 'Vector Embeddings'],
    default: 'Projects and prompts',
    chips: []
  },
  {
    id: 'editorType',
    label: 'EDITOR TYPE',
    options: ['Prompt template editor', 'Rich Text (WYSIWYG)', 'Markdown Editor', 'Code Editor', 'Block Editor (Notion-style)'],
    default: 'Prompt template editor',
    chips: []
  },
  {
    id: 'searchMode',
    label: 'SEARCH MODE',
    options: ['Hybrid keyword + vector', 'Exact Match', 'Semantic Vector Only', 'Fuzzy Search', 'Elasticsearch'],
    default: 'Hybrid keyword + vector',
    chips: []
  },
  {
    id: 'authStrategy',
    label: 'AUTH STRATEGY',
    options: ['Email/password', 'OAuth (Google/GitHub)', 'Magic Links', 'SSO (SAML)', 'Web3 Wallet'],
    default: 'Email/password',
    chips: []
  },
  {
    id: 'passwordReset',
    label: 'PASSWORD RESET',
    options: ['Email reset link', 'Security Questions', 'SMS OTP', 'Admin manual reset'],
    default: 'Email reset link',
    chips: []
  },
  {
    id: 'userRoles',
    label: 'USER ROLES',
    options: ['Owner/admin/member', 'Flat (All equal)', 'Custom RBAC', 'Single User'],
    default: 'Owner/admin/member',
    chips: []
  }
];

export default function EditableBlueprint() {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    BLUEPRINT_CONFIG.forEach(f => init[f.id] = `🟢 ${f.default}`);
    return init;
  });

  const [activeChips, setActiveChips] = useState<Record<string, string[]>>({});
  const [customOptions, setCustomOptions] = useState<Record<string, string[]>>({});

  const handleChange = (id: string, val: string) => {
    if (val === '+ Add custom option...') {
      const customVal = prompt('Enter custom option:');
      if (customVal && customVal.trim()) {
        const newVal = `🟢 ${customVal.trim()}`;
        setCustomOptions(prev => ({
          ...prev,
          [id]: [...(prev[id] || []), newVal]
        }));
        setValues(prev => ({ ...prev, [id]: newVal }));
      }
      return;
    }
    setValues(prev => ({ ...prev, [id]: val }));
  };

  const toggleChip = (id: string, chip: string) => {
    setActiveChips(prev => {
      const current = prev[id] || [];
      if (current.includes(chip)) {
        return { ...prev, [id]: current.filter(c => c !== chip) };
      }
      return { ...prev, [id]: [...current, chip] };
    });
  };

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6 border-b border-[#1e2532] pb-3">
        <h3 className="text-sm font-bold text-[#f59e0b] uppercase tracking-widest flex items-center gap-2">
          REQUIRED BLUEPRINT
        </h3>
        <div className="h-px bg-gradient-to-r from-[#f59e0b]/50 to-transparent flex-1" />
        <button className="text-xs font-bold text-[#818cf8] flex items-center gap-1.5 px-3 py-1 bg-[#5b5fd8]/10 rounded-full border border-[#5b5fd8]/30 hover:bg-[#5b5fd8]/20 transition-all">
          <Edit2 size={12}/> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {BLUEPRINT_CONFIG.map((field) => (
          <div key={field.id} className="flex flex-col">
            <label className="text-xs font-bold text-[#8b9bb4] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              {field.label}
              <div className="w-3.5 h-3.5 rounded-full bg-[#5b5fd8]/20 text-[#818cf8] flex items-center justify-center text-[8px] font-bold border border-[#5b5fd8]/40">
                i
              </div>
            </label>
            
            <div className="relative">
              <select
                value={values[field.id]}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="w-full appearance-none bg-[#111622] border border-[#1e2532] rounded-lg py-2.5 pl-4 pr-10 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#5b5fd8] transition-colors cursor-pointer"
              >
                <option value="🚫 Not Required">🚫 Not Required</option>
                {field.options.map(opt => (
                  <option key={opt} value={`🟢 ${opt}`}>🟢 {opt}</option>
                ))}
                {(customOptions[field.id] || []).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="+ Add custom option...">+ Add custom option...</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#586c8f]">
                <ChevronDown size={14} />
              </div>
            </div>

            {field.chips && field.chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {field.chips.map(chip => {
                  const isActive = (activeChips[field.id] || []).includes(chip);
                  return (
                    <button
                      key={chip}
                      onClick={() => toggleChip(field.id, chip)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                        isActive 
                          ? 'bg-[#5b5fd8]/10 text-[#818cf8] border-[#5b5fd8]/30' 
                          : 'bg-[#1e2532]/50 text-[#8b9bb4] border-transparent hover:bg-[#1e2532]'
                      }`}
                    >
                      <Plus size={10} className={isActive ? 'rotate-45 transition-transform text-[#818cf8]' : 'text-[#586c8f]'} />
                      {chip}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
