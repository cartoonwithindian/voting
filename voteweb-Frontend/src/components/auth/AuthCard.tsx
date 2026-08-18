import React from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "bg-white border border-border rounded-[20px] shadow-[0_8px_30px_rgba(32,39,92,0.08)] p-6 sm:p-8",
        className
      )}
    >
      {children}
    </div>
  );
};