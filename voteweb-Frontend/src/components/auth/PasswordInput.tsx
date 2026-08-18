"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  id?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, id: externalId, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const internalId = React.useId();
    const inputId = externalId || internalId;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={showPassword ? "text" : "password"}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "w-full h-12 px-4 pr-12 text-sm bg-white border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-500 disabled:opacity-50 disabled:bg-primary-50 transition-all duration-150",
              {
                "border-error-500 focus:ring-error-500 focus:border-error-500": !!error,
              },
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-text-muted hover:text-primary-700 hover:bg-primary-50 transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4.5 h-4.5" />
            ) : (
              <Eye className="w-4.5 h-4.5" />
            )}
          </button>
        </div>
        {error && (
          <p id={errorId} className="text-xs text-error-600 font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";