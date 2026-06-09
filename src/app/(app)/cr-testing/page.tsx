'use client';

import React, { useState, useCallback } from 'react';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  BarChart3,
  Clock,
  Layers,
  RefreshCw,
  AlertTriangle,
  ArrowUpDown,
  Search,
  Filter,
} from 'lucide-react';

/** Test type tab definition */
interface TestTab {
  id: string;
  label: string;
  count: number;
}

/** Single test result row */
interface TestResult {
  id: string;
  name: string;
  suite: string;
  type: string;
  status: 'passed' | 'failed' | 'skipped' | 'running';
  duration: string;
  timestamp: string;
}

const TEST_TABS: TestTab[] = [
  { id: 'unit', label: 'Unit Tests', count: 0 },
  { id: 'integration', label: 'Integration Tests', count: 0 },
  { id: 'e2e', label: 'E2E Tests', count: 0 },
  { id: 'regression', label: 'Regression Tests', count: 0 },
];

/** Stat card data */
interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  borderColor: string;
}

/** CR Testing Dashboard — validate changes before deployment */
export default function CRTestingPage() {
  const [activeTab, setActiveTab] = useState('unit');
  const [testResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const stats: StatCard[] = [
    {
      label: 'Test Suites',
      value: 0,
      icon: Layers,
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/20 to-blue-600/10',
      borderColor: 'border-blue-500/20',
    },
    {
      label: 'Passing',
      value: 0,
      icon: CheckCircle2,
      color: 'text-green-400',
      bgGradient: 'from-green-500/20 to-green-600/10',
      borderColor: 'border-green-500/20',
    },
    {
      label: 'Failing',
      value: 0,
      icon: XCircle,
      color: 'text-red-400',
      bgGradient: 'from-red-500/20 to-red-600/10',
      borderColor: 'border-red-500/20',
    },
    {
      label: 'Coverage',
      value: '0%',
      icon: ShieldCheck,
      color: 'text-amber-400',
      bgGradient: 'from-amber-500/20 to-amber-600/10',
      borderColor: 'border-amber-500/20',
    },
  ];

  const handleRunAllTests = useCallback(() => {
    setIsRunning(true);
    // Simulate test run
    setTimeout(() => setIsRunning(false), 3000);
  }, []);

  const filteredResults = testResults.filter(
    (r) =>
      r.type === activeTab &&
      (searchQuery === '' ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.suite.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const statusBadge = (status: TestResult['status']) => {
    const styles: Record<string, string> = {
      passed: 'border-green-500/30 bg-green-500/10 text-green-400',
      failed: 'border-red-500/30 bg-red-500/10 text-red-400',
      skipped: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
      running: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    };
    const icons: Record<string, React.ElementType> = {
      passed: CheckCircle2,
      failed: XCircle,
      skipped: AlertTriangle,
      running: RefreshCw,
    };
    const Icon = icons[status];
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${styles[status]}`}
      >
        <Icon className={`h-3 w-3 ${status === 'running' ? 'animate-spin' : ''}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#8b9bb4]">
      {/* Header */}
      <div className="border-b border-[#1e2532] bg-[#111622]/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20">
                <FlaskConical className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">CR Testing Dashboard</h1>
                <p className="text-sm text-[#586c8f]">Validate changes before deployment</p>
              </div>
            </div>
            <button
              onClick={handleRunAllTests}
              disabled={isRunning}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                isRunning
                  ? 'bg-green-500/20 text-green-400/60 cursor-not-allowed border border-green-500/20'
                  : 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20 hover:shadow-green-500/30'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run All Tests
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-[#1e2532] bg-[#111622]/80 p-5 transition-all duration-200 hover:border-[#2a3548]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#586c8f] uppercase tracking-wider">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.bgGradient} border ${stat.borderColor}`}
                  >
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Test Types Tabs + Table */}
        <div className="rounded-xl border border-[#1e2532] bg-[#111622]/80">
          {/* Tab bar */}
          <div className="flex items-center justify-between border-b border-[#1e2532] px-5">
            <div className="flex gap-0">
              {TEST_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-4 py-3.5 text-sm font-medium transition-colors ${
                      isActive ? 'text-green-400' : 'text-[#586c8f] hover:text-[#8b9bb4]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {tab.label}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                          isActive
                            ? 'bg-green-500/15 text-green-400'
                            : 'bg-[#1e2532] text-[#586c8f]'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search + Filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#586c8f]" />
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-lg border border-[#1e2532] bg-[#0b0e14] py-1.5 pl-9 pr-3 text-xs text-[#8b9bb4] placeholder:text-[#586c8f] transition-colors focus:outline-none focus:border-green-500/40 w-48"
                />
              </div>
              <button className="flex items-center gap-1 rounded-lg border border-[#1e2532] bg-[#0b0e14] px-2.5 py-1.5 text-xs text-[#586c8f] transition-colors hover:border-green-500/30 hover:text-[#8b9bb4]">
                <Filter className="h-3.5 w-3.5" />
                Filter
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 border-b border-[#1e2532] px-5 py-3 text-xs font-medium text-[#586c8f] uppercase tracking-wider">
              <div className="col-span-4 flex items-center gap-1 cursor-pointer hover:text-[#8b9bb4] transition-colors">
                Test Name <ArrowUpDown className="h-3 w-3" />
              </div>
              <div className="col-span-3">Suite</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 flex items-center gap-1 cursor-pointer hover:text-[#8b9bb4] transition-colors">
                <Clock className="h-3 w-3" /> Duration
              </div>
              <div className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-[#8b9bb4] transition-colors">
                Timestamp <ArrowUpDown className="h-3 w-3" />
              </div>
            </div>

            {/* Table body or empty state */}
            {filteredResults.length > 0 ? (
              <div>
                {filteredResults.map((result) => (
                  <div
                    key={result.id}
                    className="grid grid-cols-12 gap-4 border-b border-[#1e2532] px-5 py-3 text-sm transition-colors hover:bg-[#1e2532]/30"
                  >
                    <div className="col-span-4 text-white font-medium truncate">{result.name}</div>
                    <div className="col-span-3 text-[#8b9bb4] truncate">{result.suite}</div>
                    <div className="col-span-2">{statusBadge(result.status)}</div>
                    <div className="col-span-1 text-[#586c8f] font-mono text-xs">{result.duration}</div>
                    <div className="col-span-2 text-[#586c8f] text-xs">{result.timestamp}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 mb-4">
                  <BarChart3 className="h-8 w-8 text-green-400/60" />
                </div>
                <h3 className="text-base font-medium text-white mb-1">No test results yet</h3>
                <p className="text-sm text-[#586c8f] max-w-md">
                  Run tests after implementing a CR. Results will appear here organized by test type
                  with pass/fail status, duration, and timestamps.
                </p>
                <button
                  onClick={handleRunAllTests}
                  disabled={isRunning}
                  className="mt-6 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400 transition-all hover:bg-green-500/20 hover:border-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Run All Tests
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Test Run History */}
        <div className="rounded-xl border border-[#1e2532] bg-[#111622]/80 p-5">
          <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-400" />
            Test Run History
          </h2>
          <div className="space-y-3">
            {/* Empty history */}
            <div className="flex items-center justify-center rounded-lg border border-dashed border-[#1e2532] py-12 text-center">
              <div>
                <p className="text-sm text-[#586c8f]">No previous test runs recorded</p>
                <p className="mt-1 text-xs text-[#586c8f]/70">
                  Test run history will be tracked here with timestamps, pass rates, and coverage trends.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
