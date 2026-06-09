'use client';

import { SessionProvider as Provider } from 'next-auth/react';
import React from 'react';

class SessionErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.warn('[SessionProvider] Auth error caught, rendering without session:', error.message);
  }
  render() {
    if (this.state.hasError) {
      return <>{this.props.children}</>;
    }
    return this.props.children;
  }
}

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionErrorBoundary>
      <Provider>{children}</Provider>
    </SessionErrorBoundary>
  );
}
