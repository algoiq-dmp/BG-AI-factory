/**
 * @file Security Utilities
 * @description Security helpers for the Launch IQ.
 *              Provides input sanitization (XSS, SQL injection), API key hashing,
 *              JWT session validation via NextAuth, CORS headers, and rate-limit
 *              header generation. Uses only Node.js built-in `crypto` — no external
 *              dependencies.
 * @module lib/security
 */

import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { getToken } from 'next-auth/jwt';
import { prisma } from './prisma';

// ─── Input Sanitization ────────────────────────────────────────

/**
 * Dangerous HTML/XSS patterns to strip from user input.
 * Order matters — more specific patterns should come first.
 * @internal
 */
const XSS_PATTERNS: RegExp[] = [
  // Script tags and their content
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  // Event handlers (onclick, onerror, onload, etc.)
  /\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi,
  // javascript: and data: URI schemes
  /(?:javascript|data|vbscript)\s*:/gi,
  // HTML tags that can execute code
  /<(?:iframe|embed|object|applet|form|meta|link|base|svg)\b[^>]*>/gi,
  // Closing tags for the above
  /<\/(?:iframe|embed|object|applet|form|svg)>/gi,
  // HTML entity encoding tricks (&#x6A;avascript: etc.)
  /&#x?[0-9a-f]+;?/gi,
  // Expression() in CSS (IE attack vector)
  /expression\s*\(/gi,
  // URL() in CSS with javascript
  /url\s*\(\s*(?:javascript|data):/gi,
];

/**
 * SQL injection patterns to neutralize.
 * These are detection patterns — the actual "fix" is replacing
 * dangerous sequences with safe alternatives.
 * @internal
 */
const SQL_INJECTION_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // SQL comment sequences
  { pattern: /--/g, replacement: '' },
  { pattern: /\/\*[\s\S]*?\*\//g, replacement: '' },
  // Common injection keywords preceded/followed by spaces or special chars
  { pattern: /'\s*(?:OR|AND)\s+'[^']*'\s*=\s*'[^']*'/gi, replacement: '' },
  { pattern: /'\s*(?:OR|AND)\s+\d+\s*=\s*\d+/gi, replacement: '' },
  // UNION SELECT injection
  { pattern: /\bUNION\s+(?:ALL\s+)?SELECT\b/gi, replacement: '' },
  // DROP/DELETE/TRUNCATE/ALTER statements
  { pattern: /\b(?:DROP|DELETE\s+FROM|TRUNCATE|ALTER)\s+\w+/gi, replacement: '' },
  // Semicolon-based statement injection
  { pattern: /;\s*(?:DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|EXECUTE)\b/gi, replacement: '' },
  // xp_cmdshell and other extended stored procedures
  { pattern: /\bxp_\w+/gi, replacement: '' },
  // WAITFOR DELAY (time-based blind SQLi)
  { pattern: /\bWAITFOR\s+DELAY\b/gi, replacement: '' },
  // BENCHMARK (MySQL time-based blind SQLi)
  { pattern: /\bBENCHMARK\s*\(/gi, replacement: '' },
];

/**
 * Sanitize user input by stripping XSS payloads and SQL injection patterns.
 *
 * This is a defense-in-depth measure — it should be used alongside parameterized
 * queries (Prisma handles this) and Content-Security-Policy headers.
 *
 * @param input - Raw user input string
 * @returns Sanitized string with dangerous patterns removed
 *
 * @example
 * ```ts
 * import { sanitizeInput } from '@/lib/security';
 *
 * const safe = sanitizeInput('<script>alert("xss")</script>Hello');
 * // => 'Hello'
 *
 * const safeSql = sanitizeInput("'; DROP TABLE users; --");
 * // => "' users; "
 * ```
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Pass 1: Strip XSS patterns
  for (const pattern of XSS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Pass 2: Neutralize SQL injection patterns
  for (const { pattern, replacement } of SQL_INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  // Pass 3: Encode remaining HTML special characters
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  // Pass 4: Trim and collapse excessive whitespace
  sanitized = sanitized.replace(/\s{2,}/g, ' ').trim();

  return sanitized;
}

// ─── API Key Hashing ────────────────────────────────────────────

/**
 * Hash an API key using SHA-256 for safe storage.
 *
 * API keys should never be stored in plaintext. This function produces
 * a deterministic hex hash that can be used for lookup and comparison
 * without exposing the original key.
 *
 * @param key - The raw API key to hash
 * @returns Lowercase hex-encoded SHA-256 hash
 * @throws {Error} If the key is empty or not a string
 *
 * @example
 * ```ts
 * import { hashApiKey } from '@/lib/security';
 *
 * const hashed = hashApiKey('sk-live-abc123xyz');
 * // => '9f86d081884c7d659a2feaa0c55ad015...' (64 char hex string)
 *
 * // Store `hashed` in DB, compare on subsequent requests
 * if (hashApiKey(incomingKey) === storedHash) {
 *   // Valid key
 * }
 * ```
 */
export function hashApiKey(key: string): string {
  if (!key || typeof key !== 'string') {
    throw new Error('API key must be a non-empty string');
  }

  return createHash('sha256').update(key, 'utf8').digest('hex');
}

// ─── API Key Encryption ─────────────────────────────────────────

/**
 * Get a consistent 32-byte key for AES-256.
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback_insecure_secret_for_dev_only_please_change';
  return createHash('sha256').update(secret).digest();
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * @param text - The plaintext API key
 * @returns Base64 encoded string containing the iv, authTag, and ciphertext separated by ':'
 */
export function encryptApiKey(text: string): string {
  if (!text) return text;
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  const ivHex = Buffer.from(iv).toString('hex');
  
  // Format: iv:authTag:ciphertext
  return `${ivHex}:${authTag}:${encrypted}`;
}

/**
 * Decrypt a previously encrypted AES-256-GCM string.
 * @param encryptedData - The encrypted string (iv:authTag:ciphertext)
 * @returns The decrypted plaintext API key
 */
export function decryptApiKey(encryptedData: string): string {
  if (!encryptedData || !encryptedData.includes(':')) return encryptedData; // Return as-is if plain/malformed
  
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) return encryptedData;
    
    const [ivHex, authTagHex, encryptedText] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('API Key decryption failed:', error);
    return '';
  }
}
// ─── Session Validation ─────────────────────────────────────────

/**
 * Validated session payload extracted from a JWT token.
 */
export interface ValidatedSession {
  /** The authenticated user's ID */
  userId: string;
  /** The user's role (e.g., 'ADMIN', 'CLIENT') */
  role: string;
}

/**
 * Extract and validate a JWT session from a NextAuth-authenticated request.
 *
 * Uses NextAuth's `getToken()` to decode the JWT from the Authorization header
 * or cookie. Returns null if the token is missing, expired, or invalid.
 *
 * @param req - The incoming Request object (from API route or middleware)
 * @returns Validated session with userId and role, or null if unauthenticated
 *
 * @example
 * ```ts
 * import { validateSession } from '@/lib/security';
 *
 * export async function GET(req: Request) {
 *   const session = await validateSession(req);
 *   if (!session) {
 *     return Response.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *
 *   // session.userId and session.role are available
 *   return Response.json({ message: `Hello ${session.userId}` });
 * }
 * ```
 */
export async function validateSession(
  req: Request
): Promise<ValidatedSession | null> {
  try {
    const secret = process.env.NEXTAUTH_SECRET;

    if (!secret) {
      console.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: 'NEXTAUTH_SECRET is not configured',
          context: 'security',
        })
      );
      return null;
    }

    // NextAuth's getToken works with the standard Request object
    // It checks both the cookie and Authorization header
    const token = await getToken({
      req: req as any,
      secret,
    });

    if (!token) {
      return null;
    }

    // Extract userId and role from the JWT payload
    // These are set by the jwt callback in auth.ts
    const userId = (token.id as string) || (token.sub as string) || '';
    const role = (token.role as string) || 'CLIENT';

    if (!userId) {
      console.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'warn',
          message: 'JWT token missing user ID',
          context: 'security',
          data: { tokenKeys: Object.keys(token) },
        })
      );
      return null;
    }

    return { userId, role };
  } catch (error) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: 'Session validation failed',
        context: 'security',
        error: error instanceof Error ? error.message : String(error),
      })
    );
    return null;
  }
}

// ─── CORS Headers ───────────────────────────────────────────────

/**
 * Standard CORS headers for API responses.
 *
 * Configured for the Launch IQ's needs:
 * - Allows common HTTP methods for REST APIs
 * - Permits Authorization and Content-Type headers
 * - Caches preflight responses for 1 hour
 *
 * In production, replace the wildcard origin with your domain.
 *
 * @example
 * ```ts
 * import { CORS_HEADERS } from '@/lib/security';
 *
 * export async function OPTIONS() {
 *   return new Response(null, { status: 204, headers: CORS_HEADERS });
 * }
 *
 * export async function GET() {
 *   return Response.json({ data: 'hello' }, { headers: CORS_HEADERS });
 * }
 * ```
 */
export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '3600',
};

// ─── Rate Limit Headers ─────────────────────────────────────────

/**
 * Generate standard rate-limit response headers.
 *
 * Follows the IETF RateLimit header fields draft specification.
 * These headers inform API consumers about their current rate limit
 * status so they can throttle requests accordingly.
 *
 * @param remaining - Number of requests remaining in the current window
 * @param limit - Maximum requests allowed per window
 * @param resetAt - When the rate limit window resets
 * @returns Record of rate-limit headers to merge into the response
 *
 * @example
 * ```ts
 * import { rateLimitHeaders } from '@/lib/security';
 *
 * const headers = rateLimitHeaders(
 *   42,                                    // 42 requests remaining
 *   100,                                   // out of 100 allowed
 *   new Date(Date.now() + 60 * 1000)       // resets in 60 seconds
 * );
 *
 * return Response.json({ data }, { headers });
 * // Headers:
 * //   X-RateLimit-Limit: 100
 * //   X-RateLimit-Remaining: 42
 * //   X-RateLimit-Reset: 1717260000
 * //   Retry-After: 60
 * ```
 */
export function rateLimitHeaders(
  remaining: number,
  limit: number,
  resetAt: Date
): Record<string, string> {
  const resetEpoch = Math.ceil(resetAt.getTime() / 1000);
  const retryAfterSeconds = Math.max(
    0,
    Math.ceil((resetAt.getTime() - Date.now()) / 1000)
  );

  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(Math.max(0, remaining)),
    'X-RateLimit-Reset': String(resetEpoch),
    'Retry-After': String(retryAfterSeconds),
  };
}

/**
 * Verify if the authenticated user has ownership rights over the requested projectId.
 * @param projectId The project ID to check
 * @param session The validated NextAuth session
 * @returns boolean true if authorized
 */
export async function verifyProjectOwnership(projectId: string, session: any): Promise<boolean> {
  if (!projectId || !session?.user?.id) return false;
  
  if (session.user.role === 'ADMIN') return true;
  
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true }
    });
    
    return project?.userId === session.user.id;
  } catch (error) {
    console.error("verifyProjectOwnership Error:", error);
    return false;
  }
}
