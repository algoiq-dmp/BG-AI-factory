/**
 * @file Architecture Consistency Checker
 * @description Cross-validates entities across pipeline stages to catch inconsistencies.
 *              Ensures API endpoints reference existing DB tables, frontend components
 *              call valid APIs, and all entities are properly connected.
 * @module lib/quality/consistency-checker
 */

/** An entity extracted from a pipeline stage output */
export interface Entity {
  /** Entity name (table name, endpoint path, component name) */
  name: string;
  /** Entity type */
  type: 'table' | 'endpoint' | 'component' | 'model' | 'route' | 'service';
  /** Which pipeline stage produced this entity */
  source: string;
  /** References to other entities */
  references: string[];
}

/** A consistency violation between stages */
export interface ConsistencyViolation {
  /** Violation severity */
  severity: 'error' | 'warning';
  /** Which check detected this */
  check: string;
  /** Human-readable description */
  message: string;
  /** Entity that has the issue */
  entity: string;
  /** Source stage */
  sourceStage: string;
  /** Expected reference stage */
  expectedIn: string;
  /** Suggested fix */
  fix: string;
}

/** Complete consistency report */
export interface ConsistencyReport {
  /** Overall pass/fail */
  consistent: boolean;
  /** Total violations found */
  violationCount: number;
  /** All violations */
  violations: ConsistencyViolation[];
  /** Entity summary by type */
  entitySummary: Record<string, number>;
  /** Cross-reference matrix showing which stages reference which */
  crossRefMatrix: Record<string, string[]>;
  /** Timestamp */
  analyzedAt: string;
}

/**
 * Cross-validates consistency across pipeline stage outputs.
 * 
 * @example
 * ```ts
 * const checker = new ConsistencyChecker();
 * checker.registerEntities('Database AI', dbOutput);
 * checker.registerEntities('Backend AI', apiOutput);
 * checker.registerEntities('Frontend AI', frontendOutput);
 * const report = checker.validate();
 * ```
 */
export class ConsistencyChecker {
  /** All registered entities from pipeline stages */
  private entities: Entity[] = [];

  /** Known entities indexed by type and name for fast lookup */
  private entityIndex: Map<string, Set<string>> = new Map();

  /**
   * Register entities extracted from a pipeline stage output
   * @param stageName - Pipeline stage that produced the output
   * @param output - Raw AI output text to parse for entities
   */
  registerEntities(stageName: string, output: string): void {
    // Extract DB tables
    const tableMatches = output.matchAll(/(?:model|table|CREATE TABLE)\s+["`]?(\w+)["`]?/gi);
    for (const match of tableMatches) {
      this.addEntity({ name: match[1], type: 'table', source: stageName, references: [] });
    }

    // Extract API endpoints
    const endpointMatches = output.matchAll(/(?:GET|POST|PUT|DELETE|PATCH)\s+["`']?(\/[\w/:.-]+)["`']?/gi);
    for (const match of endpointMatches) {
      this.addEntity({ name: match[1], type: 'endpoint', source: stageName, references: [] });
    }

    // Extract React/Next.js components
    const componentMatches = output.matchAll(/(?:export\s+(?:default\s+)?(?:function|const))\s+(\w+)/g);
    for (const match of componentMatches) {
      if (/^[A-Z]/.test(match[1])) {
        this.addEntity({ name: match[1], type: 'component', source: stageName, references: [] });
      }
    }

    // Extract Prisma models
    const modelMatches = output.matchAll(/model\s+(\w+)\s*\{/g);
    for (const match of modelMatches) {
      this.addEntity({ name: match[1], type: 'model', source: stageName, references: [] });
    }

    // Extract references to other entities (e.g., "references User table", "calls /api/users")
    const refMatches = output.matchAll(/(?:references?|calls?|uses?|imports?)\s+["`']?(\w+)["`']?/gi);
    for (const match of refMatches) {
      const lastEntity = this.entities[this.entities.length - 1];
      if (lastEntity) {
        lastEntity.references.push(match[1]);
      }
    }
  }

  /**
   * Add a single entity to the registry
   */
  private addEntity(entity: Entity): void {
    this.entities.push(entity);
    const key = entity.type;
    if (!this.entityIndex.has(key)) {
      this.entityIndex.set(key, new Set());
    }
    this.entityIndex.get(key)!.add(entity.name.toLowerCase());
  }

  /**
   * Run all consistency checks and produce a report
   * @returns ConsistencyReport with violations and suggestions
   */
  validate(): ConsistencyReport {
    const violations: ConsistencyViolation[] = [];

    // Check 1: API endpoints reference valid DB tables/models
    violations.push(...this.checkAPItoDBConsistency());

    // Check 2: Frontend components call valid API endpoints
    violations.push(...this.checkFrontendToAPIConsistency());

    // Check 3: Orphaned entities (defined but never referenced)
    violations.push(...this.checkOrphanedEntities());

    // Check 4: Missing CRUD completeness
    violations.push(...this.checkCRUDCompleteness());

    // Build entity summary
    const entitySummary: Record<string, number> = {};
    for (const entity of this.entities) {
      entitySummary[entity.type] = (entitySummary[entity.type] || 0) + 1;
    }

    // Build cross-reference matrix
    const crossRefMatrix: Record<string, string[]> = {};
    for (const entity of this.entities) {
      if (!crossRefMatrix[entity.source]) crossRefMatrix[entity.source] = [];
      crossRefMatrix[entity.source].push(`${entity.type}:${entity.name}`);
    }

    return {
      consistent: violations.filter(v => v.severity === 'error').length === 0,
      violationCount: violations.length,
      violations,
      entitySummary,
      crossRefMatrix,
      analyzedAt: new Date().toISOString(),
    };
  }

  /** Check if API endpoints reference valid DB tables */
  private checkAPItoDBConsistency(): ConsistencyViolation[] {
    const violations: ConsistencyViolation[] = [];
    const tables = this.entityIndex.get('table') || this.entityIndex.get('model') || new Set();
    const endpoints = this.entities.filter(e => e.type === 'endpoint');

    for (const ep of endpoints) {
      // Extract resource name from endpoint path (e.g., /api/users -> users -> User)
      const parts = ep.name.split('/').filter(Boolean);
      const resource = parts[parts.length - 1]?.replace(/:[^/]+/, '').toLowerCase();

      if (resource && resource.length > 2 && !resource.startsWith('[')) {
        const singular = resource.endsWith('s') ? resource.slice(0, -1) : resource;
        const tableExists = tables.has(resource) || tables.has(singular) ||
          tables.has(resource.charAt(0).toUpperCase() + resource.slice(1)) ||
          tables.has(singular.charAt(0).toUpperCase() + singular.slice(1));

        if (!tableExists && tables.size > 0) {
          violations.push({
            severity: 'warning',
            check: 'api-db-consistency',
            message: `API endpoint "${ep.name}" references resource "${resource}" but no matching DB table/model found`,
            entity: ep.name,
            sourceStage: ep.source,
            expectedIn: 'Database AI',
            fix: `Create a "${singular.charAt(0).toUpperCase() + singular.slice(1)}" model in your database schema`,
          });
        }
      }
    }

    return violations;
  }

  /** Check if frontend components reference valid API endpoints */
  private checkFrontendToAPIConsistency(): ConsistencyViolation[] {
    const violations: ConsistencyViolation[] = [];
    const endpoints = this.entityIndex.get('endpoint') || new Set();
    const components = this.entities.filter(e => e.type === 'component');

    for (const comp of components) {
      for (const ref of comp.references) {
        if (ref.startsWith('/api') && !endpoints.has(ref.toLowerCase())) {
          violations.push({
            severity: 'error',
            check: 'frontend-api-consistency',
            message: `Component "${comp.name}" calls API "${ref}" which doesn't exist`,
            entity: comp.name,
            sourceStage: comp.source,
            expectedIn: 'Backend AI',
            fix: `Create API route handler for "${ref}"`,
          });
        }
      }
    }

    return violations;
  }

  /** Find orphaned entities (defined but never referenced by other stages) */
  private checkOrphanedEntities(): ConsistencyViolation[] {
    const violations: ConsistencyViolation[] = [];
    const allRefs = new Set(this.entities.flatMap(e => e.references.map(r => r.toLowerCase())));

    for (const entity of this.entities) {
      if (entity.type === 'table' || entity.type === 'model') {
        if (!allRefs.has(entity.name.toLowerCase()) && this.entities.length > 5) {
          violations.push({
            severity: 'warning',
            check: 'orphaned-entity',
            message: `"${entity.name}" (${entity.type}) is defined but never referenced by any other stage`,
            entity: entity.name,
            sourceStage: entity.source,
            expectedIn: 'Backend AI / Frontend AI',
            fix: `Either create API endpoints for "${entity.name}" or remove it from the schema`,
          });
        }
      }
    }

    return violations;
  }

  /** Check CRUD completeness for resources */
  private checkCRUDCompleteness(): ConsistencyViolation[] {
    const violations: ConsistencyViolation[] = [];
    const endpoints = this.entities.filter(e => e.type === 'endpoint');

    // Group endpoints by resource
    const resourceOps: Record<string, Set<string>> = {};
    for (const ep of endpoints) {
      const parts = ep.name.split('/').filter(Boolean);
      const resource = parts.find(p => !p.startsWith(':') && !p.startsWith('[') && p !== 'api');
      if (resource) {
        if (!resourceOps[resource]) resourceOps[resource] = new Set();
        // Infer operation from endpoint pattern
        if (ep.name.includes(':id') || ep.name.includes('[id]')) {
          resourceOps[resource].add('READ_ONE');
          resourceOps[resource].add('UPDATE');
          resourceOps[resource].add('DELETE');
        } else {
          resourceOps[resource].add('LIST');
          resourceOps[resource].add('CREATE');
        }
      }
    }

    for (const [resource, ops] of Object.entries(resourceOps)) {
      const missing = ['LIST', 'CREATE', 'READ_ONE', 'UPDATE', 'DELETE'].filter(op => !ops.has(op));
      if (missing.length > 0 && missing.length < 4) {
        violations.push({
          severity: 'info' as any,
          check: 'crud-completeness',
          message: `Resource "${resource}" is missing: ${missing.join(', ')}`,
          entity: resource,
          sourceStage: 'Backend AI',
          expectedIn: 'Backend AI',
          fix: `Add ${missing.map(m => m.toLowerCase()).join(', ')} endpoints for "${resource}"`,
        });
      }
    }

    return violations;
  }

  /** Reset all registered entities */
  reset(): void {
    this.entities = [];
    this.entityIndex = new Map();
  }
}

/** Singleton instance */
export const consistencyChecker = new ConsistencyChecker();
