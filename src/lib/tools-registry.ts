/**
 * @file AI Tools Registry
 * @description Configuration registry for all AI-powered tools in the factory.
 *              Each tool has a slug, system prompt, Gita mode, and document type.
 *              Unknown slugs fall back to a generic AI assistant configuration.
 * @module lib/tools-registry
 */

/** Configuration for a single AI tool */
export interface ToolConfig {
  /** URL-safe identifier (e.g., "sprint-planner") */
  slug: string;
  /** Human-readable title */
  title: string;
  /** Lucide icon name for UI rendering */
  iconName: string;
  /** Bhagavad Gita AI personality mode */
  gitaMode: string;
  /** Document type for KB storage */
  documentType: string;
  /** System prompt sent to the AI model */
  systemPrompt: string;
}

export const TOOLS_REGISTRY: Record<string, ToolConfig> = {
  "sprint-planner": {
    slug: "sprint-planner",
    title: "Sprint Planner",
    iconName: "LayoutPanelLeft",
    gitaMode: "Chanakya",
    documentType: "SPRINT_PLAN",
    systemPrompt: "You are an Agile Sprint Planner. Output a strict JSON array of Jira-style tasks broken into 2-week sprints based on the user's project context. Format as: [{ sprint: 1, title: 'Auth', tasks: [{ name: 'Setup NextAuth', hours: 4 }] }]",
  },
  "database-designer": {
    slug: "database-designer",
    title: "Database Designer",
    iconName: "Database",
    gitaMode: "Vishwakarma",
    documentType: "DB_SCHEMA",
    systemPrompt: "You are an Enterprise Database Architect. Output a complete Prisma schema (`schema.prisma`) based on the project requirements. Include relationships, indexes, and standard audit fields (createdAt, updatedAt).",
  },
  "api-blueprint": {
    slug: "api-blueprint",
    title: "API Blueprint",
    iconName: "Webhook",
    gitaMode: "Vishwakarma",
    documentType: "API_SPECS",
    systemPrompt: "You are a Backend Systems Engineer. Generate a full REST API and GraphQL schema blueprint. Define endpoints, methods, request bodies, and JSON responses.",
  },
  "master-document": {
    slug: "master-document",
    title: "Master Document",
    iconName: "FileText",
    gitaMode: "Vyasa",
    documentType: "PRD",
    systemPrompt: "You are a Chief Product Officer. Generate a comprehensive Product Requirements Document (PRD) detailing the entire scope of the project. Use strict Markdown format.",
  },
  "auto-intelligence": {
    slug: "auto-intelligence",
    title: "Auto Intelligence",
    iconName: "BrainCircuit",
    gitaMode: "Krishna",
    documentType: "AI_STRATEGY",
    systemPrompt: "You are an AI Orchestrator. Provide a step-by-step strategy for automating this software factory pipeline.",
  },
  // We can add specific ones later. For any slug not defined, we fallback to a generic config.
};

export function getToolConfig(slug: string): ToolConfig {
  if (TOOLS_REGISTRY[slug]) {
    return TOOLS_REGISTRY[slug];
  }
  
  // Generic Fallback
  return {
    slug,
    title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    iconName: "Box",
    gitaMode: "Krishna",
    documentType: "GENERAL_DOC",
    systemPrompt: "You are an AI assistant in an enterprise software factory. Provide a detailed analysis or output related to this tool's domain based on the user's project context. Use Markdown formatting.",
  };
}
