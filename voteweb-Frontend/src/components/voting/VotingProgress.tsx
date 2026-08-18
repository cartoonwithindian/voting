"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface VotingProgressProps {
  currentStep: number;
  totalSteps: number;
  steps?: string[];
}

export const VotingProgress: React.FC<VotingProgressProps> = ({
  currentStep,
  totalSteps,
  steps = ["Select", "Review", "Confirm"],
}) => {
  return (
    <div className="w-full">
      {/* Desktop progress */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <React.Fragment key={step}>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                    isCompleted && "bg-success text-white",
                    isActive && "bg-primary-600 text-white",
                    isUpcoming && "bg-border text-text-secondary"
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive && "text-primary-600",
                    isCompleted && "text-success",
                    isUpcoming && "text-text-secondary"
                  )}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-3 rounded-full",
                    index < currentStep ? "bg-success" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile progress */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-primary">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-xs text-text-secondary">{steps[currentStep]}</span>
        </div>
        <div className="w-full h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
