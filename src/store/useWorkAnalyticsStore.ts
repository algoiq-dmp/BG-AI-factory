import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ───────────────────────────────────────────────────────────────────

export type TimelineEntryType = 'login' | 'code' | 'ai' | 'review' | 'deploy' | 'break' | 'logout' | 'bug-fix' | 'docs';

export interface DeveloperMetrics {
  name: string;
  loginTime: string;
  logoutTime: string | null;
  activeCodingHours: number;
  idleTimeMinutes: number;
  filesModified: number;
  commitsDone: number;
  tasksCompleted: number;
  aiPromptsUsed: number;
  aiAcceptancePercent: number;
  manualOverridePercent: number;
  productivityScore: number;
}

export interface TimelineEntry {
  id: string;
  time: string;
  activity: string;
  type: TimelineEntryType;
  aiAssisted: boolean;
  duration?: string;
}

export interface DailyReport {
  developer: string;
  developerName: string;
  project: string;
  date: string;
  totalProductiveTime: string;
  productiveTime: string;
  aiAssistedTasks: number;
  aiTasks: number;
  manualCodingTasks: number;
  manualTasks: number;
  bugsFixed: number;
  codeQualityChange: string;
  qualityChange: string;
  pendingRiskAreas: string[];
  pendingRisks: string[];
  summary: string;
  aiSummary: string;
  generatedAt: string;
}

export interface PerformanceScores {
  productivity: number;
  codeStability: number;
  aiUsageEfficiency: number;
  documentationDiscipline: number;
  deliverySpeed: number;
  bugRate: number;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  productivityScore: number;
  productivity: number;
  aiEfficiency: number;
  bugsCreated: number;
  bugsFixed: number;
  tasksCompleted: number;
  activeCodingHours: number;
  status: 'online' | 'idle' | 'offline';
}

export interface PredictiveAlert {
  id: string;
  type: 'delay' | 'burnout' | 'module-risk' | 'bug-zone' | 'overload';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  probability: number;
  recommendation: string;
  module?: string;
}

export interface EscalationEntry {
  id: string;
  type: 'delay' | 'quality' | 'conflict' | 'resource';
  subject: string;
  status: 'draft' | 'pending' | 'sent' | 'resolved';
  developer: string;
  aiAnalysis: string;
  suggestedActions: string[];
  emailDraft: string;
  createdAt: string;
}

export interface AskAIEntry {
  id: string;
  question: string;
  answer: string;
  sources: string[];
  timestamp: string;
}

export interface PrivacySettings {
  trackActivity: boolean;
  shareWithManagers: boolean;
  allowAIReports: boolean;
  dataRetentionDays: number;
  consentGiven: boolean;
  lastConsentDate: string;
}

export type Escalation = EscalationEntry;

export interface WorkAnalyticsState {
  // Data
  developerMetrics: DeveloperMetrics;
  timeline: TimelineEntry[];
  dailyReport: DailyReport | null;
  performanceScores: PerformanceScores;
  teamMembers: TeamMember[];
  predictiveAlerts: PredictiveAlert[];
  escalations: EscalationEntry[];
  askAIHistory: AskAIEntry[];
  privacySettings: PrivacySettings;

  // UI State
  reportGenerating: boolean;
  reportProgress: number;
  askAILoading: boolean;

  // Actions
  generateDailyReport: () => Promise<void>;
  askAI: (question: string) => Promise<void>;
  createEscalation: (type: string, subject: string, developer: string) => Promise<void>;
  updatePrivacySetting: (key: keyof PrivacySettings, value: any) => void;
  addTimelineEntry: (entry: Omit<TimelineEntry, 'id'>) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  removeTeamMember: (id: string) => void;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockDeveloperMetrics: DeveloperMetrics = {
  name: 'Ritesh Kumar',
  loginTime: '10:00 AM',
  logoutTime: null,
  activeCodingHours: 6.7,
  idleTimeMinutes: 38,
  filesModified: 23,
  commitsDone: 7,
  tasksCompleted: 14,
  aiPromptsUsed: 42,
  aiAcceptancePercent: 78,
  manualOverridePercent: 22,
  productivityScore: 88,
};

const mockTimeline: TimelineEntry[] = [
  {
    id: 'tl-001',
    time: '10:00 AM',
    activity: 'Logged in to workspace',
    type: 'login',
    aiAssisted: false,
  },
  {
    id: 'tl-002',
    time: '10:15 AM',
    activity: 'API module generated via AI scaffold',
    type: 'ai',
    aiAssisted: true,
    duration: '30 min',
  },
  {
    id: 'tl-003',
    time: '10:45 AM',
    activity: 'Database schema designed with AI assistance',
    type: 'ai',
    aiAssisted: true,
    duration: '15 min',
  },
  {
    id: 'tl-004',
    time: '11:00 AM',
    activity: 'Authentication service coded manually',
    type: 'code',
    aiAssisted: false,
    duration: '30 min',
  },
  {
    id: 'tl-005',
    time: '11:30 AM',
    activity: 'Code review submitted for auth module',
    type: 'review',
    aiAssisted: false,
    duration: '30 min',
  },
  {
    id: 'tl-006',
    time: '12:00 PM',
    activity: 'AI suggestion rejected — retry logic rewritten manually',
    type: 'ai',
    aiAssisted: true,
    duration: '20 min',
  },
  {
    id: 'tl-007',
    time: '12:20 PM',
    activity: 'Fixed auth middleware bug — token validation issue',
    type: 'bug-fix',
    aiAssisted: false,
    duration: '40 min',
  },
  {
    id: 'tl-008',
    time: '01:00 PM',
    activity: 'Lunch break',
    type: 'break',
    aiAssisted: false,
    duration: '30 min',
  },
  {
    id: 'tl-009',
    time: '01:30 PM',
    activity: 'Frontend dashboard components built',
    type: 'code',
    aiAssisted: false,
    duration: '45 min',
  },
  {
    id: 'tl-010',
    time: '02:15 PM',
    activity: 'API documentation updated with Swagger specs',
    type: 'docs',
    aiAssisted: true,
    duration: '45 min',
  },
  {
    id: 'tl-011',
    time: '03:00 PM',
    activity: 'Deployment to staging environment',
    type: 'deploy',
    aiAssisted: false,
    duration: '45 min',
  },
  {
    id: 'tl-012',
    time: '03:45 PM',
    activity: 'Unit tests added for auth service',
    type: 'code',
    aiAssisted: false,
    duration: '60 min',
  },
];

const mockPerformanceScores: PerformanceScores = {
  productivity: 88,
  codeStability: 91,
  aiUsageEfficiency: 74,
  documentationDiscipline: 82,
  deliverySpeed: 86,
  bugRate: 93,
};

const mockTeamMembers: TeamMember[] = [
  {
    id: 'tm-001',
    name: 'Ritesh Kumar',
    avatar: 'RK',
    role: 'Full-Stack Developer',
    productivityScore: 88,
    productivity: 88,
    aiEfficiency: 78,
    bugsCreated: 3,
    bugsFixed: 5,
    tasksCompleted: 14,
    activeCodingHours: 6.7,
    status: 'online',
  },
  {
    id: 'tm-002',
    name: 'Darshan Patil',
    avatar: 'DP',
    role: 'Senior Backend Engineer',
    productivityScore: 92,
    productivity: 92,
    aiEfficiency: 85,
    bugsCreated: 1,
    bugsFixed: 8,
    tasksCompleted: 18,
    activeCodingHours: 7.2,
    status: 'online',
  },
  {
    id: 'tm-003',
    name: 'Sneha Gupta',
    avatar: 'SG',
    role: 'Frontend Developer',
    productivityScore: 85,
    productivity: 85,
    aiEfficiency: 72,
    bugsCreated: 4,
    bugsFixed: 6,
    tasksCompleted: 12,
    activeCodingHours: 5.8,
    status: 'idle',
  },
  {
    id: 'tm-004',
    name: 'Arjun Mehta',
    avatar: 'AM',
    role: 'DevOps Engineer',
    productivityScore: 79,
    productivity: 79,
    aiEfficiency: 65,
    bugsCreated: 2,
    bugsFixed: 3,
    tasksCompleted: 9,
    activeCodingHours: 5.1,
    status: 'online',
  },
  {
    id: 'tm-005',
    name: 'Priya Sharma',
    avatar: 'PS',
    role: 'QA & Testing Lead',
    productivityScore: 91,
    productivity: 91,
    aiEfficiency: 88,
    bugsCreated: 0,
    bugsFixed: 12,
    tasksCompleted: 16,
    activeCodingHours: 6.5,
    status: 'offline',
  },
  {
    id: 'tm-006',
    name: 'Karthik Nair',
    avatar: 'KN',
    role: 'Junior Developer',
    productivityScore: 76,
    productivity: 76,
    aiEfficiency: 60,
    bugsCreated: 6,
    bugsFixed: 4,
    tasksCompleted: 8,
    activeCodingHours: 4.9,
    status: 'online',
  },
];

const mockPredictiveAlerts: PredictiveAlert[] = [
  {
    id: 'pa-001',
    type: 'delay',
    severity: 'high',
    title: 'Auth Module Delay',
    message:
      'The authentication module is at risk of missing the sprint deadline. Current velocity indicates a 2-day overshoot based on remaining story points and historical completion rate.',
    probability: 73,
    recommendation:
      'Reassign 2 low-priority tasks from Ritesh to Karthik and enable AI-assisted code generation for remaining auth endpoints.',
    module: 'Authentication Service',
  },
  {
    id: 'pa-002',
    type: 'burnout',
    severity: 'medium',
    title: 'Developer Burnout Risk',
    message:
      'Ritesh Kumar has averaged 12+ hours/day for the past 5 consecutive workdays. Idle time has dropped below 20 minutes/day, and error rates in recent commits have increased by 18%.',
    probability: 45,
    recommendation:
      'Enforce a mandatory half-day off within the next 48 hours. Redistribute urgent tasks to Darshan and Sneha to balance the workload.',
  },
  {
    id: 'pa-003',
    type: 'module-risk',
    severity: 'high',
    title: 'Payment Integration Risk',
    message:
      'The payment gateway integration module has 3 unresolved critical dependencies and the third-party API sandbox has been intermittently unavailable. Test coverage is at 34%, well below the 80% threshold.',
    probability: 68,
    recommendation:
      'Set up a local mock server for the payment API, prioritize writing integration tests, and schedule a sync with the payment provider support team.',
    module: 'Payment Gateway',
  },
  {
    id: 'pa-004',
    type: 'bug-zone',
    severity: 'medium',
    title: 'API Gateway Bug Zone',
    message:
      'The API gateway module has accumulated 8 minor bugs in the last 3 days. Pattern analysis shows most bugs originate from improper error handling in the rate-limiting middleware.',
    probability: 52,
    recommendation:
      'Conduct a focused code review of the rate-limiting middleware. Apply AI-suggested error handling patterns and add comprehensive edge-case unit tests.',
    module: 'API Gateway',
  },
  {
    id: 'pa-005',
    type: 'overload',
    severity: 'low',
    title: 'Sprint Overload',
    message:
      'Current sprint has 15% more story points assigned than the team\'s average velocity over the last 4 sprints. If no adjustments are made, 3-4 tasks may spill over into the next sprint.',
    probability: 28,
    recommendation:
      'Review the sprint backlog in the next standup. Consider moving 2 non-critical enhancements to the next sprint and focus on high-priority deliverables.',
  },
];

const mockEscalations: EscalationEntry[] = [
  {
    id: 'esc-001',
    type: 'delay',
    subject: 'Authentication Module Sprint Deadline at Risk',
    status: 'sent',
    developer: 'Ritesh Kumar',
    aiAnalysis:
      'Analysis of commit history, task velocity, and remaining story points indicates the authentication module is trending 2.3 days behind schedule. Root cause: unexpected complexity in OAuth2 PKCE flow implementation and 3 unplanned bug fixes that consumed 6 hours of development time. Current completion rate: 68% against the 85% expected at this sprint stage.',
    suggestedActions: [
      'Pair Ritesh with Darshan on the OAuth2 PKCE implementation to accelerate delivery',
      'Move the "Remember Me" feature to next sprint — it is a low-priority nice-to-have',
      'Enable AI-assisted code generation for the remaining 4 auth API endpoints',
      'Schedule a 15-minute daily sync specifically for auth module blockers',
    ],
    emailDraft:
      'Subject: [Action Required] Auth Module Sprint Deadline Risk — 73% Delay Probability\n\nHi Team Lead,\n\nI\'m writing to flag a potential delay in the Authentication Module delivery for Sprint 24.\n\nCurrent Status:\n- Completion: 68% (expected: 85% at this stage)\n- Projected overshoot: 2.3 days\n- Root cause: OAuth2 PKCE complexity + 3 unplanned bug fixes\n\nRecommended Actions:\n1. Pair programming with Darshan on PKCE flow\n2. Defer "Remember Me" feature to Sprint 25\n3. Leverage AI code generation for remaining endpoints\n\nPlease let me know if we can discuss during today\'s standup.\n\nBest regards,\nAI Work Analytics System',
    createdAt: '2026-06-01T14:30:00Z',
  },
  {
    id: 'esc-002',
    type: 'quality',
    subject: 'Code Quality Degradation in API Gateway Module',
    status: 'resolved',
    developer: 'Karthik Nair',
    aiAnalysis:
      'Static analysis reveals a 23% increase in code complexity (cyclomatic complexity) in the API Gateway module over the past week. Code duplication has risen to 12%, and 4 out of 6 recent PRs had review comments about missing error handling. Test coverage for new code is at 41%, below the team standard of 80%. Pattern suggests the developer may benefit from additional mentoring on error handling best practices.',
    suggestedActions: [
      'Schedule a 1-on-1 code review session between Karthik and Darshan focused on error handling patterns',
      'Enable mandatory linting rules for error handling in the API Gateway module',
      'Assign Karthik to write tests for existing code to build familiarity before adding new features',
      'Set up AI-assisted code review to catch quality issues before PR submission',
    ],
    emailDraft:
      'Subject: [Resolved] Code Quality Improvement Plan — API Gateway Module\n\nHi Team Lead,\n\nFollowing up on the code quality concerns in the API Gateway module.\n\nResolution:\n- Paired Karthik with Darshan for error handling mentoring (completed)\n- Enabled strict linting rules for the module\n- Test coverage improved from 41% to 72%\n- Code duplication reduced from 12% to 5%\n\nThe quality metrics are now trending positively. We\'ll continue monitoring for the next sprint.\n\nBest regards,\nAI Work Analytics System',
    createdAt: '2026-05-28T09:15:00Z',
  },
];

const mockPrivacySettings: PrivacySettings = {
  trackActivity: true,
  shareWithManagers: true,
  allowAIReports: true,
  dataRetentionDays: 90,
  consentGiven: true,
  lastConsentDate: '2026-05-15T10:00:00Z',
};

// ─── Pre-built AI Answers ────────────────────────────────────────────────────

const preBuiltAnswers: Record<string, { answer: string; sources: string[] }> = {
  'why task delayed': {
    answer:
      'Based on sprint analytics, the primary delay factors are:\n\n1. **OAuth2 PKCE Flow Complexity** — The authentication module required 40% more effort than estimated due to undocumented edge cases in the PKCE specification.\n\n2. **Unplanned Bug Fixes** — 3 critical bugs in the auth middleware consumed approximately 6 hours of unplanned development time.\n\n3. **Dependency Bottleneck** — The payment API sandbox was intermittently unavailable, blocking integration testing for 4 hours.\n\n**AI Recommendation:** Redistribute 2 low-priority tasks to balance workload and enable AI-assisted code generation for boilerplate endpoints to recover 1.5 days of development time.',
    sources: [
      'Sprint 24 Velocity Report',
      'Git Commit Analysis (last 7 days)',
      'JIRA Task Dependency Graph',
      'Developer Activity Logs',
    ],
  },
  'why build failed': {
    answer:
      'The last build failure (Build #347) occurred at 02:47 PM today. Root cause analysis:\n\n1. **TypeScript Compilation Error** — A missing type export in `src/types/auth.ts` caused cascading import failures across 4 modules.\n\n2. **Dependency Conflict** — The `next-auth` package was upgraded to v5.2.0 but `@auth/prisma-adapter` remained at v1.0.1, causing an incompatible peer dependency.\n\n3. **Environment Variable** — `DATABASE_URL` was not set in the staging CI/CD pipeline configuration.\n\n**Fix Applied:** Type export restored, adapter upgraded to v2.0.0, and environment variable added to the pipeline. Build #348 passed successfully at 03:12 PM.',
    sources: [
      'CI/CD Pipeline Logs (Build #347)',
      'package.json Dependency Tree',
      'TypeScript Compiler Output',
      'Environment Configuration Audit',
    ],
  },
  'why test score low': {
    answer:
      'Current test coverage analysis for the project:\n\n- **Overall Coverage:** 67% (target: 80%)\n- **Auth Module:** 82% ✅\n- **API Gateway:** 41% ❌ (primary concern)\n- **Payment Module:** 34% ❌\n- **Dashboard UI:** 71%\n\n**Key Issues:**\n1. The API Gateway module has 12 untested edge cases in error handling middleware.\n2. Payment module integration tests require the sandbox API which has been unreliable.\n3. 4 recent PRs were merged without corresponding test updates.\n\n**AI Recommendation:** Prioritize writing unit tests for API Gateway error handling (estimated +18% coverage). Set up a local mock server for payment API testing. Enable pre-merge test coverage gates to prevent future regressions.',
    sources: [
      'Jest Coverage Report (latest)',
      'SonarQube Analysis Dashboard',
      'PR Merge History (last 2 weeks)',
      'Module Dependency Map',
    ],
  },
  'why architecture changed': {
    answer:
      'The architecture modification was triggered by three converging factors:\n\n1. **Scalability Concern** — Load testing revealed the monolithic API handler could not sustain >500 concurrent WebSocket connections. The team migrated to a microservices pattern with dedicated WebSocket and REST gateway services.\n\n2. **AI-Driven Recommendation** — The AI governance system analyzed the codebase dependency graph and identified 3 tightly-coupled modules that would benefit from service decomposition, reducing deployment risk by an estimated 40%.\n\n3. **Security Audit Findings** — The external security audit recommended isolating the payment processing flow into a separate service with its own database to achieve PCI-DSS compliance.\n\n**Impact:** Deployment complexity increased by 20%, but individual service deployment time decreased from 8 minutes to 2.5 minutes. Fault isolation improved significantly.',
    sources: [
      'Architecture Decision Record (ADR-017)',
      'Load Testing Report (May 2026)',
      'AI Codebase Analysis Report',
      'Security Audit Findings (v2.1)',
    ],
  },
  'why api rejected': {
    answer:
      'API rejection analysis for the last 24 hours:\n\n- **Total Rejected Requests:** 47 out of 2,340 (2.01%)\n- **401 Unauthorized:** 28 requests — Expired JWT tokens not being refreshed by the client. The token refresh interceptor has a race condition when multiple requests fire simultaneously.\n- **429 Rate Limited:** 12 requests — The AI prompt service is hitting the rate limit of 60 requests/minute during peak usage hours.\n- **422 Validation Error:** 7 requests — Malformed date formats in the reporting API (`DD/MM/YYYY` sent instead of `ISO 8601`).\n\n**AI Recommendation:**\n1. Implement a token refresh queue to serialize refresh requests and prevent race conditions.\n2. Add client-side request debouncing for the AI prompt service.\n3. Add input validation middleware with clear error messages for date format mismatches.',
    sources: [
      'API Gateway Access Logs',
      'Error Tracking Dashboard (Sentry)',
      'Rate Limiter Configuration',
      'Request Validation Middleware Logs',
    ],
  },
};

// ─── Helper ──────────────────────────────────────────────────────────────────

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const findBestAnswer = (question: string): { answer: string; sources: string[] } => {
  const q = question.toLowerCase();
  if (q.includes('delay') || q.includes('late') || q.includes('behind')) {
    return preBuiltAnswers['why task delayed'];
  }
  if (q.includes('build') || q.includes('fail') || q.includes('compile') || q.includes('broken')) {
    return preBuiltAnswers['why build failed'];
  }
  if (q.includes('test') || q.includes('coverage') || q.includes('score low') || q.includes('quality')) {
    return preBuiltAnswers['why test score low'];
  }
  if (q.includes('architecture') || q.includes('design') || q.includes('changed') || q.includes('refactor')) {
    return preBuiltAnswers['why architecture changed'];
  }
  if (q.includes('api') || q.includes('rejected') || q.includes('401') || q.includes('error')) {
    return preBuiltAnswers['why api rejected'];
  }
  // Fallback generic answer
  return {
    answer: `Based on analysis of project metrics and activity logs, here is what I found regarding your question: "${question}"\n\nThe system has analyzed commit history, task velocity, code quality metrics, and developer activity patterns. The most relevant factors are:\n\n1. **Current Sprint Health:** The sprint is 78% complete with 3 days remaining. Velocity is tracking slightly below the 4-sprint average.\n\n2. **Code Quality Trend:** Overall code quality has improved by 5% this week, with notable improvements in error handling and test coverage.\n\n3. **Team Utilization:** The team is operating at 87% capacity. Two developers are approaching high utilization thresholds.\n\nFor a more specific analysis, try asking about particular modules, tasks, or team members.`,
    sources: [
      'Sprint Analytics Dashboard',
      'Code Quality Metrics (SonarQube)',
      'Team Activity Logs',
      'AI Governance Report',
    ],
  };
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useWorkAnalyticsStore = create<WorkAnalyticsState>()(
  persist(
    (set, get) => ({
      // ── Data ──
      developerMetrics: mockDeveloperMetrics,
      timeline: mockTimeline,
      dailyReport: null,
      performanceScores: mockPerformanceScores,
      teamMembers: mockTeamMembers,
      predictiveAlerts: mockPredictiveAlerts,
      escalations: mockEscalations,
      askAIHistory: [],
      privacySettings: mockPrivacySettings,

      // ── UI State ──
      reportGenerating: false,
      reportProgress: 0,
      askAILoading: false,

      // ── Actions ──

      generateDailyReport: async () => {
        set({ reportGenerating: true, reportProgress: 0 });

        // Simulate progress 0 → 100% over ~3 seconds
        const totalSteps = 20;
        const stepDuration = 150; // 20 × 150ms = 3000ms

        for (let i = 1; i <= totalSteps; i++) {
          await sleep(stepDuration);
          set({ reportProgress: Math.round((i / totalSteps) * 100) });
        }

        const metrics = get().developerMetrics;
        const now = new Date();

        const aiTasks = Math.round(metrics.tasksCompleted * (metrics.aiAcceptancePercent / 100));
        const manualTasks = Math.round(metrics.tasksCompleted * (metrics.manualOverridePercent / 100));
        const risks = [
            'Payment gateway integration — sandbox API intermittently unavailable',
            'Auth module — OAuth2 PKCE flow edge cases need additional testing',
            'API Gateway — rate-limiting middleware error handling incomplete',
          ];
        const summaryText = `${metrics.name} had a productive day with ${metrics.activeCodingHours} hours of active coding across ${metrics.filesModified} files. ${metrics.commitsDone} commits were pushed with ${metrics.tasksCompleted} tasks completed. AI was used for ${metrics.aiPromptsUsed} prompts with a ${metrics.aiAcceptancePercent}% acceptance rate, indicating effective human-AI collaboration. Code quality improved by 5.3% overall. Key accomplishments include completing the authentication service, deploying to staging, and updating API documentation. Two bugs were fixed in the auth middleware. Attention needed on the payment integration module where test coverage remains below threshold.`;

        const report: DailyReport = {
          developer: metrics.name,
          developerName: metrics.name,
          project: 'Launch IQ',
          date: now.toISOString().split('T')[0],
          totalProductiveTime: `${metrics.activeCodingHours} hours`,
          productiveTime: `${metrics.activeCodingHours}h`,
          aiAssistedTasks: aiTasks,
          aiTasks,
          manualCodingTasks: manualTasks,
          manualTasks,
          bugsFixed: 2,
          codeQualityChange: '+5.3%',
          qualityChange: '5.3',
          pendingRiskAreas: risks,
          pendingRisks: risks,
          summary: summaryText,
          aiSummary: summaryText,
          generatedAt: now.toISOString(),
        };

        set({
          dailyReport: report,
          reportGenerating: false,
          reportProgress: 100,
        });
      },

      askAI: async (question: string) => {
        set({ askAILoading: true });

        await sleep(1500);

        const { answer, sources } = findBestAnswer(question);

        const entry: AskAIEntry = {
          id: generateId(),
          question,
          answer,
          sources,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          askAIHistory: [...state.askAIHistory, entry],
          askAILoading: false,
        }));
      },

      createEscalation: async (type: string, subject: string, developer: string) => {
        await sleep(2000);

        const escalationType = type as EscalationEntry['type'];

        const analysisMap: Record<string, string> = {
          delay:
            `Comprehensive analysis of ${developer}'s recent activity indicates a delivery delay risk. Over the past 5 days, task completion velocity has decreased by 22% compared to the sprint average. Contributing factors include: increased time spent on bug fixes (up 35%), pending code review bottlenecks (3 PRs awaiting review for >24 hours), and an unexpected increase in scope for assigned tasks. The developer's productive hours remain high at 6.5+ hours/day, suggesting the issue is workload-related rather than engagement-related.`,
          quality:
            `Code quality analysis for ${developer}'s recent contributions shows a declining trend. Cyclomatic complexity has increased by 18% in the last week, and 3 out of 5 recent PRs received significant review comments. Test coverage for new code averages 45%, below the 80% team standard. Static analysis has flagged 7 new code smells and 2 potential security vulnerabilities. The pattern suggests the developer may be under time pressure, leading to shortcuts in code quality practices.`,
          conflict:
            `Team dynamics analysis indicates a potential workflow conflict involving ${developer}. Git blame analysis shows overlapping work on 3 files with another team member, and there have been 2 merge conflicts in the past 48 hours. PR review comments suggest differing approaches to error handling patterns. The AI system recommends a brief architecture alignment session to establish shared conventions.`,
          resource:
            `Resource utilization analysis shows ${developer} is currently assigned to 3 concurrent workstreams, exceeding the recommended maximum of 2. Context-switching overhead is estimated at 1.5 hours/day based on activity pattern analysis. The developer has flagged 2 blocked tasks requiring infrastructure team support that have been pending for 3 days.`,
        };

        const actionsMap: Record<string, string[]> = {
          delay: [
            `Redistribute 2 lower-priority tasks from ${developer} to available team members`,
            'Schedule a focused 30-minute sprint planning review to reassess priorities',
            'Enable AI-assisted code generation for boilerplate tasks to recover velocity',
            'Set up daily 10-minute blockers check-in until the delay risk is mitigated',
          ],
          quality: [
            `Pair ${developer} with a senior team member for the next 2 complex tasks`,
            'Enable automated pre-commit quality gates (linting, complexity checks)',
            'Schedule a 1-hour focused code quality workshop for the team',
            'Temporarily reduce task assignment volume by 20% to allow focus on quality',
          ],
          conflict: [
            'Schedule a 30-minute architecture alignment session for the involved developers',
            'Establish clear file ownership boundaries in the project CODEOWNERS file',
            'Create shared coding conventions document for the disputed patterns',
            'Assign a senior developer as a tie-breaker for architectural decisions',
          ],
          resource: [
            `Limit ${developer}'s concurrent workstreams to a maximum of 2`,
            'Escalate blocked infrastructure requests to the platform team lead',
            'Identify and reassign non-critical tasks to reduce cognitive load',
            'Schedule a resource allocation review with the project manager',
          ],
        };

        const emailDraft = `Subject: [Escalation — ${type.charAt(0).toUpperCase() + type.slice(1)}] ${subject}\n\nHi Team Lead,\n\nThis is an automated escalation generated by the AI Work Analytics system.\n\n**Developer:** ${developer}\n**Type:** ${type.charAt(0).toUpperCase() + type.slice(1)}\n**Subject:** ${subject}\n\n**AI Analysis:**\n${analysisMap[type] || analysisMap['delay']}\n\n**Recommended Actions:**\n${(actionsMap[type] || actionsMap['delay']).map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nPlease review and take appropriate action. This escalation was generated based on automated analysis of developer activity patterns, code metrics, and sprint data.\n\nBest regards,\nAI Work Analytics & Governance System`;

        const newEscalation: EscalationEntry = {
          id: generateId(),
          type: escalationType,
          subject,
          status: 'pending',
          developer,
          aiAnalysis: analysisMap[type] || analysisMap['delay'],
          suggestedActions: actionsMap[type] || actionsMap['delay'],
          emailDraft,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          escalations: [newEscalation, ...state.escalations],
        }));
      },

      updatePrivacySetting: (key: keyof PrivacySettings, value: any) => {
        set((state) => ({
          privacySettings: {
            ...state.privacySettings,
            [key]: value,
          },
        }));
      },

      addTimelineEntry: (entry: Omit<TimelineEntry, 'id'>) => {
        const newEntry: TimelineEntry = {
          ...entry,
          id: generateId(),
        };
        set((state) => ({
          timeline: [...state.timeline, newEntry],
        }));
      },

      addTeamMember: (member: Omit<TeamMember, 'id'>) => {
        const newMember: TeamMember = {
          ...member,
          id: generateId(),
        };
        set((state) => ({
          teamMembers: [newMember, ...state.teamMembers],
        }));
      },

      removeTeamMember: (id: string) => {
        set((state) => ({
          teamMembers: state.teamMembers.filter(m => m.id !== id)
        }));
      },
    }),
    {
      name: 'bg-work-analytics',
      partialize: (state) => ({
        developerMetrics: state.developerMetrics,
        timeline: state.timeline,
        dailyReport: state.dailyReport,
        performanceScores: state.performanceScores,
        teamMembers: state.teamMembers,
        predictiveAlerts: state.predictiveAlerts,
        escalations: state.escalations,
        askAIHistory: state.askAIHistory,
        privacySettings: state.privacySettings,
      }),
    }
  )
);
