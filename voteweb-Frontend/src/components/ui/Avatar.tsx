import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  src?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = "md",
  className,
  src,
}) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold select-none shrink-0 relative overflow-hidden",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <Image src={src} alt={name} fill className="rounded-full object-cover" sizes="4rem" />
      ) : (
        <span className="bg-primary-100 text-primary-700 w-full h-full">{initials}</span>
      )}
    </div>
  );
};