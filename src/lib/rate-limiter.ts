/**
 * @file Rate Limiter
 * @description Token-bucket rate limiter with request queuing for the
 *              Launch IQ. Prevents API abuse by limiting
 *              request throughput per user with configurable burst capacity
 *              and a bounded request queue for overflow handling.
 * @module lib/rate-limiter
 */

// ─── Types & Interfaces ──────────────────────────────────────────────────────

/**
 * Configuration for a TokenBucket instance.
 */
export interface TokenBucketConfig {
  /** Maximum number of tokens the bucket can hold (burst capacity). Default: 10 */
  maxTokens?: number;
  /** Token refill rate in tokens per second. Default: 0.1667 (~10/min) */
  refillRate?: number;
}

/**
 * Configuration for a RequestQueue instance.
 */
export interface RequestQueueConfig {
  /** Maximum number of pending requests in the queue. Default: 20 */
  maxQueueDepth?: number;
  /** Token cost per queued request. Default: 1 */
  defaultCost?: number;
  /** Interval in ms between queue drain attempts. Default: 500 */
  drainIntervalMs?: number;
}

/**
 * Configuration for a RateLimiter instance (combines bucket + queue).
 */
export interface RateLimiterConfig extends TokenBucketConfig, RequestQueueConfig {}

/**
 * Statistics snapshot for the rate limiter.
 */
export interface RateLimiterStats {
  /** Number of tokens currently available in the bucket */
  tokensRemaining: number;
  /** Number of requests currently waiting in the queue */
  queueDepth: number;
  /** Total number of requests successfully processed */
  totalProcessed: number;
  /** Total number of requests rejected (queue full or limiter disposed) */
  totalRejected: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Default maximum tokens (burst capacity): 10 */
const DEFAULT_MAX_TOKENS = 10;

/** Default refill rate: ~10 tokens per minute ≈ 0.1667 tokens/sec */
const DEFAULT_REFILL_RATE = 10 / 60;

/** Default maximum queue depth */
const DEFAULT_MAX_QUEUE_DEPTH = 20;

/** Default token cost per request */
const DEFAULT_COST = 1;

/** Default drain interval in milliseconds */
const DEFAULT_DRAIN_INTERVAL_MS = 500;

// ─── Token Bucket ─────────────────────────────────────────────────────────────

/**
 * Token-bucket algorithm implementation for rate limiting.
 *
 * Tokens are consumed when a request is processed and automatically
 * refilled at a steady rate. The bucket has a maximum capacity to
 * allow controlled bursting.
 *
 * @example
 * ```ts
 * // 10 requests per minute with burst capacity of 10
 * const bucket = new TokenBucket({ maxTokens: 10, refillRate: 10 / 60 });
 *
 * if (bucket.tryConsume(1)) {
 *   // Process request
 * } else {
 *   // Rate limited — reject or queue
 * }
 * ```
 */
export class TokenBucket {
  /** Current number of available tokens */
  private tokens: number;

  /** Maximum token capacity */
  private readonly maxTokens: number;

  /** Tokens added per second */
  private readonly refillRate: number;

  /** Timestamp of the last refill calculation */
  private lastRefillTime: number;

  /**
   * Create a new TokenBucket.
   *
   * @param config - Bucket configuration
   * @param config.maxTokens - Maximum token capacity (burst size). Default: 10
   * @param config.refillRate - Tokens refilled per second. Default: ~0.1667 (10/min)
   */
  constructor(config?: TokenBucketConfig) {
    this.maxTokens = config?.maxTokens ?? DEFAULT_MAX_TOKENS;
    this.refillRate = config?.refillRate ?? DEFAULT_REFILL_RATE;
    this.tokens = this.maxTokens; // Start full
    this.lastRefillTime = Date.now();
  }

  /**
   * Refill tokens based on elapsed time since the last refill.
   * Tokens are capped at maxTokens.
   */
  private refill(): void {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefillTime) / 1000;
    const newTokens = elapsedSec * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
    this.lastRefillTime = now;
  }

  /**
   * Attempt to consume tokens from the bucket.
   *
   * @param cost - Number of tokens to consume. Default: 1
   * @returns `true` if tokens were consumed, `false` if insufficient tokens
   *
   * @example
   * ```ts
   * if (bucket.tryConsume(2)) {
   *   // Allowed: 2 tokens consumed
   * }
   * ```
   */
  tryConsume(cost: number = DEFAULT_COST): boolean {
    this.refill();

    if (this.tokens >= cost) {
      this.tokens -= cost;
      return true;
    }

    return false;
  }

  /**
   * Get the current number of available tokens (after refill).
   *
   * @returns Number of tokens remaining
   */
  getTokensRemaining(): number {
    this.refill();
    return Math.floor(this.tokens * 100) / 100; // 2 decimal places
  }

  /**
   * Force-reset the bucket to full capacity.
   */
  reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefillTime = Date.now();
  }
}

// ─── Request Queue ────────────────────────────────────────────────────────────

/** Internal representation of a queued request */
interface QueuedRequest<T> {
  /** The async function to execute when tokens are available */
  fn: () => Promise<T>;
  /** Token cost for this request */
  cost: number;
  /** Promise resolve callback */
  resolve: (value: T) => void;
  /** Promise reject callback */
  reject: (reason: unknown) => void;
}

/**
 * Bounded request queue that pairs with a TokenBucket.
 * When the bucket is empty, requests are queued and drained
 * as tokens become available.
 *
 * @example
 * ```ts
 * const bucket = new TokenBucket({ maxTokens: 5, refillRate: 1 });
 * const queue = new RequestQueue(bucket, { maxQueueDepth: 20 });
 *
 * const result = await queue.enqueue(async () => {
 *   return fetch('/api/data').then(r => r.json());
 * });
 *
 * console.log(queue.getStats());
 * queue.dispose(); // Clean up drain interval
 * ```
 */
export class RequestQueue {
  /** The token bucket controlling throughput */
  private readonly bucket: TokenBucket;

  /** Maximum pending requests */
  private readonly maxQueueDepth: number;

  /** Default token cost per request */
  private readonly defaultCost: number;

  /** Interval timer for draining the queue */
  private drainTimer: ReturnType<typeof setInterval> | null = null;

  /** The pending request queue */
  private queue: QueuedRequest<unknown>[] = [];

  /** Total requests processed successfully */
  private totalProcessed = 0;

  /** Total requests rejected (queue full) */
  private totalRejected = 0;

  /**
   * Create a new RequestQueue.
   *
   * @param bucket - TokenBucket instance to consume from
   * @param config - Queue configuration
   * @param config.maxQueueDepth - Maximum number of queued requests. Default: 20
   * @param config.defaultCost - Default token cost per request. Default: 1
   * @param config.drainIntervalMs - Milliseconds between drain attempts. Default: 500
   */
  constructor(bucket: TokenBucket, config?: RequestQueueConfig) {
    this.bucket = bucket;
    this.maxQueueDepth = config?.maxQueueDepth ?? DEFAULT_MAX_QUEUE_DEPTH;
    this.defaultCost = config?.defaultCost ?? DEFAULT_COST;

    const drainInterval = config?.drainIntervalMs ?? DEFAULT_DRAIN_INTERVAL_MS;
    this.drainTimer = setInterval(() => this.drain(), drainInterval);

    // Prevent the drain timer from keeping the process alive in serverless
    if (this.drainTimer && typeof this.drainTimer === 'object' && 'unref' in this.drainTimer) {
      (this.drainTimer as NodeJS.Timeout).unref();
    }
  }

  /**
   * Enqueue an async function for rate-limited execution.
   *
   * If the bucket has enough tokens, the function executes immediately.
   * Otherwise, it is placed in the queue and executed when tokens refill.
   * Rejects immediately if the queue is already at max depth.
   *
   * @typeParam T - The return type of the queued function
   * @param fn - Async function to execute
   * @param cost - Token cost for this request. Default: configured defaultCost
   * @returns Promise resolving to the function's return value
   * @throws Error if the queue is full
   *
   * @example
   * ```ts
   * const result = await queue.enqueue(
   *   () => aiRouter.execute({ model: 'deepseek', prompt: 'Hello' }),
   *   1
   * );
   * ```
   */
  enqueue<T>(fn: () => Promise<T>, cost?: number): Promise<T> {
    const requestCost = cost ?? this.defaultCost;

    // Fast path: bucket has tokens → execute immediately
    if (this.bucket.tryConsume(requestCost)) {
      this.totalProcessed += 1;
      return fn();
    }

    // Reject if queue is full
    if (this.queue.length >= this.maxQueueDepth) {
      this.totalRejected += 1;
      return Promise.reject(
        new Error(`Rate limiter queue full (depth: ${this.maxQueueDepth}). Request rejected.`)
      );
    }

    // Queue the request for later execution
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        fn: fn as () => Promise<unknown>,
        cost: requestCost,
        resolve: resolve as (value: unknown) => void,
        reject,
      });
    });
  }

  /**
   * Drain queued requests as tokens become available.
   * Called automatically by the drain interval timer.
   */
  private drain(): void {
    while (this.queue.length > 0) {
      const head = this.queue[0];

      if (!this.bucket.tryConsume(head.cost)) {
        break; // No tokens available, stop draining
      }

      // Remove from queue and execute
      this.queue.shift();
      this.totalProcessed += 1;

      head.fn()
        .then(head.resolve)
        .catch(head.reject);
    }
  }

  /**
   * Get current rate limiter statistics.
   *
   * @returns Snapshot of tokens remaining, queue depth, and counters
   *
   * @example
   * ```ts
   * const stats = queue.getStats();
   * // { tokensRemaining: 7.5, queueDepth: 3, totalProcessed: 42, totalRejected: 2 }
   * ```
   */
  getStats(): RateLimiterStats {
    return {
      tokensRemaining: this.bucket.getTokensRemaining(),
      queueDepth: this.queue.length,
      totalProcessed: this.totalProcessed,
      totalRejected: this.totalRejected,
    };
  }

  /**
   * Get the current queue depth.
   *
   * @returns Number of requests waiting in the queue
   */
  getQueueDepth(): number {
    return this.queue.length;
  }

  /**
   * Dispose the queue, clearing the drain timer and rejecting all
   * pending requests. Call this during shutdown or cleanup.
   */
  dispose(): void {
    if (this.drainTimer) {
      clearInterval(this.drainTimer);
      this.drainTimer = null;
    }

    // Reject all pending requests
    while (this.queue.length > 0) {
      const req = this.queue.shift()!;
      this.totalRejected += 1;
      req.reject(new Error('RequestQueue disposed. Pending request rejected.'));
    }
  }
}

// ─── Convenience: Combined Rate Limiter ──────────────────────────────────────

/**
 * Combined rate limiter that bundles a TokenBucket and RequestQueue together.
 * Provides a simple, unified API for rate-limiting async operations.
 *
 * Default configuration: 10 requests/minute, burst capacity of 10, queue depth 20.
 *
 * @example
 * ```ts
 * import { RateLimiter } from '@/lib/rate-limiter';
 *
 * const limiter = new RateLimiter();
 *
 * // Check if a request can proceed
 * if (limiter.tryConsume(1)) {
 *   await handleRequest();
 * }
 *
 * // Or queue it for later execution
 * const result = await limiter.enqueue(() => handleRequest());
 *
 * // Get stats
 * console.log(limiter.getStats());
 *
 * // Cleanup
 * limiter.dispose();
 * ```
 */
export class RateLimiter {
  /** The underlying token bucket */
  public readonly bucket: TokenBucket;

  /** The underlying request queue */
  public readonly queue: RequestQueue;

  /**
   * Create a new RateLimiter.
   *
   * @param config - Configuration for both the bucket and the queue
   * @param config.maxTokens - Maximum burst capacity. Default: 10
   * @param config.refillRate - Tokens refilled per second. Default: ~0.1667 (10/min)
   * @param config.maxQueueDepth - Maximum queue depth. Default: 20
   * @param config.defaultCost - Default token cost per request. Default: 1
   * @param config.drainIntervalMs - Drain interval in ms. Default: 500
   */
  constructor(config?: RateLimiterConfig) {
    this.bucket = new TokenBucket({
      maxTokens: config?.maxTokens,
      refillRate: config?.refillRate,
    });
    this.queue = new RequestQueue(this.bucket, {
      maxQueueDepth: config?.maxQueueDepth,
      defaultCost: config?.defaultCost,
      drainIntervalMs: config?.drainIntervalMs,
    });
  }

  /**
   * Attempt to immediately consume tokens for a request.
   * Does not queue the request if tokens are unavailable.
   *
   * @param cost - Number of tokens to consume. Default: 1
   * @returns `true` if the request can proceed, `false` if rate limited
   */
  tryConsume(cost: number = DEFAULT_COST): boolean {
    return this.bucket.tryConsume(cost);
  }

  /**
   * Enqueue an async function for rate-limited execution.
   * Executes immediately if tokens are available, otherwise queued.
   *
   * @typeParam T - Return type of the queued function
   * @param fn - Async function to execute
   * @param cost - Token cost. Default: 1
   * @returns Promise resolving to the function's return value
   * @throws Error if the queue is full
   */
  enqueue<T>(fn: () => Promise<T>, cost?: number): Promise<T> {
    return this.queue.enqueue(fn, cost);
  }

  /**
   * Get current rate limiter statistics.
   *
   * @returns Snapshot of tokens, queue, and counters
   */
  getStats(): RateLimiterStats {
    return this.queue.getStats();
  }

  /**
   * Dispose the rate limiter, clearing timers and rejecting pending requests.
   */
  dispose(): void {
    this.queue.dispose();
  }
}

// ─── Per-User Rate Limiter Map ───────────────────────────────────────────────

/**
 * Manages per-user rate limiters. Automatically creates a new RateLimiter
 * for each unique user ID with the configured defaults.
 *
 * @example
 * ```ts
 * import { userRateLimiters } from '@/lib/rate-limiter';
 *
 * const limiter = userRateLimiters.getOrCreate('user-123');
 * const result = await limiter.enqueue(() => generateCode(prompt));
 * ```
 */
export class UserRateLimiterMap {
  /** Map of userId → RateLimiter */
  private limiters: Map<string, RateLimiter> = new Map();

  /** Default config for new per-user limiters */
  private readonly defaultConfig: RateLimiterConfig;

  /**
   * Create a UserRateLimiterMap.
   *
   * @param config - Default config for each user's rate limiter
   */
  constructor(config?: RateLimiterConfig) {
    this.defaultConfig = config ?? {};
  }

  /**
   * Get or create a rate limiter for a specific user.
   *
   * @param userId - Unique user identifier
   * @returns The user's RateLimiter instance
   */
  getOrCreate(userId: string): RateLimiter {
    let limiter = this.limiters.get(userId);
    if (!limiter) {
      limiter = new RateLimiter(this.defaultConfig);
      this.limiters.set(userId, limiter);
    }
    return limiter;
  }

  /**
   * Check if a rate limiter exists for a user.
   *
   * @param userId - Unique user identifier
   * @returns `true` if the user has an active rate limiter
   */
  has(userId: string): boolean {
    return this.limiters.has(userId);
  }

  /**
   * Remove and dispose a specific user's rate limiter.
   *
   * @param userId - Unique user identifier
   */
  remove(userId: string): void {
    const limiter = this.limiters.get(userId);
    if (limiter) {
      limiter.dispose();
      this.limiters.delete(userId);
    }
  }

  /**
   * Dispose all user rate limiters. Call during shutdown.
   */
  disposeAll(): void {
    for (const limiter of this.limiters.values()) {
      limiter.dispose();
    }
    this.limiters.clear();
  }

  /**
   * Get the number of active user limiters.
   *
   * @returns Count of active rate limiters
   */
  get size(): number {
    return this.limiters.size;
  }
}

/**
 * Default per-user rate limiter map.
 * Each user gets 10 requests/minute with a queue depth of 20.
 */
export const userRateLimiters = new UserRateLimiterMap();
