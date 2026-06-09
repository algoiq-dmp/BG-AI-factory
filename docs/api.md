# API Documentation — BG AI Software Factory

> **Base URL:** `http://148.230.66.71:3003/api`
> **Auth:** NextAuth session cookie (most endpoints require authentication)

---

## Authentication

### `POST /api/auth/[...nextauth]`
NextAuth handler supporting:
- **Credentials** — Username/password with optional 2FA PIN
- **GitHub** — OAuth provider
- **Google** — OAuth provider

---

## Projects

### `GET /api/projects`
List all projects for the authenticated user.

**Response:**
```json
{
  "success": true,
  "projects": [
    {
      "id": "clx...",
      "name": "My App",
      "description": "...",
      "domainTemplate": "saas",
      "tier": "FREE",
      "status": "PLANNING",
      "pipelineStatus": "IDLE",
      "progress": 0,
      "createdAt": "2026-06-01T12:00:00Z",
      "updatedAt": "2026-06-01T12:00:00Z",
      "_count": { "documents": 3, "tasks": 12, "codeFiles": 5, "knowledgeNodes": 8 }
    }
  ]
}
```

### `POST /api/projects`
Create a new project.

**Body:**
```json
{
  "name": "My New App",
  "description": "A SaaS platform for...",
  "domainTemplate": "saas"
}
```

### `DELETE /api/projects`
Delete a project by ID.

**Body:** `{ "projectId": "clx..." }`

---

## AI Tools

### `POST /api/tools/generate`
Generic AI tool runner. Streams response via ReadableStream.

**Auth:** Required. Costs 5 karma tokens.

**Body:**
```json
{
  "task": "Architecture Design",
  "context": "Building a SaaS CRM...",
  "systemPrompt": "You are a Solutions Architect..."
}
```

**Response:** `text/plain` stream

---

### `POST /api/chat/discovery`
AI Product Manager discovery chat.

**Auth:** Required. Costs 2 karma tokens.

**Body:**
```json
{
  "messages": [
    { "role": "user", "content": "I want to build a fintech app..." }
  ],
  "projectId": "clx..."
}
```

---

### `POST /api/studio/generate-code`
AI code generation for the execution studio.

**Auth:** Required. Costs 5 karma tokens.

**Body:**
```json
{
  "prompt": "Create a REST API for user management",
  "filePath": "src/api/users.ts"
}
```

---

### `POST /api/studio/execute`
Execute code in a Docker sandbox.

**Auth:** Required.

**Body:**
```json
{
  "code": "console.log('Hello World')",
  "language": "javascript"
}
```

---

## Pipeline & Progress

### `GET /api/projects/progress`
Get pipeline progress for the active project.

### `POST /api/projects/progress`
Update pipeline status. **Admin only.**

**Body:**
```json
{
  "projectId": "clx...",
  "pipelineStatus": "BUILDING",
  "progress": 45
}
```

---

### `POST /api/orchestrator`
Execute a step of the 27-step Auto-Intelligence pipeline.

**Body:**
```json
{
  "stepId": 1,
  "stepName": "Project Summary",
  "kbContext": "..."
}
```

---

## Documents & Tasks

### `GET /api/documents`
Fetch project documents. Client role restricted.

### `GET /api/tasks`
List project tasks.

### `POST /api/tasks`
Create a new task. **Admin only.**

### `PATCH /api/tasks`
Update task status. **Admin only.**

---

## Monitoring

### `GET /api/telemetry`
Get user tokens, pipeline status, and recent documents.

### `GET /api/stream/quality`
SSE stream of quality metrics per code file.

### `GET /api/quality-audit`
Code quality audit. Pings Ollama for local audit, falls back to mock.

---

## Export

### `GET /api/export`
Export project code files as ZIP archive.

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

| Status Code | Meaning |
|-------------|---------|
| 401 | Unauthorized — session required |
| 403 | Forbidden — insufficient permissions |
| 400 | Bad Request — invalid input |
| 500 | Internal Server Error |
