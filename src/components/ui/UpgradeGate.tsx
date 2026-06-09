'use client';

/**
 * @file UpgradeGate Component
 * @description Wraps enterprise-only features. Shows an upgrade prompt if the user's
 *              plan does not meet the required tier. Mirrors the reference project's UpgradeGate.
 * @module components/ui/UpgradeGate
 */
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface UpgradeGateProps {
  /** Required plan: 'pro' or 'enterprise' */
  requiredPlan: 'pro' | 'enterprise';
  /** Feature name to display */
  featureName: string;
  /** The gated content */
  children: React.ReactNode;
  /** Current user plan — if not provided, defaults to 'free' */
  currentPlan?: string;
}

/**
 * Renders children if user plan meets requirement, otherwise shows upgrade prompt.
 * @example
 * ```tsx
 * <UpgradeGate requiredPlan="enterprise" featureName="Code Audit">
 *   <CodeAuditPage />
 * </UpgradeGate>
 * ```
 */
export default function UpgradeGate({
  requiredPlan,
  featureName,
  children,
  currentPlan = 'free',
}: UpgradeGateProps) {
  const planHierarchy: Record<string, number> = {
    free: 0,
    pro: 1,
    enterprise: 2,
  };

  const userLevel = planHierarchy[currentPlan.toLowerCase()] ?? 0;
  const requiredLevel = planHierarchy[requiredPlan] ?? 0;

  // Grant access if user plan meets or exceeds requirement
  if (userLevel >= requiredLevel) {
    return <>{children}</>;
  }

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        {/* Lock Icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-amber-400" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">
          {featureName}
        </h2>
        <p className="text-[#8b9bb4] text-sm mb-2">
          This feature requires the{' '}
          <span className="text-amber-400 font-bold capitalize">{requiredPlan}</span>{' '}
          plan.
        </p>
        <p className="text-[#586c8f] text-xs mb-8">
          Upgrade your plan to unlock {featureName} and all premium AI tools.
        </p>

        {/* Plan Badge */}
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 mb-6">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-300">
            Current: {currentPlan.toUpperCase()} → Required: {requiredPlan.toUpperCase()}
          </span>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link
            href="/pricing"
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="text-[#8b9bb4] hover:text-white text-sm transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
