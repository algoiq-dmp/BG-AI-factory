'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, Check, X, ArrowRight, ChevronDown, ChevronUp,
  Zap, Crown, Building2, Shield
} from 'lucide-react';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  icon: React.ElementType;
  iconColor: string;
  price: string;
  period: string;
  description: string;
  popular: boolean;
  gradient: string;
  borderColor: string;
  shadowColor: string;
  cta: string;
  ctaHref: string;
  features: PlanFeature[];
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    icon: Zap,
    iconColor: 'text-emerald-400',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for exploring and small personal projects.',
    popular: false,
    gradient: 'from-emerald-500/10 to-emerald-900/20',
    borderColor: 'border-[#1e2532]',
    shadowColor: '',
    cta: 'Get Started',
    ctaHref: '/start',
    features: [
      { text: '1 Active Project', included: true },
      { text: '5 AI Tools', included: true },
      { text: 'Basic Quality Dashboard', included: true },
      { text: 'Community Support', included: true },
      { text: '1K Tokens/day', included: true },
      { text: 'Unlimited Projects', included: false },
      { text: 'Full AI Pipeline (12 stages)', included: false },
      { text: 'Multi-Agent Swarm', included: false },
      { text: 'Priority Support', included: false },
      { text: 'Custom AI Models', included: false },
      { text: 'Self-Hosted Deployment', included: false },
      { text: 'SLA Guarantee', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Crown,
    iconColor: 'text-amber-400',
    price: '₹999',
    period: '/month',
    description: 'For professional developers and growing teams.',
    popular: true,
    gradient: 'from-amber-500/20 to-amber-900/30',
    borderColor: 'border-amber-500/30',
    shadowColor: 'shadow-[0_0_30px_rgba(245,158,11,0.1)]',
    cta: 'Subscribe',
    ctaHref: '/start',
    features: [
      { text: 'Unlimited Projects', included: true },
      { text: 'All 50+ AI Tools', included: true },
      { text: 'Full Quality Dashboard', included: true },
      { text: 'Priority Support', included: true },
      { text: '100K Tokens/day', included: true },
      { text: 'Full AI Pipeline (12 stages)', included: true },
      { text: 'Multi-Agent Swarm', included: true },
      { text: 'Krishna AI Assistant', included: true },
      { text: 'Advanced Analytics', included: true },
      { text: 'Custom AI Models', included: false },
      { text: 'Self-Hosted Deployment', included: false },
      { text: 'SLA Guarantee', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building2,
    iconColor: 'text-violet-400',
    price: '₹49,999',
    period: '/year',
    description: 'For large organizations with custom requirements.',
    popular: false,
    gradient: 'from-violet-500/10 to-violet-900/20',
    borderColor: 'border-[#1e2532]',
    shadowColor: '',
    cta: 'Contact Sales',
    ctaHref: '/start',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited Tokens', included: true },
      { text: 'Custom AI Models', included: true },
      { text: 'Self-Hosted Deployment', included: true },
      { text: 'SLA Guarantee (99.9%)', included: true },
      { text: 'Dedicated Support Manager', included: true },
      { text: 'SSO & RBAC', included: true },
      { text: 'Audit Logs', included: true },
      { text: 'Custom Integrations', included: true },
      { text: 'On-Premise Option', included: true },
      { text: 'Training & Onboarding', included: true },
      { text: 'White-Label Option', included: true },
    ],
  },
];

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What AI platforms does the factory support?',
    answer: 'Launch IQ integrates with 9 AI platforms including Claude, GPT-4, Gemini, Cursor AI, Bolt.new, Lovable, Replit Agent, Windsurf, and Devin. Each platform is optimized for specific tasks in the pipeline.',
  },
  {
    question: 'Can I use my own API keys?',
    answer: 'Yes! You can configure your own API keys for any supported platform in the Settings page. This allows you to use your own quotas and billing. We also provide shared keys on the Pro and Enterprise plans.',
  },
  {
    question: 'How does the 12-stage pipeline work?',
    answer: 'The pipeline covers the complete SDLC: Idea → Requirements → Architecture → Design → Implementation → Testing → Code Review → Documentation → Deployment → Monitoring → Optimization → Maintenance. Each stage uses specialized AI agents.',
  },
  {
    question: 'Is my code private and secure?',
    answer: 'Absolutely. On the Enterprise plan, you can self-host the entire platform. All data is encrypted at rest and in transit. We follow SOC 2 Type II compliance standards. Your code is never used for training AI models.',
  },
  {
    question: 'What is the Multi-Agent Swarm?',
    answer: 'The Multi-Agent Swarm is a coordinated system of specialized AI agents (Architect, Developer, QA, DevOps, Security) that work in parallel on your project. They communicate, review each other\'s work, and ensure quality standards are met.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your Pro subscription at any time. Your access continues until the end of the billing period. Enterprise contracts are annual but include a 30-day money-back guarantee.',
  },
];

export default function PricingPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-violet-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,37,50,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,37,50,0.3)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-20" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 border-b border-[#1e2532]/50 backdrop-blur-xl bg-[#0a0f1c]/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5b5fd8] to-[#4a4fcf] flex items-center justify-center shadow-lg border border-[#5b5fd8]/30">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">Launch IQ</h1>
              <p className="text-[10px] text-[#586c8f] font-medium tracking-wider uppercase">by Algo IQ Group</p>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#8b9bb4]">
            <Link href="/home" className="hover:text-white transition-colors">Home</Link>
            <Link href="/home#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/login" className="px-4 py-2 bg-[#5b5fd8] hover:bg-[#6a6ff8] text-white font-bold rounded-lg text-sm transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-sm text-amber-400 font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Simple, Transparent Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Choose Your Plan
          </h1>
          <p className="text-lg text-[#8b9bb4] max-w-2xl mx-auto">
            Start free, scale as you grow. All plans include the core AI pipeline with different levels of access and support.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-[#111622]/80 backdrop-blur-sm border rounded-2xl p-8 transition-all hover:-translate-y-1 duration-300 ${plan.borderColor} ${plan.shadowColor} ${
                plan.popular ? 'ring-1 ring-amber-500/30 scale-[1.02]' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full text-xs font-bold text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center border border-white/5`}>
                  <plan.icon className={`w-5 h-5 ${plan.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              </div>

              <div className="mb-4">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-sm text-[#586c8f] ml-1">{plan.period}</span>
              </div>

              <p className="text-sm text-[#8b9bb4] mb-6">{plan.description}</p>

              <Link
                href={plan.ctaHref}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all mb-8 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : 'bg-[#1e2532] hover:bg-[#2a3142] text-white border border-[#1e2532]'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="space-y-3">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-[#586c8f]/50 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-[#8b9bb4]' : 'text-[#586c8f]/50'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Banner */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-[#111622]/80 backdrop-blur-sm border border-[#1e2532] rounded-2xl p-8 text-center">
          <Shield className="w-10 h-10 text-[#5b5fd8] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">All Plans Include</h3>
          <p className="text-sm text-[#8b9bb4] mb-6">Core features available on every plan</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {['SSL Encryption', 'Dark Theme UI', 'Auto-Save', 'Export Options', 'API Access', 'Gita Guidance', 'Activity Logs', '24/7 Uptime'].map((feat, i) => (
              <div key={i} className="flex items-center gap-2 justify-center text-[#8b9bb4]">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {feat}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-[#8b9bb4]">Everything you need to know about the Launch IQ.</p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((faq, i) => (
            <div
              key={i}
              className="bg-[#111622]/80 backdrop-blur-sm border border-[#1e2532] rounded-xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#1e2532]/30 transition-colors"
              >
                <span className="font-bold text-white text-sm">{faq.question}</span>
                {openFAQ === i ? (
                  <ChevronUp className="w-4 h-4 text-amber-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#586c8f] flex-shrink-0" />
                )}
              </button>
              {openFAQ === i && (
                <div className="px-6 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-sm text-[#8b9bb4] leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1e2532]/50">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5b5fd8] to-[#4a4fcf] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
            <span className="text-sm font-bold text-[#8b9bb4]">Bhagwat Gita AI Software Factory</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#586c8f]">
            <Link href="/home" className="hover:text-white transition-colors">Home</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
          <p className="text-xs text-[#586c8f]">© 2026 Algo IQ Group. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
