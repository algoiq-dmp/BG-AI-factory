'use client';

/**
 * @file Global Error Handler
 * @description Catches errors in the root layout that error.tsx cannot handle.
 *              This is the last resort error boundary.
 */
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: '#0a0f1c', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
            <div style={{ width: '4rem', height: '4rem', borderRadius: '1rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <AlertTriangle style={{ width: '2rem', height: '2rem', color: '#f87171' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Critical Error</h2>
            <p style={{ color: '#8b9bb4', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              The application encountered a critical error. Please refresh the page.
            </p>
            {error?.digest && (
              <p style={{ fontSize: '0.625rem', color: '#586c8f', fontFamily: 'monospace', marginBottom: '1rem' }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{ backgroundColor: '#5b5fd8', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw style={{ width: '1rem', height: '1rem' }} />
              Refresh Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
