'use client';

/**
 * @file Toast Notification Component
 * @description Renders floating toast notifications from useToastStore.
 *              Supports 4 types: success (green), error (red), warning (yellow), info (blue).
 *              Each toast auto-dismisses and can be manually closed.
 * @module components/ui/Toast
 */
import { useToastStore } from '@/store/useToastStore';
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

const typeConfig = {
  success: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm">
      {toasts.map((t) => {
        const config = typeConfig[t.type];
        const Icon = config.icon;
        return (
          <div
            key={t.id}
            className={`${config.bg} ${config.border} border rounded-xl p-4 shadow-2xl backdrop-blur-sm animate-in slide-in-from-right-5 duration-300 flex items-start gap-3`}
          >
            <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white">{t.title}</div>
              {t.message && (
                <div className="text-xs text-[#8b9bb4] mt-1">{t.message}</div>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#586c8f] hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
