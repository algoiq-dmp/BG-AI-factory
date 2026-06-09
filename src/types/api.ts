/**
 * @file API type definitions for Launch IQ
 * @description Centralized TypeScript types for all API request/response contracts
 */

/** API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

/** Project model */
export interface Project {
  id: string;
  name: string;
  description: string | null;
  domainTemplate: string | null;
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  status: 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'ARCHIVED';
  pipelineStatus: string;
  progress: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
    tasks: number;
    codeFiles: number;
    knowledgeNodes: number;
  };
}

/** User model */
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'CLIENT';
  karmaTokens: number;
  createdAt: string;
  updatedAt: string;
}

/** Task model */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tokens: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

/** Document model */
export interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  fileUrl: string | null;
  projectId: string;
  createdAt: string;
}

/** Knowledge node model */
export interface KnowledgeNode {
  id: string;
  type: 'PRD' | 'ARCHITECTURE' | 'DEPENDENCY' | 'CODE_SNIPPET';
  content: string;
  metadata: string | null;
  projectId: string;
  createdAt: string;
}

/** Code file model */
export interface CodeFile {
  id: string;
  path: string;
  content: string;
  language: string;
  status: 'GENERATED' | 'REVIEWED' | 'FAILED' | 'CIRCUIT_TRIPPED';
  retryCount: number;
  projectId: string;
}

/** AI generation request */
export interface GenerateRequest {
  task: string;
  context: string;
  systemPrompt: string;
}

/** Chat message */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/** Discovery chat request */
export interface DiscoveryChatRequest {
  messages: ChatMessage[];
  projectId?: string;
}

/** Pipeline step */
export interface PipelineStep {
  stepId: number;
  stepName: string;
  status: 'pending' | 'running' | 'done' | 'error' | 'skipped';
  output?: string;
}

/** Orchestrator request */
export interface OrchestratorRequest {
  stepId: number;
  stepName: string;
  kbContext: string;
}

/** Telemetry response */
export interface TelemetryData {
  user: {
    karmaTokens: number;
    role: string;
  };
  pipeline: {
    status: string;
    progress: number;
  };
  recentDocs: Document[];
}

/** Project progress update */
export interface ProgressUpdate {
  projectId: string;
  pipelineStatus: string;
  progress: number;
}

/** Studio code execution request */
export interface ExecuteCodeRequest {
  code: string;
  language: string;
}

/** Studio code generation request */
export interface GenerateCodeRequest {
  prompt: string;
  filePath: string;
}

/** Task creation request */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  projectId: string;
}

/** Task update request */
export interface UpdateTaskRequest {
  id: string;
  status?: Task['status'];
  title?: string;
  description?: string;
}
