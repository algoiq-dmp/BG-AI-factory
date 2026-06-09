'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn('credentials', {
      userId,
      password,
      pin,
      redirect: false,
    });
    
    if (result?.ok) {
      router.push('/');
    } else {
      alert("Invalid credentials or 2FA PIN");
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#0b0e14] z-50 flex items-center justify-center font-sans">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,37,50,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,37,50,0.5)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="relative w-full max-w-md p-8 bg-[#0b0e14] border border-[#1e2532] rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4a4fcf] to-[#2a2c7a] flex items-center justify-center shadow-lg border border-[#5b5fd8]/30 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Bhagvat Gita Engine</h1>
          <p className="text-sm text-[#8b9bb4] mt-1 font-medium">Enterprise PMO & AI Factory Login</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#586c8f] uppercase tracking-wider mb-2 block">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#1a1b3b]/50 border border-[#1e2532] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#5b5fd8] transition-colors" 
                placeholder="••••••" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 block">2FA PIN</label>
              <input 
                type="password" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                className="w-full bg-[#5b5fd8]/10 border border-indigo-500/30 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#5b5fd8] transition-colors font-mono tracking-widest" 
                placeholder="1234" 
                maxLength={4}
              />
            </div>
          </div>
          
          <button 
            disabled={loading}
            type="submit" 
            className="mt-4 w-full bg-gradient-to-r from-[#4a4fcf] to-[#5b5fd8] hover:from-[#5b5fd8] hover:to-[#6a6ff8] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(91,95,216,0.3)] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In securely'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/forgot-password" className="text-sm text-[#5b5fd8] hover:text-[#4a4fcf] font-bold transition-colors">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
}
