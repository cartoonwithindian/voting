"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const RememberMe = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id: externalId, ...props }, ref) => {
    const internalId = React.useId();
    const inputId = externalId || internalId;

    return (
      <label
        htmlFor={inputId}
        className="flex items-center gap-2.5 cursor-pointer group select-none"
      >
        <div className="relative flex items-center shrink-0">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            className={cn(
              "peer w-4 h-4 rounded border-border text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 transition-all cursor-pointer",
              className
            )}
            {...props}
          />
        </div>
        <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
          {label}
        </span>
      </label>
    );
  }
);

RememberMe.displayName = "RememberMe";