import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  disabled?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, disabled = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(32,39,92,0.04)] transition-all duration-200 ease-in-out",
          {
            "hover:shadow-[0_8px_24px_rgba(32,39,92,0.08)] hover:border-border-strong cursor-pointer": hoverable && !disabled,
            "opacity-50 pointer-events-none": disabled,
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";