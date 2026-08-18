"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VotingCandidate } from "@/lib/api-election";

interface CandidateVotingCardProps {
  candidate: VotingCandidate;
  isSelected: boolean;
  onSelect: (candidateId: string | number) => void;
}

export const CandidateVotingCard: React.FC<CandidateVotingCardProps> = ({
  candidate,
  isSelected,
  onSelect,
}) => {
  return (
    <Card
      className={cn(
        "border transition-all cursor-pointer",
        isSelected
          ? "border-primary-600 bg-primary-50 ring-2 ring-primary-600/20"
          : "border-border hover:border-primary-200 hover:bg-primary-50/50"
      )}
      onClick={() => onSelect(candidate.id)}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 mb-3">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0",
              isSelected ? "bg-primary-600" : "bg-primary-400"
            )}
          >
            {candidate.photoInitials}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-text-primary text-sm leading-tight">
              {candidate.name}
            </h4>
            <p className="text-[11px] text-primary-400 font-mono mt-0.5">
              {candidate.id}
            </p>
            <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wider mt-0.5">
              {candidate.department} &bull; {candidate.year}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-white/90 border border-border flex items-center justify-center text-base shrink-0">
            {candidate.campaignSymbol}
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed mb-3">
          &ldquo;{candidate.shortManifesto}&rdquo;
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant={isSelected ? "primary" : "secondary"}
            size="sm"
            className="flex-1 justify-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(candidate.id);
            }}
          >
            {isSelected ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Selected
              </>
            ) : (
              "Select"
            )}
          </Button>
          <Link
            href={`/student/candidates/${candidate.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              Profile
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
