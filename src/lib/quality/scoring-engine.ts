/**
 * @file Quality Scoring Engine
 * @description Real-time code quality analysis and scoring system.
 *              Scores code across 6 dimensions: complexity, duplication, type safety,
 *              error handling, test coverage, and documentation.
 *              Produces an A+ to F grade for individual files and entire projects.
 * @module lib/quality/scoring-engine
 */

/** Individual dimension score */
export interface DimensionScore {
  /** Dimension name */
  name: string;
  /** Score 0-100 */
  score: number;
  /** Weight in overall calculation (0-1) */
  weight: number;
  /** Issues found */
  issues: QualityIssue[];
  /** Improvement suggestions */
  suggestions: string[];
}

/** A single quality issue found in code */
export interface QualityIssue {
  /** Issue severity */
  severity: 'critical' | 'warning' | 'info';
  /** Human-readable description */
  message: string;
  /** File path (if applicable) */
  file?: string;
  /** Line number (if applicable) */
  line?: number;
  /** Suggested fix */
  fix?: string;
}

/** Overall quality report */
export interface QualityReport {
  /** Letter grade: A+ through F */
  grade: string;
  /** Numeric score 0-100 */
  score: number;
  /** Individual dimension scores */
  dimensions: DimensionScore[];
  /** Total issues by severity */
  issueCounts: { critical: number; warning: number; info: number };
  /** Top 5 priority improvements */
  topImprovements: string[];
  /** Timestamp of analysis */
  analyzedAt: string;
  /** Number of files analyzed */
  filesAnalyzed: number;
}

/**
 * Analyzes code quality across 6 dimensions and produces a grade.
 *
 * @example
 * ```ts
 * const scorer = new QualityScorer();
 * const report = scorer.analyzeCode(sourceCode, 'component.tsx');
 * console.log(`Grade: ${report.grade} (${report.score}/100)`);
 * ```
 */
export class QualityScorer {
  /**
   * Analyze a single source file
   * @param code - Source code content
   * @param filename - File name for context
   * @returns Complete quality report
   */
  analyzeCode(code: string, filename: string): QualityReport {
    const dimensions: DimensionScore[] = [
      this.scoreComplexity(code, filename),
      this.scoreDuplication(code, filename),
      this.scoreTypeSafety(code, filename),
      this.scoreErrorHandling(code, filename),
      this.scoreTestCoverage(code, filename),
      this.scoreDocumentation(code, filename),
    ];

    const score = Math.round(
      dimensions.reduce((sum, d) => sum + d.score * d.weight, 0) /
      dimensions.reduce((sum, d) => sum + d.weight, 0)
    );

    const allIssues = dimensions.flatMap(d => d.issues);
    const issueCounts = {
      critical: allIssues.filter(i => i.severity === 'critical').length,
      warning: allIssues.filter(i => i.severity === 'warning').length,
      info: allIssues.filter(i => i.severity === 'info').length,
    };

    // Collect top improvements from all dimensions
    const topImprovements = dimensions
      .flatMap(d => d.suggestions)
      .slice(0, 5);

    return {
      grade: this.scoreToGrade(score),
      score,
      dimensions,
      issueCounts,
      topImprovements,
      analyzedAt: new Date().toISOString(),
      filesAnalyzed: 1,
    };
  }

  /**
   * Analyze multiple files and produce an aggregate report
   * @param files - Array of { code, filename } objects
   * @returns Aggregate quality report
   */
  analyzeProject(files: Array<{ code: string; filename: string }>): QualityReport {
    if (files.length === 0) {
      return {
        grade: 'N/A', score: 0, dimensions: [],
        issueCounts: { critical: 0, warning: 0, info: 0 },
        topImprovements: ['No files to analyze'],
        analyzedAt: new Date().toISOString(), filesAnalyzed: 0,
      };
    }

    const reports = files.map(f => this.analyzeCode(f.code, f.filename));
    const avgScore = Math.round(reports.reduce((s, r) => s + r.score, 0) / reports.length);

    // Aggregate dimensions
    const dimensionNames = ['complexity', 'duplication', 'type-safety', 'error-handling', 'test-coverage', 'documentation'];
    const aggregatedDimensions = dimensionNames.map((name, i) => {
      const dimReports = reports.map(r => r.dimensions[i]).filter(Boolean);
      return {
        name,
        score: Math.round(dimReports.reduce((s, d) => s + d.score, 0) / dimReports.length),
        weight: dimReports[0]?.weight || 0.15,
        issues: dimReports.flatMap(d => d.issues),
        suggestions: [...new Set(dimReports.flatMap(d => d.suggestions))].slice(0, 3),
      };
    });

    const allIssues = aggregatedDimensions.flatMap(d => d.issues);

    return {
      grade: this.scoreToGrade(avgScore),
      score: avgScore,
      dimensions: aggregatedDimensions,
      issueCounts: {
        critical: allIssues.filter(i => i.severity === 'critical').length,
        warning: allIssues.filter(i => i.severity === 'warning').length,
        info: allIssues.filter(i => i.severity === 'info').length,
      },
      topImprovements: [...new Set(reports.flatMap(r => r.topImprovements))].slice(0, 5),
      analyzedAt: new Date().toISOString(),
      filesAnalyzed: files.length,
    };
  }

  // ─── Dimension Scorers ────────────────────────────────────────

  /** Score code complexity (cyclomatic complexity, nesting depth) */
  private scoreComplexity(code: string, filename: string): DimensionScore {
    const issues: QualityIssue[] = [];
    const lines = code.split('\n');
    let maxNesting = 0;
    let currentNesting = 0;
    let functionCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/\b(function|if|for|while|switch|catch)\b/.test(line)) functionCount++;
      currentNesting += (line.match(/{/g) || []).length;
      currentNesting -= (line.match(/}/g) || []).length;
      maxNesting = Math.max(maxNesting, currentNesting);
    }

    if (maxNesting > 5) {
      issues.push({ severity: 'warning', message: `Deep nesting (${maxNesting} levels)`, file: filename, fix: 'Extract nested logic into separate functions' });
    }
    if (lines.length > 300) {
      issues.push({ severity: 'warning', message: `File too long (${lines.length} lines)`, file: filename, fix: 'Split into smaller modules' });
    }

    const score = Math.max(0, 100 - (maxNesting > 4 ? (maxNesting - 4) * 10 : 0) - (lines.length > 200 ? Math.min(30, (lines.length - 200) / 10) : 0));

    return {
      name: 'complexity',
      score: Math.round(score),
      weight: 0.20,
      issues,
      suggestions: maxNesting > 4 ? ['Reduce nesting by extracting functions', 'Use early returns to flatten conditionals'] : [],
    };
  }

  /** Score code duplication (DRY violations) */
  private scoreDuplication(code: string, filename: string): DimensionScore {
    const issues: QualityIssue[] = [];
    const lines = code.split('\n').map(l => l.trim()).filter(l => l.length > 20);
    const seen = new Map<string, number>();
    let duplicates = 0;

    for (const line of lines) {
      seen.set(line, (seen.get(line) || 0) + 1);
    }

    for (const [line, count] of seen) {
      if (count > 2) {
        duplicates++;
        issues.push({ severity: 'info', message: `Duplicated ${count} times: "${line.slice(0, 60)}..."`, file: filename, fix: 'Extract to a shared utility function' });
      }
    }

    const duplicationRatio = lines.length > 0 ? duplicates / lines.length : 0;
    const score = Math.max(0, 100 - duplicationRatio * 500);

    return {
      name: 'duplication',
      score: Math.round(Math.min(100, score)),
      weight: 0.10,
      issues: issues.slice(0, 5),
      suggestions: duplicates > 0 ? ['Extract repeated code into shared utilities', 'Use higher-order functions to reduce duplication'] : [],
    };
  }

  /** Score TypeScript type safety (any/unknown usage) */
  private scoreTypeSafety(code: string, filename: string): DimensionScore {
    const issues: QualityIssue[] = [];
    const lines = code.split('\n');

    let anyCount = 0;
    for (let i = 0; i < lines.length; i++) {
      // Match `: any`, `as any`, `<any>`, but not inside comments or strings
      const line = lines[i];
      if (/\/\//.test(line)) continue; // Skip comment lines
      const matches = line.match(/\bany\b/g);
      if (matches) {
        anyCount += matches.length;
        if (anyCount <= 3) {
          issues.push({ severity: 'warning', message: `Usage of 'any' type`, file: filename, line: i + 1, fix: 'Replace with specific type or unknown' });
        }
      }
    }

    // Check for missing return types on exported functions
    const exportedFunctions = code.match(/export\s+(async\s+)?function\s+\w+\s*\([^)]*\)\s*{/g) || [];
    const withReturnType = code.match(/export\s+(async\s+)?function\s+\w+\s*\([^)]*\)\s*:\s*\w/g) || [];
    const missingReturnTypes = exportedFunctions.length - withReturnType.length;

    if (missingReturnTypes > 0) {
      issues.push({ severity: 'info', message: `${missingReturnTypes} exported functions missing return types`, file: filename });
    }

    const score = Math.max(0, 100 - anyCount * 10 - missingReturnTypes * 5);

    return {
      name: 'type-safety',
      score: Math.round(Math.min(100, score)),
      weight: 0.20,
      issues,
      suggestions: anyCount > 0 ? [`Replace ${anyCount} 'any' types with proper types`, 'Add return types to all exported functions'] : [],
    };
  }

  /** Score error handling (try/catch, error boundaries) */
  private scoreErrorHandling(code: string, filename: string): DimensionScore {
    const issues: QualityIssue[] = [];
    const hasAsync = /async\s/.test(code);
    const hasTryCatch = /try\s*{/.test(code);
    const hasCatch = /\.catch\(/.test(code);
    const isAPIRoute = filename.includes('route.ts') || filename.includes('api/');
    const isComponent = filename.endsWith('.tsx');

    let score = 70; // Base score

    if (hasAsync && !hasTryCatch && !hasCatch) {
      score -= 30;
      issues.push({ severity: 'warning', message: 'Async code without try/catch or .catch()', file: filename, fix: 'Wrap async operations in try/catch blocks' });
    }

    if (isAPIRoute && !hasTryCatch) {
      score -= 20;
      issues.push({ severity: 'critical', message: 'API route without error handling', file: filename, fix: 'Add try/catch to all API route handlers' });
    }

    if (hasTryCatch) score += 15;
    if (hasCatch) score += 15;

    return {
      name: 'error-handling',
      score: Math.round(Math.min(100, Math.max(0, score))),
      weight: 0.20,
      issues,
      suggestions: issues.length > 0 ? ['Add try/catch blocks to async functions', 'Return proper error responses from API routes'] : [],
    };
  }

  /** Score test coverage (heuristic based on test file existence) */
  private scoreTestCoverage(code: string, filename: string): DimensionScore {
    const isTestFile = /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(filename);
    if (isTestFile) {
      return { name: 'test-coverage', score: 100, weight: 0.15, issues: [], suggestions: [] };
    }

    // For non-test files, we can't determine coverage statically
    // This would need runtime integration with vitest --coverage
    return {
      name: 'test-coverage',
      score: 50, // Default: unknown coverage
      weight: 0.15,
      issues: [{ severity: 'info', message: 'Run `npm run test:coverage` for actual coverage data', file: filename }],
      suggestions: ['Add unit tests for this module', 'Run vitest with --coverage flag for real metrics'],
    };
  }

  /** Score documentation (JSDoc coverage, comments) */
  private scoreDocumentation(code: string, filename: string): DimensionScore {
    const issues: QualityIssue[] = [];
    const hasFileHeader = /\/\*\*\s*\n\s*\*\s*@file/m.test(code);
    const jsDocCount = (code.match(/\/\*\*[\s\S]*?\*\//g) || []).length;
    const exportCount = (code.match(/export\s+(function|class|const|interface|type)/g) || []).length;
    const commentLines = code.split('\n').filter(l => /^\s*(\/\/|\/\*|\*)/.test(l)).length;
    const totalLines = code.split('\n').length;
    const commentRatio = totalLines > 0 ? commentLines / totalLines : 0;

    let score = 40; // Base

    if (hasFileHeader) score += 20;
    else issues.push({ severity: 'info', message: 'Missing @file JSDoc header', file: filename, fix: 'Add /** @file ... */ header' });

    if (exportCount > 0 && jsDocCount >= exportCount) score += 25;
    else if (exportCount > 0) {
      const missing = exportCount - jsDocCount;
      issues.push({ severity: 'info', message: `${missing} exports missing JSDoc`, file: filename });
      score += Math.round(25 * (jsDocCount / Math.max(1, exportCount)));
    }

    if (commentRatio > 0.1) score += 15;
    else if (commentRatio < 0.03 && totalLines > 50) {
      issues.push({ severity: 'info', message: 'Very few comments (< 3% of lines)', file: filename });
    }

    return {
      name: 'documentation',
      score: Math.round(Math.min(100, score)),
      weight: 0.15,
      issues,
      suggestions: !hasFileHeader ? ['Add @file JSDoc header', 'Document all exported functions with JSDoc'] : [],
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────

  /** Convert numeric score to letter grade */
  private scoreToGrade(score: number): string {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 55) return 'C-';
    if (score >= 50) return 'D';
    return 'F';
  }
}

/** Singleton quality scorer instance */
export const qualityScorer = new QualityScorer();
