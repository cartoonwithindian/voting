"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 space-y-5 animate-fade-in",
        className
      )}
    >
      <div className="p-4 bg-success-50 text-success-600 rounded-full">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
        <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
      </div>
      {actionLabel && onAction && (
        <p className="text-xs font-medium text-primary-600 animate-pulse">{actionLabel}</p>
      )}
    </div>
  );
};