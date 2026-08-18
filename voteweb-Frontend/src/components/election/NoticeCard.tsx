import React from "react";
import { Card } from "../ui/Card";
import { Info } from "lucide-react";
import { Button } from "../ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface NoticeCardProps {
  title: string;
  message: string;
  buttonText: string;
  buttonHref: string;
  className?: string;
  isPrivate?: boolean;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({
  title,
  message,
  buttonText,
  buttonHref,
  className,
  isPrivate = false,
}) => {
  return (
    <Card
      className={cn(
        "flex flex-col justify-between border-l-4 p-5 shadow-xs",
        isPrivate
          ? "border-l-indigo-600 bg-indigo-50/30"
          : "border-l-amber-500 bg-amber-50/20",
        className
      )}
    >
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          {isPrivate ? (
            <span className="text-indigo-600 font-bold text-sm flex items-center gap-1.5">
              <span>🔒</span> {title}
            </span>
          ) : (
            <span className="text-amber-700 font-bold text-sm flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-500 shrink-0" />
              {title}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          {message}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100/60">
        <Link href={buttonHref}>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full text-xs font-bold",
              isPrivate
                ? "border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                : "border-amber-200 text-amber-800 hover:bg-amber-50"
            )}
          >
            {buttonText}
          </Button>
        </Link>
      </div>
    </Card>
  );
};
