"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CandidatePageHeaderProps {
  className?: string;
}

export const CandidatePageHeader: React.FC<CandidatePageHeaderProps> = ({
  className,
}) => {
  return (
    <div className={cn("mb-8", className)}>
      <h1 className="text-2xl font-bold text-text-primary">Candidates</h1>
      <p className="text-sm text-text-secondary font-medium leading-relaxed">
        Review candidate profiles and manifestos before making your decision.
      </p>
    </div>
  );
};