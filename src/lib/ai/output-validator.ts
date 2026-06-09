/**
 * @file AI Output Validator
 * @description Multi-pass validation pipeline for AI-generated content.
 *              Validates JSON, code syntax, schema structure, and markdown
 *              before presenting output to users. Auto-retries on failure.
 * @module lib/ai/output-validator
 */

/** Validation result for a single check */
export interface ValidationResult {
  /** Whether the validation passed */
  valid: boolean;
  /** Validation check name */
  check: string;
  /** Error details if validation failed */
  errors: string[];
  /** Confidence score 0-100 */
  confidence: number;
}

/** Combined validation report */
export interface ValidationReport {
  /** Overall pass/fail */
  passed: boolean;
  /** Individual check results */
  checks: ValidationResult[];
  /** Overall confidence (weighted average) */
  overallConfidence: number;
  /** Suggested fix if validation failed */
  suggestedFix?: string;
  /** Number of auto-retries attempted */
  retriesUsed: number;
}

/** Content type hint for the validator */
export type ContentType = 'json' | 'code' | 'prisma' | 'markdown' | 'sql' | 'text';

/**
 * Validates AI-generated output through multiple passes.
 *
 * @example
 * ```ts
 * const report = OutputValidator.validate(aiOutput, 'json');
 * if (!report.passed) {
 *   console.error('Validation failed:', report.checks.filter(c => !c.valid));
 * }
 * ```
 */
export class OutputValidator {
  /**
   * Run all applicable validations on the content
   * @param content - Raw AI output string
   * @param expectedType - Expected content format
   * @returns Validation report with pass/fail and confidence
   */
  static validate(content: string, expectedType: ContentType): ValidationReport {
    const checks: ValidationResult[] = [];

    // Universal checks
    checks.push(this.checkNotEmpty(content));
    checks.push(this.checkNoTruncation(content));

    // Type-specific checks
    switch (expectedType) {
      case 'json':
        checks.push(this.checkValidJSON(content));
        checks.push(this.checkJSONDepth(content));
        break;
      case 'code':
        checks.push(this.checkCodeSyntax(content));
        checks.push(this.checkNoPlaceholders(content));
        break;
      case 'prisma':
        checks.push(this.checkPrismaSchema(content));
        break;
      case 'sql':
        checks.push(this.checkSQLSyntax(content));
        break;
      case 'markdown':
        checks.push(this.checkMarkdownStructure(content));
        break;
    }

    const passed = checks.every(c => c.valid);
    const overallConfidence = checks.length > 0
      ? Math.round(checks.reduce((sum, c) => sum + c.confidence, 0) / checks.length)
      : 0;

    return {
      passed,
      checks,
      overallConfidence,
      suggestedFix: passed ? undefined : this.suggestFix(checks),
      retriesUsed: 0,
    };
  }

  /**
   * Validate and auto-retry with corrective prompt if validation fails
   * @param generateFn - Function that generates AI content
   * @param expectedType - Expected content type
   * @param maxRetries - Maximum retry attempts (default: 2)
   * @returns Content and validation report
   */
  static async validateWithRetry(
    generateFn: (correctionHint?: string) => Promise<string>,
    expectedType: ContentType,
    maxRetries = 2
  ): Promise<{ content: string; report: ValidationReport }> {
    let content = await generateFn();
    let report = this.validate(content, expectedType);
    let retries = 0;

    while (!report.passed && retries < maxRetries) {
      retries++;
      const hint = report.suggestedFix || 'Please fix the output format and try again.';
      content = await generateFn(hint);
      report = this.validate(content, expectedType);
      report.retriesUsed = retries;
    }

    return { content, report };
  }

  // ─── Individual Validation Checks ─────────────────────────────

  /** Check content is not empty or whitespace-only */
  private static checkNotEmpty(content: string): ValidationResult {
    const valid = content.trim().length > 10;
    return {
      valid,
      check: 'not-empty',
      errors: valid ? [] : ['Content is empty or too short (< 10 chars)'],
      confidence: valid ? 100 : 0,
    };
  }

  /** Check for truncation indicators */
  private static checkNoTruncation(content: string): ValidationResult {
    const truncationMarkers = ['...', '// rest of', '/* more */', '// TODO: add', '// continue'];
    const found = truncationMarkers.filter(m => content.toLowerCase().endsWith(m.toLowerCase()));
    const valid = found.length === 0;
    return {
      valid,
      check: 'no-truncation',
      errors: valid ? [] : [`Content appears truncated (ends with: ${found.join(', ')})`],
      confidence: valid ? 95 : 30,
    };
  }

  /** Validate JSON parsing */
  private static checkValidJSON(content: string): ValidationResult {
    // Strip markdown code fences if present
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    try {
      JSON.parse(cleaned);
      return { valid: true, check: 'valid-json', errors: [], confidence: 100 };
    } catch (e: any) {
      return {
        valid: false,
        check: 'valid-json',
        errors: [`Invalid JSON: ${e.message}`],
        confidence: 0,
      };
    }
  }

  /** Check JSON is not excessively nested (max depth 10) */
  private static checkJSONDepth(content: string): ValidationResult {
    try {
      const parsed = JSON.parse(content.replace(/```json\n?|```/g, '').trim());
      const depth = this.getObjectDepth(parsed);
      const valid = depth <= 10;
      return {
        valid,
        check: 'json-depth',
        errors: valid ? [] : [`JSON nesting too deep: ${depth} levels (max 10)`],
        confidence: valid ? 90 : 50,
      };
    } catch {
      return { valid: true, check: 'json-depth', errors: [], confidence: 50 };
    }
  }

  /** Basic code syntax validation */
  private static checkCodeSyntax(content: string): ValidationResult {
    const errors: string[] = [];

    // Check balanced braces
    const opens = (content.match(/{/g) || []).length;
    const closes = (content.match(/}/g) || []).length;
    if (opens !== closes) {
      errors.push(`Unbalanced braces: ${opens} open, ${closes} close`);
    }

    // Check balanced parentheses
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push(`Unbalanced parentheses: ${openParens} open, ${closeParens} close`);
    }

    // Check for common syntax errors
    if (/;\s*;/.test(content)) errors.push('Double semicolons detected');
    if (/\)\s*{/.test(content) === false && content.includes('function')) {
      // Functions without body — might be truncated
    }

    return {
      valid: errors.length === 0,
      check: 'code-syntax',
      errors,
      confidence: errors.length === 0 ? 85 : Math.max(0, 85 - errors.length * 20),
    };
  }

  /** Check for placeholder code that wasn't filled in */
  private static checkNoPlaceholders(content: string): ValidationResult {
    const placeholders = [
      /TODO:\s*implement/gi,
      /FIXME/gi,
      /your_.*_here/gi,
      /placeholder/gi,
      /REPLACE_ME/gi,
      /\.\.\.\s*$/gm,
    ];
    const found = placeholders.filter(p => p.test(content));
    return {
      valid: found.length === 0,
      check: 'no-placeholders',
      errors: found.length > 0 ? [`Found ${found.length} placeholder(s) in generated code`] : [],
      confidence: found.length === 0 ? 90 : Math.max(20, 90 - found.length * 15),
    };
  }

  /** Validate Prisma schema structure */
  private static checkPrismaSchema(content: string): ValidationResult {
    const errors: string[] = [];
    const hasModel = /model\s+\w+\s*{/.test(content);
    const hasDatasource = /datasource\s+\w+\s*{/.test(content);
    const hasGenerator = /generator\s+\w+\s*{/.test(content);

    if (!hasModel) errors.push('No Prisma model definitions found');
    if (!hasDatasource && !hasGenerator) {
      // Might be a partial schema — just models
    }

    return {
      valid: errors.length === 0,
      check: 'prisma-schema',
      errors,
      confidence: hasModel ? (hasDatasource ? 95 : 75) : 20,
    };
  }

  /** Validate SQL syntax basics */
  private static checkSQLSyntax(content: string): ValidationResult {
    const errors: string[] = [];
    const upper = content.toUpperCase();
    const hasSQL = /\b(CREATE|SELECT|INSERT|UPDATE|ALTER|DROP)\b/.test(upper);
    if (!hasSQL) errors.push('No SQL statements detected');

    // Check for incomplete statements
    const statements = content.split(';').filter(s => s.trim());
    const incomplete = statements.filter(s => {
      const trimmed = s.trim().toUpperCase();
      return trimmed.startsWith('CREATE') && !trimmed.includes('(');
    });
    if (incomplete.length > 0) {
      errors.push(`${incomplete.length} incomplete SQL statement(s)`);
    }

    return {
      valid: errors.length === 0,
      check: 'sql-syntax',
      errors,
      confidence: errors.length === 0 ? 80 : 40,
    };
  }

  /** Validate markdown has proper structure */
  private static checkMarkdownStructure(content: string): ValidationResult {
    const errors: string[] = [];
    const hasHeading = /^#{1,6}\s+\S/m.test(content);
    const lineCount = content.split('\n').length;

    if (!hasHeading) errors.push('No markdown headings found');
    if (lineCount < 5) errors.push('Content too short for a document (< 5 lines)');

    return {
      valid: errors.length === 0,
      check: 'markdown-structure',
      errors,
      confidence: errors.length === 0 ? 90 : 50,
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────

  /** Calculate JSON object nesting depth */
  private static getObjectDepth(obj: any, current = 0): number {
    if (typeof obj !== 'object' || obj === null) return current;
    const values = Array.isArray(obj) ? obj : Object.values(obj);
    if (values.length === 0) return current + 1;
    return Math.max(...values.map(v => this.getObjectDepth(v, current + 1)));
  }

  /** Generate a fix suggestion based on failed checks */
  private static suggestFix(checks: ValidationResult[]): string {
    const failed = checks.filter(c => !c.valid);
    if (failed.length === 0) return '';

    const suggestions = failed.map(c => {
      switch (c.check) {
        case 'valid-json': return 'Output must be valid JSON. Do not include markdown code fences or explanatory text.';
        case 'code-syntax': return 'Ensure all braces {} and parentheses () are properly balanced.';
        case 'no-placeholders': return 'Replace all TODO/FIXME/placeholder comments with actual implementations.';
        case 'no-truncation': return 'Do not truncate the output. Provide the complete content.';
        case 'prisma-schema': return 'Include complete Prisma model definitions with all fields and relations.';
        default: return `Fix: ${c.errors.join('; ')}`;
      }
    });

    return suggestions.join('\n');
  }
}
