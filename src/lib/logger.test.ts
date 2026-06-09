/**
 * @file Logger Tests
 * @description Unit tests for the structured logger utility
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock console methods before importing logger
const mockLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be importable', async () => {
    const { logger } = await import('@/lib/logger');
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.fatal).toBe('function');
  });

  it('should log info messages with structured JSON', async () => {
    const { logger } = await import('@/lib/logger');
    logger.info('Test message', 'test-context');

    expect(mockLog).toHaveBeenCalled();
    const logged = JSON.parse(mockLog.mock.calls[0][0]);
    expect(logged.level).toBe('info');
    expect(logged.message).toBe('Test message');
    expect(logged.context).toBe('test-context');
    expect(logged.timestamp).toBeDefined();
  });

  it('should log warnings to console.warn', async () => {
    const { logger } = await import('@/lib/logger');
    logger.warn('Warning message');

    expect(mockWarn).toHaveBeenCalled();
    const logged = JSON.parse(mockWarn.mock.calls[0][0]);
    expect(logged.level).toBe('warn');
    expect(logged.message).toBe('Warning message');
  });

  it('should log errors to console.error', async () => {
    const { logger } = await import('@/lib/logger');
    const testError = new Error('Test error');
    logger.error('Error occurred', 'api', {}, testError);

    expect(mockError).toHaveBeenCalled();
    const logged = JSON.parse(mockError.mock.calls[0][0]);
    expect(logged.level).toBe('error');
    expect(logged.error).toBe('Test error');
    expect(logged.stack).toBeDefined();
  });

  it('should include data in log entries', async () => {
    const { logger } = await import('@/lib/logger');
    logger.info('With data', 'test', { userId: '123', action: 'login' });

    const logged = JSON.parse(mockLog.mock.calls[0][0]);
    expect(logged.data).toEqual({ userId: '123', action: 'login' });
  });

  it('should create child loggers with fixed context', async () => {
    const { logger } = await import('@/lib/logger');
    const child = logger.child('api/projects');
    child.info('Child message');

    const logged = JSON.parse(mockLog.mock.calls[0][0]);
    expect(logged.context).toBe('api/projects');
  });
});
