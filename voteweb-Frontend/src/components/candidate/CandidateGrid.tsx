"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CandidateCard } from "./CandidateCard";

interface CandidateGridProps {
  candidates: Array<{
    id: string;
    name: string;
    position: string;
    department: string;
    year: string;
    photoInitials: string;
    campaignSymbol: string;
    verified: boolean;
    biography: string;
    manifestos: { title: string; content: string }[];
  }>;
  className?: string;
  onCompare?: (id: string) => void;
  comparedIds?: Set<string>;
  onSelect?: (id: string) => void;
  selectedIds?: Set<string>;
}

export const CandidateGrid: React.FC<CandidateGridProps> = ({
  candidates,
  className,
  onCompare,
  comparedIds = new Set(),
  onSelect,
  selectedIds = new Set(),
}) => {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          onCompare={onCompare}
          isCompared={comparedIds.has(candidate.id)}
          onSelect={onSelect}
          isSelected={selectedIds.has(candidate.id)}
        />
      ))}
    </div>
  );
};
