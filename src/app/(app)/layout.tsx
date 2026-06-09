'use client';

/**
 * @file App Layout — Authenticated Shell
 * @description Wraps all authenticated pages with Sidebar, Header, RightPane, and session provider.
 *              Only rendered for routes inside the (app) route group.
 */
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import RightPane from "@/components/layout/RightPane";
import ToastContainer from "@/components/ui/Toast";
import SessionProvider from "@/components/providers/SessionProvider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="h-screen flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main id="main-content" className="flex-1 overflow-y-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            {children}
          </main>
        </div>
        <RightPane />
      </div>
      <ToastContainer />
    </SessionProvider>
  );
}
