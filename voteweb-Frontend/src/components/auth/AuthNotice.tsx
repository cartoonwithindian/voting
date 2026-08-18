"use client";

import React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthNoticeProps {
  children: React.ReactNode;
  className?: string;
}

export const AuthNotice: React.FC<AuthNoticeProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 p-3 bg-primary-50 border border-primary-100 rounded-xl",
        className
      )}
    >
      <Info className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
      <p className="text-xs font-medium text-primary-800 leading-relaxed">{children}</p>
    </div>
  );
};