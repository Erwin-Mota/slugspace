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
        // Refetch session after OAuth redirect
        refetchInterval={5 * 60} // Refetch every 5 minutes
        refetchOnWindowFocus={true} // Refetch when user returns to tab
      >
        {children}
      </SessionProvider>
    </ErrorBoundary>
  );
}
