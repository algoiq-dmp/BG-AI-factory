'use client';

/**
 * @file FAQ Page
 * @description 7-section accordion FAQ with 22 questions, expand/collapse all,
 *              bold markdown rendering, and section-colored icons.
 */
import { useState } from 'react';
import { ChevronDown, ChevronRight, HelpCircle, Rocket, Download, Zap, Pencil, Brain, Shield, BookOpen, Settings } from 'lucide-react';

const FAQ_SECTIONS = [
  {
    title: 'Getting Started', icon: Rocket, color: '#6366f1',
    questions: [
      { q: 'How do I start a new project?', a: `1. Click **"Start Project"** in the left sidebar.\n2. Enter your **project name** and describe your **idea** in the textarea.\n3. Optionally select a **Domain Template** (Fintech, E-Commerce, etc.) to auto-fill the blueprint.\n4. Configure the **Required Blueprint** dropdowns (frontend, backend, database, etc.).\n5. Select relevant **Multiple Choices** (login methods, core features, AI features).\n6. Set the number of **questions** (4–20) and click **"Generate Questions"**.\n7. Answer the generated questions — this builds your Knowledge Base.` },
      { q: 'What is a "Domain Template" and should I use one?', a: `Domain Templates are pre-configured blueprints for common project types (Fintech, Healthcare, EdTech, etc.). They auto-fill your blueprint dropdowns with industry-standard choices.\n\n**Use one if:** You're building a standard app type and want a quick start.\n**Skip if:** Your project is unique and you want full manual control.` },
      { q: 'What are the "Required Blueprint" dropdowns?', a: `These 24 dropdowns define your project's technical architecture. They include:\n- **Tech stack**: Frontend (React, Next.js), Backend (FastAPI, Express), Database (PostgreSQL, MongoDB)\n- **Features**: Auth strategy, payments, notifications, analytics\n- **AI**: Which AI provider to use (OpenAI, Gemini, DeepSeek, Ollama)\n- **Deployment**: Where to host (Vercel, AWS, Docker, Cloudflare)\n\n🟢 Options marked with a green dot are **open-source/free**. Use the ⓘ icon next to each field for comparison guidance.` },
      { q: 'What is the difference between Blueprint and Multiple Choices?', a: `**Blueprint** = Single-select dropdowns for core architecture decisions (one frontend, one backend, one database).\n\n**Multiple Choices** = Multi-select checkboxes for features you want included (you can pick many: Google OAuth + Magic Link + OTP for login, or Dashboard + CRUD + Search for core features).` },
    ],
  },
  {
    title: 'Editing & Saving', icon: Pencil, color: '#f59e0b',
    questions: [
      { q: 'How do I edit my project after generating questions?', a: `Once questions are generated, the project inputs (idea, blueprint, choices) are **locked** to prevent accidental changes.\n\nTo edit:\n1. Click the **"Edit Project"** button (top-right of Start Project page).\n2. A confirmation popup will appear warning that editing will **regenerate the entire project**.\n3. Click **"Yes, Edit & Regenerate"** to unlock all fields.\n4. Make your changes and click **"Generate Questions"** again.\n\n⚠️ This resets: questions, knowledgebase, pipeline phases, auto intelligence, and compiled prompts.` },
      { q: 'How does saving work?', a: `Your project is **auto-saved** to the database after every significant action:\n- After generating questions\n- After answering questions\n- After building the knowledgebase\n- After running any pipeline phase\n\nYou can also manually save from the **Project Manager** page. Your data persists across sessions — just log in again to continue.` },
      { q: 'Can I have multiple projects?', a: `Yes! Use the **My Projects** page (sidebar) to:\n- View all your projects\n- Switch between projects\n- Create new projects\n- Delete old ones\n\n**Free plan**: 1 project (30 days). **Pro plan**: 5 projects. **Enterprise**: Unlimited projects.` },
    ],
  },
  {
    title: 'Knowledge Base & Intelligence', icon: Brain, color: '#10b981',
    questions: [
      { q: 'What is the Knowledge Base (KB)?', a: `The Knowledge Base is the **brain of your project**. It contains:\n- Your project idea and blueprint\n- Answered questions (structured analysis)\n- AI-generated suggestions (accepted/rejected)\n- MCQ analysis results\n- Feature matrix and requirement intel\n\nEvery AI operation in the platform reads from your KB. The richer your KB, the better your outputs.` },
      { q: 'How do I use Auto Intelligence?', a: `Auto Intelligence is a **27-step autonomous pipeline** that enriches your project without manual effort.\n\nTo use it:\n1. Navigate to **"Auto Intelligence"** in the sidebar.\n2. Click **"Run All Steps"** or run individual steps.\n3. Each step generates structured analysis: risk assessment, tech debt prediction, skill requirements, security audit, etc.\n4. Review the output and **Accept** or **Reject** each suggestion.\n5. Accepted suggestions are added to your KB automatically.\n\n💡 Pro tip: Run Auto Intelligence after answering at least 50% of your questions for best results.` },
      { q: 'What are AI Suggestions and how do I handle them?', a: `After answering questions, the AI generates **smart suggestions** for things you may have missed:\n- Missing features\n- Security considerations\n- Performance optimizations\n- UX improvements\n\nFor each suggestion, you can:\n- ✅ **Accept** — Added to your KB and used in all future outputs\n- ❌ **Reject** — Dismissed and excluded\n- 📝 **Edit** — Modify before accepting\n\nThis Accept/Reject flow ensures the AI never adds anything without your approval.` },
      { q: 'What is the MCQ system?', a: `MCQ (Multiple Choice Questions) is a **gap analysis tool**. After your KB is built, the AI generates multiple-choice questions about areas that might be incomplete.\n\n- Each MCQ tests whether a requirement has been covered\n- Your answers help the AI identify **knowledge gaps**\n- Results are used to improve prompt quality\n\nNavigate to **MCQ** in the sidebar after building your KB.` },
    ],
  },
  {
    title: 'Downloading & Exporting', icon: Download, color: '#ec4899',
    questions: [
      { q: 'How do I download my project outputs?', a: `You can export from multiple pages:\n\n1. **Documentation AI** → Download complete technical docs\n2. **Phase Prompts** → Download individual phase prompts for each AI platform\n3. **Prompt Compiler** → Download compiled prompts for Cursor, Bolt, V0, Claude, etc.\n4. **Project Summary** → Export the full project summary with all sections\n5. **Architecture** → Download HLD, API blueprints, DB schemas\n\nLook for the **📥 Download** or **📋 Copy** buttons on each page.` },
      { q: 'What formats are available for export?', a: `- **Markdown (.md)** — Universal, works everywhere\n- **JSON (.json)** — Structured data for programmatic use\n- **ZIP (.zip)** — All code files bundled\n- **Copy to clipboard** — Quick paste into any AI platform\n\nThe Prompt Compiler specifically formats output for each platform:\n- Cursor uses .cursorrules format\n- Bolt uses its native prompt structure\n- V0, Claude, GPT, Gemini each get optimized formats` },
      { q: 'Can I import/export projects between accounts?', a: `Yes! Enterprise users can:\n- **Export**: Download full project as JSON + KB\n- **Import**: Upload JSON to restore\n\nThis is especially useful for:\n- Migrating from Cloud to Self-Hosted\n- Sharing project templates across teams\n- Backing up important projects` },
    ],
  },
  {
    title: 'Pipeline & Phases', icon: Zap, color: '#8b5cf6',
    questions: [
      { q: 'What is the 12-Stage Pipeline?', a: `The pipeline takes your project from idea to deployment-ready:\n\n1. **Requirements AI** — Deep requirement analysis from KB\n2. **Architecture AI** — HLD, LLD, component design\n3. **Task Breakdown AI** — Sprint-ready Jira-style tasks\n4. **Frontend AI** — React/Next.js component generation\n5. **Backend AI** — API routes, middleware, auth\n6. **Database AI** — Schema, migrations, seed data\n7. **Testing AI** — Unit, integration, E2E test suites\n8. **Documentation AI** — Technical docs, README, API specs\n9. **Code Review AI** — Quality audit and improvements\n10. **Deployment AI** — CI/CD, Docker, cloud setup\n11. **Monitoring AI** — Alerting, logging, health checks\n12. **Quality Audit** — Final 360° quality validation\n\nEach phase builds on the previous one. Complete them in order for best results.` },
      { q: 'What are Phase Prompts?', a: `Phase Prompts break your project into **10 development phases** (Auth, Core CRUD, API, Frontend, etc.) and generate a detailed prompt for each phase.\n\nEach prompt contains:\n- Phase description and goals\n- Specific files to create\n- Code patterns to follow\n- Testing requirements\n- Dependencies from previous phases\n\nUse these prompts directly in Cursor, Bolt, V0, or any AI code generator.` },
      { q: 'What is the Prompt Compiler?', a: `The Prompt Compiler takes your KB and generates **platform-specific prompts** optimized for each code generator:\n\n- **Cursor** — .cursorrules + project context\n- **Bolt.new** — Single comprehensive prompt\n- **V0** — Component-focused prompts\n- **Claude/GPT/Gemini** — Conversation-style prompts\n- **Copilot/Windsurf/Replit** — IDE-optimized formats\n\nEach output is tailored to how that platform processes context.` },
    ],
  },
  {
    title: 'Architecture & Design', icon: BookOpen, color: '#06b6d4',
    questions: [
      { q: 'What does the Architecture page generate?', a: `The Architecture page auto-generates:\n- **High-Level Design (HLD)** — System architecture, component diagram\n- **API Blueprint** — All API endpoints with request/response schemas\n- **Database Design** — Tables, relationships, indexes, migrations\n- **Frontend Components** — Component tree and state management\n- **Dependency Map** — Package dependencies and version recommendations\n\nAll outputs are based on YOUR project KB, not generic templates.` },
      { q: 'How does the Execution Studio work?', a: `Execution Studio is a **sandboxed AI coding environment**. It provides:\n- Monaco code editor (VS Code engine)\n- AI code generation from natural language\n- Multi-file project context\n- Syntax highlighting for 30+ languages\n\nUse it to prototype, generate, and refine code directly in the browser.` },
    ],
  },
  {
    title: 'Account & Settings', icon: Settings, color: '#64748b',
    questions: [
      { q: 'What AI models does the platform use?', a: `The platform uses a **multi-provider AI routing layer**:\n1. **DeepSeek** (primary) — Best value, fast responses\n2. **Ollama** (local) — Air-gapped, zero-cost local models\n3. **Claude/GPT** (planned) — Premium fallback options\n\nEnterprise users can:\n- Use their **own API keys** (BYO)\n- Connect to **local LLMs** (Ollama, Llama 3)\n- Use **custom endpoints** for air-gapped deployments` },
      { q: 'Is my data secure?', a: `Yes. Your data security measures:\n- 🔒 All data stored in **encrypted SQLite database**\n- 🚫 We **never sell** your data or use it for AI training\n- 🔐 **JWT authentication** with session tokens\n- 🌍 **GDPR compliant** data handling\n- 🏢 Enterprise: **Self-hosted option** — 100% data on your server\n\nWe don't have access to your API keys (Enterprise BYO keys are stored encrypted and never logged).` },
      { q: 'What are Karma Tokens?', a: `Karma Tokens are the **API economy currency** of the platform:\n- Each AI operation costs tokens (2-10 per call)\n- **Free plan**: 100 tokens/month\n- **Pro plan**: 5,000 tokens/month\n- **Enterprise**: Unlimited tokens\n\nAdmins get 1,000 tokens. Track usage in the Dashboard or Admin Panel.` },
    ],
  },
];

/** Renders a single FAQ item with accordion toggle and bold markdown */
function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[#1e2532] last:border-0">
      <button onClick={onToggle} className={`w-full p-3.5 px-4 flex items-center gap-3 text-left cursor-pointer transition-all ${isOpen ? 'bg-[#5b5fd8]/[0.04]' : 'hover:bg-white/[0.02]'}`}>
        {isOpen ? <ChevronDown className="w-4 h-4 text-[#5b5fd8] flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-[#586c8f] flex-shrink-0" />}
        <span className="flex-1 text-[13px] font-semibold text-white">{q}</span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pl-11 text-xs text-[#8b9bb4] leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
          {a.split('\n').map((line, i) => {
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
              <div key={i} className={line.trim() === '' ? 'h-2' : 'mb-0.5'}>
                {parts.map((part, j) =>
                  j % 2 === 1 ? <strong key={j} className="text-white font-bold">{part}</strong> : part
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (si: number, qi: number) => {
    const key = `${si}-${qi}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    FAQ_SECTIONS.forEach((s, si) => s.questions.forEach((_, qi) => { all[`${si}-${qi}`] = true; }));
    setOpenItems(all);
  };

  const collapseAll = () => setOpenItems({});

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8 max-w-[900px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white tracking-tight">
            <HelpCircle className="w-6 h-6 text-[#5b5fd8]" /> Frequently Asked Questions
          </h1>
          <p className="text-[#8b9bb4] text-sm mt-1">Everything you need to know about using Launch IQ</p>
        </div>
        <div className="flex gap-2">
          <button onClick={expandAll} className="text-[11px] px-3 py-1.5 rounded-lg bg-[#111622] border border-[#1e2532] text-[#8b9bb4] hover:text-white hover:border-[#5b5fd8]/30 transition-all cursor-pointer font-bold">Expand All</button>
          <button onClick={collapseAll} className="text-[11px] px-3 py-1.5 rounded-lg bg-[#111622] border border-[#1e2532] text-[#8b9bb4] hover:text-white hover:border-[#5b5fd8]/30 transition-all cursor-pointer font-bold">Collapse All</button>
        </div>
      </div>

      {/* FAQ Sections */}
      {FAQ_SECTIONS.map((section, si) => {
        const Icon = section.icon;
        return (
          <div key={si} className="bg-[#111622] border border-[#1e2532] rounded-xl mb-4 overflow-hidden">
            {/* Section Header */}
            <div className="px-4 py-3 flex items-center gap-3 border-b border-[#1e2532]" style={{ background: `${section.color}08` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${section.color}15` }}>
                <Icon className="w-4 h-4" style={{ color: section.color }} />
              </div>
              <div className="font-bold text-sm" style={{ color: section.color }}>{section.title}</div>
              <span className="text-[10px] text-[#586c8f] ml-auto">{section.questions.length} questions</span>
            </div>
            {/* Questions */}
            {section.questions.map((faq, qi) => (
              <FAQItem key={qi} q={faq.q} a={faq.a} isOpen={!!openItems[`${si}-${qi}`]} onToggle={() => toggleItem(si, qi)} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
