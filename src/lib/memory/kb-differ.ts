/**
 * @file Knowledge Base Diffing Engine
 * @description Git-style versioning and diffing for Knowledge Base changes.
 *              Tracks every KB modification, enables rollback, and shows
 *              change attribution (which AI step or user action modified the KB).
 * @module lib/memory/kb-differ
 */

/** A single KB change record */
export interface KBChange {
  /** Change unique ID */
  id: string;
  /** What field/section changed */
  field: string;
  /** Previous value */
  oldValue: string;
  /** New value */
  newValue: string;
  /** What triggered this change */
  source: 'user' | 'auto-intelligence' | 'mcq' | 'suggestion' | 'pipeline' | 'import';
  /** Specific step or action that caused the change */
  sourceDetail: string;
  /** ISO timestamp */
  timestamp: string;
}

/** A KB version snapshot */
export interface KBVersion {
  /** Version number (auto-incremented) */
  version: number;
  /** Project ID */
  projectId: string;
  /** Full KB snapshot at this version */
  snapshot: Record<string, any>;
  /** Changes that led to this version */
  changes: KBChange[];
  /** ISO timestamp */
  createdAt: string;
  /** Optional label (e.g., "After Auto Intelligence Step 7") */
  label?: string;
}

/** Diff between two KB versions */
export interface KBDiff {
  /** Source version */
  fromVersion: number;
  /** Target version */
  toVersion: number;
  /** Fields added */
  added: Array<{ field: string; value: string }>;
  /** Fields removed */
  removed: Array<{ field: string; value: string }>;
  /** Fields modified */
  modified: Array<{ field: string; oldValue: string; newValue: string }>;
  /** Total changes */
  totalChanges: number;
}

/**
 * Knowledge Base Diffing Engine — tracks all KB changes with
 * versioning, diffing, and rollback capabilities.
 *
 * @example
 * ```ts
 * const differ = new KBDiffer('project-123');
 * differ.recordChange('features', '', 'Auth, Dashboard', 'auto-intelligence', 'Step 3');
 * differ.createSnapshot({ features: 'Auth, Dashboard' }, 'After Step 3');
 * const diff = differ.diff(1, 2);
 * ```
 */
export class KBDiffer {
  /** Project ID */
  private projectId: string;

  /** Version history */
  private versions: KBVersion[] = [];

  /** Pending changes (not yet committed to a version) */
  private pendingChanges: KBChange[] = [];

  /** Current version counter */
  private currentVersion = 0;

  constructor(projectId: string) {
    this.projectId = projectId;
  }

  /**
   * Record a KB change
   * @param field - Which KB field changed
   * @param oldValue - Previous value
   * @param newValue - New value
   * @param source - What triggered this change
   * @param sourceDetail - Specific step/action
   */
  recordChange(
    field: string,
    oldValue: string,
    newValue: string,
    source: KBChange['source'],
    sourceDetail: string
  ): KBChange {
    const change: KBChange = {
      id: `chg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      field,
      oldValue,
      newValue,
      source,
      sourceDetail,
      timestamp: new Date().toISOString(),
    };

    this.pendingChanges.push(change);
    return change;
  }

  /**
   * Create a version snapshot (commits pending changes)
   * @param snapshot - Full KB state at this point
   * @param label - Optional human-readable label
   * @returns The created version
   */
  createSnapshot(snapshot: Record<string, any>, label?: string): KBVersion {
    this.currentVersion++;

    const version: KBVersion = {
      version: this.currentVersion,
      projectId: this.projectId,
      snapshot: JSON.parse(JSON.stringify(snapshot)), // Deep clone
      changes: [...this.pendingChanges],
      createdAt: new Date().toISOString(),
      label,
    };

    this.versions.push(version);
    this.pendingChanges = []; // Clear pending

    // Keep max 50 versions per project
    if (this.versions.length > 50) {
      this.versions = this.versions.slice(-50);
    }

    return version;
  }

  /**
   * Compute diff between two versions
   * @param fromVersion - Source version number
   * @param toVersion - Target version number
   * @returns Diff showing added, removed, and modified fields
   */
  diff(fromVersion: number, toVersion: number): KBDiff | null {
    const from = this.versions.find(v => v.version === fromVersion);
    const to = this.versions.find(v => v.version === toVersion);

    if (!from || !to) return null;

    const added: KBDiff['added'] = [];
    const removed: KBDiff['removed'] = [];
    const modified: KBDiff['modified'] = [];

    const fromKeys = new Set(Object.keys(from.snapshot));
    const toKeys = new Set(Object.keys(to.snapshot));

    // Added fields
    for (const key of toKeys) {
      if (!fromKeys.has(key)) {
        added.push({ field: key, value: String(to.snapshot[key]) });
      }
    }

    // Removed fields
    for (const key of fromKeys) {
      if (!toKeys.has(key)) {
        removed.push({ field: key, value: String(from.snapshot[key]) });
      }
    }

    // Modified fields
    for (const key of fromKeys) {
      if (toKeys.has(key)) {
        const oldVal = JSON.stringify(from.snapshot[key]);
        const newVal = JSON.stringify(to.snapshot[key]);
        if (oldVal !== newVal) {
          modified.push({
            field: key,
            oldValue: String(from.snapshot[key]),
            newValue: String(to.snapshot[key]),
          });
        }
      }
    }

    return {
      fromVersion,
      toVersion,
      added,
      removed,
      modified,
      totalChanges: added.length + removed.length + modified.length,
    };
  }

  /**
   * Rollback to a specific version
   * @param targetVersion - Version number to restore
   * @returns The snapshot at that version, or null if not found
   */
  rollback(targetVersion: number): Record<string, any> | null {
    const version = this.versions.find(v => v.version === targetVersion);
    if (!version) return null;

    // Create a rollback change record
    this.recordChange(
      '__rollback',
      `v${this.currentVersion}`,
      `v${targetVersion}`,
      'user',
      `Rollback from v${this.currentVersion} to v${targetVersion}`
    );

    return JSON.parse(JSON.stringify(version.snapshot)); // Return deep clone
  }

  /**
   * Get version history
   * @param limit - Max versions to return (default: all)
   */
  getHistory(limit?: number): KBVersion[] {
    const history = [...this.versions].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Get all changes for a specific source (e.g., "auto-intelligence")
   */
  getChangesBySource(source: KBChange['source']): KBChange[] {
    return this.versions
      .flatMap(v => v.changes)
      .filter(c => c.source === source);
  }

  /**
   * Get the latest version number
   */
  getCurrentVersion(): number {
    return this.currentVersion;
  }

  /**
   * Get pending (uncommitted) changes
   */
  getPendingChanges(): KBChange[] {
    return [...this.pendingChanges];
  }

  /**
   * Get evolution timeline showing change frequency over time
   */
  getEvolutionTimeline(): Array<{ version: number; label: string; changeCount: number; timestamp: string }> {
    return this.versions.map(v => ({
      version: v.version,
      label: v.label || `Version ${v.version}`,
      changeCount: v.changes.length,
      timestamp: v.createdAt,
    }));
  }
}

/** Factory function to create a differ for a specific project */
export function createKBDiffer(projectId: string): KBDiffer {
  return new KBDiffer(projectId);
}
