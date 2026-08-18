import React from "react";
import { Vote } from "lucide-react";
import { cn } from "@/lib/utils";

interface CampusVoteLogoProps {
  variant?: "default" | "dark" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const CampusVoteLogo: React.FC<CampusVoteLogoProps> = ({
  variant = "default",
  size = "md",
  className,
}) => {
  const sizeClasses = {
    sm: {
      logo: "w-9 h-9 text-sm",
      title: "text-sm",
      subtitle: "text-[9px]",
    },
    md: {
      logo: "w-10 h-10 text-base",
      title: "text-base",
      subtitle: "text-[10px]",
    },
    lg: {
      logo: "w-12 h-12 text-lg",
      title: "text-lg",
      subtitle: "text-[10px]",
    },
  };

  const theme =
    variant === "light"
      ? {
          logoBg: "bg-white/10 border border-white/20 text-white",
          title: "text-white",
          subtitle: "text-white/60",
        }
      : {
          logoBg: "bg-primary-600 text-white shadow-sm shadow-primary-600/30",
          title: "text-text-primary",
          subtitle: "text-text-secondary",
        };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "rounded-xl flex items-center justify-center font-bold shrink-0",
          sizeClasses[size].logo,
          theme.logoBg
        )}
      >
        <Vote className="w-[55%] h-[55%]" />
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            "font-semibold tracking-wide",
            sizeClasses[size].title,
            theme.title
          )}
        >
          CampusVote
        </span>
        <span
          className={cn(
            "font-medium uppercase tracking-widest",
            sizeClasses[size].subtitle,
            theme.subtitle
          )}
        >
          Student Council Election 2026
        </span>
      </div>
    </div>
  );
};