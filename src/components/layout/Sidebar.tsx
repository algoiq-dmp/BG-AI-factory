'use client';

/**
 * @file Sidebar Navigation
 * @description Collapsible sidebar with section accordions, nav items with active states,
 *              NEW badges, CHANGE OPS section, PRO TOOLS section, and user profile footer.
 *              Connected to NextAuth session for real user data and working logout.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useOsStore } from '@/store/useOsStore';
import {
  Award, Eye, Users, Target, Box,
  ChevronRight, ChevronDown,
  ShieldCheck, FlaskConical, Rocket, Mic, Files, History, Clock,
  Sparkles, Brain, PanelLeftClose, UserCircle, BrainCircuit, Terminal,
  Layers, FileText, Search, Calculator, LayoutPanelLeft, FileEdit, GitBranch, Globe, Database, LayoutDashboard, Monitor,
  Book, Settings, HelpCircle, Wand2, Shield, Bug, ClipboardList, BarChart3, Zap, Wrench, GitCommit,
  LogOut, Network
} from 'lucide-react';

interface NavSection {
  title: string;
  icon?: any;
  color: string;
  defaultOpen: boolean;
  enterpriseOnly?: boolean;
  items: Array<{ name: string; href: string; icon: any; badge?: string }>;
}

const sections: NavSection[] = [
  {
    title: 'IDEATION', icon: Sparkles, color: '#f59e0b', defaultOpen: true,
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'My Projects', href: '/projects', icon: Files },
      { name: 'Start Project', href: '/start', icon: Sparkles },
      { name: 'Geeta Guidance', href: '/geeta-guidance', icon: Eye },
    ],
  },
  {
    title: 'BUILD KB', icon: Database, color: '#6366f1', defaultOpen: false,
    items: [
      { name: 'AI Suggestions', href: '/mcq', icon: HelpCircle },
      { name: 'Knowledgebase', href: '/knowledgebase', icon: Book },
    ],
  },
  {
    title: 'AUTO INTEL', icon: BrainCircuit, color: '#8b5cf6', defaultOpen: false,
    items: [
      { name: 'Project Summary', href: '/summary', icon: FileText },
      { name: 'Auto Intelligence', href: '/auto-intelligence', icon: BrainCircuit },
    ],
  },
  {
    title: 'REQUIREMENTS', icon: Target, color: '#ec4899', defaultOpen: false,
    items: [
      { name: 'Requirement Intel', href: '/analysis', icon: Target },
      { name: 'User Stories', href: '/board', icon: LayoutDashboard },
      { name: 'Competitive Analysis', href: '/competitive-analysis', icon: Search },
      { name: 'Feature Engine', href: '/feature-engine', icon: Settings },
    ],
  },
  {
    title: 'ARCHITECTURE', icon: Layers, color: '#10b981', defaultOpen: false,
    items: [
      { name: 'Solution Architect', href: '/architecture', icon: Layers },
      { name: 'API Blueprint', href: '/backend-ai', icon: Database },
      { name: 'Database Designer', href: '/database-ai', icon: Database },
      { name: 'Frontend AI', href: '/frontend-ai', icon: Monitor },
      { name: 'Project Hub', href: '/hub', icon: LayoutPanelLeft },
      { name: 'Execution Studio', href: '/execution-studio', icon: Terminal },
    ],
  },
  {
    title: 'PLANNING', icon: Calculator, color: '#f97316', defaultOpen: false,
    items: [
      { name: 'Skills Analyzer', href: '/skills-analyzer', icon: Award },
      { name: 'Risk Analyzer', href: '/risk-analyzer', icon: ShieldCheck },
      { name: 'Quality Swarm', href: '/quality-swarm', icon: Users },
    ],
  },
  {
    title: 'EXECUTION', icon: Rocket, color: '#5b5fd8', defaultOpen: false,
    items: [
      { name: 'Execution Plan', href: '/execution-plan', icon: ClipboardList, badge: 'NEW' },
      { name: 'Agent Swarm', href: '/test-project/agent-swarm', icon: Network },
      { name: 'Task Breakdown', href: '/task-breakdown', icon: FileText },
    ],
  },
  {
    title: 'PROMPTS', icon: Wand2, color: '#3b82f6', defaultOpen: false,
    items: [
      { name: 'Prompt Compiler', href: '/prompt-compiler', icon: Layers },
      { name: 'Phase Prompts', href: '/phase-prompts', icon: FileEdit },
      { name: 'Prompt Workshop', href: '/prompts', icon: Wand2 },
    ],
  },
  {
    title: 'TESTING', icon: FlaskConical, color: '#ef4444', defaultOpen: false,
    items: [
      { name: 'Testing AI', href: '/testing-ai', icon: FlaskConical },
      { name: 'Code Review AI', href: '/code-review', icon: Eye },
      { name: 'Quality Dashboard', href: '/quality-dashboard', icon: ShieldCheck },
      { name: 'Monitoring AI', href: '/monitoring', icon: Monitor },
    ],
  },
  {
    title: 'DOCS', icon: Files, color: '#06b6d4', defaultOpen: false,
    items: [
      { name: 'Documentation AI', href: '/documentation-ai', icon: FileText },
      { name: 'Documents', href: '/documents', icon: Files },
      { name: 'Activity Log', href: '/activity', icon: History },
    ],
  },
  {
    title: 'CHANGE OPS', icon: GitBranch, color: '#f59e0b', defaultOpen: false, enterpriseOnly: true,
    items: [
      { name: 'CR Dashboard', href: '/cr-dashboard', icon: BarChart3 },
      { name: 'File CR / Bug', href: '/file-cr-bug', icon: Bug },
      { name: 'Requirements Vault', href: '/requirements-vault', icon: ClipboardList },
      { name: 'Impact Analysis', href: '/impact-analysis', icon: Zap },
      { name: 'Fix Prompts', href: '/fix-prompts', icon: Wrench },
      { name: 'CR Testing', href: '/cr-testing', icon: FlaskConical },
    ],
  },
  {
    title: 'OS COMMAND CENTER', icon: Monitor, color: '#06b6d4', defaultOpen: true, enterpriseOnly: true,
    items: [
      { name: 'PIKB Governance', href: '/os/pikb-dashboard', icon: Database, badge: 'CORE' },
      { name: 'Work Analytics', href: '/os/work-analytics', icon: BarChart3, badge: 'NEW' },
      { name: 'Executive Dashboard', href: '/os/executive-dashboard', icon: LayoutDashboard },
      { name: 'Team Intelligence', href: '/os/team-intelligence', icon: Users },
    ],
  },
  {
    title: 'DEPLOY', icon: Globe, color: '#a855f7', defaultOpen: false,
    items: [
      { name: 'Deployment AI', href: '/deployment', icon: Rocket },
      { name: 'Pricing', href: '/pricing', icon: Book },
    ],
  },
  {
    title: 'SYSTEM', icon: Settings, color: '#64748b', defaultOpen: false,
    items: [
      { name: 'Krishna AI Chat', href: '/chat', icon: Brain },
      { name: 'Swarm Config', href: '/test-project/settings', icon: Settings },
      { name: 'Settings', href: '/settings', icon: Settings },
      { name: 'Help Guide', href: '/help-guide', icon: Eye },
      { name: 'FAQ', href: '/faq', icon: Target },
    ],
  },
];

const proToolItems = [
  { name: 'Admin Panel', href: '/admin', icon: Shield },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { mode } = useOsStore();
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(sections.map(s => [s.title, s.defaultOpen]))
  );

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (href: string) => pathname === href || (pathname.startsWith(href) && href !== '/');

  if (collapsed) {
    return (
      <div className="w-[60px] h-screen flex flex-col bg-[#0b0e14] border-r border-[#1e2532] items-center py-4">
        <button onClick={() => setCollapsed(false)} className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4a4fcf] to-[#2a2c7a] flex items-center justify-center mb-4 cursor-pointer">
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </button>
        {sections.slice(0, 4).flatMap(s => s.items.slice(0, 2)).map((item, i) => (
          <Link key={i} href={item.href} title={item.name} className={`w-9 h-9 rounded-lg flex items-center justify-center mb-1 transition-all ${isActive(item.href) ? 'bg-[#1a1b3b] text-[#10b981]' : 'text-[#586c8f] hover:text-white hover:bg-white/5'}`}>
            <item.icon className="w-4 h-4" />
          </Link>
        ))}
        <button onClick={() => setCollapsed(false)} className="mt-auto w-9 h-9 rounded-lg flex items-center justify-center text-[#586c8f] hover:text-white transition-all cursor-pointer">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-[240px] h-screen flex flex-col bg-[#0b0e14] border-r border-[#1e2532] text-[#8b9bb4] font-sans flex-shrink-0">
      {/* Header */}
      <div className="p-4 pb-3 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4a4fcf] to-[#2a2c7a] flex items-center justify-center shadow-lg border border-[#5b5fd8]/30 flex-shrink-0">
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="min-w-0">
          <h1 className="text-[15px] font-extrabold text-white leading-tight truncate">Launch IQ</h1>
          <p className="text-[10px] text-[#586c8f] font-medium truncate">Platform — From Thought to S...</p>
        </div>
      </div>

      {/* Scrollable Nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {sections.filter(s => mode === 'ENTERPRISE' || !s.enterpriseOnly).map(section => (
          <div key={section.title}>
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between px-4 py-2 mt-1 text-[10px] font-extrabold uppercase tracking-[1.5px] hover:text-white transition-colors cursor-pointer"
              style={{ color: openSections[section.title] ? section.color : '#586c8f' }}
            >
              <div className="flex items-center gap-2">
                {section.icon && <section.icon className="w-3.5 h-3.5" />}
                <span>{section.title}</span>
              </div>
              {openSections[section.title]
                ? <ChevronDown className="w-3 h-3" />
                : <ChevronRight className="w-3 h-3" />
              }
            </button>
            {openSections[section.title] && (
              <div className="pb-1">
                {section.items.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-[7px] transition-all text-[13px] relative group ${
                      isActive(item.href)
                        ? 'bg-[#1a1b3b] text-white border-l-2 border-[#10b981]'
                        : 'text-[#8b9bb4] hover:text-white hover:bg-white/[0.03] border-l-2 border-transparent'
                    }`}
                  >
                    <item.icon className={`w-[14px] h-[14px] flex-shrink-0 ${isActive(item.href) ? 'text-[#10b981]' : 'text-[#586c8f] group-hover:text-white'}`} />
                    <span className="font-semibold truncate">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#10b981]/15 text-[#10b981]">{item.badge}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* PRO TOOLS Section */}
        <div className="mt-1 border-t border-[#1e2532] pt-1">
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#586c8f]">PRO TOOLS</span>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b]">43</span>
          </div>
          {proToolItems.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-[7px] text-[13px] transition-all ${
                isActive(item.href)
                  ? 'bg-[#1a1b3b] text-white border-l-2 border-[#10b981]'
                  : 'text-[#ef4444] hover:text-white hover:bg-white/[0.03] border-l-2 border-transparent'
              }`}
            >
              <item.icon className="w-[14px] h-[14px] flex-shrink-0" />
              <span className="font-semibold">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#1e2532] mt-auto">
        <button
          onClick={() => setCollapsed(true)}
          className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-[#8b9bb4] hover:text-white transition-colors cursor-pointer"
        >
          <PanelLeftClose className="w-4 h-4 text-[#586c8f]" />
          Collapse
        </button>

        <div className="px-4 py-3 flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#f59e0b] flex items-center justify-center text-black font-extrabold text-xs border-2 border-[#0b0e14]">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-[#0b0e14]" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[13px] font-bold text-white truncate">{session?.user?.name || 'Guest'}</span>
            <span className="text-[9px] text-[#586c8f] font-bold uppercase tracking-wider">{(session?.user as any)?.role || 'user'}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#586c8f] hover:text-red-400 transition-all cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
