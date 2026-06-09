'use client';

/**
 * @file Admin Panel
 * @description User & subscription management panel for admins.
 *              Matches the reference site design with plan approval, search, 
 *              stats cards, user table with Change Plan actions, and system tabs.
 */
import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Shield, Users, Activity, BarChart3, ScrollText, FolderOpen,
  Cpu, HardDrive, Clock, Database, Zap, Bot, Coins, Timer,
  CheckCircle2, XCircle, AlertTriangle, Info, Loader2, Sparkles,
  Mail, Crown, UserCheck, UserX, RefreshCcw, Search, ChevronDown,
  Star, ArrowRight, Edit3
} from 'lucide-react';

/* ─── Plan Config ─── */
const PLANS = [
  { name: 'Free', color: '#8b9bb4', bg: 'bg-[#1e2532]', border: 'border-[#1e2532]' },
  { name: 'Pro', color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { name: 'Enterprise Cloud', color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { name: 'Enterprise Self-Hosted', color: '#6366f1', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
];

const systemMetrics = [
  { label: 'CPU Usage', value: '34%', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', bar: 34 },
  { label: 'Memory', value: '6.2 / 16 GB', icon: Activity, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', bar: 39 },
  { label: 'Disk', value: '142 / 500 GB', icon: HardDrive, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', bar: 28 },
  { label: 'Uptime', value: '47d 12h 33m', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', bar: 99 },
  { label: 'DB Size', value: '2.8 GB', icon: Database, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30', bar: 14 },
  { label: 'API Latency', value: '42ms avg', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', bar: 8 },
];

const severityConfig = {
  success: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-500/20 text-red-400 border-red-500/30',
  DEVELOPER: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CLIENT: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'health' | 'logs'>('users');
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check admin access
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (data.success) {
        // Map users
        const mappedUsers = data.users.map((u: any) => ({
          id: u.id,
          name: u.name || 'Unknown',
          email: u.email,
          loginId: u.email.split('@')[0].toUpperCase(),
          role: u.role,
          plan: u.role === 'ADMIN' ? 'Enterprise Cloud' : 'Free', // Simulated plan mapping
          expires: 'Lifetime',
          status: 'active'
        }));
        setUsers(mappedUsers);

        // Map logs
        const mappedLogs = data.logs.map((log: any) => ({
          id: log.id,
          timestamp: new Date(log.createdAt).toLocaleString(),
          event: log.action + (log.details ? `: ${log.details}` : ''),
          severity: log.status === 'success' ? 'info' : (log.status === 'warning' ? 'warning' : 'error'),
          source: log.user?.email || 'system'
        }));
        setLogs(mappedLogs);
      } else {
        console.error("Failed to fetch admin data", data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats
  const totalUsers = users.length;
  const freeUsers = users.filter(u => u.plan === 'Free').length;
  const proUsers = users.filter(u => u.plan === 'Pro').length;
  const enterpriseUsers = users.filter(u => u.plan.startsWith('Enterprise')).length;

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.loginId.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const handleChangePlan = (userId: string, newPlan: string) => {
    // In a real app, send API request here to update the user tier/role
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, plan: newPlan } : u
    ));
    setChangingPlan(null);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleBackup = async () => {
    if (!confirm('Are you sure you want to trigger a manual database backup?')) return;
    setIsBackingUp(true);
    try {
      const res = await fetch('/api/admin/backup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Backup successful!\nSaved to: ${data.path}`);
      } else {
        alert(`Backup failed: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Backup error: ${err.message}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const tabs = [
    { id: 'users' as const, name: 'Users & Plans', icon: Users, count: totalUsers },
    { id: 'health' as const, name: 'System Health', icon: Activity, count: null },
    { id: 'logs' as const, name: 'Audit Logs', icon: ScrollText, count: logs.length },
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[50vh] bg-[#0b0e14]">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/30 flex items-center justify-center">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Panel</h1>
            <p className="text-[#8b9bb4] text-sm mt-1">Manage user subscriptions and plans</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleBackup} disabled={isBackingUp} className="bg-[#111622] hover:bg-[#1e2532] border border-[#1e2532] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 text-sm cursor-pointer">
            {isBackingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
            {isBackingUp ? 'Backing up...' : 'Backup DB'}
          </button>
          <button onClick={handleRefresh} disabled={isRefreshing} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 text-sm cursor-pointer">
            {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards — Matching Reference Screenshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-5 text-center">
          <Users className="w-6 h-6 text-[#586c8f] mx-auto mb-2" />
          <div className="text-3xl font-black text-indigo-400">{totalUsers}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#586c8f] font-bold mt-1">Total Users</div>
        </div>
        <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-5 text-center">
          <Sparkles className="w-6 h-6 text-[#586c8f] mx-auto mb-2" />
          <div className="text-3xl font-black text-[#8b9bb4]">{freeUsers}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#586c8f] font-bold mt-1">Free</div>
        </div>
        <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-5 text-center">
          <Crown className="w-6 h-6 text-[#586c8f] mx-auto mb-2" />
          <div className="text-3xl font-black text-amber-400">{proUsers}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#586c8f] font-bold mt-1">Pro</div>
        </div>
        <div className="bg-[#111622] border border-[#1e2532] rounded-xl p-5 text-center">
          <Star className="w-6 h-6 text-[#586c8f] mx-auto mb-2" />
          <div className="text-3xl font-black text-emerald-400">{enterpriseUsers}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#586c8f] font-bold mt-1">Enterprise</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 flex items-center gap-3 bg-[#111622] border border-[#1e2532] rounded-xl px-4 py-3">
          <Search className="w-4 h-4 text-[#586c8f]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or login ID..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#586c8f] outline-none"
          />
        </div>
        <button onClick={() => {}} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer">
          Search
        </button>
        <button onClick={handleRefresh} className="p-3 rounded-xl border border-[#1e2532] hover:border-indigo-500/30 text-[#586c8f] hover:text-white transition-all cursor-pointer">
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#0b0e14] border border-[#1e2532] rounded-lg p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === t.id ? 'bg-indigo-500/15 text-indigo-400' : 'text-[#586c8f] hover:text-white'}`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.name}
            {t.count !== null && <span className={`text-[10px] px-1.5 py-0.5 rounded ${activeTab === t.id ? 'bg-indigo-500/20' : 'bg-[#1e2532]'}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {/* ─── Users & Plans Tab ─── */}
        {activeTab === 'users' && (
          <div className="bg-[#0b0e14] border border-[#1e2532] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e2532]">
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#586c8f] font-bold">User</th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#586c8f] font-bold">Login ID</th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#586c8f] font-bold">Role</th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#586c8f] font-bold">Plan</th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#586c8f] font-bold">Expires</th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#586c8f] font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => {
                    const planConfig = PLANS.find(p => p.name === user.plan) || PLANS[0];
                    return (
                      <tr key={user.id} className="border-b border-[#1e2532]/50 hover:bg-[#111622]/50 transition-all">
                        {/* User */}
                        <td className="px-5 py-3">
                          <div className="font-bold text-sm text-white">{user.name}</div>
                          <div className="text-[11px] text-[#586c8f]">{user.email}</div>
                        </td>
                        {/* Login ID */}
                        <td className="px-5 py-3">
                          <span className="text-xs font-mono text-[#8b9bb4]">{user.loginId}</span>
                        </td>
                        {/* Role */}
                        <td className="px-5 py-3">
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${ROLE_COLORS[user.role] || ROLE_COLORS.DEVELOPER}`}>
                            {user.role}
                          </span>
                        </td>
                        {/* Plan */}
                        <td className="px-5 py-3">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-md border inline-flex items-center gap-1.5 ${planConfig.bg} ${planConfig.border}`}
                            style={{ color: planConfig.color }}
                          >
                            {user.plan === 'Enterprise Cloud' && <span className="text-emerald-400">●</span>}
                            {user.plan === 'Pro' && <span className="text-amber-400">●</span>}
                            {user.plan === 'Free' && <span className="text-[#586c8f]">■</span>}
                            {user.plan}
                          </span>
                        </td>
                        {/* Expires */}
                        <td className="px-5 py-3">
                          <span className="text-xs text-[#586c8f]">{user.expires}</span>
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-3 relative">
                          {changingPlan === user.id ? (
                            <div className="absolute right-4 top-1 z-50 bg-[#111622] border border-[#1e2532] rounded-xl shadow-2xl p-2 w-56 animate-in fade-in zoom-in-95 duration-150">
                              <div className="text-[10px] font-bold text-[#586c8f] uppercase tracking-wider px-2 py-1 mb-1">Select Plan</div>
                              {PLANS.map(plan => (
                                <button
                                  key={plan.name}
                                  onClick={() => handleChangePlan(user.id, plan.name)}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${user.plan === plan.name ? 'bg-white/5 text-white' : 'text-[#8b9bb4] hover:bg-white/[0.03] hover:text-white'}`}
                                >
                                  <span className="w-2 h-2 rounded-full" style={{ background: plan.color }} />
                                  {plan.name}
                                  {user.plan === plan.name && <CheckCircle2 className="w-3 h-3 text-green-400 ml-auto" />}
                                </button>
                              ))}
                              <button onClick={() => setChangingPlan(null)} className="w-full text-center px-3 py-1.5 mt-1 rounded-lg text-[10px] font-bold text-[#586c8f] hover:text-white transition-all cursor-pointer">Cancel</button>
                            </div>
                          ) : null}
                          <button
                            onClick={() => setChangingPlan(changingPlan === user.id ? null : user.id)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer flex items-center gap-1 transition-all"
                          >
                            <Edit3 className="w-3 h-3" />
                            Change Plan
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="p-12 text-center text-[#586c8f] text-sm">
                No users found matching &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        )}

        {/* ─── System Health Tab ─── */}
        {activeTab === 'health' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemMetrics.map(metric => (
              <div key={metric.label} className={`border rounded-xl p-5 ${metric.bg}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                    <span className="text-xs font-bold text-white">{metric.label}</span>
                  </div>
                  <span className={`text-lg font-black ${metric.color}`}>{metric.value}</span>
                </div>
                <div className="w-full h-2 bg-[#1e2532] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${metric.bar > 80 ? 'bg-red-500' : metric.bar > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${metric.bar}%` }} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-[#586c8f] font-bold">{metric.bar}% utilized</span>
                  <span className={`text-[10px] font-bold ${metric.bar > 80 ? 'text-red-400' : 'text-green-400'}`}>{metric.bar > 80 ? 'HIGH' : 'NORMAL'}</span>
                </div>
              </div>
            ))}
            <div className="md:col-span-2 lg:col-span-3 bg-[#0b0e14] border border-[#1e2532] rounded-xl p-5">
              <h3 className="text-xs font-bold text-[#586c8f] uppercase tracking-wider mb-4">Service Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {['API Gateway', 'Auth Service', 'AI Engine', 'DB Cluster', 'CDN Edge', 'Worker Pool'].map(service => (
                  <div key={service} className="bg-[#111622] border border-green-500/20 rounded-lg p-3 text-center">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <div className="text-[10px] font-bold text-white">{service}</div>
                    <div className="text-[9px] text-green-400 font-bold mt-0.5">OPERATIONAL</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Audit Logs Tab ─── */}
        {activeTab === 'logs' && (
          <div className="bg-[#0b0e14] border border-[#1e2532] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#1e2532] flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#586c8f] uppercase tracking-wider">Recent System Events</h3>
              <div className="flex gap-2">
                {Object.entries(severityConfig).map(([key, cfg]) => (
                  <span key={key} className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${cfg.bg} ${cfg.color}`}>{key}</span>
                ))}
              </div>
            </div>
            <div className="divide-y divide-[#1e2532]/50">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-[#586c8f] text-sm">No recent activity logs found.</div>
              ) : logs.map(log => {
                const cfg = severityConfig[log.severity as keyof typeof severityConfig] || severityConfig.info;
                const SeverityIcon = cfg.icon;
                return (
                  <div key={log.id} className="px-5 py-3 hover:bg-[#111622]/50 transition-all flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${cfg.bg}`}>
                      <SeverityIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white font-medium leading-relaxed">{log.event}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-[#586c8f] font-mono">{log.timestamp}</span>
                        <span className="text-[10px] text-[#586c8f] font-bold uppercase bg-[#1e2532] px-1.5 py-0.5 rounded">{log.source}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border shrink-0 ${cfg.bg} ${cfg.color}`}>{log.severity}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
