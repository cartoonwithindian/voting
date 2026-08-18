import React from "react";
import { Card } from "../ui/Card";
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils";

export interface TimelineStep {
  label: string;
  status: "completed" | "active" | "pending";
  dateRange?: string;
}

export interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ steps, className }) => {
  return (
    <Card className={cn("space-y-4", className)}>
      <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5">
        Election Timeline
      </h3>

      <div className="relative pl-4 space-y-5 border-l-2 border-slate-100 ml-2 py-1">
        {steps.map((step, index) => {
          const isCompleted = step.status === "completed";
          const isActive = step.status === "active";

          return (
            <div key={index} className="relative group">
              {/* Timeline marker */}
              <div
                className={cn(
                  "absolute -left-[25px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-all",
                  {
                    "border-blue-600 text-blue-600 scale-110": isActive,
                    "border-emerald-500 text-emerald-500 bg-emerald-50": isCompleted,
                    "border-slate-300 text-slate-400": !isCompleted && !isActive,
                  }
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-50 text-emerald-500" />
                ) : isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                )}
              </div>

              {/* Text content */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={cn("text-xs font-bold", {
                      "text-blue-700": isActive,
                      "text-slate-800": isCompleted,
                      "text-slate-400": !isCompleted && !isActive,
                    })}
                  >
                    {step.label}
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 uppercase tracking-wide">
                      🟢 Active
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                      ✓ Completed
                    </span>
                  )}
                  {!isCompleted && !isActive && (
                    <span className="text-[10px] font-bold bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded border border-slate-100 uppercase tracking-wide">
                      🔒 Pending
                    </span>
                  )}
                </div>
                {step.dateRange && (
                  <p className="text-[11px] text-slate-500 font-medium">{step.dateRange}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
