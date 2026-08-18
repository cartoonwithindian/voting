import React from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Calendar, ArrowRight, Vote } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ElectionCardProps {
  electionName: string;
  isOpen: boolean;
  closesAt: string;
  onVoteClick?: () => void;
  className?: string;
}

export const ElectionCard: React.FC<ElectionCardProps> = ({
  electionName,
  isOpen,
  closesAt,
  onVoteClick,
  className,
}) => {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Decorative background accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary-100 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5 p-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary-100 rounded-xl">
                <Vote className="w-5 h-5 text-primary-700" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">{electionName}</h3>
            </div>
            <Badge variant={isOpen ? "success" : "neutral"} className="text-xs">
              {isOpen ? "🟢 Voting Open" : "🔒 Voting Closed"}
            </Badge>
          </div>
          <p className="text-sm text-text-secondary max-w-xl leading-relaxed">
            {isOpen
              ? "Your vote can help shape the student council. Cast your vote before the election closes."
              : "Voting is currently closed. Thank you for participating. Results will be announced shortly."}
          </p>

          <div className="flex items-center gap-2 text-xs font-medium text-text-secondary bg-primary-50 rounded-xl px-3 py-1.5 w-fit border border-border">
            <Calendar className="w-3.5 h-3.5 text-primary-500 shrink-0" />
            <span>Voting Closes: {closesAt}</span>
          </div>
        </div>

        {isOpen && (
          <div className="shrink-0 md:w-auto">
            <Link href="/student/vote">
              <Button
                onClick={onVoteClick}
                size="lg"
                className="gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-sm shadow-primary-600/20"
              >
                <span>Vote Now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
};