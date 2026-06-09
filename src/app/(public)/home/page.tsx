'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Sun, Moon, ChevronDown, ChevronRight, Brain, Code, Layers,
  Shield, Zap, Rocket, CheckCircle2, ArrowRight, Star, ExternalLink,
  Menu, X
} from 'lucide-react';

/* ───────────────────────── THEME CSS ───────────────────────── */
const themeCSS = `
:root, [data-theme="dark"] {
  --bg-primary:#060a1a;--bg-secondary:#0c1029;--bg-tertiary:#111638;
  --bg-card:rgba(17,22,56,0.7);--border-primary:rgba(99,102,241,0.15);
  --text-primary:#e8eaf6;--text-secondary:#9fa8da;--text-muted:#5c6bc0;
  --text-accent:#f59e0b;--accent-primary:#6366f1;
}
[data-theme="light"] {
  --bg-primary:#f5f6fa;--bg-secondary:#ffffff;--bg-tertiary:#eef0f6;
  --bg-card:rgba(255,255,255,0.95);--border-primary:rgba(99,102,241,0.12);
  --text-primary:#1a1e36;--text-secondary:#4a5070;--text-muted:#8890b0;
  --text-accent:#c07800;--accent-primary:#5558e6;
}
html{scroll-behavior:smooth}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,-apple-system,sans-serif}
`;

/* ───────────────────────── DATA ───────────────────────── */
const NAV_LINKS = ['Features','Pipeline','Pricing','Gita Wisdom','Why Gita?','FAQ'];

const PIPELINE_STEPS = [
  { num:'01', title:'Define', emoji:'💡', color:'#f59e0b', desc:'Capture raw idea, constraints, and target users in structured format' },
  { num:'02', title:'Analyze', emoji:'🧠', color:'#6366f1', desc:'Deep-dive feasibility, risk assessment, and technology stack selection' },
  { num:'03', title:'Summarize', emoji:'📋', color:'#10b981', desc:'Auto-generate executive summary and stakeholder brief' },
  { num:'04', title:'Architect', emoji:'🏗️', color:'#8b5cf6', desc:'System design, database schema, API contracts, microservices layout' },
  { num:'05', title:'Plan', emoji:'📊', color:'#ec4899', desc:'Sprint breakdown, milestones, resource allocation, and timelines' },
  { num:'06', title:'Intelligence', emoji:'🤖', color:'#06b6d4', desc:'27 auto-intel modules analyze every dimension of your project' },
  { num:'07', title:'Compile', emoji:'⚡', color:'#f59e0b', desc:'Generate production-ready prompts for 9 AI platforms' },
  { num:'08', title:'Document', emoji:'📄', color:'#6366f1', desc:'Auto-create PRDs, technical specs, API docs, and user stories' },
  { num:'09', title:'Validate', emoji:'🛡️', color:'#ef4444', desc:'Security audit, compliance check, performance benchmarks' },
  { num:'10', title:'Launch', emoji:'🚀', color:'#10b981', desc:'Deployment checklist, monitoring setup, go-live playbook' },
];

const GITA_PARALLELS = [
  { emoji:'🧠', color:'#6366f1', title:'Gita = Decision Framework', desc:'Just as the Gita guides Arjuna through complex decisions, our engine guides developers through architectural choices.' },
  { emoji:'🙏', color:'#d4af37', title:'Krishna = AI Advisor', desc:'Krishna provides divine counsel — our AI provides intelligent, context-aware development guidance.' },
  { emoji:'🏹', color:'#10b981', title:'Arjuna = Developer', desc:'The skilled warrior who needs direction, not more weapons. Developers need intelligence, not more tools.' },
  { emoji:'⚖️', color:'#f59e0b', title:'Dharma = Best Practices', desc:'Following dharma means following the right path — our engine enforces industry best practices automatically.' },
  { emoji:'🔄', color:'#ec4899', title:'Karma Yoga = Process > Outcome', desc:'Focus on the process of building excellently; quality outcomes follow naturally.' },
  { emoji:'📖', color:'#06b6d4', title:'Knowledge = Power', desc:'Gita teaches that knowledge destroys ignorance — our intelligence layer eliminates development blind spots.' },
];

const CASE_STUDIES = [
  { emoji:'📈', color:'#6366f1', title:'Fintech Trading Terminal', problem:'Complex real-time trading UI with SEBI compliance requirements and multi-exchange integration.', solution:'Generated 340+ prompts covering regulatory compliance, WebSocket architecture, and risk management modules.', results:['60% faster development','Zero compliance issues','₹12L saved in consulting'] },
  { emoji:'🛒', color:'#10b981', title:'E-Commerce Marketplace', problem:'Multi-vendor platform with inventory sync, payment gateway integration, and logistics management.', solution:'Produced complete microservices architecture with event-driven design and automated vendor onboarding.', results:['45% fewer bugs','3x faster launch','98% uptime from day 1'] },
  { emoji:'🏥', color:'#ec4899', title:'Healthcare Patient Records', problem:'HIPAA-compliant patient management system with telemedicine, prescriptions, and lab integrations.', solution:'Delivered security-first architecture with end-to-end encryption specs and audit trail documentation.', results:['100% HIPAA compliance','50% dev time saved','Zero data breaches'] },
  { emoji:'📚', color:'#f59e0b', title:'EdTech LMS Platform', problem:'Adaptive learning platform supporting 50K+ concurrent users with video streaming and assessments.', solution:'Created scalable CDN architecture, real-time analytics pipeline, and gamification system design.', results:['99.9% uptime','40% better engagement','Scaled to 100K users'] },
];

const SHLOKAS = [
  { ch:'2.47', color:'#d4af37', sanskrit:'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।', hindi:'तुम्हारा अधिकार केवल कर्म में है, फल में कभी नहीं।', english:'You have a right to perform your duty, but never to the fruits of action.', software:'Focus on writing excellent code and architecture — business outcomes will follow naturally.' },
  { ch:'2.14', color:'#6366f1', sanskrit:'मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः।', hindi:'हे कुन्तीपुत्र, सुख-दुख का अनुभव अस्थायी है।', english:'The contacts of the senses bring fleeting heat and cold, pleasure and pain.', software:'Bugs and production issues are temporary — systematic processes make them manageable.' },
  { ch:'3.21', color:'#10b981', sanskrit:'यद्यदाचरति श्रेष्ठस्तत्तदेवेतरो जनः।', hindi:'श्रेष्ठ पुरुष जो-जो आचरण करता है, अन्य लोग भी वैसा ही करते हैं।', english:'Whatever a great person does, others follow. Whatever standards they set, the world pursues.', software:'Senior developers who follow best practices set the standard for entire engineering teams.' },
  { ch:'6.5', color:'#ec4899', sanskrit:'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।', hindi:'अपने आप को ऊपर उठाओ, अपने आप को नीचे मत गिराओ।', english:'Elevate yourself through the power of your mind, and do not degrade yourself.', software:'Continuously upskill, refactor, and improve — never settle for "it works" code quality.' },
  { ch:'18.78', color:'#f59e0b', sanskrit:'यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः।', hindi:'जहाँ योगेश्वर कृष्ण हैं और जहाँ धनुर्धर अर्जुन हैं, वहाँ विजय निश्चित है।', english:'Where there is Krishna, the master of yoga, and Arjuna, the archer — there is certain victory.', software:'When AI intelligence meets skilled developers, project success is inevitable.' },
  { ch:'4.38', color:'#06b6d4', sanskrit:'न हि ज्ञानेन सदृशं पवित्रमिह विद्यते।', hindi:'इस संसार में ज्ञान के समान पवित्र कुछ भी नहीं है।', english:'In this world, there is nothing as purifying as knowledge.', software:'Pre-development intelligence eliminates waste, rework, and technical debt from the start.' },
];

const FEATURES = [
  { icon:'Brain', color:'#6366f1', title:'50+ Intelligence Modules', desc:'Deep analysis covering feasibility, risks, architecture, security, and compliance.' },
  { icon:'Code', color:'#10b981', title:'9 Platform Outputs', desc:'Production-ready prompts for ChatGPT, Claude, Gemini, Copilot, Cursor, and more.' },
  { icon:'Layers', color:'#8b5cf6', title:'7 AI Personalities', desc:'From ruthless critic to creative visionary — get multi-perspective analysis.' },
  { icon:'Shield', color:'#ef4444', title:'Security & Compliance', desc:'Built-in OWASP, GDPR, HIPAA, and SEBI compliance checks in every output.' },
  { icon:'Zap', color:'#f59e0b', title:'Save 90% Tokens', desc:'Pre-structured prompts eliminate wasteful back-and-forth with AI platforms.' },
  { icon:'Rocket', color:'#ec4899', title:'40+ Deploy Checklist', desc:'Go-live readiness with monitoring, rollback, and incident response plans.' },
];

const ICON_MAP: Record<string, React.ElementType> = { Brain, Code, Layers, Shield, Zap, Rocket };

const COMPETITOR_FEATURES = [
  'Pre-dev intelligence layer','27-step auto analysis','Hindi + English','SEBI/RBI compliance','Architecture generation',
  'Multi-platform prompts','7 AI personalities','Security audit built-in','Sprint planning','Cost estimation',
  'Token optimization','40+ deploy checklist','Gita-inspired methodology',
];

const COMPETITORS = ['ChatPRD','Cursor','ClickUp','Pieces.app','SuperAGI'];
const COMP_MATRIX: Record<string, boolean[]> = {
  'ChatPRD':[false,false,false,false,false,false,false,false,false,false,false,false,false],
  'Cursor':[false,false,false,false,true,true,false,false,false,false,false,false,false],
  'ClickUp':[false,false,false,false,false,false,false,false,true,false,false,false,false],
  'Pieces.app':[false,false,false,false,false,true,false,false,false,false,true,false,false],
  'SuperAGI':[true,false,false,false,false,true,false,false,false,false,false,false,false],
};

const AUDIENCE = [
  { emoji:'👨‍💻', title:'Solo Developers', desc:'Stop guessing architecture. Get enterprise-grade intelligence for your indie projects.', features:['Save 40+ hours per project','Professional documentation','Client-ready proposals'] },
  { emoji:'🏢', title:'Dev Agencies', desc:'Standardize your pre-development process across all client projects instantly.', features:['Consistent quality output','Faster client onboarding','Scalable methodology'] },
  { emoji:'📋', title:'Product Managers', desc:'Bridge the gap between business requirements and technical implementation effortlessly.', features:['Auto-generated PRDs','Technical feasibility reports','Sprint-ready backlogs'] },
  { emoji:'🧑‍💼', title:'CTOs & Tech Leads', desc:'Ensure every project starts with proper architecture and security considerations.', features:['Architecture blueprints','Risk assessments','Compliance frameworks'] },
];

const COMPANY_PRODUCTS = ['Bhagvat Gita AI Engine','Algo Analytiq Platform','QuickComply Pro','DataForge Studio','API Guardian','CloudSync Manager','DevMetrics Dashboard','SecureVault Enterprise'];
const COMPANY_SERVICES = ['Custom AI Solutions','Enterprise Integration','Compliance Consulting','Technical Architecture'];
const COMPANY_TRUST = ['500+ Projects Delivered','50+ Enterprise Clients','ISO 27001 Certified','24/7 Support'];

const BENEFITS = [
  { emoji:'💰', title:'Save 90% Tokens', desc:'Pre-structured prompts eliminate wasteful AI conversations' },
  { emoji:'🔄', title:'Zero Rework', desc:'Get it right the first time with comprehensive pre-analysis' },
  { emoji:'⏱️', title:'40+ Hours Saved', desc:'Per project automation of repetitive planning tasks' },
  { emoji:'📄', title:'One-Click Docs', desc:'PRDs, specs, and proposals generated automatically' },
  { emoji:'🛡️', title:'Security-First', desc:'OWASP, GDPR, HIPAA compliance built into every output' },
  { emoji:'📊', title:'Estimation Accuracy', desc:'AI-powered effort and cost estimation within 10% accuracy' },
  { emoji:'📋', title:'Requirements Capture', desc:'Never miss a requirement with 50+ analysis dimensions' },
  { emoji:'🌐', title:'9 AI Platforms', desc:'Output optimized for every major AI coding assistant' },
  { emoji:'💼', title:'Client Proposals', desc:'Auto-generate professional proposals from project analysis' },
  { emoji:'🏗️', title:'Architecture Ready', desc:'System design, DB schema, API contracts auto-generated' },
  { emoji:'⏪', title:'Time Machine', desc:'Version control for your project intelligence documents' },
  { emoji:'🤖', title:'Auto Intelligence', desc:'27 modules analyze feasibility, risks, and opportunities' },
  { emoji:'🔍', title:'Code Audit Ready', desc:'Pre-audit reports for quality assurance teams' },
  { emoji:'📅', title:'Sprint Planning', desc:'Auto-generated sprint backlogs with story points' },
  { emoji:'🌍', title:'Multi-Language', desc:'Full Hindi and English support for Indian enterprises' },
];

const SHOW_STOPPERS = [
  { challenge:'AI Hallucinations', solution:'Structured prompt templates with validation gates eliminate fabricated outputs', status:'✅ Solved' },
  { challenge:'Generic Prompts', solution:'Context-aware, project-specific prompt generation with domain knowledge', status:'✅ Solved' },
  { challenge:'Prompt Fatigue', solution:'One-click generation of 340+ prompts from a single project description', status:'✅ Solved' },
  { challenge:'Hindi Support', solution:'Native Hindi + English bilingual interface with Devanagari rendering', status:'✅ Solved' },
  { challenge:'SEBI Compliance', solution:'Built-in SEBI, RBI, and Indian regulatory compliance frameworks', status:'✅ Solved' },
  { challenge:'Token Waste', solution:'Pre-optimized prompt structures save 90% tokens across platforms', status:'✅ Solved' },
  { challenge:'Scope Creep', solution:'Automated scope boundary detection and change impact analysis', status:'✅ Solved' },
  { challenge:'Architecture Debt', solution:'Proactive architecture review with scalability recommendations', status:'✅ Solved' },
  { challenge:'Testing Gaps', solution:'Auto-generated test strategies with coverage mapping', status:'✅ Solved' },
  { challenge:'Deployment Anxiety', solution:'40+ point deployment checklist with rollback procedures', status:'✅ Solved' },
];

const COMP_DEEP = [
  { name:'ChatPRD', color:'#6366f1', short:'Only generates PRDs — no architecture, no prompts, no compliance checks.', edge:'We deliver full-stack intelligence: PRDs + architecture + prompts + security audit + deployment plans.' },
  { name:'Cursor', color:'#10b981', short:'Great IDE-level AI, but zero pre-development planning or architecture generation.', edge:'We work before Cursor — providing the intelligence layer that makes Cursor 10x more effective.' },
  { name:'ClickUp', color:'#ec4899', short:'Project management tool, not an AI intelligence engine. No prompt generation.', edge:'We generate the content that goes into ClickUp — requirements, sprints, and technical specs.' },
  { name:'Pieces.app', color:'#f59e0b', short:'Code snippet manager with some AI — no project-level intelligence or planning.', edge:'We provide project-level intelligence that makes every code snippet contextually relevant.' },
  { name:'SuperAGI', color:'#8b5cf6', short:'General-purpose AI agent framework — not specialized for software development lifecycle.', edge:'We are purpose-built for software pre-development with 27 specialized intelligence modules.' },
  { name:'GitHub Copilot', color:'#06b6d4', short:'Excellent code completion, but starts at the code level with no planning intelligence.', edge:'We create the architectural blueprint that makes Copilot suggestions architecturally consistent.' },
];

const ENTERPRISE_TOOLS = [
  { cat:'Architecture Suite', items:['System Design Generator','Database Schema Builder','API Contract Designer','Microservices Mapper','Event-Driven Architecture','Load Balancer Config','Cache Strategy Planner'] },
  { cat:'Security Suite', items:['OWASP Vulnerability Scanner','Penetration Test Planner','Encryption Strategy','Access Control Matrix','Audit Trail Designer','Compliance Reporter'] },
  { cat:'DevOps Suite', items:['CI/CD Pipeline Generator','Docker Compose Builder','Kubernetes Manifest Creator','Monitoring Dashboard','Alert Rules Generator','Disaster Recovery Plan'] },
  { cat:'Documentation Suite', items:['PRD Generator','Technical Spec Writer','API Documentation','User Story Creator','Release Notes','Change Log Manager'] },
  { cat:'Testing Suite', items:['Test Strategy Planner','Test Case Generator','Performance Benchmark','Load Test Scenarios','Security Test Plans','Regression Suite'] },
  { cat:'Analytics Suite', items:['Cost Estimator','Timeline Predictor','Risk Assessment','Resource Allocator','ROI Calculator','Burndown Forecaster'] },
];

const AUTO_INTEL_STEPS = [
  'Project Classification','Domain Analysis','Feasibility Study','Risk Assessment','Technology Stack','Architecture Pattern',
  'Database Design','API Design','Security Analysis','Compliance Check','Performance Strategy','Scalability Plan',
  'Cost Estimation','Timeline Projection','Resource Planning','Sprint Breakdown','Testing Strategy','Deployment Plan',
  'Monitoring Setup','Documentation Plan','Stakeholder Analysis','Market Analysis','Competitor Analysis','Integration Map',
  'Data Flow Design','Error Handling Strategy','Disaster Recovery',
];

const PRICING = [
  { name:'Free', price:'₹0', period:'/30 days', color:'#6366f1', features:['3 Projects','Basic Intelligence','Single Platform Output','Community Support','Email Reports'], cta:'Get Started Free', popular:false },
  { name:'Pro', price:'₹999', period:'/month', color:'#f59e0b', features:['Unlimited Projects','Full 27-Step Intelligence','9 Platform Outputs','Priority Support','All 7 AI Personalities','Advanced Analytics','Custom Templates'], cta:'Start Pro Trial', popular:true },
  { name:'Enterprise Monthly', price:'₹4,999', period:'/month', color:'#10b981', features:['Everything in Pro','40+ Pro Tools','Team Collaboration','SSO & SAML','Custom Compliance','Dedicated Account Manager','API Access','White-label Options'], cta:'Contact Sales', popular:false },
  { name:'Enterprise Yearly', price:'₹49,999', period:'/year', color:'#ec4899', features:['Everything in Enterprise','Save 17%','Annual Strategy Session','Custom Integrations','On-premise Option','SLA Guarantee','Training & Onboarding','Priority Feature Requests'], cta:'Contact Sales', popular:false },
];

const KRISHNA_CARDS = [
  { img:'/krishna1.png', shloka:'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन', ch:'Chapter 2, Verse 47' },
  { img:'/krishna2.png', shloka:'योगः कर्मसु कौशलम्', ch:'Chapter 2, Verse 50' },
  { img:'/krishna3.png', shloka:'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत', ch:'Chapter 4, Verse 7' },
  { img:'/krishna4.png', shloka:'न हि ज्ञानेन सदृशं पवित्रमिह विद्यते', ch:'Chapter 4, Verse 38' },
  { img:'/krishna5.png', shloka:'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्', ch:'Chapter 6, Verse 5' },
  { img:'/krishna6.png', shloka:'यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः', ch:'Chapter 18, Verse 78' },
];

const FAQ_ITEMS = [
  { q:'What is the Bhagvat Gita AI Software Factory?', a:'It is a pre-development intelligence platform that transforms raw project ideas into comprehensive, production-ready prompts and documentation for 9 AI coding platforms. It applies the wisdom principles of the Bhagavad Gita to modern software engineering.' },
  { q:'How does it save 90% AI tokens?', a:'By generating pre-structured, context-rich prompts that eliminate back-and-forth conversations with AI tools. Instead of 50 vague prompts, you get 5 precise ones that produce better results.' },
  { q:'What are the 27 Auto-Intelligence steps?', a:'They cover everything from project classification and domain analysis to security assessment, compliance checking, cost estimation, and deployment planning — all automated from your initial project description.' },
  { q:'Which AI platforms does it support?', a:'ChatGPT, Claude, Gemini, GitHub Copilot, Cursor, Windsurf, Replit, Bolt, and Lovable — with platform-specific prompt optimization for each.' },
  { q:'Is Hindi language fully supported?', a:'Yes! Full bilingual support with native Devanagari script rendering. All outputs, documentation, and the interface itself support Hindi and English.' },
  { q:'What compliance frameworks are included?', a:'SEBI, RBI, GDPR, HIPAA, SOC2, ISO 27001, PCI-DSS, and Indian IT Act compliance — automatically checked and integrated into your project documentation.' },
  { q:'Can I use it for existing projects?', a:'Absolutely. You can feed existing project descriptions to generate architecture reviews, security audits, and optimization recommendations for projects already in development.' },
  { q:'How is this different from GitHub Copilot?', a:'Copilot writes code inside your IDE. We work before you open your IDE — generating the architecture, requirements, and prompts that make Copilot dramatically more effective.' },
  { q:'Is there an API for integration?', a:'Enterprise plans include full REST API access for integrating our intelligence engine into your existing CI/CD pipelines, project management tools, and development workflows.' },
  { q:'What about data privacy?', a:'All project data is encrypted at rest and in transit. Enterprise plans support on-premise deployment. We are ISO 27001 certified and never use your data for model training.' },
];

/* ───────────────────────── COMPONENT ───────────────────────── */
export default function HomePage() {
  const router = useRouter();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('home-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('home-theme', theme);
  }, [theme]);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenu(false);
  }, []);

  const sectionIds: Record<string, string> = { Features:'features', Pipeline:'pipeline', Pricing:'pricing', 'Gita Wisdom':'gita-wisdom', 'Why Gita?':'why-gita', FAQ:'faq' };

  /* ── shared styles ── */
  const page: React.CSSProperties = { background:'var(--bg-primary)', color:'var(--text-primary)', minHeight:'100vh', transition:'background .3s, color .3s' };
  const section: React.CSSProperties = { maxWidth:1200, margin:'0 auto', padding:'80px 20px' };
  const heading: React.CSSProperties = { fontSize:36, fontWeight:800, marginBottom:16, lineHeight:1.2 };
  const subhead: React.CSSProperties = { fontSize:18, color:'var(--text-secondary)', marginBottom:48, maxWidth:700, marginLeft:'auto', marginRight:'auto' };
  const card: React.CSSProperties = { background:'var(--bg-card)', border:'1px solid var(--border-primary)', borderRadius:16, padding:28, backdropFilter:'blur(12px)', transition:'transform .2s, box-shadow .2s' };
  const grid2: React.CSSProperties = { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:24 };
  const grid3: React.CSSProperties = { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:24 };
  const btn = (bg: string): React.CSSProperties => ({ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 28px', borderRadius:12, fontWeight:700, fontSize:15, border:'none', cursor:'pointer', background:bg, color:'#fff', transition:'transform .15s' });

  return (
    <div style={page}>
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />

      {/* ═══════════════ 1. STICKY HEADER ═══════════════ */}
      <header style={{ position:'sticky', top:0, zIndex:100, background:'var(--bg-secondary)', borderBottom:'1px solid var(--border-primary)', backdropFilter:'blur(16px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Sparkles size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:17, color:'var(--text-primary)' }}>Bhagvat Gita Engine</div>
              <div style={{ fontSize:11, color:'var(--text-muted)' }}>by Algo IQ Software Solutions</div>
            </div>
          </div>

          <nav style={{ display:'flex', alignItems:'center', gap:24 }} className="desktop-nav">
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => scrollTo(sectionIds[l])} style={{ background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer', fontSize:14, fontWeight:500 }}>{l}</button>
            ))}
            <a href="https://www.algoanalytiq.com" target="_blank" rel="noopener noreferrer" style={{ color:'var(--text-muted)', display:'flex', alignItems:'center', gap:4, fontSize:14, textDecoration:'none' }}>
              Algo IQ <ExternalLink size={12} />
            </a>
          </nav>

          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} style={{ background:'var(--bg-tertiary)', border:'1px solid var(--border-primary)', borderRadius:10, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-primary)' }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/login" style={btn('#6366f1')}>Sign In</Link>
            <button onClick={() => setMobileMenu(!mobileMenu)} style={{ background:'none', border:'none', color:'var(--text-primary)', cursor:'pointer', display:'none' }} className="mobile-menu-btn">
              {mobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div style={{ padding:'16px 20px', borderTop:'1px solid var(--border-primary)', display:'flex', flexDirection:'column', gap:12 }}>
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => scrollTo(sectionIds[l])} style={{ background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer', fontSize:15, textAlign:'left', padding:'8px 0' }}>{l}</button>
            ))}
          </div>
        )}
      </header>

      {/* ═══════════════ 2. HERO ═══════════════ */}
      <section style={{ ...section, textAlign:'center', position:'relative', overflow:'hidden', paddingTop:100, paddingBottom:100 }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:800, height:800, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
        <p style={{ fontSize:22, color:'var(--text-accent)', fontWeight:600, marginBottom:16 }}>&quot;कच्ची सोच को पक्की तकनीक में बदलो&quot;</p>
        <h1 style={{ fontSize:52, fontWeight:900, lineHeight:1.1, marginBottom:24, maxWidth:800, margin:'0 auto 24px' }}>
          Transform a <span style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Raw Idea</span> into <span style={{ background:'linear-gradient(135deg,#f59e0b,#ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Production-Ready Prompts</span>
        </h1>
        <p style={{ fontSize:19, color:'var(--text-secondary)', maxWidth:650, margin:'0 auto 40px', lineHeight:1.7 }}>
          The world&apos;s first pre-development intelligence layer that analyzes your idea through 27 dimensions before a single line of code is written.
        </p>
        <div style={{ display:'flex', justifyContent:'center', gap:16, flexWrap:'wrap', marginBottom:56 }}>
          <Link href="/login" style={btn('linear-gradient(135deg,#6366f1,#8b5cf6)')}>Start Building <ArrowRight size={18} /></Link>
          <button onClick={() => scrollTo('pipeline')} style={{ ...btn('transparent'), border:'1px solid var(--border-primary)', color:'var(--text-primary)' }}>See How It Works</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24, maxWidth:700, margin:'0 auto' }}>
          {[['27','Auto-Intel Steps'],['10','Dev Phases'],['9','AI Platforms'],['2000+','Happy Customers']].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize:36, fontWeight:900, background:'linear-gradient(135deg,#6366f1,#f59e0b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{v}</div>
              <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ 3. 10-PHASE PIPELINE ═══════════════ */}
      <section id="pipeline" style={{ ...section, background:'var(--bg-secondary)' }}>
        <div style={{ textAlign:'center' }}>
          <h2 style={heading}>The 10-Phase Development Pipeline</h2>
          <p style={subhead}>From raw idea to production-ready intelligence — every step automated and validated.</p>
        </div>
        <div style={{ position:'relative', maxWidth:700, margin:'0 auto' }}>
          <div style={{ position:'absolute', left:28, top:0, bottom:0, width:3, background:'linear-gradient(180deg,#6366f1,#10b981,#f59e0b)', borderRadius:4 }} />
          {PIPELINE_STEPS.map((s, i) => (
            <div key={s.num} style={{ display:'flex', gap:24, marginBottom:32, position:'relative', paddingLeft:60 }}>
              <div style={{ position:'absolute', left:14, top:4, width:32, height:32, borderRadius:'50%', background:s.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, zIndex:1 }}>{s.emoji}</div>
              <div style={card}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:s.color }}>{s.num}</span>
                  <span style={{ fontSize:19, fontWeight:700 }}>{s.title}</span>
                </div>
                <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.6 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ 4. WHY GITA FOR SOFTWARE ═══════════════ */}
      <section id="why-gita" style={section}>
        <div style={{ textAlign:'center' }}>
          <h2 style={heading}>Why the Bhagavad Gita for Software?</h2>
          <p style={subhead}>Ancient wisdom meets modern engineering — a framework for making perfect decisions under complexity.</p>
        </div>
        <div style={grid3}>
          {GITA_PARALLELS.map(g => (
            <div key={g.title} style={{ ...card, borderTop:`3px solid ${g.color}` }}>
              <div style={{ fontSize:36, marginBottom:12 }}>{g.emoji}</div>
              <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8, color:g.color }}>{g.title}</h3>
              <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.7 }}>{g.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ 5. CASE STUDIES ═══════════════ */}
      <section style={{ ...section, background:'var(--bg-secondary)' }}>
        <div style={{ textAlign:'center' }}>
          <h2 style={heading}>Real-World Case Studies</h2>
          <p style={subhead}>See how the Gita Engine transforms complex projects across industries.</p>
        </div>
        <div style={grid2}>
          {CASE_STUDIES.map(c => (
            <div key={c.title} style={{ ...card, borderLeft:`4px solid ${c.color}` }}>
              <div style={{ fontSize:32, marginBottom:8 }}>{c.emoji}</div>
              <h3 style={{ fontSize:18, fontWeight:700, marginBottom:12 }}>{c.title}</h3>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:4 }}>Problem</div>
                <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6 }}>{c.problem}</p>
              </div>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:4 }}>Solution</div>
                <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6 }}>{c.solution}</p>
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:8 }}>Results</div>
                {c.results.map(r => (
                  <div key={r} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <CheckCircle2 size={14} color={c.color} />
                    <span style={{ fontSize:14, color:'var(--text-secondary)' }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ 6. GITA WISDOM ═══════════════ */}
      <section id="gita-wisdom" style={section}>
        <div style={{ textAlign:'center' }}>
          <h2 style={heading}>Gita Wisdom for Developers</h2>
          <p style={subhead}>Timeless shlokas and their powerful applications in software engineering.</p>
        </div>
        <div style={grid2}>
          {SHLOKAS.map(s => (
            <div key={s.ch} style={{ ...card, borderTop:`3px solid ${s.color}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ fontSize:13, fontWeight:700, color:s.color }}>Chapter {s.ch}</span>
                <Star size={16} color={s.color} />
              </div>
              <p style={{ fontStyle:'italic', color:'#d4af37', fontSize:16, marginBottom:8, lineHeight:1.6 }}>{s.sanskrit}</p>
              <p style={{ color:'var(--text-accent)', fontSize:13, marginBottom:6 }}>{s.hindi}</p>
              <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:12, lineHeight:1.6 }}>{s.english}</p>
              <div style={{ background:'var(--bg-tertiary)', borderRadius:10, padding:12 }}>
                <div style={{ fontSize:11, fontWeight:700, color:s.color, textTransform:'uppercase', marginBottom:4 }}>In Software</div>
                <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.5 }}>{s.software}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop:48, padding:'32px 24px', background:'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(212,175,55,0.1))', borderRadius:16, border:'1px solid rgba(212,175,55,0.2)' }}>
          <p style={{ fontSize:28, fontWeight:800, color:'#d4af37', fontStyle:'italic' }}>योगः कर्मसु कौशलम्</p>
          <p style={{ color:'var(--text-secondary)', marginTop:8, fontSize:15 }}>Yoga is excellence in action — The Bhagavad Gita, Chapter 2, Verse 50</p>
        </div>
      </section>

      {/* ═══════════════ 7. WHAT'S INSIDE (FEATURES) ═══════════════ */}
      <section id="features" style={{ ...section, background:'var(--bg-secondary)' }}>
        <div style={{ textAlign:'center' }}>
          <h2 style={heading}>What&apos;s Inside the Engine</h2>
          <p style={subhead}>Enterprise-grade intelligence modules designed to transform how you build software.</p>
        </div>
        <div style={grid3}>
          {FEATURES.map(f => {
            const Icon = ICON_MAP[f.icon];
            return (
              <div key={f.title} style={{ ...card, textAlign:'center' }}>
                <div style={{ width:56, height:56, borderRadius:14, background:`${f.color}18`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <Icon size={28} color={f.color} />
                </div>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:8 }}>{f.title}</h3>
                <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.6 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════ 8. COMPETITOR TABLE ═══════════════ */}
      <section style={section}>
        <div style={{ textAlign:'center' }}>
          <h2 style={heading}>How We Compare</h2>
          <p style={subhead}>The only platform that covers the entire pre-development intelligence gap.</p>
        </div>
        <div style={{ overflowX:'auto', marginBottom:48 }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
            <thead>
              <tr style={{ borderBottom:'2px solid var(--border-primary)' }}>
                <th style={{ textAlign:'left', padding:'12px 16px', color:'var(--text-muted)', fontWeight:600 }}>Feature</th>
                <th style={{ padding:'12px 16px', color:'#6366f1', fontWeight:700 }}>Gita Engine</th>
                {COMPETITORS.map(c => <th key={c} style={{ padding:'12px 16px', color:'var(--text-muted)', fontWeight:600 }}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {COMPETITOR_FEATURES.map((f, i) => (
                <tr key={f} style={{ borderBottom:'1px solid var(--border-primary)' }}>
                  <td style={{ padding:'12px 16px', color:'var(--text-secondary)' }}>{f}</td>
                  <td style={{ textAlign:'center', padding:'12px 16px', fontSize:18 }}>✅</td>
                  {COMPETITORS.map(c => <td key={c} style={{ textAlign:'center', padding:'12px 16px', fontSize:18 }}>{COMP_MATRIX[c][i] ? '✅' : '—'}</td>)}
                </tr>
              ))}
              <tr style={{ borderBottom:'1px solid var(--border-primary)', background:'var(--bg-tertiary)' }}>
                <td style={{ padding:'12px 16px', fontWeight:700 }}>Pricing</td>
                <td style={{ textAlign:'center', padding:'12px 16px', color:'#10b981', fontWeight:700 }}>₹0 – ₹4,999</td>
                <td style={{ textAlign:'center', padding:'12px 16px', color:'var(--text-muted)' }}>$25/mo</td>
                <td style={{ textAlign:'center', padding:'12px 16px', color:'var(--text-muted)' }}>$20/mo</td>
                <td style={{ textAlign:'center', padding:'12px 16px', color:'var(--text-muted)' }}>$7/mo</td>
                <td style={{ textAlign:'center', padding:'12px 16px', color:'var(--text-muted)' }}>Free</td>
                <td style={{ textAlign:'center', padding:'12px 16px', color:'var(--text-muted)' }}>Custom</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24, marginBottom:48, textAlign:'center' }}>
          {[['$82B+','AI Dev Tools Market'],['85%','Projects Lack Pre-Planning'],['46%','Fail Due to Poor Requirements'],['0','Tools Cover This Gap']].map(([v, l]) => (
            <div key={l} style={card}>
              <div style={{ fontSize:28, fontWeight:900, color:'#6366f1' }}>{v}</div>
              <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ ...card, textAlign:'center', padding:32 }}>
          <h3 style={{ fontSize:18, fontWeight:700, marginBottom:20, color:'var(--text-accent)' }}>The Missing Layer</h3>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
            {['💡 Idea','🧠 Gita AI Engine','⚡ Code Generators','🚀 Production'].map((step, i) => (
              <div key={step} style={{ display:'flex', alignItems:'center', gap:16 }}>
                <div style={{ background:'var(--bg-tertiary)', borderRadius:12, padding:'12px 20px', fontWeight:600, fontSize:14, border:'1px solid var(--border-primary)' }}>{step}</div>
                {i < 3 && <ChevronRight size={20} color="var(--text-muted)" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 9. WHO IS IT FOR ═══════════════ */}
      <section style={{ ...section, background:'var(--bg-secondary)' }}>
        <div style={{ textAlign:'center' }}>
          <h2 style={heading}>Who Is It For?</h2>
          <p style={subhead}>Built for everyone in the software development lifecycle.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:24 }}>
          {AUDIENCE.map(a => (
            <div key={a.title} style={card}>
              <div style={{ fontSize:42, marginBottom:12 }}>{a.emoji}</div>
              <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>{a.title}</h3>
              <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.6, marginBottom:16 }}>{a.desc}</p>
              {a.features.map(f => (
                <div key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                  <CheckCircle2 size={14} color="#10b981" />
                  <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{f}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ 10. ABOUT COMPANY ═══════════════ */}
      <section style={section}>
        <div style={{ textAlign:'center' }}>
          <h2 style={heading}>About Algo IQ Software Solutions</h2>
          <p style={subhead}>Building intelligent software solutions for the modern enterprise.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:24 }}>
          <div style={card}>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:16, color:'#6366f1' }}>Our Products</h3>
            {COMPANY_PRODUCTS.map(p => (
              <div key={p} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <CheckCircle2 size={14} color="#6366f1" />
                <span style={{ fontSize:14, color:'var(--text-secondary)' }}>{p}</span>
              </div>
            ))}
          </div>
          <div style={card}>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:16, color:'#10b981' }}>Our Services</h3>
            {COMPANY_SERVICES.map(s => (
              <div key={s} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <CheckCircle2 size={14} color="#10b981" />
                <span style={{ fontSize:14, color:'var(--text-secondary)' }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={card}>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:16, color:'#f59e0b' }}>Why Trust Us</h3>
            {COMPANY_TRUST.map(t => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <CheckCircle2 size={14} color="#f59e0b" />
                <span style={{ fontSize:14, color:'var(--text-secondary)' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 11. 15 BENEFITS ═══════════════ */}
      <section style={{ ...section, background:'var(--bg-secondary)' }}>
        <div style={{ textAlign:'center' }}>
          <h2 style={heading}>15 Reasons to Choose Gita Engine</h2>
          <p style={subhead}>Every benefit backed by real metrics and measurable outcomes.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:20 }}>
          {BENEFITS.map(b => (
            <div key={b.title} style={{ ...card, padding:20 }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{b.emoji}</div>
              <h3 style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>{b.title}</h3>
              <p style={{ color:'var(--text-secondary)', fontSize:13, lineHeight:1.5 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ 12. SHOW STOPPERS ═══════════════ */}
      <section style={section}>
        <div style={{ textAlign:'center' }}>
          <h2 style={heading}>10 Industry Show-Stoppers — All Solved</h2>
          <p style={subhead}>The biggest challenges in AI-assisted development — and how we conquered them.</p>
        </div>
        <div style={grid2}>
          {SHOW_STOPPERS.map(s => (
            <div key={s.challenge} style={{ ...card, borderLeft:'4px solid #10b981' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <h3 style={{ fontSize:16, fontWeight:700, color:'#ef4444' }}>🚫 {s.challenge}</h3>
                <span style={{ fontSize:13, fontWeight:700, color:'#10b981' }}>{s.status}</span>
              </div>
              <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.6 }}>{s.solution}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ 13. COMPETITION DEEP DIVE ═══════════════ */}
      <section style={{ ...section, background:'var(--bg-secondary)' }}>
        <div style={{ textAlign:'center' }}>
          <h2 style={heading}>Competition Deep Dive</h2>
          <p style={subhead}>A detailed look at how Gita Engine stands apart from every competitor.</p>
        </div>
        <div style={grid2}>
          {COMP_DEEP.map(c => (
            <div key={c.name} style={{ ...card, borderTop:`3px solid ${c.color}` }}>
              <h3 style={{ fontSize:18, fontWeight:700, marginBottom:12, color:c.color }}>{c.name}</h3>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#ef4444', textTransform:'uppercase', marginBottom:4 }}>Where They Fall Short</div>
                <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6 }}>{c.short}</p>
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'#10b981', textTransform:'uppercase', marginBottom:4 }}>Our Edge</div>
                <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6 }}>{c.edge}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ 14. ENTERPRISE DEEP DIVE ═══════════════ */}
      <section style={section}>
        <div style={{ textAlign:'center' }}>
          <h2 style={heading}>Enterprise Deep Dive</h2>
          <p style={subhead}>Everything included in our enterprise intelligence platform.</p>
        </div>

        <div style={{ ...grid2, marginBottom:48 }}>
          <div style={{ ...card, borderTop:'3px solid #6366f1' }}>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:16, color:'#6366f1' }}>Free Tier</h3>
            <ul style={{ listStyle:'none', padding:0 }}>
              {['3 projects/month','Basic intelligence (5 modules)','Single platform output','Community support','Standard templates'].map(f => (
                <li key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, fontSize:14, color:'var(--text-secondary)' }}>
                  <CheckCircle2 size={14} color="var(--text-muted)" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ ...card, borderTop:'3px solid #f59e0b' }}>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:16, color:'#f59e0b' }}>Enterprise</h3>
            <ul style={{ listStyle:'none', padding:0 }}>
              {['Unlimited projects','Full 27-step intelligence','9 platform outputs','40+ Pro Tools','Team collaboration','SSO & API access','Custom compliance','Dedicated support'].map(f => (
                <li key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, fontSize:14, color:'var(--text-secondary)' }}>
                  <CheckCircle2 size={14} color="#f59e0b" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h3 style={{ fontSize:22, fontWeight:700, textAlign:'center', marginBottom:24 }}>40+ Pro Tool Modules</h3>
        <div style={grid3}>
          {ENTERPRISE_TOOLS.map(t => (
            <div key={t.cat} style={card}>
              <h4 style={{ fontSize:16, fontWeight:700, marginBottom:12, color:'#6366f1' }}>{t.cat}</h4>
              {t.items.map(item => (
                <div key={item} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                  <CheckCircle2 size={12} color="#10b981" />
                  <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <h3 style={{ fontSize:22, fontWeight:700, textAlign:'center', margin:'48px 0 24px' }}>27-Step Auto Intelligence</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
          {AUTO_INTEL_STEPS.map((s, i) => (
            <div key={s} style={{ ...card, padding:14, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#6366f1', minWidth:24 }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{s}</span>
            </div>
          ))}
        </div>

        <div style={{ ...card, marginTop:48, textAlign:'center', padding:32 }}>
          <h3 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>ROI Calculator</h3>
          <p style={{ color:'var(--text-secondary)', fontSize:15, marginBottom:16 }}>Enterprise customers save an average of:</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
            {[['₹15L+','Annual Dev Cost Savings'],['2,400+','Developer Hours Saved'],['90%','Fewer AI Token Costs']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize:32, fontWeight:900, color:'#10b981' }}>{v}</div>
                <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 15. PRICING ═══════════════ */}
      <section id="pricing" style={{ ...section, background:'var(--bg-secondary)' }}>
        <div style={{ textAlign:'center' }}>
          <h2 style={heading}>Simple, Transparent Pricing</h2>
          <p style={subhead}>Start free. Scale when you&apos;re ready. No hidden fees.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:24, marginBottom:48 }}>
          {PRICING.map(p => (
            <div key={p.name} style={{ ...card, borderTop:`3px solid ${p.color}`, position:'relative', textAlign:'center' }}>
              {p.popular && <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#f59e0b,#ec4899)', color:'#fff', fontSize:12, fontWeight:700, padding:'4px 16px', borderRadius:20 }}>Most Popular</div>}
              <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8, marginTop:p.popular ? 8 : 0 }}>{p.name}</h3>
              <div style={{ fontSize:36, fontWeight:900, color:p.color }}>{p.price}<span style={{ fontSize:14, fontWeight:400, color:'var(--text-muted)' }}>{p.period}</span></div>
              {p.name === 'Enterprise Yearly' && <div style={{ fontSize:13, color:'#10b981', fontWeight:600, marginTop:4 }}>Save 17% vs Monthly</div>}
              <div style={{ margin:'20px 0', borderTop:'1px solid var(--border-primary)', paddingTop:20 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, justifyContent:'center' }}>
                    <CheckCircle2 size={14} color={p.color} />
                    <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button style={{ ...btn(p.color), width:'100%', justifyContent:'center' }} onClick={() => router.push('/login')}>{p.cta}</button>
            </div>
          ))}
        </div>

        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
            <thead>
              <tr style={{ borderBottom:'2px solid var(--border-primary)' }}>
                <th style={{ textAlign:'left', padding:'12px 16px', color:'var(--text-muted)' }}>Feature</th>
                {PRICING.map(p => <th key={p.name} style={{ padding:'12px 16px', color:p.color, fontWeight:700 }}>{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {['Projects','Intelligence Modules','Platform Outputs','AI Personalities','Templates','Support','API Access','Team Seats'].map((feat, i) => {
                const vals = [
                  ['3/mo','Unlimited','Unlimited','Unlimited'],
                  ['5 Basic','Full 27','Full 27','Full 27'],
                  ['1','9','9','9'],
                  ['1','7','7','7'],
                  ['Standard','Premium','Custom','Custom'],
                  ['Community','Priority','Dedicated','Dedicated'],
                  ['—','—','✅','✅'],
                  ['1','1','10','Unlimited'],
                ];
                return (
                  <tr key={feat} style={{ borderBottom:'1px solid var(--border-primary)' }}>
                    <td style={{ padding:'12px 16px', color:'var(--text-secondary)' }}>{feat}</td>
                    {vals[i].map((v, j) => <td key={j} style={{ textAlign:'center', padding:'12px 16px', color:'var(--text-secondary)' }}>{v}</td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════════ 16. KRISHNA IMAGES ═══════════════ */}
      <section style={section}>
        <div style={{ textAlign:'center' }}>
          <h2 style={heading}>Divine Inspiration Gallery</h2>
          <p style={subhead}>The wisdom of Lord Krishna — visualized for the modern developer.</p>
        </div>
        <div style={grid3}>
          {KRISHNA_CARDS.map(k => (
            <div key={k.ch} style={{ ...card, textAlign:'center', overflow:'hidden' }}>
              <div style={{ width:'100%', height:240, borderRadius:12, overflow:'hidden', marginBottom:16, background:'var(--bg-tertiary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <img src={k.img} alt={k.ch} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
              <p style={{ fontStyle:'italic', color:'#d4af37', fontSize:15, marginBottom:8, lineHeight:1.5 }}>{k.shloka}</p>
              <p style={{ fontSize:13, color:'var(--text-muted)' }}>{k.ch}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ 17. WHY THE NAME ═══════════════ */}
      <section style={{ ...section, background:'var(--bg-secondary)' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <p style={{ fontSize:36, fontWeight:900, color:'#d4af37', fontStyle:'italic', marginBottom:16 }}>योगः कर्मसु कौशलम्</p>
          <p style={{ fontSize:18, color:'var(--text-secondary)', maxWidth:600, margin:'0 auto' }}>
            &quot;Yoga is excellence in action&quot; — This single shloka encapsulates our entire philosophy. We named our engine after the Bhagavad Gita because it represents the ultimate guide to making right decisions under complexity.
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:24, marginBottom:48 }}>
          {[
            { icon:'🧘', title:'Discipline', desc:'Structured processes over chaotic coding' },
            { icon:'🎯', title:'Focus', desc:'Clear objectives before implementation' },
            { icon:'⚖️', title:'Balance', desc:'Speed and quality in perfect equilibrium' },
            { icon:'🔮', title:'Vision', desc:'See the full picture before writing line one' },
          ].map(p => (
            <div key={p.title} style={{ ...card, textAlign:'center' }}>
              <div style={{ fontSize:36, marginBottom:12 }}>{p.icon}</div>
              <h3 style={{ fontSize:17, fontWeight:700, marginBottom:8 }}>{p.title}</h3>
              <p style={{ color:'var(--text-secondary)', fontSize:14 }}>{p.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ ...card, padding:32, marginBottom:48 }}>
          <h3 style={{ fontSize:20, fontWeight:700, textAlign:'center', marginBottom:24 }}>The Krishna-Arjuna Metaphor</h3>
          <div style={grid2}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:42, marginBottom:8 }}>🙏</div>
              <h4 style={{ fontSize:16, fontWeight:700, color:'#d4af37', marginBottom:8 }}>Krishna (AI Engine)</h4>
              <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.6 }}>The all-knowing advisor who sees every dimension, every risk, every opportunity. Provides wisdom without imposing — lets the warrior make the final call.</p>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:42, marginBottom:8 }}>🏹</div>
              <h4 style={{ fontSize:16, fontWeight:700, color:'#6366f1', marginBottom:8 }}>Arjuna (Developer)</h4>
              <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.6 }}>The skilled warrior who has the talent but needs clarity of purpose. With the right guidance, transforms from hesitant to unstoppable.</p>
            </div>
          </div>
        </div>

        <div style={{ textAlign:'center', padding:'32px 24px', background:'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(212,175,55,0.08))', borderRadius:16 }}>
          <h3 style={{ fontSize:20, fontWeight:700, marginBottom:12 }}>Our Mission</h3>
          <p style={{ color:'var(--text-secondary)', fontSize:16, lineHeight:1.7, maxWidth:700, margin:'0 auto' }}>
            To bridge the gap between an idea and its execution — ensuring every software project starts with the intelligence, clarity, and strategic depth that the Bhagavad Gita teaches. We believe that excellence in preparation is the foundation of excellence in action.
          </p>
        </div>
      </section>

      {/* ═══════════════ 18. FAQ + CTA + FOOTER ═══════════════ */}
      <section id="faq" style={section}>
        <div style={{ textAlign:'center' }}>
          <h2 style={heading}>Frequently Asked Questions</h2>
          <p style={subhead}>Everything you need to know about the Gita Engine.</p>
        </div>
        <div style={{ maxWidth:800, margin:'0 auto 64px' }}>
          {FAQ_ITEMS.map((faq, i) => (
            <div key={i} style={{ borderBottom:'1px solid var(--border-primary)', marginBottom:4 }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 0', background:'none', border:'none', cursor:'pointer', color:'var(--text-primary)', fontSize:16, fontWeight:600, textAlign:'left' }}
              >
                {faq.q}
                <ChevronDown size={20} style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition:'transform .2s', color:'var(--text-muted)', flexShrink:0, marginLeft:12 }} />
              </button>
              {openFaq === i && (
                <p style={{ padding:'0 0 18px', color:'var(--text-secondary)', fontSize:15, lineHeight:1.7 }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign:'center', padding:'64px 32px', background:'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.12))', borderRadius:24, border:'1px solid rgba(99,102,241,0.2)', marginBottom:64 }}>
          <h2 style={{ fontSize:36, fontWeight:900, marginBottom:16 }}>Ready to Build Smarter?</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:18, marginBottom:32, maxWidth:500, margin:'0 auto 32px' }}>
            Join 2000+ developers who have transformed their software development process with the power of Gita-inspired intelligence.
          </p>
          <div style={{ display:'flex', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
            <Link href="/login" style={btn('linear-gradient(135deg,#6366f1,#8b5cf6)')}>Start Free Today <ArrowRight size={18} /></Link>
            <a href="https://www.algoanalytiq.com" target="_blank" rel="noopener noreferrer" style={{ ...btn('transparent'), border:'1px solid var(--border-primary)', color:'var(--text-primary)', textDecoration:'none' }}>Learn About Algo IQ <ExternalLink size={16} /></a>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ borderTop:'1px solid var(--border-primary)', paddingTop:48 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:32, marginBottom:48 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <div style={{ width:36, height:36, borderRadius:8, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Sparkles size={18} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>Bhagvat Gita Engine</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>by Algo IQ Software Solutions</div>
                </div>
              </div>
              <p style={{ color:'var(--text-secondary)', fontSize:13, lineHeight:1.6 }}>
                Transforming software development with the wisdom of the Bhagavad Gita and the power of artificial intelligence.
              </p>
            </div>
            <div>
              <h4 style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Product</h4>
              {['Features','Pipeline','Pricing','Case Studies'].map(l => (
                <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(' ','-'))} style={{ display:'block', background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer', fontSize:13, marginBottom:8, padding:0 }}>{l}</button>
              ))}
            </div>
            <div>
              <h4 style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Wisdom</h4>
              {['Gita Wisdom','Why Gita?','Krishna Gallery','FAQ'].map(l => (
                <button key={l} onClick={() => scrollTo(sectionIds[l] || l.toLowerCase().replace(' ','-'))} style={{ display:'block', background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer', fontSize:13, marginBottom:8, padding:0 }}>{l}</button>
              ))}
            </div>
            <div>
              <h4 style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Company</h4>
              <a href="https://www.algoanalytiq.com" target="_blank" rel="noopener noreferrer" style={{ display:'block', color:'var(--text-secondary)', fontSize:13, marginBottom:8, textDecoration:'none' }}>Algo IQ Website</a>
              <Link href="/login" style={{ display:'block', color:'var(--text-secondary)', fontSize:13, marginBottom:8, textDecoration:'none' }}>Sign In</Link>
              <a href="mailto:contact@algoanalytiq.com" style={{ display:'block', color:'var(--text-secondary)', fontSize:13, marginBottom:8, textDecoration:'none' }}>Contact Us</a>
            </div>
          </div>
          <div style={{ borderTop:'1px solid var(--border-primary)', paddingTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
            <p style={{ fontSize:13, color:'var(--text-muted)' }}>© 2024 Algo IQ Software Solutions. All rights reserved.</p>
            <p style={{ fontSize:13, color:'var(--text-muted)' }}>Built with ❤️ and the wisdom of the Bhagavad Gita</p>
          </div>
        </footer>
      </section>
    </div>
  );
}
