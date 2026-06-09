/**
 * @file Toast Store — Zustand state for toast notifications
 * @description Global toast notification system. Supports success, error, warning, and info types.
 *              Toasts auto-dismiss after a configurable duration.
 * @module store/useToastStore
 */
import { create } from 'zustand';

/** Toast notification type */
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState {
  /** Active toasts */
  toasts: Toast[];
  /** Add a toast notification */
  addToast: (toast: Omit<Toast, 'id'>) => void;
  /** Remove a toast by ID */
  removeToast: (id: string) => void;
  /** Clear all toasts */
  clearToasts: () => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 4000 };
    set({ toasts: [...get().toasts, newToast] });

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        set({ toasts: get().toasts.filter((t) => t.id !== id) });
      }, newToast.duration);
    }
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  clearToasts: () => set({ toasts: [] }),
}));

/** Convenience helpers for quick toast calls */
export const toast = {
  success: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'success', title, message }),
  error: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'error', title, message }),
  warning: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'warning', title, message }),
  info: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'info', title, message }),
};
