'use client';

/**
 * @file Auto-Save React Hook
 * @description Provides debounced auto-saving functionality for forms and editors.
 *              Watches data changes, debounces save calls, warns on unsaved changes
 *              before page unload, and exposes manual save triggers.
 * @module lib/hooks/useAutoSave
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// ─── Types ──────────────────────────────────────────────────────

/**
 * Configuration options for the useAutoSave hook.
 */
export interface AutoSaveOptions {
  /** The data object to watch for changes. Compared via JSON serialization. */
  data: any;
  /** Async callback invoked with the current data when a save is triggered. */
  onSave: (data: any) => Promise<void>;
  /** Debounce interval in milliseconds before triggering a save. @default 2000 */
  debounceMs?: number;
  /** Whether auto-saving is enabled. Set to false to pause. @default true */
  enabled?: boolean;
}

/**
 * Return value from the useAutoSave hook.
 */
export interface AutoSaveReturn {
  /** Whether a save operation is currently in progress. */
  isSaving: boolean;
  /** Timestamp of the last successful save, or null if never saved. */
  lastSavedAt: Date | null;
  /** Manually trigger an immediate save, bypassing the debounce timer. */
  forceSave: () => void;
}

// ─── Hook Implementation ────────────────────────────────────────

/**
 * React hook for auto-saving data with debounce, unsaved-changes warnings,
 * and manual save support.
 *
 * @param options - Auto-save configuration
 * @returns Object with saving state, last-saved timestamp, and a manual save trigger
 *
 * @example
 * ```tsx
 * import { useAutoSave } from '@/lib/hooks/useAutoSave';
 *
 * function EditorForm() {
 *   const [formData, setFormData] = useState({ title: '', body: '' });
 *
 *   const { isSaving, lastSavedAt, forceSave } = useAutoSave({
 *     data: formData,
 *     onSave: async (data) => {
 *       await fetch('/api/save', {
 *         method: 'POST',
 *         body: JSON.stringify(data),
 *       });
 *     },
 *     debounceMs: 3000,
 *   });
 *
 *   return (
 *     <div>
 *       <input
 *         value={formData.title}
 *         onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
 *       />
 *       <button onClick={forceSave} disabled={isSaving}>
 *         {isSaving ? 'Saving...' : 'Save Now'}
 *       </button>
 *       {lastSavedAt && <span>Last saved: {lastSavedAt.toLocaleTimeString()}</span>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAutoSave(options: AutoSaveOptions): AutoSaveReturn {
  const {
    data,
    onSave,
    debounceMs = 2000,
    enabled = true,
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  /**
   * Track whether there are unsaved changes for the beforeunload guard.
   * Using a ref so the beforeunload handler always reads the latest value
   * without needing to re-register the event listener.
   */
  const hasUnsavedChanges = useRef(false);

  /** Stores the debounce timer ID so it can be cleared on new changes or unmount. */
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Ref to the latest onSave callback to avoid stale closure issues. */
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  /** Ref to the latest data snapshot for the save function. */
  const dataRef = useRef(data);
  dataRef.current = data;

  /** Track the last serialized data to detect actual changes. */
  const lastSerializedRef = useRef<string>('');

  /** Flag to skip the first render (initial mount). */
  const isFirstRender = useRef(true);

  // ─── Core Save Function ─────────────────────────────────────

  /**
   * Execute the save operation. Handles state transitions, error logging,
   * and unsaved-changes flag management.
   */
  const executeSave = useCallback(async () => {
    if (isSaving) return;

    const currentData = dataRef.current;
    setIsSaving(true);

    try {
      await onSaveRef.current(currentData);
      setLastSavedAt(new Date());
      hasUnsavedChanges.current = false;
      lastSerializedRef.current = JSON.stringify(currentData);
    } catch (error) {
      // Log save failures — consumers should handle errors in their onSave callback
      console.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: 'Auto-save failed',
          context: 'useAutoSave',
          error: error instanceof Error ? error.message : String(error),
        })
      );
    } finally {
      setIsSaving(false);
    }
  }, [isSaving]);

  // ─── Manual Save Trigger ────────────────────────────────────

  /**
   * Force an immediate save, clearing any pending debounce timer.
   * Safe to call multiple times — concurrent saves are prevented.
   */
  const forceSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    executeSave();
  }, [executeSave]);

  // ─── Data Change Watcher ────────────────────────────────────

  useEffect(() => {
    // Skip auto-save on first mount — the initial data is the "baseline"
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastSerializedRef.current = JSON.stringify(data);
      return;
    }

    if (!enabled) return;

    // Serialize and compare to detect real changes (not just reference changes)
    const serialized = JSON.stringify(data);
    if (serialized === lastSerializedRef.current) return;

    hasUnsavedChanges.current = true;

    // Clear any existing debounce timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Schedule a new debounced save
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      executeSave();
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [data, debounceMs, enabled, executeSave]);

  // ─── Beforeunload Guard ─────────────────────────────────────

  useEffect(() => {
    /**
     * Warn the user if they try to close/navigate away with unsaved changes.
     * The browser shows a generic confirmation dialog.
     */
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        // Modern browsers ignore custom messages but require returnValue to be set
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // ─── Cleanup on Unmount ─────────────────────────────────────

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { isSaving, lastSavedAt, forceSave };
}

export default useAutoSave;
