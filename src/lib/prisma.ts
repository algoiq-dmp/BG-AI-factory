/**
 * @file Prisma Client Singleton
 * @description Creates a single PrismaClient instance shared across the application.
 *              Uses `require()` to bypass Turbopack Edge inference which would
 *              incorrectly bundle Prisma for the edge runtime.
 *              In development, the client is cached on `globalThis` to survive HMR.
 * @module lib/prisma
 */

// Import via require() to bypass Turbopack Edge module detection
const { PrismaClient } = require('@prisma/client');

/** Global cache to prevent multiple PrismaClient instances during development HMR */
const globalForPrisma = global as unknown as { prisma: any };

/**
 * Shared Prisma client instance
 * @example
 * ```ts
 * import { prisma } from '@/lib/prisma';
 * const users = await prisma.user.findMany();
 * ```
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

