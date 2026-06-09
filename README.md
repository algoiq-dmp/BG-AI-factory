# BG AI Software Factory 🏭

> **Autonomous AI Software Company** — From Thought to Production in 12 Stages

[![Build](https://img.shields.io/badge/build-passing-brightgreen)](http://148.230.66.71:3003)
[![Pages](https://img.shields.io/badge/pages-50+-blue)](#)
[![License](https://img.shields.io/badge/license-proprietary-red)](#)

## 🕉️ Overview

The BG AI Software Factory is an autonomous AI-powered software development platform inspired by the Bhagavad Gita. It transforms raw project ideas into production-ready applications through a 12-stage AI pipeline, with each stage powered by specialized AI agents.

**Live:** http://148.230.66.71:3003

## 🏗️ Architecture

```
Next.js 16 (Turbopack) → Prisma ORM → SQLite → DeepSeek AI
```

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Next.js 16, Zustand |
| Styling | Tailwind CSS 4, Custom Dark Theme |
| Backend | Next.js API Routes (App Router) |
| Database | SQLite via Prisma ORM |
| AI Engine | DeepSeek (primary), Gemini, OpenAI |
| Deployment | PM2 + Nginx on Ubuntu VPS |

## 🚀 12-Stage AI Pipeline

```
Idea → Requirements AI → Architecture AI → Task Breakdown AI →
Frontend AI → Backend AI → Database AI → Testing AI →
Documentation AI → Code Review AI → Deployment AI → Monitoring AI
```

## 📦 Features

### Intelligence Suite (6 modules)
- AI Suggestions, Analysis, Auto Intelligence (27-step pipeline)
- Knowledgebase, Risk Analyzer, Skills Analyzer

### Architecture Tools (4 modules)
- Solution Architect, Auto Research, Estimation, Dependencies

### Development Pipeline (12 stages)
- Full autonomous pipeline from requirements to monitoring

### Quality & Operations
- Quality Dashboard (13 mandatory standards)
- Code Audit, Compliance, Testing Intelligence
- Deploy Checklist, Changelog, SOP Generator

### Change Operations
- CR Dashboard, File CR/Bug, Requirements Vault
- Impact Analysis, Fix Prompts, CR Testing

## 🛠️ Setup

### Prerequisites
- Node.js ≥ 20.9.0
- npm ≥ 9

### Installation

```bash
git clone https://github.com/algoiq-dmp/BG-AI-factory.git
cd BG-AI-factory
cp .env.example .env
# Edit .env with your API keys
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_SECRET` | ✅ | Auth encryption key |
| `NEXTAUTH_URL` | ✅ | App URL |
| `DATABASE_URL` | ✅ | SQLite path (default: `file:./dev.db`) |
| `DEEPSEEK_API_KEY` | ✅ | DeepSeek AI API key |
| `OLLAMA_BASE_URL` | ❌ | Local LLM endpoint |
| `PINECONE_API_KEY` | ❌ | Vector DB for RAG |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # 13 API routes
│   ├── [projectId]/       # 30+ project-scoped tools
│   ├── pipeline/          # 12-stage orchestrator
│   └── ...                # 20+ standalone pages
├── components/
│   ├── dashboard/         # Dashboard widgets
│   ├── layout/            # Sidebar, RightPane
│   └── tools/             # Universal tool runner
├── lib/
│   ├── ai/router.ts       # Multi-provider AI router
│   ├── prisma.ts          # Database client
│   └── auth.ts            # NextAuth config
├── store/                 # Zustand state management
└── types/                 # TypeScript definitions
```

## 🚀 Deployment

```bash
# Production build
npm run build

# Start with PM2
PORT=3003 pm2 start npm --name "bg-factory" -- start
```

See [deploy/](./deploy/) for Nginx config and setup scripts.

## 📋 13 Mandatory Quality Standards

1. ✅ Detailed comments (JSDoc)
2. ✅ README everywhere
3. ✅ Auto changelog
4. ✅ API documentation
5. ✅ Structured logging
6. ✅ Error handling
7. ✅ Reusable modules
8. ✅ Test coverage >80%
9. ✅ Type safety
10. ✅ CI/CD mandatory
11. ✅ Git commit standards
12. ✅ Versioning standards
13. ✅ This README

## 📄 License

Proprietary — © 2026 Algo IQ Software Solutions Pvt Ltd. All rights reserved.
