"use client";

import React from "react";
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/Button";

interface LeaveVotingModalProps {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export const LeaveVotingModal: React.FC<LeaveVotingModalProps> = ({
  isOpen,
  onStay,
  onLeave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onStay} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <h3 className="font-semibold text-text-primary">Leave Voting?</h3>
        </div>
        <p className="text-sm text-text-secondary">
          Your current selections may be lost if you leave this page.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" size="md" className="flex-1" onClick={onStay}>
            Stay
          </Button>
          <Button variant="danger" size="md" className="flex-1" onClick={onLeave}>
            Leave
          </Button>
        </div>
      </div>
    </div>
  );
};
