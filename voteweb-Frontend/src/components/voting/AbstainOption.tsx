"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AbstainOptionProps {
  isAbstained: boolean;
  onAbstain: () => void;
}

export const AbstainOption: React.FC<AbstainOptionProps> = ({
  isAbstained,
  onAbstain,
}) => {
  return (
    <Card
      className={cn(
        "border transition-all",
        isAbstained
          ? "border-warning bg-warning-50 ring-2 ring-warning/20"
          : "border-border hover:border-warning/50"
      )}
    >
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isAbstained ? "bg-warning" : "bg-border"
            )}
          >
            <Minus className={cn("w-5 h-5", isAbstained ? "text-white" : "text-text-secondary")} />
          </div>
          <div>
            <h4 className="font-medium text-sm text-text-primary">
              Abstain from this position
            </h4>
            <p className="text-[11px] text-text-secondary">
              Choose this if you do not wish to select a candidate for this position.
            </p>
          </div>
        </div>
        <Button
          variant={isAbstained ? "outline" : "ghost"}
          size="sm"
          className={cn("gap-1.5 shrink-0", isAbstained && "border-warning text-warning")}
          onClick={onAbstain}
        >
          {isAbstained ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Abstained
            </>
          ) : (
            "Abstain"
          )}
        </Button>
      </div>
    </Card>
  );
};
