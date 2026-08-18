import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "neutral" | "primary";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full transition-colors",
        {
          "bg-primary-100 text-primary-700": variant === "default",
          "bg-success-50 text-success-600": variant === "success",
          "bg-warning-50 text-warning-600": variant === "warning",
          "bg-error-50 text-error-600": variant === "error",
          "bg-primary-50 text-primary-600": variant === "info",
          "bg-neutral-100 text-neutral-600": variant === "neutral",

          "px-2 py-0.5 text-[10px]": size === "sm",
          "px-2.5 py-1 text-xs": size === "md",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};