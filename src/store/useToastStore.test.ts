/**
 * @file Toast Store Tests
 * @description Unit tests for the toast notification store
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useToastStore, toast } from '@/store/useToastStore';

describe('useToastStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useToastStore.setState({ toasts: [] });
    vi.useFakeTimers();
  });

  it('should start with empty toasts', () => {
    const state = useToastStore.getState();
    expect(state.toasts).toEqual([]);
  });

  it('should add a toast', () => {
    useToastStore.getState().addToast({
      type: 'success',
      title: 'Test Toast',
      message: 'This is a test',
    });

    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].type).toBe('success');
    expect(state.toasts[0].title).toBe('Test Toast');
    expect(state.toasts[0].message).toBe('This is a test');
    expect(state.toasts[0].id).toBeDefined();
  });

  it('should remove a toast by ID', () => {
    useToastStore.getState().addToast({ type: 'info', title: 'Toast 1' });
    useToastStore.getState().addToast({ type: 'error', title: 'Toast 2' });

    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(2);

    useToastStore.getState().removeToast(toasts[0].id);
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0].title).toBe('Toast 2');
  });

  it('should clear all toasts', () => {
    useToastStore.getState().addToast({ type: 'info', title: 'Toast 1' });
    useToastStore.getState().addToast({ type: 'warning', title: 'Toast 2' });
    useToastStore.getState().addToast({ type: 'error', title: 'Toast 3' });

    expect(useToastStore.getState().toasts).toHaveLength(3);
    useToastStore.getState().clearToasts();
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('should auto-dismiss after duration', () => {
    useToastStore.getState().addToast({
      type: 'success',
      title: 'Auto-dismiss',
      duration: 2000,
    });

    expect(useToastStore.getState().toasts).toHaveLength(1);

    vi.advanceTimersByTime(2000);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('should default duration to 4000ms', () => {
    useToastStore.getState().addToast({ type: 'info', title: 'Default' });

    const t = useToastStore.getState().toasts[0];
    expect(t.duration).toBe(4000);
  });

  it('should support convenience helpers', () => {
    toast.success('Success!');
    toast.error('Error!');
    toast.warning('Warning!');
    toast.info('Info!');

    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(4);
    expect(toasts[0].type).toBe('success');
    expect(toasts[1].type).toBe('error');
    expect(toasts[2].type).toBe('warning');
    expect(toasts[3].type).toBe('info');
  });
});
