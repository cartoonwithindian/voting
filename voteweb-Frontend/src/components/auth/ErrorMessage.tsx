"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 p-3 bg-error-50 border border-error-100 rounded-xl animate-slide-down",
        className
      )}
    >
      <AlertCircle className="w-4 h-4 text-error-600 shrink-0 mt-0.5" />
      <p className="text-xs font-medium text-error-700 leading-relaxed">{message}</p>
    </div>
  );
};