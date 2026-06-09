'use client';

/**
 * @file Public Layout — No App Shell
 * @description Clean layout for public pages (home, login, pricing).
 *              No sidebar, no header, no authentication required.
 *              Wraps with SessionProvider so login page can use signIn().
 */
import SessionProvider from "@/components/providers/SessionProvider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen">
        {children}
      </div>
    </SessionProvider>
  );
}
