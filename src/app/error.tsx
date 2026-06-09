'use client';

/**
 * @file Next.js Error Boundary
 * @description Catches and displays runtime errors within route segments.
 *              Provides a recovery button to re-render the segment.
 */
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-[#8b9bb4] text-sm mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        {error.digest && (
          <p className="text-[10px] text-[#586c8f] font-mono mb-4">
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="bg-[#5b5fd8] hover:bg-[#4a4fcf] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
