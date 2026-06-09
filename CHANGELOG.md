# Changelog

All notable changes to BG AI Software Factory will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-06-01

### Added
- 12-stage AI Pipeline (Architecture → Monitoring)
- Quality Dashboard with 13 mandatory standards
- Krishna AI Chat assistant
- Code Review AI Agent (Stage 10)
- Testing AI Agent (Stage 8)
- Documentation AI Agent (Stage 9)
- Deployment AI Agent (Stage 11)
- Monitoring AI Agent (Stage 12)
- MCQ interrogation page
- Prompt Compiler for 9+ platforms
- Admin panel
- Pricing page
- Public landing page
- Comprehensive README.md
- CHANGELOG.md
- API documentation (docs/api.md)
- Structured logger (src/lib/logger.ts)
- Error boundaries (error.tsx, global-error.tsx)
- CI/CD pipeline (.github/workflows/ci.yml)
- Dockerfile and docker-compose.yml
- Git commit standards (husky + commitlint)
- TypeScript API types (src/types/api.ts)
- Missing /api/projects route (CRITICAL FIX)

### Fixed
- Prisma version mismatch (5.14.0 → 5.22.0 sync)
- Missing /api/projects route causing 404 on 4+ pages
- Build errors with Tailwind native binary on Linux VPS

### Changed
- Upgraded Node.js to v20.20.2 on VPS
- Replaced default README with comprehensive project documentation

## [0.1.0] - 2026-05-23

### Added
- Initial project setup with Next.js 16, React 19
- Dashboard with Bhagavad Gita wisdom banner
- 45-page application with sidebar navigation
- Prisma ORM with SQLite database
- DeepSeek AI integration
- NextAuth authentication (Credentials + GitHub + Google)
- PM2 deployment to Hostinger VPS
- Nginx reverse proxy configuration
