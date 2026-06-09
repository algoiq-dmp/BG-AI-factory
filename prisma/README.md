# Prisma Schema

Database models for the BG AI Software Factory.

## Models

| Model | Purpose |
|-------|---------|
| `User` | User accounts with roles (ADMIN/CLIENT) and karma tokens |
| `Project` | Software projects with pipeline status and tier |
| `CodeFile` | AI-generated code files with review status |
| `Task` | Kanban tasks with priority and status |
| `KnowledgeNode` | Knowledgebase entries (PRD, Architecture, Dependencies) |
| `Document` | Project documents with file attachments |

## Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Open Prisma Studio (GUI)
npx prisma studio
```

## Database

SQLite at `prisma/dev.db` (file-based, no server required).
