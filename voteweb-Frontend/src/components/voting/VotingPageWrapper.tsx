"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

export function VotingPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      {children}
    </Suspense>
  );
}
