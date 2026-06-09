/**
 * @file Structured Logger for Launch IQ
 * @description Provides structured JSON logging with log levels, timestamps,
 *              and context. Replaces raw console.log across the application.
 * @module lib/logger
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: string;
  stack?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const MIN_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

/**
 * Format a log entry as structured JSON
 */
function formatEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

/**
 * Write a log entry to stdout/stderr based on level
 */
function writeLog(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>, error?: Error): void {
  if (LOG_LEVELS[level] < LOG_LEVELS[MIN_LEVEL]) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context && { context }),
    ...(data && { data }),
    ...(error && { error: error.message, stack: error.stack }),
  };

  const formatted = formatEntry(entry);

  if (level === 'error' || level === 'fatal') {
    console.error(formatted);
  } else if (level === 'warn') {
    console.warn(formatted);
  } else {
    console.log(formatted);
  }
}

/**
 * Structured logger with context support
 * @example
 * ```ts
 * import { logger } from '@/lib/logger';
 * 
 * // Basic usage
 * logger.info('Server started', 'startup');
 * 
 * // With data
 * logger.info('Project created', 'api', { projectId: '123', userId: 'abc' });
 * 
 * // Error logging
 * logger.error('Failed to generate', 'ai-router', {}, new Error('API timeout'));
 * 
 * // Create scoped logger
 * const log = logger.child('api/projects');
 * log.info('Listed projects');
 * ```
 */
export const logger = {
  debug: (msg: string, ctx?: string, data?: Record<string, unknown>) => writeLog('debug', msg, ctx, data),
  info: (msg: string, ctx?: string, data?: Record<string, unknown>) => writeLog('info', msg, ctx, data),
  warn: (msg: string, ctx?: string, data?: Record<string, unknown>) => writeLog('warn', msg, ctx, data),
  error: (msg: string, ctx?: string, data?: Record<string, unknown>, err?: Error) => writeLog('error', msg, ctx, data, err),
  fatal: (msg: string, ctx?: string, data?: Record<string, unknown>, err?: Error) => writeLog('fatal', msg, ctx, data, err),

  /**
   * Create a child logger with a fixed context prefix
   */
  child: (context: string) => ({
    debug: (msg: string, data?: Record<string, unknown>) => writeLog('debug', msg, context, data),
    info: (msg: string, data?: Record<string, unknown>) => writeLog('info', msg, context, data),
    warn: (msg: string, data?: Record<string, unknown>) => writeLog('warn', msg, context, data),
    error: (msg: string, data?: Record<string, unknown>, err?: Error) => writeLog('error', msg, context, data, err),
    fatal: (msg: string, data?: Record<string, unknown>, err?: Error) => writeLog('fatal', msg, context, data, err),
  }),
};

export default logger;
