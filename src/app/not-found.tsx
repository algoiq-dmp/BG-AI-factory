import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

/**
 * Custom 404 Not Found page
 */
export default function NotFound() {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="text-8xl font-black text-[#1e2532] mb-4">404</div>
        <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-[#8b9bb4] text-sm mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="bg-[#5b5fd8] hover:bg-[#4a4fcf] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/hub"
            className="bg-[#111622] border border-[#1e2532] hover:border-[#5b5fd8]/30 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Project Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
