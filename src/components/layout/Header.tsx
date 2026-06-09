'use client';

/**
 * @file Top Header Bar
 * @description Global header with breadcrumbs, search (Ctrl+K), Krishna mode selector
 *              (connected to Zustand store with auto-switch), project switcher,
 *              save button, AI status badge, and working logout.
 */
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Search, ChevronRight, Save, FolderOpen, LogOut,
  Zap, Command, Check, Loader2, Box, Database
} from 'lucide-react';
import { useGitaModesStore, GITA_MODES } from '@/store/useGitaModesStore';
import { useOsStore } from '@/store/useOsStore';

/** Route-to-label mapping for breadcrumbs */
const ROUTE_LABELS: Record<string, string> = {
  '/': 'Dashboard', '/start': 'Start Project', '/projects': 'My Projects',
  '/analysis': 'AI Analysis', '/mcq': 'MCQ Quiz', '/summary': 'Project Summary',
  '/phase-prompts': 'Phase Prompts', '/prompt-compiler': 'Prompt Compiler',
  '/prompts': 'Prompt Workshop', '/auto-intelligence': 'Auto Intelligence',
  '/competitive-analysis': 'Competitive Analysis', '/knowledgebase': 'Knowledgebase',
  '/feature-engine': 'Feature Engine', '/risk-analyzer': 'Risk Analyzer',
  '/skills-analyzer': 'Skills Analyzer', '/hub': 'Project Hub',
  '/documents': 'Documents', '/board': 'Kanban Board',
  '/execution-studio': 'Execution Studio', '/quality-swarm': 'Quality Swarm',
  '/pipeline': 'Pipeline', '/architecture': 'Architecture AI',
  '/task-breakdown': 'Task Breakdown', '/frontend-ai': 'Frontend AI',
  '/backend-ai': 'Backend AI', '/database-ai': 'Database AI',
  '/testing-ai': 'Testing AI', '/documentation-ai': 'Documentation AI',
  '/code-review': 'Code Review AI', '/deployment': 'Deployment AI',
  '/monitoring': 'Monitoring AI', '/quality-dashboard': 'Quality Dashboard',
  '/activity': 'Activity Log', '/chat': 'Krishna AI Chat',
  '/admin': 'Admin Panel', '/settings': 'Settings',
  '/geeta-guidance': 'Geeta Guidance', '/help-guide': 'Help Guide',
  '/faq': 'FAQ', '/home': 'Home', '/pricing': 'Pricing',
  '/cr-dashboard': 'CR Dashboard', '/file-cr-bug': 'File CR / Bug',
  '/requirements-vault': 'Requirements Vault', '/impact-analysis': 'Impact Analysis',
  '/fix-prompts': 'Fix Prompts', '/cr-testing': 'CR Testing',
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modeOpen, setModeOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);

  // Gita Modes from Zustand store
  const { activeMode, autoModeEnabled, setMode, getAutoModeForPage } = useGitaModesStore();
  const gitaMode = GITA_MODES[activeMode] || GITA_MODES.krishna;

  // OS Mode from Zustand store
  const { mode: osMode, toggleMode } = useOsStore();

  // Get breadcrumb label
  const currentLabel = ROUTE_LABELS[pathname] || pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Page';

  // DB Health Status
  const [dbStatus, setDbStatus] = useState<'loading' | 'connected' | 'error'>('loading');

  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await fetch('/api/health/db');
        if (res.ok) setDbStatus('connected');
        else setDbStatus('error');
      } catch (e) {
        setDbStatus('error');
      }
    };
    checkDb();
    const interval = setInterval(checkDb, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // Auto-switch mode based on current page
  useEffect(() => {
    if (autoModeEnabled) {
      const bestMode = getAutoModeForPage(pathname);
      if (bestMode !== activeMode) {
        setMode(bestMode);
      }
    }
  }, [pathname, autoModeEnabled, activeMode, setMode, getAutoModeForPage]);

  // Ctrl+K handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setModeOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) {
        setModeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search navigation
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const match = Object.entries(ROUTE_LABELS).find(([, label]) =>
      label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (match) {
      router.push(match[0]);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      <header className="h-[52px] flex items-center justify-between px-5 border-b border-[#1e2532] bg-[#0b0e14]/95 backdrop-blur-md flex-shrink-0 z-50">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="font-bold text-white truncate">Bhagvat Gita</span>
          <ChevronRight className="w-3 h-3 text-[#586c8f] flex-shrink-0" />
          <span className="font-semibold text-[#8b9bb4] truncate">{currentLabel}</span>
        </div>

        {/* Center: Search */}
        <button
          onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 100); }}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1e2532] bg-[#0f1218] hover:border-[#5b5fd8]/30 transition-all cursor-pointer min-w-[220px] max-w-[320px]"
        >
          <Search className="w-3.5 h-3.5 text-[#586c8f]" />
          <span className="text-xs text-[#586c8f] flex-1 text-left">Search pages...</span>
          <kbd className="text-[9px] text-[#586c8f] bg-[#1e2532] px-1.5 py-0.5 rounded font-mono">Ctrl+K</kbd>
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* OS Mode Toggle */}
          <button
            onClick={toggleMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e2532] hover:border-[#a855f7]/30 transition-all cursor-pointer mr-2 relative overflow-hidden group"
            title={`Currently in ${osMode === 'STARTUP' ? 'Startup' : 'Enterprise'} Mode`}
          >
            {/* Animated background pulse for Enterprise mode */}
            {osMode === 'ENTERPRISE' && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#a855f7]/10 to-[#6366f1]/10 animate-pulse" />
            )}
            
            <div className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center transition-colors ${osMode === 'STARTUP' ? 'bg-[#f59e0b]' : 'bg-[#a855f7]'}`}>
              {osMode === 'STARTUP' ? <Zap className="w-2.5 h-2.5 text-black" /> : <Box className="w-2.5 h-2.5 text-white" />}
            </div>
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${osMode === 'STARTUP' ? 'text-[#f59e0b]' : 'text-[#a855f7]'}`}>
              {osMode === 'STARTUP' ? 'Startup' : 'Enterprise'}
            </span>
          </button>

          {/* Krishna Mode — Connected to Zustand Store */}
          <div className="relative" ref={modeRef}>
            <button
              onClick={() => setModeOpen(!modeOpen)}
              aria-label="Select Gita mode"
              aria-expanded={modeOpen}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#1e2532] hover:border-[#5b5fd8]/30 transition-all cursor-pointer"
              style={{ borderColor: `${gitaMode.color}30`, background: `${gitaMode.color}08` }}
            >
              <span className="text-sm">{gitaMode.emoji}</span>
              <span className="text-xs font-bold" style={{ color: gitaMode.color }}>{gitaMode.name}</span>
              <ChevronRight className="w-3 h-3 text-[#586c8f] rotate-90" />
            </button>
            {modeOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] w-64 bg-[#111622] border border-[#1e2532] rounded-xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-2.5 border-b border-[#1e2532] flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#586c8f]">🕉️ Gita Mode</span>
                  <span className="text-[10px] font-medium text-[#586c8f]">
                    {autoModeEnabled ? '⚡ Auto' : '🔧 Manual'}
                  </span>
                </div>
                {Object.values(GITA_MODES).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMode(m.id); setModeOpen(false); }}
                    className={`w-full px-3 py-2.5 text-left flex items-center gap-2.5 transition-all cursor-pointer ${m.id === activeMode ? 'bg-white/5' : 'hover:bg-white/[0.03]'}`}
                    style={{ borderLeft: m.id === activeMode ? `3px solid ${m.color}` : '3px solid transparent' }}
                  >
                    <span className="text-lg">{m.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold" style={{ color: m.id === activeMode ? m.color : '#e8eaf6' }}>{m.name}</div>
                      <div className="text-[10px] text-[#586c8f]">{m.title}</div>
                    </div>
                    {m.id === activeMode && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Projects */}
          <button
            onClick={() => router.push('/projects')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#1e2532] hover:border-[#5b5fd8]/30 text-[#8b9bb4] hover:text-white transition-all cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold hidden lg:inline">Projects</span>
          </button>

          {/* Save */}
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#1e2532] hover:border-[#10b981]/30 text-[#8b9bb4] hover:text-[#10b981] transition-all cursor-pointer">
            <Save className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold hidden lg:inline">Save</span>
          </button>

          {/* AI Connected Badge */}
          <div 
            className="flex items-center justify-center p-2 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 cursor-help"
            title="AI Connected"
          >
            <Zap className="w-4 h-4 text-[#10b981]" />
          </div>

          {/* DB Status Badge */}
          <div 
            className={`flex items-center justify-center p-2 rounded-lg border cursor-help ${
              dbStatus === 'connected' ? 'bg-[#10b981]/10 border-[#10b981]/20' : 
              dbStatus === 'error' ? 'bg-[#ef4444]/10 border-[#ef4444]/20' : 
              'bg-[#f59e0b]/10 border-[#f59e0b]/20'
            }`}
            title={dbStatus === 'connected' ? 'DB Connected' : dbStatus === 'error' ? 'DB Disconnected' : 'Checking DB...'}
          >
            <Database className={`w-4 h-4 ${
              dbStatus === 'connected' ? 'text-[#10b981]' : 
              dbStatus === 'error' ? 'text-[#ef4444]' : 
              'text-[#f59e0b] animate-pulse'
            }`} />
          </div>

          {/* Logout — FIXED: Now actually calls signOut */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg border border-[#1e2532] hover:border-red-500/30 text-[#586c8f] hover:text-red-400 transition-all cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]" 
          onClick={() => setSearchOpen(false)}
          role="dialog"
          aria-modal="true"
          id="search-dialog"
          aria-label="Search navigation"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg mx-4 bg-[#111622] border border-[#1e2532] rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e2532]">
              <Search className="w-4 h-4 text-[#586c8f]" />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                placeholder="Search pages, tools, features..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[#586c8f] outline-none"
              />
              <kbd className="text-[9px] text-[#586c8f] bg-[#1e2532] px-1.5 py-0.5 rounded font-mono">ESC</kbd>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              {Object.entries(ROUTE_LABELS)
                .filter(([, label]) => !searchQuery || label.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(0, 10)
                .map(([path, label]) => (
                  <button
                    key={path}
                    onClick={() => { router.push(path); setSearchOpen(false); setSearchQuery(''); }}
                    className="w-full px-3 py-2 text-left rounded-lg text-sm text-[#8b9bb4] hover:text-white hover:bg-white/5 flex items-center gap-3 transition-all cursor-pointer"
                  >
                    <Command className="w-3 h-3 text-[#586c8f]" />
                    <span className="font-medium">{label}</span>
                    <span className="text-[10px] text-[#586c8f] ml-auto font-mono">{path}</span>
                  </button>
                ))}
              {searchQuery && Object.entries(ROUTE_LABELS).filter(([, l]) => l.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-[#586c8f]">No pages match &quot;{searchQuery}&quot;</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
