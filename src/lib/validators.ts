/**
 * @file Input Validators
 * @description Zod-based validation schemas for all API inputs in the
 *              Launch IQ. Provides strict runtime validation
 *              for project creation, AI generation, chat messages, and exports.
 *              Includes a generic ApiResponse wrapper and a validateRequest helper.
 * @module lib/validators
 */

import { z } from 'zod';

// ─── Reusable Primitives ─────────────────────────────────────────────────────

/**
 * CUID format regex for Prisma-generated IDs.
 * Matches strings like "clxxxxxxxxxxxxxxxxxxxxxxxxx".
 */
const CUID_REGEX = /^c[a-z0-9]{24,}$/i;

/**
 * Zod schema for a CUID string.
 *
 * @example
 * ```ts
 * CuidSchema.parse('clxyz1234567890abcdefghij'); // OK
 * CuidSchema.parse('not-a-cuid'); // throws ZodError
 * ```
 */
export const CuidSchema = z
  .string()
  .regex(CUID_REGEX, 'Must be a valid CUID');

// ─── Enums ────────────────────────────────────────────────────────────────────

/**
 * Allowed project tiers.
 */
export const ProjectTier = z.enum(['FREE', 'PRO', 'ENTERPRISE']);

/**
 * Allowed AI model providers.
 */
export const AIModelEnum = z.enum(['deepseek', 'ollama', 'claude', 'gpt4']);

/**
 * Allowed export formats.
 */
export const ExportFormat = z.enum(['markdown', 'json', 'zip']);

/** TypeScript type for ProjectTier */
export type ProjectTier = z.infer<typeof ProjectTier>;

/** TypeScript type for AIModelEnum */
export type AIModelEnum = z.infer<typeof AIModelEnum>;

/** TypeScript type for ExportFormat */
export type ExportFormat = z.infer<typeof ExportFormat>;

// ─── CreateProjectSchema ─────────────────────────────────────────────────────

/**
 * Validation schema for project creation requests.
 *
 * @property name - Project name, 1–100 characters, trimmed
 * @property description - Optional project description, max 5000 characters
 * @property domainTemplate - Optional domain template identifier
 * @property tier - Subscription tier: FREE | PRO | ENTERPRISE. Default: FREE
 *
 * @example
 * ```ts
 * const result = CreateProjectSchema.safeParse({
 *   name: 'My SaaS App',
 *   description: 'A multi-tenant SaaS platform',
 *   tier: 'PRO',
 * });
 *
 * if (result.success) {
 *   console.log(result.data);
 * }
 * ```
 */
export const CreateProjectSchema = z.object({
  /** Project name (1–100 characters, whitespace trimmed) */
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be 100 characters or fewer'),

  /** Optional project description (max 5000 characters) */
  description: z
    .string()
    .max(5000, 'Description must be 5000 characters or fewer')
    .optional(),

  /** Optional domain template slug (e.g., "ecommerce", "fintech") */
  domainTemplate: z
    .string()
    .max(100, 'Domain template must be 100 characters or fewer')
    .optional(),

  /** Subscription tier. Default: FREE */
  tier: ProjectTier.default('FREE'),
});

/** TypeScript type inferred from CreateProjectSchema */
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

// ─── GenerateSchema ──────────────────────────────────────────────────────────

/**
 * Validation schema for AI generation requests.
 *
 * @property task - The generation task/prompt, 1–10000 characters
 * @property context - Optional additional context, max 50000 characters
 * @property systemPrompt - Optional system prompt override, max 5000 characters
 * @property model - Optional AI model provider: deepseek | ollama | claude | gpt4
 *
 * @example
 * ```ts
 * const result = GenerateSchema.safeParse({
 *   task: 'Generate a REST API for user management',
 *   context: 'Stack: Next.js 16, Prisma, PostgreSQL',
 *   model: 'deepseek',
 * });
 * ```
 */
export const GenerateSchema = z.object({
  /** The generation task/prompt (1–10000 characters, trimmed) */
  task: z
    .string()
    .trim()
    .min(1, 'Task is required')
    .max(10000, 'Task must be 10000 characters or fewer'),

  /** Optional additional context for the AI (max 50000 characters) */
  context: z
    .string()
    .max(50000, 'Context must be 50000 characters or fewer')
    .optional(),

  /** Optional system prompt override (max 5000 characters) */
  systemPrompt: z
    .string()
    .max(5000, 'System prompt must be 5000 characters or fewer')
    .optional(),

  /** Optional target AI model provider */
  model: AIModelEnum.optional(),
});

/** TypeScript type inferred from GenerateSchema */
export type GenerateInput = z.infer<typeof GenerateSchema>;

// ─── ChatMessageSchema ───────────────────────────────────────────────────────

/**
 * Validation schema for chat message submissions.
 *
 * @property message - The chat message text, 1–5000 characters
 * @property projectId - CUID of the project this message belongs to
 * @property conversationId - Optional CUID of an existing conversation thread
 *
 * @example
 * ```ts
 * const result = ChatMessageSchema.safeParse({
 *   message: 'How do I add authentication?',
 *   projectId: 'clxyz1234567890abcdefghij',
 * });
 * ```
 */
export const ChatMessageSchema = z.object({
  /** Chat message content (1–5000 characters, trimmed) */
  message: z
    .string()
    .trim()
    .min(1, 'Message is required')
    .max(5000, 'Message must be 5000 characters or fewer'),

  /** Project ID the message belongs to (must be a valid CUID) */
  projectId: CuidSchema,

  /** Optional conversation thread ID (must be a valid CUID if provided) */
  conversationId: CuidSchema.optional(),
});

/** TypeScript type inferred from ChatMessageSchema */
export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;

// ─── ExportSchema ─────────────────────────────────────────────────────────────

/**
 * Validation schema for project export requests.
 *
 * @property projectId - CUID of the project to export
 * @property format - Export format: markdown | json | zip
 *
 * @example
 * ```ts
 * const result = ExportSchema.safeParse({
 *   projectId: 'clxyz1234567890abcdefghij',
 *   format: 'markdown',
 * });
 * ```
 */
export const ExportSchema = z.object({
  /** Project ID to export (must be a valid CUID) */
  projectId: CuidSchema,

  /** Export format */
  format: ExportFormat,
});

/** TypeScript type inferred from ExportSchema */
export type ExportInput = z.infer<typeof ExportSchema>;

// ─── ApiResponse Wrapper ──────────────────────────────────────────────────────

/**
 * Generic API response wrapper type.
 * Wraps all API responses in a consistent envelope with success flag,
 * data payload, optional error, and ISO timestamp.
 *
 * @typeParam T - The shape of the response data payload
 */
export interface ApiResponse<T = unknown> {
  /** Whether the operation succeeded */
  success: boolean;
  /** The response payload (present on success) */
  data: T | null;
  /** Error message (present on failure) */
  error: string | null;
  /** ISO 8601 timestamp of the response */
  timestamp: string;
}

/**
 * Create a successful API response.
 *
 * @typeParam T - The data payload type
 * @param data - The response payload
 * @returns Formatted ApiResponse with success: true
 *
 * @example
 * ```ts
 * return apiSuccess({ project: newProject });
 * // → { success: true, data: { project: ... }, error: null, timestamp: "..." }
 * ```
 */
export function apiSuccess<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a failed API response.
 *
 * @param error - Error message or Error object
 * @returns Formatted ApiResponse with success: false
 *
 * @example
 * ```ts
 * return apiError('Project not found');
 * // → { success: false, data: null, error: "Project not found", timestamp: "..." }
 * ```
 */
export function apiError(error: string | Error): ApiResponse<null> {
  return {
    success: false,
    data: null,
    error: error instanceof Error ? error.message : error,
    timestamp: new Date().toISOString(),
  };
}

// ─── Validation Result ────────────────────────────────────────────────────────

/**
 * Result of a validation attempt.
 *
 * @typeParam T - The validated data type
 */
export interface ValidationResult<T> {
  /** Whether validation passed */
  success: boolean;
  /** Validated and transformed data (present when success is true) */
  data: T | null;
  /** Array of human-readable error messages (present when success is false) */
  errors: string[] | null;
}

/**
 * Validate input data against a Zod schema.
 *
 * Returns a structured result with either the validated data or
 * an array of human-readable error messages. Never throws.
 *
 * @typeParam T - The output type of the Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Raw input data to validate
 * @returns Structured validation result
 *
 * @example
 * ```ts
 * import { validateRequest, CreateProjectSchema } from '@/lib/validators';
 *
 * const result = validateRequest(CreateProjectSchema, req.body);
 *
 * if (!result.success) {
 *   return NextResponse.json(apiError(result.errors!.join('; ')), { status: 400 });
 * }
 *
 * // result.data is fully typed as CreateProjectInput
 * const project = await createProject(result.data);
 * ```
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: null,
    };
  }

  // Format Zod errors into human-readable strings
  const errors = result.error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
    return `${path}${issue.message}`;
  });

  return {
    success: false,
    data: null,
    errors,
  };
}

// ─── Convenience: Validate & Respond ─────────────────────────────────────────

/**
 * Validate input and return an ApiResponse directly.
 * Convenience wrapper that combines validateRequest + apiSuccess/apiError.
 *
 * @typeParam T - The output type of the Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Raw input data to validate
 * @returns ApiResponse with validated data on success, or error details on failure
 *
 * @example
 * ```ts
 * const response = validateAndRespond(GenerateSchema, req.body);
 * if (!response.success) {
 *   return NextResponse.json(response, { status: 400 });
 * }
 * // response.data is typed as GenerateInput
 * ```
 */
export function validateAndRespond<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ApiResponse<T> {
  const result = validateRequest(schema, data);

  if (result.success) {
    return apiSuccess(result.data as T);
  }

  return {
    success: false,
    data: null,
    error: result.errors!.join('; '),
    timestamp: new Date().toISOString(),
  };
}
