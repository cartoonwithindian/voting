"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Calendar, Clock, CheckCircle2, Info } from "lucide-react";
import type { VotingElection } from "@/lib/api-election";

interface ElectionInfoCardProps {
  election: VotingElection;
}

export const ElectionInfoCard: React.FC<ElectionInfoCardProps> = ({
  election,
}) => {
  return (
    <Card className="p-4 border-border">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary-400" />
          <span className="font-medium text-text-primary">{election.name}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <Badge variant="success" className="text-[10px]">Voting Open</Badge>
        </div>

        <div className="flex items-center gap-1.5 text-text-secondary">
          <Calendar className="w-3.5 h-3.5" />
          <span>{election.votingPeriod.start}</span>
        </div>

        <div className="flex items-center gap-1.5 text-text-secondary">
          <Clock className="w-3.5 h-3.5" />
          <span>{election.votingPeriod.startTime} – {election.votingPeriod.endTime}</span>
        </div>

        {election.eligible && (
          <div className="flex items-center gap-1.5 text-success">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="font-medium">Eligible</span>
          </div>
        )}
      </div>
    </Card>
  );
};
