import React from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils";

interface ActivityStep {
  label: string;
  status: "complete" | "active" | "pending";
  dateRange?: string;
}

interface ActivityListProps {
  steps: ActivityStep[];
  className?: string;
}

export const ActivityList: React.FC<ActivityListProps> = ({ steps, className }) => {
  return (
    <Card className={cn(className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-primary-100 rounded-xl">
          <Clock className="w-5 h-5 text-primary-700" />
        </div>
        <h3 className="font-semibold text-text-primary">Election Activity</h3>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="relative flex flex-col items-center shrink-0">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all duration-200",
                  step.status === "complete" && "bg-success-500 text-white",
                  step.status === "active" && "bg-primary-600 text-white shadow-[0_0_0_4px_rgba(79,85,200,0.2)]",
                  step.status === "pending" && "bg-white text-text-muted border-2 border-border"
                )}
              >
                {step.status === "complete" && <CheckCircle2 className="w-5 h-5" />}
                {step.status === "active" && (
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
                {step.status === "pending" && <Clock className="w-5 h-5" />}
              </div>
              {index < steps.length - 1 && (
                <div className="absolute top-10 bottom-10 left-4.5 w-0.5 bg-border" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-text-primary">{step.label}</p>
                {step.status === "complete" && (
                  <Badge variant="success" size="sm">Completed</Badge>
                )}
                {step.status === "active" && (
                  <Badge variant="info" size="sm">Active</Badge>
                )}
                {step.status === "pending" && (
                  <Badge variant="neutral" size="sm">Pending</Badge>
                )}
              </div>
              {step.dateRange && (
                <p className="text-xs text-text-muted mt-0.5">{step.dateRange}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};