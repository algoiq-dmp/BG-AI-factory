/**
 * @file Project Pattern Engine
 * @description Cross-project pattern learning and recommendation system.
 *              Extracts successful patterns from completed projects and recommends
 *              them for new projects with similar characteristics.
 * @module lib/memory/pattern-engine
 */

/** A learned pattern from a successful project */
export interface ProjectPattern {
  /** Pattern unique identifier */
  id: string;
  /** Domain category (fintech, ecommerce, healthcare, etc.) */
  domain: string;
  /** Tech stack used */
  techStack: string[];
  /** Features that appeared in >70% of similar projects */
  commonFeatures: string[];
  /** Most successful architecture pattern */
  architecture: string;
  /** Known pitfalls from similar projects */
  pitfalls: string[];
  /** Average estimated duration in days */
  estimatedDays: number;
  /** Average quality score achieved */
  avgQualityScore: number;
  /** Number of projects this pattern was learned from */
  sampleSize: number;
  /** Last updated timestamp */
  updatedAt: string;
}

/** Recommendation for a new project based on learned patterns */
export interface PatternRecommendation {
  /** Confidence score 0-100 */
  confidence: number;
  /** Pattern match basis */
  matchReason: string;
  /** Recommended features */
  suggestedFeatures: string[];
  /** Recommended architecture */
  suggestedArchitecture: string;
  /** Known pitfalls to avoid */
  pitfallsToAvoid: string[];
  /** Estimated timeline */
  estimatedDays: number;
  /** Similar patterns used for this recommendation */
  basedOnPatterns: string[];
}

/** Project summary for pattern extraction */
export interface ProjectSummary {
  /** Project name */
  name: string;
  /** Domain category */
  domain: string;
  /** Tech stack */
  techStack: string[];
  /** Features implemented */
  features: string[];
  /** Architecture used */
  architecture: string;
  /** Actual duration in days */
  durationDays: number;
  /** Final quality score */
  qualityScore: number;
  /** Issues encountered */
  issues: string[];
  /** Completion status */
  completed: boolean;
}

/**
 * Pattern Learning Engine — learns from completed projects
 * and provides recommendations for new ones.
 *
 * @example
 * ```ts
 * const engine = new PatternEngine();
 * engine.learnFromProject(completedProject);
 * const recs = engine.recommend({ domain: 'fintech', techStack: ['Next.js'] });
 * ```
 */
export class PatternEngine {
  /** Learned patterns indexed by domain */
  private patterns: Map<string, ProjectPattern> = new Map();

  /** Raw project summaries for pattern extraction */
  private projectHistory: ProjectSummary[] = [];

  /**
   * Learn from a completed project
   * @param project - Project summary to learn from
   */
  learnFromProject(project: ProjectSummary): void {
    if (!project.completed) return;

    this.projectHistory.push(project);
    this.updatePattern(project);
  }

  /**
   * Get recommendations for a new project
   * @param context - New project context (domain, tech stack)
   * @returns Array of recommendations sorted by confidence
   */
  recommend(context: { domain: string; techStack?: string[] }): PatternRecommendation[] {
    const recommendations: PatternRecommendation[] = [];

    // Find exact domain match
    const exactMatch = this.patterns.get(context.domain.toLowerCase());
    if (exactMatch) {
      recommendations.push({
        confidence: 90,
        matchReason: `Based on ${exactMatch.sampleSize} similar "${context.domain}" projects`,
        suggestedFeatures: exactMatch.commonFeatures,
        suggestedArchitecture: exactMatch.architecture,
        pitfallsToAvoid: exactMatch.pitfalls,
        estimatedDays: exactMatch.estimatedDays,
        basedOnPatterns: [exactMatch.id],
      });
    }

    // Find partial matches (similar tech stack)
    if (context.techStack && context.techStack.length > 0) {
      for (const [domain, pattern] of this.patterns) {
        if (domain === context.domain.toLowerCase()) continue;

        const techOverlap = context.techStack.filter(t =>
          pattern.techStack.some(pt => pt.toLowerCase() === t.toLowerCase())
        );

        if (techOverlap.length > 0) {
          const confidence = Math.min(70, 30 + techOverlap.length * 15);
          recommendations.push({
            confidence,
            matchReason: `Similar tech stack (${techOverlap.join(', ')}) from "${domain}" projects`,
            suggestedFeatures: pattern.commonFeatures.slice(0, 5),
            suggestedArchitecture: pattern.architecture,
            pitfallsToAvoid: pattern.pitfalls.slice(0, 3),
            estimatedDays: pattern.estimatedDays,
            basedOnPatterns: [pattern.id],
          });
        }
      }
    }

    // Sort by confidence descending
    recommendations.sort((a, b) => b.confidence - a.confidence);

    return recommendations;
  }

  /**
   * Get all known patterns
   */
  getAllPatterns(): ProjectPattern[] {
    return Array.from(this.patterns.values());
  }

  /**
   * Get pattern statistics
   */
  getStats(): { totalProjects: number; totalPatterns: number; domains: string[] } {
    return {
      totalProjects: this.projectHistory.length,
      totalPatterns: this.patterns.size,
      domains: Array.from(this.patterns.keys()),
    };
  }

  /**
   * Export patterns for persistence
   */
  exportPatterns(): string {
    return JSON.stringify({
      patterns: Array.from(this.patterns.entries()),
      history: this.projectHistory,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Import previously exported patterns
   */
  importPatterns(json: string): void {
    try {
      const data = JSON.parse(json);
      if (data.patterns) {
        for (const [key, value] of data.patterns) {
          this.patterns.set(key, value as ProjectPattern);
        }
      }
      if (data.history) {
        this.projectHistory = data.history;
      }
    } catch (e) {
      console.error('[PatternEngine] Failed to import patterns:', e);
    }
  }

  // ─── Private ──────────────────────────────────────────────────

  /** Update or create a domain pattern from a project */
  private updatePattern(project: ProjectSummary): void {
    const domain = project.domain.toLowerCase();
    const existing = this.patterns.get(domain);

    if (existing) {
      // Merge: update averages and add new common features
      existing.sampleSize++;
      existing.estimatedDays = Math.round(
        (existing.estimatedDays * (existing.sampleSize - 1) + project.durationDays) / existing.sampleSize
      );
      existing.avgQualityScore = Math.round(
        (existing.avgQualityScore * (existing.sampleSize - 1) + project.qualityScore) / existing.sampleSize
      );

      // Merge tech stacks (unique)
      for (const tech of project.techStack) {
        if (!existing.techStack.includes(tech)) existing.techStack.push(tech);
      }

      // Track feature frequency
      for (const feature of project.features) {
        if (!existing.commonFeatures.includes(feature)) {
          // Check if this feature appeared in >50% of projects
          const freq = this.projectHistory.filter(
            p => p.domain.toLowerCase() === domain && p.features.includes(feature)
          ).length;
          if (freq / existing.sampleSize > 0.5) {
            existing.commonFeatures.push(feature);
          }
        }
      }

      // Merge pitfalls
      for (const issue of project.issues) {
        if (!existing.pitfalls.includes(issue)) existing.pitfalls.push(issue);
      }

      existing.updatedAt = new Date().toISOString();
    } else {
      // Create new pattern
      this.patterns.set(domain, {
        id: `pattern_${domain}_${Date.now()}`,
        domain,
        techStack: [...project.techStack],
        commonFeatures: [...project.features],
        architecture: project.architecture,
        pitfalls: [...project.issues],
        estimatedDays: project.durationDays,
        avgQualityScore: project.qualityScore,
        sampleSize: 1,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  /**
   * Seed with built-in patterns for common domains
   */
  seedDefaults(): void {
    const defaults: ProjectSummary[] = [
      {
        name: 'Template: Fintech App', domain: 'fintech', techStack: ['Next.js', 'PostgreSQL', 'Prisma', 'Stripe'],
        features: ['KYC Verification', 'Payment Processing', 'Transaction History', 'Portfolio Dashboard', 'Real-time Quotes', '2FA Authentication', 'Audit Logging'],
        architecture: 'Monolithic Next.js with API routes + PostgreSQL', durationDays: 90, qualityScore: 82,
        issues: ['Payment gateway integration delays', 'KYC compliance complexity', 'Real-time data scaling', 'Regulatory requirements change frequently'],
        completed: true,
      },
      {
        name: 'Template: E-Commerce', domain: 'ecommerce', techStack: ['Next.js', 'MongoDB', 'Stripe', 'Redis'],
        features: ['Product Catalog', 'Shopping Cart', 'Payment Gateway', 'Order Management', 'Inventory Tracking', 'Review System', 'Search & Filters', 'Admin Dashboard'],
        architecture: 'Next.js + MongoDB Atlas + Redis Cache', durationDays: 60, qualityScore: 78,
        issues: ['Cart sync across devices', 'Inventory race conditions', 'Search performance at scale', 'Payment failure handling'],
        completed: true,
      },
      {
        name: 'Template: SaaS Platform', domain: 'saas', techStack: ['Next.js', 'PostgreSQL', 'Prisma', 'Stripe', 'NextAuth'],
        features: ['Multi-tenancy', 'Subscription Billing', 'Role-based Access', 'Team Management', 'API Keys', 'Usage Analytics', 'Webhook System', 'Onboarding Flow'],
        architecture: 'Next.js App Router + Prisma + Stripe Billing', durationDays: 75, qualityScore: 85,
        issues: ['Multi-tenant data isolation', 'Subscription state management', 'Webhook reliability', 'Rate limiting complexity'],
        completed: true,
      },
      {
        name: 'Template: Healthcare', domain: 'healthcare', techStack: ['Next.js', 'PostgreSQL', 'Prisma'],
        features: ['Patient Records', 'Appointment Booking', 'Telemedicine', 'Prescription Management', 'Lab Results', 'HIPAA Compliance', 'Audit Trail'],
        architecture: 'HIPAA-compliant Next.js with encrypted PostgreSQL', durationDays: 120, qualityScore: 88,
        issues: ['HIPAA compliance complexity', 'Data encryption requirements', 'Integration with legacy hospital systems', 'Real-time video reliability'],
        completed: true,
      },
    ];

    for (const project of defaults) {
      this.learnFromProject(project);
    }
  }
}

/** Singleton instance with default patterns */
export const patternEngine = new PatternEngine();
patternEngine.seedDefaults();
