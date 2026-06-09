/**
 * @file AI Failover Chain
 * @description Multi-provider failover system for AI model routing.
 *              Chains DeepSeek → Ollama → null fallback with circuit breaker
 *              protection, health monitoring, and exponential backoff retries.
 *              Designed to wrap around the existing AIModelRouter for resilient
 *              AI request handling across the Launch IQ.
 * @module lib/ai/failover
 */

import type { AIModel } from './router';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Default circuit breaker threshold: consecutive failures before tripping */
const DEFAULT_FAILURE_THRESHOLD = 3;

/** Default circuit breaker cooldown period in milliseconds (60 seconds) */
const DEFAULT_COOLDOWN_MS = 60_000;

/** Default backoff delays in milliseconds for exponential retry */
const DEFAULT_BACKOFF_DELAYS_MS = [200, 400, 800];

/** Default ordered chain of providers to attempt */
const DEFAULT_PROVIDER_CHAIN: AIModel[] = ['deepseek', 'ollama'];

// ─── Types & Interfaces ──────────────────────────────────────────────────────

/**
 * Health snapshot for a single AI provider.
 * Tracks latency, error rates, and circuit breaker state.
 */
export interface ProviderHealth {
  /** The AI model provider identifier */
  provider: AIModel;
  /** Total number of requests sent to this provider */
  totalRequests: number;
  /** Total number of failed requests */
  totalFailures: number;
  /** Rolling error rate as a decimal (0.0 – 1.0) */
  errorRate: number;
  /** Average response latency in milliseconds */
  averageLatencyMs: number;
  /** Most recent response latency in milliseconds */
  lastLatencyMs: number;
  /** Whether the circuit breaker is currently open (provider disabled) */
  circuitOpen: boolean;
  /** ISO timestamp of when the circuit breaker was last tripped, or null */
  lastTrippedAt: string | null;
}

/**
 * Configuration options for the failover chain.
 */
export interface FailoverConfig {
  /** Ordered list of providers to attempt. Default: ['deepseek', 'ollama'] */
  providerChain?: AIModel[];
  /** Number of consecutive failures before the circuit breaker opens. Default: 3 */
  failureThreshold?: number;
  /** Cooldown period in ms before a tripped provider is retried. Default: 60000 */
  cooldownMs?: number;
  /** Backoff delays in ms for retry attempts. Default: [200, 400, 800] */
  backoffDelaysMs?: number[];
}

/**
 * Result of a failover chain execution.
 */
export interface FailoverResult<T> {
  /** The response data from the successful provider, or null on total failure */
  data: T | null;
  /** The provider that successfully handled the request, or null */
  provider: AIModel | null;
  /** Number of providers attempted before success */
  attemptsTotal: number;
  /** Latency in ms of the successful call, or -1 on failure */
  latencyMs: number;
  /** Error message if all providers failed */
  error: string | null;
}

// ─── Circuit Breaker ─────────────────────────────────────────────────────────

/**
 * Tracks failures per AI provider and auto-disables a provider for a
 * configurable cooldown period after a threshold of consecutive failures.
 *
 * @example
 * ```ts
 * const cb = new CircuitBreaker({ failureThreshold: 3, cooldownMs: 60000 });
 *
 * if (cb.isAvailable('deepseek')) {
 *   try {
 *     const result = await callDeepSeek(prompt);
 *     cb.recordSuccess('deepseek');
 *   } catch {
 *     cb.recordFailure('deepseek');
 *   }
 * }
 * ```
 */
export class CircuitBreaker {
  /** Consecutive failure count per provider */
  private failures: Map<AIModel, number> = new Map();

  /** Timestamp (epoch ms) when each provider was last tripped */
  private trippedAt: Map<AIModel, number> = new Map();

  /** Number of consecutive failures before the breaker opens */
  private readonly threshold: number;

  /** Cooldown period in ms before a tripped provider can be retried */
  private readonly cooldownMs: number;

  /**
   * Create a new CircuitBreaker.
   * @param options - Configuration overrides
   * @param options.failureThreshold - Consecutive failures before tripping. Default: 3
   * @param options.cooldownMs - Cooldown in ms before retrying a tripped provider. Default: 60000
   */
  constructor(options?: { failureThreshold?: number; cooldownMs?: number }) {
    this.threshold = options?.failureThreshold ?? DEFAULT_FAILURE_THRESHOLD;
    this.cooldownMs = options?.cooldownMs ?? DEFAULT_COOLDOWN_MS;
  }

  /**
   * Check whether a provider's circuit is closed (available for requests).
   * A provider is unavailable if it has tripped and the cooldown has not elapsed.
   * Once the cooldown elapses, the circuit is automatically half-opened
   * (failures reset, provider becomes available again for a trial request).
   *
   * @param provider - The AI model provider to check
   * @returns `true` if the provider can accept requests
   */
  isAvailable(provider: AIModel): boolean {
    const failCount = this.failures.get(provider) ?? 0;

    if (failCount < this.threshold) {
      return true;
    }

    const trippedTime = this.trippedAt.get(provider);
    if (!trippedTime) {
      return true;
    }

    const elapsed = Date.now() - trippedTime;
    if (elapsed >= this.cooldownMs) {
      // Cooldown elapsed → half-open: reset and allow a trial request
      this.failures.set(provider, 0);
      this.trippedAt.delete(provider);
      return true;
    }

    return false;
  }

  /**
   * Record a successful request for a provider, resetting its failure counter.
   *
   * @param provider - The provider that succeeded
   */
  recordSuccess(provider: AIModel): void {
    this.failures.set(provider, 0);
    this.trippedAt.delete(provider);
  }

  /**
   * Record a failed request for a provider. If the failure count reaches
   * the threshold, the circuit breaker trips and the provider is disabled
   * for the cooldown period.
   *
   * @param provider - The provider that failed
   */
  recordFailure(provider: AIModel): void {
    const current = (this.failures.get(provider) ?? 0) + 1;
    this.failures.set(provider, current);

    if (current >= this.threshold) {
      this.trippedAt.set(provider, Date.now());
    }
  }

  /**
   * Get the current consecutive failure count for a provider.
   *
   * @param provider - The AI model provider
   * @returns Number of consecutive failures
   */
  getFailureCount(provider: AIModel): number {
    return this.failures.get(provider) ?? 0;
  }

  /**
   * Check whether the circuit is currently in the open (tripped) state
   * for a given provider.
   *
   * @param provider - The AI model provider
   * @returns `true` if the circuit is open and cooldown has not elapsed
   */
  isOpen(provider: AIModel): boolean {
    return !this.isAvailable(provider);
  }

  /**
   * Force-reset the circuit breaker state for a specific provider.
   *
   * @param provider - The provider to reset
   */
  reset(provider: AIModel): void {
    this.failures.delete(provider);
    this.trippedAt.delete(provider);
  }

  /**
   * Force-reset all circuit breaker state across all providers.
   */
  resetAll(): void {
    this.failures.clear();
    this.trippedAt.clear();
  }
}

// ─── Health Monitor ──────────────────────────────────────────────────────────

/**
 * Tracks latency and error rate per AI provider for observability and
 * intelligent routing decisions.
 *
 * @example
 * ```ts
 * const monitor = new HealthMonitor();
 *
 * monitor.recordLatency('deepseek', 320);
 * monitor.recordSuccess('deepseek');
 * monitor.recordFailure('ollama');
 *
 * const snapshot = monitor.getHealth('deepseek');
 * console.log(snapshot.averageLatencyMs, snapshot.errorRate);
 * ```
 */
export class HealthMonitor {
  /** Running totals per provider */
  private stats: Map<AIModel, {
    totalRequests: number;
    totalFailures: number;
    totalLatencyMs: number;
    lastLatencyMs: number;
    lastTrippedAt: string | null;
  }> = new Map();

  /**
   * Ensure a stats entry exists for a provider.
   * @param provider - The AI model provider
   */
  private ensureEntry(provider: AIModel): void {
    if (!this.stats.has(provider)) {
      this.stats.set(provider, {
        totalRequests: 0,
        totalFailures: 0,
        totalLatencyMs: 0,
        lastLatencyMs: 0,
        lastTrippedAt: null,
      });
    }
  }

  /**
   * Record a response latency measurement for a provider.
   *
   * @param provider - The AI model provider
   * @param latencyMs - Response time in milliseconds
   */
  recordLatency(provider: AIModel, latencyMs: number): void {
    this.ensureEntry(provider);
    const entry = this.stats.get(provider)!;
    entry.totalLatencyMs += latencyMs;
    entry.lastLatencyMs = latencyMs;
  }

  /**
   * Record a successful request for a provider.
   *
   * @param provider - The AI model provider
   */
  recordSuccess(provider: AIModel): void {
    this.ensureEntry(provider);
    const entry = this.stats.get(provider)!;
    entry.totalRequests += 1;
  }

  /**
   * Record a failed request for a provider.
   *
   * @param provider - The AI model provider
   */
  recordFailure(provider: AIModel): void {
    this.ensureEntry(provider);
    const entry = this.stats.get(provider)!;
    entry.totalRequests += 1;
    entry.totalFailures += 1;
  }

  /**
   * Mark the timestamp when a provider's circuit breaker was tripped.
   *
   * @param provider - The AI model provider
   */
  recordTrip(provider: AIModel): void {
    this.ensureEntry(provider);
    const entry = this.stats.get(provider)!;
    entry.lastTrippedAt = new Date().toISOString();
  }

  /**
   * Get a health snapshot for a specific provider.
   *
   * @param provider - The AI model provider
   * @param circuitOpen - Whether the circuit breaker is currently open
   * @returns Health snapshot object
   */
  getHealth(provider: AIModel, circuitOpen = false): ProviderHealth {
    this.ensureEntry(provider);
    const entry = this.stats.get(provider)!;

    const errorRate = entry.totalRequests > 0
      ? entry.totalFailures / entry.totalRequests
      : 0;

    const averageLatencyMs = entry.totalRequests > 0
      ? Math.round(entry.totalLatencyMs / entry.totalRequests)
      : 0;

    return {
      provider,
      totalRequests: entry.totalRequests,
      totalFailures: entry.totalFailures,
      errorRate: Math.round(errorRate * 1000) / 1000,
      averageLatencyMs,
      lastLatencyMs: entry.lastLatencyMs,
      circuitOpen,
      lastTrippedAt: entry.lastTrippedAt,
    };
  }

  /**
   * Get health snapshots for all tracked providers.
   *
   * @param circuitBreaker - Optional CircuitBreaker to include open/closed state
   * @returns Array of ProviderHealth snapshots
   */
  getAllHealth(circuitBreaker?: CircuitBreaker): ProviderHealth[] {
    const results: ProviderHealth[] = [];
    for (const provider of this.stats.keys()) {
      const circuitOpen = circuitBreaker ? circuitBreaker.isOpen(provider) : false;
      results.push(this.getHealth(provider, circuitOpen));
    }
    return results;
  }

  /**
   * Reset all health monitoring data.
   */
  resetAll(): void {
    this.stats.clear();
  }
}

// ─── Retry with Exponential Backoff ──────────────────────────────────────────

/**
 * Sleep for a specified number of milliseconds.
 *
 * @param ms - Duration in milliseconds
 * @returns Promise that resolves after the delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a function with exponential backoff retries.
 * Retries are attempted with increasing delays (default: 200ms, 400ms, 800ms).
 *
 * @typeParam T - The return type of the function being retried
 * @param fn - Async function to execute with retry protection
 * @param delays - Array of backoff delays in ms. Default: [200, 400, 800]
 * @returns The result of the function if it succeeds within the retry budget
 * @throws The last error if all retries are exhausted
 *
 * @example
 * ```ts
 * const result = await retryWithBackoff(
 *   () => callDeepSeek(prompt),
 *   [200, 400, 800]
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  delays: number[] = DEFAULT_BACKOFF_DELAYS_MS
): Promise<T> {
  let lastError: Error | undefined;

  // Attempt 0: immediate (no delay)
  try {
    return await fn();
  } catch (err) {
    lastError = err instanceof Error ? err : new Error(String(err));
  }

  // Retry attempts with backoff delays
  for (const delayMs of delays) {
    await sleep(delayMs);
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error('retryWithBackoff: all attempts failed');
}

// ─── Failover Chain ──────────────────────────────────────────────────────────

/**
 * Multi-provider AI failover chain.
 * Attempts each provider in order (DeepSeek → Ollama by default),
 * skipping providers whose circuit breaker is open, and applying
 * exponential backoff retries for each provider.
 *
 * If all providers fail, returns a null result with an error message
 * rather than throwing, so the caller can handle the failure gracefully.
 *
 * @example
 * ```ts
 * const chain = new FailoverChain();
 *
 * const result = await chain.execute(async (provider) => {
 *   return AIModelRouter.execute({
 *     model: provider,
 *     prompt: 'Generate a REST API',
 *     apiKey: process.env.DEEPSEEK_API_KEY,
 *   });
 * });
 *
 * if (result.data) {
 *   console.log(`Success via ${result.provider} in ${result.latencyMs}ms`);
 * } else {
 *   console.error(`All providers failed: ${result.error}`);
 * }
 *
 * // Check provider health
 * const health = chain.getHealthReport();
 * console.log(JSON.stringify(health, null, 2));
 * ```
 */
export class FailoverChain {
  /** Ordered list of providers to attempt */
  private readonly providerChain: AIModel[];

  /** Circuit breaker instance shared across all providers */
  public readonly circuitBreaker: CircuitBreaker;

  /** Health monitor instance shared across all providers */
  public readonly healthMonitor: HealthMonitor;

  /** Backoff delays for retry attempts */
  private readonly backoffDelaysMs: number[];

  /**
   * Create a new FailoverChain.
   *
   * @param config - Optional configuration overrides
   */
  constructor(config?: FailoverConfig) {
    this.providerChain = config?.providerChain ?? [...DEFAULT_PROVIDER_CHAIN];
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: config?.failureThreshold ?? DEFAULT_FAILURE_THRESHOLD,
      cooldownMs: config?.cooldownMs ?? DEFAULT_COOLDOWN_MS,
    });
    this.healthMonitor = new HealthMonitor();
    this.backoffDelaysMs = config?.backoffDelaysMs ?? [...DEFAULT_BACKOFF_DELAYS_MS];
  }

  /**
   * Execute a request across the failover chain.
   *
   * Iterates through each configured provider in order. For each provider:
   * 1. Checks if the circuit breaker allows the request.
   * 2. Attempts the request with exponential backoff retries.
   * 3. Records success/failure metrics in both the circuit breaker and health monitor.
   * 4. On success, returns immediately. On failure, moves to the next provider.
   *
   * If all providers fail, returns a FailoverResult with `data: null` and
   * the aggregated error message.
   *
   * @typeParam T - The return type of the provider call
   * @param callProvider - Async function that takes an AIModel and performs the request
   * @returns A FailoverResult with the response data, provider, and diagnostics
   */
  async execute<T>(
    callProvider: (provider: AIModel) => Promise<T>
  ): Promise<FailoverResult<T>> {
    const errors: string[] = [];
    let attemptsTotal = 0;

    for (const provider of this.providerChain) {
      // Skip providers whose circuit is open
      if (!this.circuitBreaker.isAvailable(provider)) {
        errors.push(`${provider}: circuit breaker open (skipped)`);
        continue;
      }

      attemptsTotal += 1;
      const startTime = Date.now();

      try {
        const data = await retryWithBackoff(
          () => callProvider(provider),
          this.backoffDelaysMs
        );

        const latencyMs = Date.now() - startTime;

        // Record success
        this.circuitBreaker.recordSuccess(provider);
        this.healthMonitor.recordLatency(provider, latencyMs);
        this.healthMonitor.recordSuccess(provider);

        return {
          data,
          provider,
          attemptsTotal,
          latencyMs,
          error: null,
        };
      } catch (err) {
        const latencyMs = Date.now() - startTime;
        const errorMsg = err instanceof Error ? err.message : String(err);

        // Record failure
        this.circuitBreaker.recordFailure(provider);
        this.healthMonitor.recordLatency(provider, latencyMs);
        this.healthMonitor.recordFailure(provider);

        // If the circuit just tripped, record the trip timestamp
        if (this.circuitBreaker.isOpen(provider)) {
          this.healthMonitor.recordTrip(provider);
        }

        errors.push(`${provider}: ${errorMsg}`);
      }
    }

    // All providers failed → null fallback with aggregated error
    return {
      data: null,
      provider: null,
      attemptsTotal,
      latencyMs: -1,
      error: `All providers failed. ${errors.join(' | ')}`,
    };
  }

  /**
   * Get a health report for all providers in the chain.
   *
   * @returns Array of ProviderHealth snapshots, one per provider
   */
  getHealthReport(): ProviderHealth[] {
    return this.providerChain.map((provider) =>
      this.healthMonitor.getHealth(provider, this.circuitBreaker.isOpen(provider))
    );
  }

  /**
   * Force-reset all circuit breakers and health metrics.
   * Useful for testing or manual recovery.
   */
  resetAll(): void {
    this.circuitBreaker.resetAll();
    this.healthMonitor.resetAll();
  }
}

// ─── Singleton (default chain) ───────────────────────────────────────────────

/**
 * Default global failover chain instance.
 * Uses the standard DeepSeek → Ollama provider order with default settings.
 *
 * @example
 * ```ts
 * import { defaultFailoverChain } from '@/lib/ai/failover';
 *
 * const result = await defaultFailoverChain.execute(async (provider) => {
 *   return AIModelRouter.execute({ model: provider, prompt: 'Hello' });
 * });
 * ```
 */
export const defaultFailoverChain = new FailoverChain();
