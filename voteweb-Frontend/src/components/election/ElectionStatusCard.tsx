import React from "react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ElectionStatusCardProps {
  electionName: string;
  isOpen: boolean;
  closesAt: string;
  onVoteClick?: () => void;
  className?: string;
}

export const ElectionStatusCard: React.FC<ElectionStatusCardProps> = ({
  electionName,
  isOpen,
  closesAt,
  onVoteClick,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-slate-900 text-white border border-slate-800 rounded-xl p-5 shadow-md overflow-hidden relative",
        className
      )}
    >
      {/* Decorative subtle background overlay */}
      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none select-none translate-x-12 translate-y-12">
        <Calendar className="w-64 h-64 text-white" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-extrabold tracking-tight text-white">{electionName}</h3>
            <Badge variant={isOpen ? "success" : "neutral"} className="bg-emerald-950/60 text-emerald-300 border-emerald-800">
              {isOpen ? "🟢 Voting Open" : "🔒 Voting Closed"}
            </Badge>
          </div>
          <p className="text-sm text-slate-300 max-w-xl">
            {isOpen
              ? "Voting is currently open. Cast your vote before the election closes. Please review candidates and election guidelines before submitting your ballot."
              : "Voting is currently closed. Thank you for participating. Results will be announced shortly."}
          </p>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-800/50 w-fit px-3 py-1.5 rounded-lg border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Voting Closes: {closesAt}</span>
          </div>
        </div>

        {isOpen && (
          <div className="shrink-0">
            <Link href="/student/vote">
              <Button
                onClick={onVoteClick}
                size="lg"
                className="w-full md:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-900/30"
              >
                <span>Vote Now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};