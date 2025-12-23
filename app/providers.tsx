"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <SessionProvider 
        // 🚀 Don't block initial render waiting for session
        refetchInterval={0}
        refetchOnWindowFocus={false}
      >
        {children}
      </SessionProvider>
    </ErrorBoundary>
  );
}
