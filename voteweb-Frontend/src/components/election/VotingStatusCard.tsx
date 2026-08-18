import React from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { CheckCircle2, Vote, Clock } from "lucide-react"
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VotingStatusCardProps {
  className?: string;
}

export const VotingStatusCard: React.FC<VotingStatusCardProps> = ({ className }) => {
  const steps = [
    { label: "Eligibility", status: "complete", detail: "✓ Verified" },
    { label: "Voting Status", status: "pending", detail: "Not Voted" },
    { label: "Election", status: "active", detail: "Open" },
  ];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-primary-100 rounded-xl">
          <Vote className="w-5 h-5 text-primary-700" />
        </div>
        <h3 className="font-semibold text-text-primary">Voting Progress</h3>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-4">
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm z-10 transition-all duration-200",
                  step.status === "complete" && "bg-success-500 text-white",
                  step.status === "active" && "bg-primary-600 text-white shadow-[0_0_0_4px_rgba(79,85,200,0.2)]",
                  step.status === "pending" && "bg-white text-text-muted border-2 border-border"
                )}
              >
                {step.status === "complete" && <CheckCircle2 className="w-5 h-5" />}
                {step.status === "active" && <Vote className="w-5 h-5" />}
                {step.status === "pending" && <Clock className="w-5 h-5" />}
              </div>
              {index < steps.length - 1 && (
                <div className="absolute top-10 bottom-10 left-4.5 w-0.5 bg-border" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{step.label}</p>
              <p className="text-xs text-text-secondary mt-0.5">{step.detail}</p>
            </div>

            <div className="shrink-0">
              {step.status === "pending" && step.label === "Voting Status" && (
                <Link href="/student/vote">
                  <Button variant="secondary" size="sm" className="gap-1.5">
                    <Vote className="w-3.5 h-3.5" />
                    Vote Now
                  </Button>
                </Link>
              )}
              {step.status === "complete" && (
                <Badge variant="success" size="sm">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              )}
              {step.status === "active" && (
                <Badge variant="info" size="sm">
                  Active
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};