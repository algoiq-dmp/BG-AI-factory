/**
 * @file Audit Logger
 * @description Event-sourced audit logger for the Launch IQ pipeline.
 *              Records all significant actions (project creation, pipeline steps,
 *              AI generation, etc.) with structured metadata. Currently uses an
 *              in-memory store that can be swapped to a database later.
 *
 *              Events are capped at {@link MAX_EVENTS_PER_PROJECT} per project to
 *              prevent unbounded memory growth. All events are also written to
 *              stdout as structured JSON for server-side log aggregation.
 * @module lib/audit
 */

// ─── Types ──────────────────────────────────────────────────────

/**
 * Represents a single audit event in the system.
 * Every meaningful action should produce one of these.
 */
export interface AuditEvent {
  /**
   * Action identifier using SCREAMING_SNAKE_CASE convention.
   * @example 'PIPELINE_STEP_COMPLETED', 'PROJECT_CREATED', 'AI_GENERATION_STARTED'
   */
  action: string;

  /** The authenticated user who triggered the action. */
  userId: string;

  /** Associated project ID, if applicable. */
  projectId?: string;

  /** Input parameters that triggered this action. */
  input?: Record<string, any>;

  /** Output or result of the action. */
  output?: Record<string, any>;

  /**
   * Additional metadata about the action.
   * Common fields: tokenCost, duration, model, provider, stepIndex
   */
  metadata?: Record<string, any>;

  /** ISO 8601 timestamp of when the event occurred. */
  timestamp: string;
}

/**
 * Fields required when logging an event.
 * The `timestamp` is auto-generated, so it's omitted from the input.
 */
export type AuditEventInput = Omit<AuditEvent, 'timestamp'>;

// ─── Constants ──────────────────────────────────────────────────

/**
 * Maximum number of events retained per project in the in-memory store.
 * Oldest events are evicted (FIFO) when this limit is exceeded.
 */
const MAX_EVENTS_PER_PROJECT = 1000;

/**
 * Maximum total events across all projects (safety valve for memory).
 * When exceeded, the oldest events globally are evicted.
 */
const MAX_TOTAL_EVENTS = 10000;

// ─── In-Memory Store ────────────────────────────────────────────

/**
 * Internal event store. Keyed by projectId (or '__global__' for events
 * without a projectId). Each key maps to a bounded FIFO array.
 * @internal
 */
const eventStore: Map<string, AuditEvent[]> = new Map();

/** Global fallback key for events without a projectId */
const GLOBAL_KEY = '__global__';

// ─── Internal Helpers ───────────────────────────────────────────

/**
 * Get or create the event array for a given store key.
 * @param key - The project ID or global key
 * @returns The mutable event array for that key
 * @internal
 */
function getOrCreateBucket(key: string): AuditEvent[] {
  let bucket = eventStore.get(key);
  if (!bucket) {
    bucket = [];
    eventStore.set(key, []);
  }
  return bucket;
}

/**
 * Count total events across all buckets.
 * @returns Total event count
 * @internal
 */
function totalEventCount(): number {
  let count = 0;
  for (const bucket of Array.from(eventStore.values())) {
    count += bucket.length;
  }
  return count;
}

/**
 * Evict the oldest event globally when the total limit is exceeded.
 * Finds the bucket with the oldest first entry and removes it.
 * @internal
 */
function evictOldestGlobal(): void {
  let oldestKey: string | null = null;
  let oldestTime = Infinity;

  for (const [key, bucket] of Array.from(eventStore.entries())) {
    if (bucket.length > 0) {
      const t = new Date(bucket[0].timestamp).getTime();
      if (t < oldestTime) {
        oldestTime = t;
        oldestKey = key;
      }
    }
  }

  if (oldestKey) {
    const bucket = eventStore.get(oldestKey)!;
    bucket.shift();
    if (bucket.length === 0) {
      eventStore.delete(oldestKey);
    }
  }
}

/**
 * Write an audit event to stdout as structured JSON.
 * Follows the same pattern as the project's logger module.
 * @param event - The audit event to log
 * @internal
 */
function writeToConsole(event: AuditEvent): void {
  const logEntry = {
    timestamp: event.timestamp,
    level: 'info',
    message: `AUDIT: ${event.action}`,
    context: 'audit',
    data: {
      action: event.action,
      userId: event.userId,
      ...(event.projectId && { projectId: event.projectId }),
      ...(event.input && { input: event.input }),
      ...(event.output && { output: event.output }),
      ...(event.metadata && { metadata: event.metadata }),
    },
  };

  console.log(JSON.stringify(logEntry));
}

// ─── Public API ─────────────────────────────────────────────────

/**
 * Audit logger for recording and querying pipeline events.
 *
 * @example
 * ```ts
 * import { auditLog } from '@/lib/audit';
 *
 * // Log a pipeline step completion
 * auditLog.log({
 *   action: 'PIPELINE_STEP_COMPLETED',
 *   userId: 'user_abc123',
 *   projectId: 'proj_xyz',
 *   input: { stepIndex: 2, stepName: 'database-designer' },
 *   output: { generatedSchema: '...' },
 *   metadata: { tokenCost: 1250, duration: 3400, model: 'gpt-4o' },
 * });
 *
 * // Query events for a project
 * const events = auditLog.getEvents('proj_xyz');
 * console.log(`Found ${events.length} events`);
 *
 * // Query events for a user across all projects
 * const userEvents = auditLog.getEventsByUser('user_abc123');
 * ```
 */
export const auditLog = {
  /**
   * Record a new audit event.
   *
   * Automatically sets the timestamp to the current time.
   * Events are stored in-memory (bounded per-project) and written
   * to stdout as structured JSON for log aggregation.
   *
   * @param event - The audit event to record (timestamp is auto-generated)
   */
  log(event: AuditEventInput): void {
    const fullEvent: AuditEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    const key = event.projectId || GLOBAL_KEY;
    const bucket = getOrCreateBucket(key);

    // Enforce per-project cap (FIFO eviction)
    if (bucket.length >= MAX_EVENTS_PER_PROJECT) {
      bucket.shift();
    }

    bucket.push(fullEvent);

    // Enforce global cap
    while (totalEventCount() > MAX_TOTAL_EVENTS) {
      evictOldestGlobal();
    }

    // Persist to structured log output
    writeToConsole(fullEvent);
  },

  /**
   * Retrieve all audit events for a specific project.
   *
   * Returns events in chronological order (oldest first).
   * Returns an empty array if no events exist for the project.
   *
   * @param projectId - The project ID to query
   * @returns Array of audit events for the project
   */
  getEvents(projectId: string): AuditEvent[] {
    return eventStore.get(projectId) ?? [];
  },

  /**
   * Retrieve all audit events triggered by a specific user,
   * across all projects.
   *
   * Performs a linear scan across all stored events.
   * Returns events in chronological order (oldest first).
   *
   * @param userId - The user ID to query
   * @returns Array of audit events by the user
   */
  getEventsByUser(userId: string): AuditEvent[] {
    const results: AuditEvent[] = [];

    for (const bucket of Array.from(eventStore.values())) {
      for (const event of bucket) {
        if (event.userId === userId) {
          results.push(event);
        }
      }
    }

    // Sort chronologically since we're merging across buckets
    results.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return results;
  },

  /**
   * Retrieve all audit events matching a specific action type,
   * optionally scoped to a project.
   *
   * @param action - The action string to filter by (e.g., 'PIPELINE_STEP_COMPLETED')
   * @param projectId - Optional project ID to scope the search
   * @returns Array of matching audit events
   */
  getEventsByAction(action: string, projectId?: string): AuditEvent[] {
    const results: AuditEvent[] = [];

    if (projectId) {
      const bucket = eventStore.get(projectId) ?? [];
      return bucket.filter((e) => e.action === action);
    }

    for (const bucket of Array.from(eventStore.values())) {
      for (const event of bucket) {
        if (event.action === action) {
          results.push(event);
        }
      }
    }

    return results;
  },

  /**
   * Clear all stored audit events.
   * Useful for testing or manual reset.
   */
  clear(): void {
    eventStore.clear();
  },

  /**
   * Get the total number of stored events across all projects.
   * Useful for monitoring memory usage.
   *
   * @returns Total event count
   */
  size(): number {
    return totalEventCount();
  },
};

export default auditLog;
