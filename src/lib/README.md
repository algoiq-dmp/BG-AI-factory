# Library Utilities

Core shared libraries for the BG AI Software Factory.

## Files

| File | Purpose |
|------|---------|
| `auth.ts` | NextAuth configuration — Credentials, GitHub, Google providers |
| `prisma.ts` | Prisma client singleton (bypasses Turbopack Edge inference) |
| `logger.ts` | Structured JSON logger with levels and child contexts |
| `tools-registry.ts` | AI tool configuration with system prompts for 5+ tools |
| `ai/router.ts` | Multi-provider AI model router (DeepSeek, Ollama) |

## Usage

```typescript
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { authOptions } from '@/lib/auth';
```
