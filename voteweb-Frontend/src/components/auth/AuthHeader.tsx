"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle, className }) => {
  return (
    <div className={cn("space-y-1.5", className)}>
      <h1 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-sm text-text-secondary font-medium leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
};