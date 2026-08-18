import React from "react";
import { Card } from "../ui/Card";
import { CheckCircle2, Award, Vote } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  subValueColor?: "success" | "warning" | "info" | "primary";
  icon?: React.ReactNode;
  actionButton?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  subValueColor = "primary",
  icon,
  actionButton,
  className,
}) => {
  const iconMap = {
    primary: { bg: "bg-primary-100", color: "text-primary-700", Icon: Vote },
    success: { bg: "bg-success-50", color: "text-success-600", Icon: CheckCircle2 },
    warning: { bg: "bg-warning-50", color: "text-warning-600", Icon: Award },
    info: { bg: "bg-primary-50", color: "text-primary-600", Icon: Vote },
  };

  const { bg, color, Icon } = iconMap[subValueColor];
  const displayIcon = icon || <Icon className="w-5 h-5" />;

  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`${bg} rounded-xl p-2`}>
            {displayIcon}
          </div>
          <span className="text-xs font-medium text-text-secondary">{title}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          {subValue && (
            <p className={`text-sm font-medium mt-1 ${color}`}>{subValue}</p>
          )}
        </div>

        {actionButton && (
          <div className="mt-3 pt-3 border-t border-border">
            {actionButton}
          </div>
        )}
      </div>
    </Card>
  );
};