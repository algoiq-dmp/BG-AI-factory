# VISION 2.0: MASTER ARCHITECTURE DOCUMENT
## Sprint 5: Database & API Blueprints

---

# 1. DATABASE ARCHITECTURE (PRISMA SCHEMA)
*Objective: The current SQLite schema is insufficient for a multi-tenant, telemetry-heavy Operating System. We must migrate to PostgreSQL.*

## 1.1 Core Entities
To support the 9 phases (especially Customer Success, Analytics, and Multi-Agent Orchestration), the following tables must be added to `schema.prisma`.

```prisma
// ------------------------------------------------------
// 1. KNOWLEDGE & PIKB ENGINE
// ------------------------------------------------------
model KnowledgeArtifact {
  id              String   @id @default(cuid())
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id])
  type            ArtifactType // BRD, PRD, DIAGRAM, CODE_AST
  content         String   @db.Text
  vectorEmbedding Unsupported("vector(1536)")? // Requires pgvector
  isOutdated      Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// ------------------------------------------------------
// 2. PRODUCTIVITY & TELEMETRY
// ------------------------------------------------------
model DeveloperTelemetry {
  id              String   @id @default(cuid())
  userId          String
  projectId       String
  linesWritten    Int      @default(0)
  bugsInjected    Int      @default(0)
  karmaScore      Float    @default(100.0)
  timestamp       DateTime @default(now())
}

model IncidentReport {
  id              String   @id @default(cuid())
  projectId       String
  severity        SeverityLevel // CRITICAL, HIGH, MEDIUM, LOW
  source          String        // e.g., "Datadog", "Sentry"
  rootCause       String?       @db.Text
  mttrMinutes     Int?
  status          IncidentStatus // OPEN, RESOLVED, ROLLBACK_TRIGGERED
}

// ------------------------------------------------------
// 3. CUSTOMER SUCCESS & PREDICTION
// ------------------------------------------------------
model CustomerHealth {
  id              String   @id @default(cuid())
  projectId       String
  adoptionScore   Float
  engagementScore Float
  churnRisk       Float    // 0.0 to 1.0 probability
  recordedAt      DateTime @default(now())
}

model AI_Prediction {
  id              String   @id @default(cuid())
  projectId       String
  predictionType  String   // e.g., "SPRINT_DELAY", "REVENUE_IMPACT"
  probability     Float    
  recommendation  String   @db.Text
  isAcknowledged  Boolean  @default(false)
}
```

---

# 2. API ARCHITECTURE
*Objective: Scale the Next.js API Routes into an Event-Driven Architecture.*

## 2.1 The Event Bus (Webhooks & Background Jobs)
The current synchronous `/api/tools/generate` routes will block and timeout Vercel functions (10s to 60s limit) when running complex Monte Carlo simulations or long Agent refactoring tasks. 

**Solution: Redis + BullMQ / Inngest**
1. `/api/agents/bug-fix` (Trigger)
   - Receives payload from Sentry.
   - Pushes job to `bug-fix-queue`.
   - Returns `202 Accepted`.
2. **Background Worker (Docker/Railway):**
   - Pops job from queue.
   - Executes Sandboxed Code.
   - Writes RCA to `IncidentReport` table.
   - Pings `/api/webhooks/pikb-update` to trigger Knowledge Drift Detector.

## 2.2 Streaming API for Master Control Center
To power the Unified Command Center (where predictions and UI elements update live), we must implement **Server-Sent Events (SSE)**.
- `/api/telemetry/stream` -> Pushes real-time CPU stats, karma scores, and deployment health directly to the CEO/Dev dashboards without client-side polling.

---

## Sprint 5 Compliance Checklist
* [x] **Database Schema:** Defined with `pgvector` for semantic knowledge gap analysis.
* [x] **API Specification:** Defined async Event-Bus architecture.
* [x] **Scalability Plan:** Offloading long-running agents to external worker nodes via queues.

---

**Feature Readiness Score:** 90/100
**Development Complexity Score:** High (Requires complete database migration and message queue setup).
**Business Impact Score:** Critical (The foundation for all future features).
