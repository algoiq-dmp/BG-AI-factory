'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [simulatedToken, setSimulatedToken] = useState('');

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    setSimulatedToken('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage('Reset request successful!');
        setSimulatedToken(data.token); // Simulated for testing
      } else {
        setError(data.error || 'Failed to request reset');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#0b0e14] z-50 flex items-center justify-center font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,37,50,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,37,50,0.5)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="relative w-full max-w-md p-8 bg-[#0b0e14] border border-[#1e2532] rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4a4fcf] to-[#2a2c7a] flex items-center justify-center shadow-lg border border-[#5b5fd8]/30 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Reset Password</h1>
          <p className="text-sm text-[#8b9bb4] mt-1 font-medium text-center">Enter your User ID to receive a reset token from the Admin.</p>
        </div>

        {message && (
          <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-bold text-center">
            {message}
          </div>
        )}

        {simulatedToken && (
          <div className="mb-6 p-4 rounded-lg bg-[#1a1b3b] border border-[#5b5fd8]/30">
            <p className="text-xs text-[#8b9bb4] mb-2 font-medium">SIMULATED TOKEN (Dev Only):</p>
            <p className="text-lg font-mono text-white text-center tracking-widest">{simulatedToken}</p>
            <p className="text-[10px] text-center text-yellow-400 mt-2">Use this token to reset your password.</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleResetRequest} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-[#586c8f] uppercase tracking-wider mb-2 block">User ID</label>
            <input 
              type="text" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              className="w-full bg-[#1a1b3b]/50 border border-[#1e2532] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#5b5fd8] transition-colors" 
              placeholder="e.g. ALGOIQ01" 
            />
          </div>
          
          <button 
            disabled={loading}
            type="submit" 
            className="mt-2 w-full bg-gradient-to-r from-[#4a4fcf] to-[#5b5fd8] hover:from-[#5b5fd8] hover:to-[#6a6ff8] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(91,95,216,0.3)] disabled:opacity-50"
          >
            {loading ? 'Requesting...' : 'Request Reset Token'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-[#8b9bb4] hover:text-white font-bold transition-colors flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
