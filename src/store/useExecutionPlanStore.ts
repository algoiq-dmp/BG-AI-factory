/**
 * @file Execution Plan Store — Zustand state for the post-prompt execution plan
 * @description Bridges prompt generation → code execution. Manages sprints, modules,
 *              tasks, agent assignments, and AI approval. Simulates a realistic
 *              multi-stage generation pipeline and persists state to localStorage.
 * @module store/useExecutionPlanStore
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  estimatedHours: number;
  assignedAgent: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  files: string[];
  tasks: Task[];
  complexity: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours: number;
}

export interface Sprint {
  id: string;
  name: string;
  description: string;
  modules: Module[];
  estimatedHours: number;
  aiConfidence: number; // 0-100
  assignedAgent: string; // agent id from GITA_MODES
  dependencies: string[]; // sprint ids this depends on
  status: 'planned' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface AgentAssignment {
  agentId: string;
  agentName: string;
  agentEmoji: string;
  agentColor: string;
  role: string;
  skills: { name: string; level: number }[]; // level 1-10
  assignedModules: string[];
  estimatedTokens: number;
  reason: string;
}

export interface ApprovalResult {
  approved: boolean;
  score: number; // 0-100
  completeness: number;
  riskAssessment: number;
  feasibility: number;
  dependencyResolution: number;
  flags: string[];
  timestamp: number;
}

export interface KeyMetrics {
  features: number;
  techStack: string[];
  complexity: string;
}

export interface ExecutionPlanState {
  // Data
  understandingSummary: string | null;
  keyMetrics: KeyMetrics | null;
  sprints: Sprint[];
  agentAssignments: AgentAssignment[];
  approval: ApprovalResult | null;

  // Status
  planStatus: 'idle' | 'generating' | 'review' | 'approved' | 'rejected';
  generationProgress: number; // 0-100

  // Actions
  generatePlan: (projectId: string) => Promise<void>;
  approvePlan: () => void;
  rejectPlan: (reason: string) => void;
  updateSprintStatus: (sprintId: string, status: Sprint['status']) => void;
  updateTaskStatus: (sprintId: string, moduleId: string, taskId: string, status: Task['status']) => void;
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper – tiny async delay
// ─────────────────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Smoothly animate progress from `from` to `to` in `steps` increments. */
async function animateProgress(
  from: number,
  to: number,
  steps: number,
  setProgress: (p: number) => void,
) {
  const increment = (to - from) / steps;
  let current = from;
  for (let i = 0; i < steps; i++) {
    current = Math.min(to, current + increment);
    setProgress(Math.round(current));
    await delay(80 + Math.random() * 120); // 80-200 ms per tick → human-feel
  }
  setProgress(to);
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data Factories
// ─────────────────────────────────────────────────────────────────────────────

function buildMockSprints(): Sprint[] {
  return [
    // ── Sprint 1 — Foundation & Auth ──────────────────────────────────────
    {
      id: 'sprint-1',
      name: 'Foundation & Auth',
      description:
        'Set up the monorepo scaffolding, configure CI/CD pipelines, integrate authentication (OAuth 2.0 + JWT), and establish the base design-system tokens.',
      estimatedHours: 34,
      aiConfidence: 96,
      assignedAgent: 'vishwakarma',
      dependencies: [],
      status: 'planned',
      priority: 'critical',
      modules: [
        {
          id: 'mod-1-1',
          name: 'Project Scaffolding',
          description: 'Next.js 14 app-router, Tailwind config, ESLint/Prettier, monorepo turborepo workspace.',
          files: [
            'package.json',
            'turbo.json',
            'apps/web/next.config.ts',
            'apps/web/tailwind.config.ts',
            'packages/ui/index.ts',
          ],
          complexity: 'medium',
          estimatedHours: 10,
          tasks: [
            { id: 'task-1-1-1', title: 'Initialize turborepo workspace', description: 'Create root package.json with turborepo, configure workspaces for apps/web and packages/ui.', status: 'todo', estimatedHours: 2, assignedAgent: 'vishwakarma' },
            { id: 'task-1-1-2', title: 'Configure Tailwind + design tokens', description: 'Set up Tailwind CSS with custom theme extending bg-[#0b0e14] dark palette and gradient utilities.', status: 'todo', estimatedHours: 3, assignedAgent: 'vishwakarma' },
            { id: 'task-1-1-3', title: 'ESLint, Prettier & Husky hooks', description: 'Add shared ESLint config, Prettier rules, and pre-commit hooks with lint-staged.', status: 'todo', estimatedHours: 2, assignedAgent: 'hanuman' },
            { id: 'task-1-1-4', title: 'CI/CD GitHub Actions', description: 'Create build/test/deploy workflows for staging and production environments.', status: 'todo', estimatedHours: 3, assignedAgent: 'hanuman' },
          ],
        },
        {
          id: 'mod-1-2',
          name: 'Authentication System',
          description: 'NextAuth.js with Google/GitHub OAuth, JWT session, RBAC middleware, and protected API routes.',
          files: [
            'apps/web/app/api/auth/[...nextauth]/route.ts',
            'apps/web/lib/auth.ts',
            'apps/web/middleware.ts',
            'packages/db/prisma/schema.prisma',
          ],
          complexity: 'high',
          estimatedHours: 14,
          tasks: [
            { id: 'task-1-2-1', title: 'NextAuth provider setup', description: 'Configure Google and GitHub OAuth providers with proper scopes and callback URLs.', status: 'todo', estimatedHours: 4, assignedAgent: 'vishwakarma' },
            { id: 'task-1-2-2', title: 'JWT session & refresh flow', description: 'Implement custom JWT callbacks, session strategy, and silent token refresh.', status: 'todo', estimatedHours: 4, assignedAgent: 'bhishma' },
            { id: 'task-1-2-3', title: 'RBAC middleware', description: 'Role-based access control middleware for admin, editor, and viewer roles.', status: 'todo', estimatedHours: 3, assignedAgent: 'bhishma' },
            { id: 'task-1-2-4', title: 'Prisma user schema & migrations', description: 'Define User, Account, Session tables in Prisma with PostgreSQL adapter.', status: 'todo', estimatedHours: 3, assignedAgent: 'vishwakarma' },
          ],
        },
      ],
    },

    // ── Sprint 2 — Core Business Logic ────────────────────────────────────
    {
      id: 'sprint-2',
      name: 'Core Business Logic',
      description:
        'Implement the primary domain models, CRUD APIs, real-time data sync with WebSockets, and the event-driven processing pipeline.',
      estimatedHours: 48,
      aiConfidence: 91,
      assignedAgent: 'krishna',
      dependencies: ['sprint-1'],
      status: 'planned',
      priority: 'high',
      modules: [
        {
          id: 'mod-2-1',
          name: 'Domain Models & API',
          description: 'REST + tRPC API layer with Zod validation, Prisma ORM queries, and paginated list endpoints.',
          files: [
            'apps/web/app/api/projects/route.ts',
            'apps/web/app/api/projects/[id]/route.ts',
            'packages/db/prisma/schema.prisma',
            'packages/validators/project.ts',
            'apps/web/lib/trpc/router.ts',
          ],
          complexity: 'high',
          estimatedHours: 18,
          tasks: [
            { id: 'task-2-1-1', title: 'Prisma schema for Projects & Sprints', description: 'Define Project, Sprint, Module, and Task models with relations and indexes.', status: 'todo', estimatedHours: 4, assignedAgent: 'vishwakarma' },
            { id: 'task-2-1-2', title: 'tRPC router & procedures', description: 'Build CRUD procedures with input validation, error handling, and optimistic updates.', status: 'todo', estimatedHours: 6, assignedAgent: 'krishna' },
            { id: 'task-2-1-3', title: 'Zod validation schemas', description: 'Shared Zod schemas for all API inputs, ensuring type-safe client-server boundary.', status: 'todo', estimatedHours: 3, assignedAgent: 'arjun' },
            { id: 'task-2-1-4', title: 'Pagination & filtering utils', description: 'Cursor-based pagination with dynamic sort/filter query builder.', status: 'todo', estimatedHours: 5, assignedAgent: 'chanakya' },
          ],
        },
        {
          id: 'mod-2-2',
          name: 'Real-time & Events',
          description: 'WebSocket server (Socket.io), event bus for pipeline stage transitions, and live progress broadcasting.',
          files: [
            'apps/web/lib/socket.ts',
            'apps/web/app/api/ws/route.ts',
            'packages/events/bus.ts',
            'packages/events/handlers.ts',
          ],
          complexity: 'high',
          estimatedHours: 16,
          tasks: [
            { id: 'task-2-2-1', title: 'Socket.io server integration', description: 'Integrate Socket.io with Next.js custom server, handle room-based channels.', status: 'todo', estimatedHours: 5, assignedAgent: 'hanuman' },
            { id: 'task-2-2-2', title: 'Event bus & handlers', description: 'Type-safe event bus with pub/sub pattern for pipeline stage transitions.', status: 'todo', estimatedHours: 4, assignedAgent: 'krishna' },
            { id: 'task-2-2-3', title: 'Live progress broadcasting', description: 'Broadcast generation progress, sprint status changes, and agent activity in real-time.', status: 'todo', estimatedHours: 4, assignedAgent: 'hanuman' },
            { id: 'task-2-2-4', title: 'Reconnection & offline queue', description: 'Exponential backoff reconnection with queued events replayed on reconnect.', status: 'todo', estimatedHours: 3, assignedAgent: 'bhishma' },
          ],
        },
      ],
    },

    // ── Sprint 3 — AI Integration ─────────────────────────────────────────
    {
      id: 'sprint-3',
      name: 'AI Integration',
      description:
        'Wire up the LLM providers (OpenAI, Anthropic), implement prompt chaining, RAG knowledge-base retrieval, and the multi-agent orchestration layer.',
      estimatedHours: 56,
      aiConfidence: 88,
      assignedAgent: 'krishna',
      dependencies: ['sprint-1', 'sprint-2'],
      status: 'planned',
      priority: 'critical',
      modules: [
        {
          id: 'mod-3-1',
          name: 'LLM Provider Layer',
          description: 'Abstraction over OpenAI & Anthropic APIs with streaming, token counting, cost tracking, and fallback routing.',
          files: [
            'packages/ai/providers/openai.ts',
            'packages/ai/providers/anthropic.ts',
            'packages/ai/providers/base.ts',
            'packages/ai/tokenizer.ts',
            'packages/ai/cost-tracker.ts',
          ],
          complexity: 'critical',
          estimatedHours: 20,
          tasks: [
            { id: 'task-3-1-1', title: 'Provider abstraction interface', description: 'Create base provider class with stream/complete/embed methods and unified error types.', status: 'todo', estimatedHours: 4, assignedAgent: 'vishwakarma' },
            { id: 'task-3-1-2', title: 'OpenAI GPT-4o integration', description: 'Implement streaming chat completion with function calling and vision support.', status: 'todo', estimatedHours: 5, assignedAgent: 'hanuman' },
            { id: 'task-3-1-3', title: 'Anthropic Claude integration', description: 'Integrate Claude 3.5 Sonnet with extended context and tool-use support.', status: 'todo', estimatedHours: 5, assignedAgent: 'hanuman' },
            { id: 'task-3-1-4', title: 'Token counter & cost dashboard', description: 'Real-time token usage tracking with per-model cost calculations and budget alerts.', status: 'todo', estimatedHours: 6, assignedAgent: 'chanakya' },
          ],
        },
        {
          id: 'mod-3-2',
          name: 'Multi-Agent Orchestrator',
          description: 'Agent personality system (GITA_MODES), prompt chain composer, context window management, and parallel agent execution.',
          files: [
            'packages/ai/orchestrator.ts',
            'packages/ai/agents/index.ts',
            'packages/ai/chain.ts',
            'packages/ai/context-manager.ts',
          ],
          complexity: 'critical',
          estimatedHours: 22,
          tasks: [
            { id: 'task-3-2-1', title: 'Agent personality loader', description: 'Load GITA_MODES system prompts and dynamically inject them into request context.', status: 'todo', estimatedHours: 3, assignedAgent: 'krishna' },
            { id: 'task-3-2-2', title: 'Prompt chain composer', description: 'Sequential and parallel chain execution with intermediate result passing and branching.', status: 'todo', estimatedHours: 6, assignedAgent: 'krishna' },
            { id: 'task-3-2-3', title: 'Context window manager', description: 'Sliding-window context with importance scoring, summary compression, and token budget allocation.', status: 'todo', estimatedHours: 5, assignedAgent: 'arjun' },
            { id: 'task-3-2-4', title: 'RAG knowledge-base retrieval', description: 'Vector similarity search over project knowledge base using pgvector embeddings.', status: 'todo', estimatedHours: 8, assignedAgent: 'vishwakarma' },
          ],
        },
      ],
    },

    // ── Sprint 4 — Frontend Polish ────────────────────────────────────────
    {
      id: 'sprint-4',
      name: 'Frontend Polish',
      description:
        'Build the premium dark-themed UI with glassmorphism, animated gradients, data visualizations, responsive layouts, and accessibility compliance.',
      estimatedHours: 40,
      aiConfidence: 94,
      assignedAgent: 'arjun',
      dependencies: ['sprint-2'],
      status: 'planned',
      priority: 'high',
      modules: [
        {
          id: 'mod-4-1',
          name: 'Dashboard & Visualizations',
          description: 'Main dashboard with animated stat cards, sprint Gantt chart, agent activity feed, and real-time progress rings.',
          files: [
            'apps/web/app/dashboard/page.tsx',
            'apps/web/components/dashboard/StatCard.tsx',
            'apps/web/components/dashboard/SprintGantt.tsx',
            'apps/web/components/dashboard/AgentFeed.tsx',
            'apps/web/components/dashboard/ProgressRing.tsx',
          ],
          complexity: 'medium',
          estimatedHours: 22,
          tasks: [
            { id: 'task-4-1-1', title: 'Glassmorphism stat cards', description: 'Animated stat cards with backdrop-blur, gradient borders, and counting animations.', status: 'todo', estimatedHours: 5, assignedAgent: 'arjun' },
            { id: 'task-4-1-2', title: 'Sprint Gantt timeline', description: 'Interactive Gantt chart with drag-to-resize, dependency arrows, and zoom controls.', status: 'todo', estimatedHours: 8, assignedAgent: 'arjun' },
            { id: 'task-4-1-3', title: 'Agent activity live feed', description: 'Real-time scrolling feed showing which agent is active, tokens used, and current task.', status: 'todo', estimatedHours: 5, assignedAgent: 'hanuman' },
            { id: 'task-4-1-4', title: 'Radial progress rings', description: 'SVG-based animated progress rings with gradient strokes and percentage labels.', status: 'todo', estimatedHours: 4, assignedAgent: 'arjun' },
          ],
        },
      ],
    },

    // ── Sprint 5 — Testing & Deployment ───────────────────────────────────
    {
      id: 'sprint-5',
      name: 'Testing & Deployment',
      description:
        'Comprehensive test suites (unit, integration, E2E), performance benchmarks, Docker containerization, and production deployment to Vercel + Railway.',
      estimatedHours: 36,
      aiConfidence: 93,
      assignedAgent: 'bhishma',
      dependencies: ['sprint-3', 'sprint-4'],
      status: 'planned',
      priority: 'high',
      modules: [
        {
          id: 'mod-5-1',
          name: 'Test Suites',
          description: 'Vitest unit tests, Playwright E2E tests, API integration tests, and snapshot testing for UI components.',
          files: [
            'apps/web/__tests__/unit/',
            'apps/web/__tests__/e2e/',
            'apps/web/__tests__/integration/',
            'vitest.config.ts',
            'playwright.config.ts',
          ],
          complexity: 'medium',
          estimatedHours: 18,
          tasks: [
            { id: 'task-5-1-1', title: 'Unit test suite (Vitest)', description: 'Unit tests for all Zustand stores, utility functions, and validation schemas.', status: 'todo', estimatedHours: 6, assignedAgent: 'bhishma' },
            { id: 'task-5-1-2', title: 'E2E test suite (Playwright)', description: 'End-to-end tests covering auth flow, project creation, plan generation, and deployment.', status: 'todo', estimatedHours: 8, assignedAgent: 'bhishma' },
            { id: 'task-5-1-3', title: 'API integration tests', description: 'Integration tests for all tRPC procedures with test database and mocked LLM responses.', status: 'todo', estimatedHours: 4, assignedAgent: 'arjun' },
          ],
        },
        {
          id: 'mod-5-2',
          name: 'Deployment & Infrastructure',
          description: 'Docker multi-stage build, Vercel deployment config, Railway PostgreSQL, and monitoring with Sentry + Axiom.',
          files: [
            'Dockerfile',
            'docker-compose.yml',
            'vercel.json',
            'apps/web/sentry.client.config.ts',
            'apps/web/sentry.server.config.ts',
          ],
          complexity: 'medium',
          estimatedHours: 12,
          tasks: [
            { id: 'task-5-2-1', title: 'Docker multi-stage build', description: 'Optimized Dockerfile with build/deps/runner stages, targeting < 200MB final image.', status: 'todo', estimatedHours: 3, assignedAgent: 'hanuman' },
            { id: 'task-5-2-2', title: 'Vercel + Railway config', description: 'Vercel project settings, environment variables, and Railway PostgreSQL provisioning.', status: 'todo', estimatedHours: 3, assignedAgent: 'chanakya' },
            { id: 'task-5-2-3', title: 'Sentry error tracking', description: 'Client + server Sentry integration with source maps, breadcrumbs, and alert rules.', status: 'todo', estimatedHours: 3, assignedAgent: 'bhishma' },
            { id: 'task-5-2-4', title: 'Health checks & uptime monitoring', description: 'Healthcheck endpoint, Axiom log drain, and uptime robot configuration.', status: 'todo', estimatedHours: 3, assignedAgent: 'bhishma' },
          ],
        },
      ],
    },
  ];
}

function buildMockAgentAssignments(): AgentAssignment[] {
  return [
    {
      agentId: 'krishna',
      agentName: 'Krishna',
      agentEmoji: '🔵',
      agentColor: '#6366f1',
      role: 'Strategic Advisor & Orchestrator',
      skills: [
        { name: 'System Design', level: 10 },
        { name: 'Prompt Engineering', level: 9 },
        { name: 'Architecture Review', level: 9 },
        { name: 'Business Logic', level: 8 },
        { name: 'Team Coordination', level: 10 },
      ],
      assignedModules: ['mod-2-1', 'mod-3-2'],
      estimatedTokens: 245_000,
      reason:
        'Krishna\'s strategic depth makes him ideal for the core business logic and multi-agent orchestration — both require high-level architectural decisions and cross-module coordination.',
    },
    {
      agentId: 'arjun',
      agentName: 'Arjun',
      agentEmoji: '🟡',
      agentColor: '#f59e0b',
      role: 'Quality Questioner & Frontend Lead',
      skills: [
        { name: 'React / Next.js', level: 9 },
        { name: 'UI/UX Design', level: 8 },
        { name: 'Requirement Analysis', level: 10 },
        { name: 'Accessibility', level: 7 },
        { name: 'Data Visualization', level: 8 },
      ],
      assignedModules: ['mod-4-1'],
      estimatedTokens: 180_000,
      reason:
        'Arjun\'s relentless questioning ensures no UX edge-case is missed, while his frontend skills deliver the premium glassmorphism dashboard and interactive Gantt chart.',
    },
    {
      agentId: 'bhishma',
      agentName: 'Bhishma',
      agentEmoji: '🔴',
      agentColor: '#ef4444',
      role: 'Risk Governor & Test Strategist',
      skills: [
        { name: 'Security Auditing', level: 10 },
        { name: 'Test Strategy', level: 9 },
        { name: 'Compliance', level: 9 },
        { name: 'Error Handling', level: 8 },
        { name: 'Monitoring', level: 8 },
      ],
      assignedModules: ['mod-5-1', 'mod-5-2'],
      estimatedTokens: 160_000,
      reason:
        'Bhishma\'s risk-first mindset ensures comprehensive test coverage and bulletproof deployment. His security expertise catches vulnerabilities before they reach production.',
    },
    {
      agentId: 'chanakya',
      agentName: 'Chanakya',
      agentEmoji: '🟢',
      agentColor: '#10b981',
      role: 'Cost Optimizer & Efficiency Analyst',
      skills: [
        { name: 'Cost Analysis', level: 10 },
        { name: 'Performance Optimization', level: 9 },
        { name: 'Infrastructure Planning', level: 8 },
        { name: 'Vendor Evaluation', level: 9 },
        { name: 'Database Tuning', level: 7 },
      ],
      assignedModules: ['mod-2-1', 'mod-5-2'],
      estimatedTokens: 120_000,
      reason:
        'Chanakya\'s cost-optimization lens ensures efficient API pagination, optimal database queries, and the most cost-effective deployment topology (Vercel + Railway over AWS).',
    },
    {
      agentId: 'hanuman',
      agentName: 'Hanuman',
      agentEmoji: '🟠',
      agentColor: '#f97316',
      role: 'Speed Executor & Integration Specialist',
      skills: [
        { name: 'Rapid Prototyping', level: 10 },
        { name: 'API Integration', level: 9 },
        { name: 'WebSockets', level: 8 },
        { name: 'DevOps / CI-CD', level: 8 },
        { name: 'Code Generation', level: 9 },
      ],
      assignedModules: ['mod-1-1', 'mod-2-2', 'mod-3-1'],
      estimatedTokens: 210_000,
      reason:
        'Hanuman\'s ship-fast philosophy is perfect for scaffolding, CI/CD pipelines, real-time WebSocket integration, and LLM provider wiring — tasks that need speed without sacrificing quality.',
    },
    {
      agentId: 'vishwakarma',
      agentName: 'Vishwakarma',
      agentEmoji: '🟣',
      agentColor: '#8b5cf6',
      role: 'System Architect & Database Designer',
      skills: [
        { name: 'System Architecture', level: 10 },
        { name: 'Database Design', level: 9 },
        { name: 'Microservices', level: 9 },
        { name: 'Design Patterns', level: 10 },
        { name: 'Schema Design', level: 9 },
      ],
      assignedModules: ['mod-1-1', 'mod-1-2', 'mod-3-1', 'mod-3-2'],
      estimatedTokens: 275_000,
      reason:
        'Vishwakarma\'s architectural mastery is essential for the project foundation, auth system, and AI provider abstraction — systems that must be perfectly designed from day one.',
    },
  ];
}

function buildMockApproval(): ApprovalResult {
  return {
    approved: true,
    score: 92,
    completeness: 95,
    riskAssessment: 88,
    feasibility: 93,
    dependencyResolution: 91,
    flags: [
      'WebSocket scalability should be load-tested above 500 concurrent connections',
      'LLM cost tracking needs budget-cap kill switch before production',
      'Consider adding rate-limiting middleware to public API routes',
    ],
    timestamp: Date.now(),
  };
}

function buildUnderstandingSummary(): string {
  return `The project is a **full-stack AI-powered software factory** built with Next.js 14 (App Router), TypeScript, TailwindCSS, and Prisma. It features a multi-agent system inspired by Bhagavad Gita characters, where each agent (Krishna, Arjun, Bhishma, Chanakya, Hanuman, Vishwakarma) has a distinct personality and specialization.

Key capabilities include:
• **12-stage AI pipeline** — from requirements analysis to quality audit
• **Real-time collaboration** via WebSocket-powered progress broadcasting
• **Prompt engineering** with chain-of-thought composition and RAG retrieval
• **Premium dark UI** with glassmorphism, animated gradients, and data visualizations
• **Multi-provider LLM support** — OpenAI GPT-4o + Anthropic Claude 3.5 Sonnet

The platform targets solo developers and small teams who want enterprise-grade software architecture generated and validated by AI agents before writing a single line of code.`;
}

function buildKeyMetrics(): KeyMetrics {
  return {
    features: 24,
    techStack: [
      'Next.js 14',
      'TypeScript',
      'TailwindCSS',
      'Prisma',
      'PostgreSQL',
      'tRPC',
      'Socket.io',
      'OpenAI',
      'Anthropic',
      'Vercel',
      'Railway',
      'Sentry',
      'Vitest',
      'Playwright',
    ],
    complexity: 'high',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Default state
// ─────────────────────────────────────────────────────────────────────────────

const defaultState: Omit<
  ExecutionPlanState,
  'generatePlan' | 'approvePlan' | 'rejectPlan' | 'updateSprintStatus' | 'updateTaskStatus' | 'reset'
> = {
  understandingSummary: null,
  keyMetrics: null,
  sprints: [],
  agentAssignments: [],
  approval: null,
  planStatus: 'idle',
  generationProgress: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const useExecutionPlanStore = create<ExecutionPlanState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // ── Generate Plan ─────────────────────────────────────────────────
      generatePlan: async (_projectId: string) => {
        const setProgress = (generationProgress: number) => set({ generationProgress });

        // Reset & begin
        set({ ...defaultState, planStatus: 'generating', generationProgress: 0 });

        try {
          // Stage 1 — Analyzing knowledge base (0-15%)
          await animateProgress(0, 15, 8, setProgress);
          await delay(300);

          // Stage 2 — Reading generated prompts (15-30%)
          await animateProgress(15, 30, 8, setProgress);
          await delay(250);

          // Stage 3 — Breaking down into modules (30-50%)
          set({ understandingSummary: buildUnderstandingSummary() });
          await animateProgress(30, 50, 10, setProgress);
          await delay(400);

          // Stage 4 — Planning sprints (50-70%)
          set({ keyMetrics: buildKeyMetrics() });
          await animateProgress(50, 70, 10, setProgress);
          await delay(350);

          // Stage 5 — Assigning agents (70-85%)
          set({ sprints: buildMockSprints() });
          await animateProgress(70, 85, 8, setProgress);
          await delay(300);

          // Stage 6 — Estimating time (85-95%)
          set({ agentAssignments: buildMockAgentAssignments() });
          await animateProgress(85, 95, 6, setProgress);
          await delay(250);

          // Stage 7 — Running AI approval (95-100%)
          const approval = buildMockApproval();
          await animateProgress(95, 100, 5, setProgress);
          await delay(200);

          // Finalize
          const finalStatus = approval.score >= 80 ? 'approved' : 'review';
          set({
            approval,
            planStatus: finalStatus as ExecutionPlanState['planStatus'],
            generationProgress: 100,
          });
        } catch {
          // On error, keep whatever data we have and set status back
          set({ planStatus: 'idle', generationProgress: 0 });
        }
      },

      // ── Approve Plan ──────────────────────────────────────────────────
      approvePlan: () => {
        const state = get();
        if (state.planStatus !== 'review' && state.planStatus !== 'approved') return;
        set({
          planStatus: 'approved',
          approval: state.approval
            ? { ...state.approval, approved: true, timestamp: Date.now() }
            : buildMockApproval(),
        });
      },

      // ── Reject Plan ───────────────────────────────────────────────────
      rejectPlan: (reason: string) => {
        const state = get();
        set({
          planStatus: 'rejected',
          approval: state.approval
            ? {
                ...state.approval,
                approved: false,
                flags: [...state.approval.flags, `Rejection reason: ${reason}`],
                timestamp: Date.now(),
              }
            : {
                approved: false,
                score: 0,
                completeness: 0,
                riskAssessment: 0,
                feasibility: 0,
                dependencyResolution: 0,
                flags: [`Rejection reason: ${reason}`],
                timestamp: Date.now(),
              },
        });
      },

      // ── Update Sprint Status ──────────────────────────────────────────
      updateSprintStatus: (sprintId: string, status: Sprint['status']) => {
        set({
          sprints: get().sprints.map((s) =>
            s.id === sprintId ? { ...s, status } : s,
          ),
        });
      },

      // ── Update Task Status ────────────────────────────────────────────
      updateTaskStatus: (
        sprintId: string,
        moduleId: string,
        taskId: string,
        status: Task['status'],
      ) => {
        set({
          sprints: get().sprints.map((sprint) =>
            sprint.id === sprintId
              ? {
                  ...sprint,
                  modules: sprint.modules.map((mod) =>
                    mod.id === moduleId
                      ? {
                          ...mod,
                          tasks: mod.tasks.map((task) =>
                            task.id === taskId ? { ...task, status } : task,
                          ),
                        }
                      : mod,
                  ),
                }
              : sprint,
          ),
        });
      },

      // ── Reset ─────────────────────────────────────────────────────────
      reset: () => set({ ...defaultState }),
    }),
    {
      name: 'bg-factory-execution-plan',
      partialize: (state) => ({
        understandingSummary: state.understandingSummary,
        keyMetrics: state.keyMetrics,
        sprints: state.sprints,
        agentAssignments: state.agentAssignments,
        approval: state.approval,
        planStatus: state.planStatus,
        generationProgress: state.generationProgress,
      }),
    },
  ),
);
