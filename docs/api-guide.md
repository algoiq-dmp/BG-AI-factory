# Launch IQ - API Guide

## Overview
Launch IQ provides a comprehensive REST API to integrate with the 12-stage AI pipeline, manage projects, and orchestrate tools. All API endpoints use JSON payloads and rely on NextAuth for authentication.

## Authentication
Most endpoints require an authenticated NextAuth session cookie. The user must be logged into the platform.

```http
POST /api/auth/[...nextauth]
```

## Core Resources

### 1. Projects
Manage your software development projects.
- `GET /api/projects` - List all your projects.
- `POST /api/projects` - Create a new project.
- `DELETE /api/projects` - Delete an existing project.

### 2. AI Tools
Run generative AI tasks.
- `POST /api/tools/generate` - Generic stream generation.
- `POST /api/chat/discovery` - Discovery phase chat with an AI PM.

### 3. Execution Studio
Run and generate code directly.
- `POST /api/studio/generate-code`
- `POST /api/studio/execute`

### 4. Orchestrator
Execute pipeline steps dynamically.
- `POST /api/orchestrator` - Run a specific Auto-Intel step.

## Error Handling
The API follows a standardized error format:

```json
{
  "success": false,
  "error": "Error description"
}
```

For detailed endpoints and payload examples, please refer to the `api.md` reference document.
