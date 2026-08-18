"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";

interface VotingNavigationProps {
  currentStep: number;
  totalSteps: number;
  hasSelection: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const VotingNavigation: React.FC<VotingNavigationProps> = ({
  currentStep,
  totalSteps,
  hasSelection,
  onPrevious,
  onNext,
}) => {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
      <Button
        variant="ghost"
        size="md"
        className="gap-1.5"
        disabled={isFirst}
        onClick={onPrevious}
      >
        <ArrowLeft className="w-4 h-4" />
        Previous
      </Button>

      <span className="text-xs text-text-secondary font-medium">
        {currentStep + 1} / {totalSteps}
      </span>

      <Button
        variant="primary"
        size="md"
        className="gap-1.5"
        disabled={!hasSelection}
        onClick={onNext}
      >
        {isLast ? (
          <>
            Review Ballot
            <FileText className="w-4 h-4" />
          </>
        ) : (
          <>
            Next
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
};
