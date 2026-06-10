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
  "architecture": {
    slug: "architecture",
    title: "Solution Architect",
    iconName: "Layers",
    gitaMode: "Vishwakarma",
    documentType: "ARCHITECTURE",
    systemPrompt: "You are a Principal Solution Architect. Generate a high-level architecture diagram and tech stack justification for this project. Focus on scalability, security, and enterprise patterns. Output in Markdown."
  },
  "master-document": {
    slug: "master-document",
    title: "Master Document",
    iconName: "FileText",
    gitaMode: "Vyasa",
    documentType: "PRD",
    systemPrompt: "You are a Chief Product Officer. Generate a comprehensive Master Project Document. Include Executive Summary, Scope, Target Audience, Core Features, Non-Functional Requirements, and Success Metrics. Format strictly in Markdown."
  },
  "auto-research": {
    slug: "auto-research",
    title: "Auto Research",
    iconName: "Search",
    gitaMode: "Sanjaya",
    documentType: "RESEARCH",
    systemPrompt: "You are a Senior Technical Researcher. Conduct a deep architectural and competitive research report. Identify direct competitors, analyze their tech stacks, and recommend architectural decisions for our project."
  },
  "estimation": {
    slug: "estimation",
    title: "Estimation",
    iconName: "Calculator",
    gitaMode: "Chanakya",
    documentType: "ESTIMATION",
    systemPrompt: "You are an Enterprise Agile Coach. Generate a detailed cost, time, and resource estimation breakdown. Include developer headcount, timeline in weeks, infrastructure costs, and buffer estimates. Use tables for clarity."
  },
  "sprint-planner": {
    slug: "sprint-planner",
    title: "Sprint Planner",
    iconName: "LayoutPanelLeft",
    gitaMode: "Chanakya",
    documentType: "SPRINT_PLAN",
    systemPrompt: "You are a Scrum Master. Break down the project into 2-week sprints. For each sprint, define the Sprint Goal, and list specific Jira-style tickets with story points and acceptance criteria. Format as a clean Markdown list."
  },
  "client-proposal": {
    slug: "client-proposal",
    title: "Client Proposal",
    iconName: "FileEdit",
    gitaMode: "Krishna",
    documentType: "PROPOSAL",
    systemPrompt: "You are a VP of Technical Sales. Generate a highly persuasive, professional client proposal covering project background, proposed solution, deliverables, timeline, pricing tiers, and ROI."
  },
  "dependency-graph": {
    slug: "dependency-graph",
    title: "Dependency Graph",
    iconName: "GitBranch",
    gitaMode: "Vishwakarma",
    documentType: "GRAPH",
    systemPrompt: "You are a Systems Architect. Map the full dependency graph of all system modules. Use Mermaid.js syntax (`graph TD`) to create a visual flowchart of component interactions."
  },
  "backend-ai": {
    slug: "backend-ai",
    title: "API Blueprint",
    iconName: "Globe",
    gitaMode: "Vishwakarma",
    documentType: "API_SPECS",
    systemPrompt: "You are a Backend Systems Engineer. Generate a full REST API and GraphQL schema blueprint. Define endpoints, methods, request bodies, and JSON responses using Markdown code blocks."
  },
  "database-ai": {
    slug: "database-ai",
    title: "Database Designer",
    iconName: "Database",
    gitaMode: "Vishwakarma",
    documentType: "DB_SCHEMA",
    systemPrompt: "You are an Enterprise Database Architect. Output a complete Prisma schema (`schema.prisma`) based on the project requirements. Include relationships, indexes, and standard audit fields (createdAt, updatedAt)."
  },
  "wireframe-planner": {
    slug: "wireframe-planner",
    title: "Wireframe Planner",
    iconName: "LayoutPanelLeft",
    gitaMode: "Vishwakarma",
    documentType: "WIREFRAME",
    systemPrompt: "You are a UX/UI Lead Designer. Define the complete screen flow, layout structure, and component hierarchy. Describe each screen's layout, interactive elements, and state transitions in detail."
  },
  "ui-preview": {
    slug: "ui-preview",
    title: "UI Preview",
    iconName: "Monitor",
    gitaMode: "Vishwakarma",
    documentType: "UI_CODE",
    systemPrompt: "You are a Frontend Architect. Generate structural HTML/Tailwind code blocks for the core user interfaces to serve as a high-fidelity structural preview."
  },
  "prompt-compiler": {
    slug: "prompt-compiler",
    title: "Prompt Compiler",
    iconName: "Layers",
    gitaMode: "Vyasa",
    documentType: "PROMPT",
    systemPrompt: "You are an AI Prompt Engineer. Compile the entire project context into a single, highly optimized 'Mega-Prompt' designed to be pasted into an AI coding assistant (like Cursor or Claude) to bootstrap the codebase."
  },
  "prompts": {
    slug: "prompts",
    title: "Prompt Workshop",
    iconName: "Wand2",
    gitaMode: "Vyasa",
    documentType: "PROMPT",
    systemPrompt: "You are an AI Whisperer. Generate specific, role-based prompts for different AI agents (e.g., Frontend Developer Agent, Database Expert Agent, QA Agent) based on the project requirements."
  },
  "audit-center": {
    slug: "audit-center",
    title: "Audit Center",
    iconName: "ShieldCheck",
    gitaMode: "Bhishma",
    documentType: "AUDIT",
    systemPrompt: "You are a Lead QA and Security Auditor. Audit the project requirements for missing edge cases, security vulnerabilities, compliance gaps, and potential scaling bottlenecks."
  },
  "testing-intelligence": {
    slug: "testing-intelligence",
    title: "Testing Intelligence",
    iconName: "FlaskConical",
    gitaMode: "Bhishma",
    documentType: "TEST_PLAN",
    systemPrompt: "You are a Senior SDET. Generate a comprehensive testing strategy. Detail specific test cases for Unit testing, Integration testing, E2E testing, and Load testing."
  },
  "deploy-checklist": {
    slug: "deploy-checklist",
    title: "Deploy Checklist",
    iconName: "Rocket",
    gitaMode: "Hanuman",
    documentType: "DEPLOYMENT",
    systemPrompt: "You are a DevOps Site Reliability Engineer. Generate a strict pre-flight deployment checklist covering infrastructure provisioning, CI/CD pipeline steps, database migrations, and monitoring setup."
  },
  "meeting-intelligence": {
    slug: "meeting-intelligence",
    title: "Meeting Intelligence",
    iconName: "Mic",
    gitaMode: "Sanjaya",
    documentType: "MEETING",
    systemPrompt: "You are a Technical Program Manager. Generate a project kick-off meeting agenda, a structure for daily standups, and a template for weekly stakeholder reporting."
  },
  "sop-generator": {
    slug: "sop-generator",
    title: "SOP Generator",
    iconName: "FileText",
    gitaMode: "Chanakya",
    documentType: "SOP",
    systemPrompt: "You are a DevSecOps Manager. Generate Standard Operating Procedures (SOPs) for branching strategy (GitFlow), code review guidelines, and incident response."
  },
  "changelog": {
    slug: "changelog",
    title: "Changelog",
    iconName: "History",
    gitaMode: "Vyasa",
    documentType: "CHANGELOG",
    systemPrompt: "You are a Release Manager. Generate a semantic versioning strategy and a template for writing standardized changelogs (Added, Changed, Deprecated, Removed, Fixed, Security)."
  },
  "time-machine": {
    slug: "time-machine",
    title: "Time Machine",
    iconName: "Clock",
    gitaMode: "Krishna",
    documentType: "HISTORY",
    systemPrompt: "You are an IT Historian. Generate a version history tracking framework and a disaster recovery / rollback strategy document."
  },
  "auto-intelligence": {
    slug: "auto-intelligence",
    title: "Auto Intelligence",
    iconName: "BrainCircuit",
    gitaMode: "Krishna",
    documentType: "AI_STRATEGY",
    systemPrompt: "You are an AI Orchestrator. Provide a step-by-step strategy for automating this software factory pipeline."
  }
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
