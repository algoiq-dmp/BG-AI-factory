# Launch IQ - Developer Guide

## System Architecture
Launch IQ is built on a modern stack:
- **Frontend:** Next.js (App Router), React, Tailwind CSS.
- **Backend:** Next.js API Routes, Prisma ORM.
- **Database:** SQLite (for local dev, configured via `prisma.config.ts`), PostgreSQL (Production).

## Project Structure
- `src/app/(public)`: Unauthenticated pages (Home, Login, Pricing).
- `src/app/(app)`: Authenticated application shell and dashboards.
- `src/app/(app)/[projectId]/(tools)`: Tool-specific interfaces for the AI pipeline.
- `src/components`: Reusable UI components.
- `prisma/`: Database schema and migrations.

## Getting Started Locally
1. Clone the repository.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in the values.
4. Run migrations: `npx prisma db push` or `npx prisma migrate dev`
5. Start development server: `npm run dev`

## Coding Standards
- **Styling:** Use Tailwind utility classes.
- **Components:** Create modular, reusable components. Follow the established patterns in `src/components/ui/`.
- **State Management:** Use standard React hooks and Context API/Zustand where applicable. Session state is managed via `next-auth`.
- **AI Integration:** Keep prompt logic encapsulated within `src/app/api` routes or dedicated service classes.

## Adding New Tools
1. Create a new directory under `src/app/(app)/[projectId]/(tools)/<tool-name>`.
2. Add a `page.tsx` that uses the standard layout.
3. Hook up any backend logic in `src/app/api/<tool-name>`.
