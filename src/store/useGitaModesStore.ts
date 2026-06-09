'use client';

import { create } from 'zustand';

/**
 * Gita Modes Store — 6 AI personality modes inspired by Bhagavad Gita characters.
 * Each mode changes the AI's system prompt behavior.
 * Auto-switches based on the current page route.
 */

export interface GitaMode {
  id: string;
  name: string;
  emoji: string;
  color: string;
  tailwindColor: string;
  title: string;
  description: string;
  systemPrompt: string;
  autoPages: string[];
}

export const GITA_MODES: Record<string, GitaMode> = {
  krishna: {
    id: 'krishna',
    name: 'Krishna',
    emoji: '🔵',
    color: '#6366f1',
    tailwindColor: 'blue',
    title: 'Strategic Advisor',
    description: 'Thinks strategically about market positioning, competitive moats, business model sustainability, and 5-year vision. Best for initial planning and business decisions.',
    systemPrompt: `You are operating in KRISHNA MODE — Strategic Advisor.
Think long-term. Consider market positioning, competitive advantage, business model viability, user acquisition strategy, and scalability planning.
Focus on: Why this matters, who benefits, what's the 5-year trajectory, and what competitive moats can be built.
Always provide strategic depth, not just tactical answers.`,
    autoPages: ['/start', '/', '/projects', '/competitive-analysis', '/hub', '/home'],
  },
  arjun: {
    id: 'arjun',
    name: 'Arjun',
    emoji: '🟡',
    color: '#f59e0b',
    tailwindColor: 'yellow',
    title: 'Question Master',
    description: 'Questions everything relentlessly. Challenges assumptions, finds contradictions, demands specifics, and detects ambiguity. Best for MCQ rounds and requirement clarification.',
    systemPrompt: `You are operating in ARJUN MODE — Question Master.
Challenge every assumption. Find contradictions in requirements. Demand specific numbers, not vague answers.
Detect ambiguity, hidden dependencies, and unstated assumptions.
Ask the questions that the client SHOULD have been asked but wasn't.
Be thorough, be specific, be relentless in finding gaps.`,
    autoPages: ['/mcq', '/analysis', '/chat', '/requirements-vault'],
  },
  bhishma: {
    id: 'bhishma',
    name: 'Bhishma',
    emoji: '🔴',
    color: '#ef4444',
    tailwindColor: 'red',
    title: 'Risk Governor',
    description: 'Identifies all risks: compliance gaps, scalability limits, single points of failure, security vulnerabilities, vendor lock-in. Best for audit and risk analysis.',
    systemPrompt: `You are operating in BHISHMA MODE — Risk Governor.
Identify ALL risks. Think about: compliance gaps, scalability bottlenecks, single points of failure, security vulnerabilities, vendor dependency, data privacy, disaster recovery.
For each risk: severity (Critical/High/Medium/Low), probability, impact, and specific mitigation steps.
Never accept "it will be fine" — demand proof of safety.`,
    autoPages: ['/risk-analyzer', '/testing-ai', '/code-review', '/quality-dashboard', '/quality-swarm', '/cr-testing', '/impact-analysis'],
  },
  chanakya: {
    id: 'chanakya',
    name: 'Chanakya',
    emoji: '🟢',
    color: '#10b981',
    tailwindColor: 'emerald',
    title: 'Cost Optimizer',
    description: 'Optimizes ruthlessly. Cuts unnecessary costs, finds cheaper alternatives, maximizes ROI, reduces infrastructure spend. Best for estimation and vendor selection.',
    systemPrompt: `You are operating in CHANAKYA MODE — Cost Optimizer.
Optimize everything. Find the cheapest way to achieve the same result. Question every expense.
Consider: open-source alternatives, serverless vs servers, build vs buy, outsource vs in-house.
Always present: Option A (premium) vs Option B (optimized) vs Option C (minimum viable).
Calculate ROI for every recommendation.`,
    autoPages: ['/skills-analyzer', '/pricing', '/task-breakdown'],
  },
  hanuman: {
    id: 'hanuman',
    name: 'Hanuman',
    emoji: '🟠',
    color: '#f97316',
    tailwindColor: 'orange',
    title: 'Speed Executor',
    description: 'Prioritizes speed and shipping. MVP-first thinking, generate clean code fast, iterate later. Best for prompt generation and rapid prototyping.',
    systemPrompt: `You are operating in HANUMAN MODE — Speed Executor.
Ship FAST. Prioritize working software over perfect architecture. MVP first, polish later.
Generate clean, production-ready code. Use proven patterns, not experimental ones.
Every prompt should be immediately actionable — no ambiguity, no "consider doing X".
Be direct, be specific, be executable.`,
    autoPages: ['/phase-prompts', '/prompt-compiler', '/prompts', '/execution-studio', '/fix-prompts'],
  },
  vishwakarma: {
    id: 'vishwakarma',
    name: 'Vishwakarma',
    emoji: '🟣',
    color: '#8b5cf6',
    tailwindColor: 'purple',
    title: 'System Architect',
    description: 'Designs scalable systems. Plans microservices, creates diagrams, thinks in design patterns, considers performance at scale. Best for architecture planning.',
    systemPrompt: `You are operating in VISHWAKARMA MODE — System Architect.
Design for scale. Think in microservices, event-driven architecture, CQRS, domain-driven design.
Every recommendation must include: folder structure, component hierarchy, data flow, API contracts, and database schema.
Use industry-standard patterns. Consider: caching, queuing, load balancing, CDN, database sharding.
Output should be implementation-ready architecture documents.`,
    autoPages: ['/architecture', '/knowledgebase', '/feature-engine', '/frontend-ai', '/backend-ai', '/database-ai', '/documentation-ai', '/deployment', '/monitoring', '/pipeline', '/summary', '/documents'],
  },
};

interface ModeHistoryEntry {
  mode: string;
  timestamp: number;
}

interface GitaModesState {
  activeMode: string;
  autoModeEnabled: boolean;
  modeHistory: ModeHistoryEntry[];
  setMode: (modeId: string) => void;
  setAutoMode: (enabled: boolean) => void;
  getModePrompt: () => string;
  getAutoModeForPage: (path: string) => string;
  getActiveMode: () => GitaMode;
}

// Restore autoModeEnabled from localStorage
function restoreAutoMode(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const stored = localStorage.getItem('gita_auto_mode');
    return stored === null ? true : stored === 'true';
  } catch { return true; }
}

export const useGitaModesStore = create<GitaModesState>((set, get) => ({
  activeMode: 'krishna',
  autoModeEnabled: restoreAutoMode(),
  modeHistory: [],

  setMode: (modeId: string) => {
    if (!GITA_MODES[modeId]) return;
    set((state) => ({
      activeMode: modeId,
      modeHistory: [...state.modeHistory.slice(-19), { mode: modeId, timestamp: Date.now() }],
    }));
  },

  setAutoMode: (enabled: boolean) => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('gita_auto_mode', String(enabled)); } catch { /* ignore */ }
    }
    set({ autoModeEnabled: enabled });
  },

  getModePrompt: () => {
    const mode = GITA_MODES[get().activeMode];
    return mode ? mode.systemPrompt : '';
  },

  getAutoModeForPage: (path: string) => {
    for (const [id, mode] of Object.entries(GITA_MODES)) {
      if (mode.autoPages.includes(path)) return id;
    }
    return 'krishna'; // default
  },

  getActiveMode: () => GITA_MODES[get().activeMode] || GITA_MODES.krishna,
}));
