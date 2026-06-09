# API Routes

Server-side API endpoints for the BG AI Software Factory.

## Routes

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/auth/[...nextauth]` | GET, POST | — | NextAuth (Credentials, GitHub, Google) |
| `/api/projects` | GET, POST, DELETE | ✅ | Project CRUD operations |
| `/api/projects/progress` | GET, POST | ✅ | Pipeline progress tracking |
| `/api/tools/generate` | POST | ✅ | Generic AI tool runner (streaming) |
| `/api/chat/discovery` | POST | ✅ | AI Product Manager chat |
| `/api/studio/generate-code` | POST | ✅ | AI code generation |
| `/api/studio/execute` | POST | ✅ | Docker sandbox execution |
| `/api/orchestrator` | POST | ⚠️ | 27-step auto-intel pipeline |
| `/api/tasks` | GET, POST, PATCH | ✅ | Task management |
| `/api/documents` | GET | ✅ | Document retrieval |
| `/api/telemetry` | GET | ✅ | User & pipeline telemetry |
| `/api/quality-audit` | GET | ✅ | Code quality audit |
| `/api/stream/quality` | GET (SSE) | ⚠️ | Real-time quality metrics |
| `/api/export` | GET | ✅ | ZIP export of code files |

## Authentication

Most routes require a NextAuth session. The session includes:
- `user.id` — User ID
- `user.role` — "ADMIN" or "CLIENT"
- `user.email` — User email

## Karma Tokens

AI-powered routes consume karma tokens:
- `/api/tools/generate` — 5 tokens
- `/api/studio/generate-code` — 5 tokens
- `/api/chat/discovery` — 2 tokens
