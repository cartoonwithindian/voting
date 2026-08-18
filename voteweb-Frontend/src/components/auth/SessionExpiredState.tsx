"use client";

import React from "react";
import { Clock } from "lucide-react";
import { AuthCard } from "./AuthCard";
import { Button } from "@/components/ui/Button";

interface SessionExpiredStateProps {
  onSignInAgain: () => void;
}

export const SessionExpiredState: React.FC<SessionExpiredStateProps> = ({
  onSignInAgain,
}) => {
  return (
    <AuthCard className="text-center py-10">
      <div className="flex flex-col items-center space-y-5">
        <div className="p-4 bg-warning-50 text-warning-600 rounded-2xl">
          <Clock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-text-primary">Your Session Has Expired</h2>
          <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
            For your security, please sign in again.
          </p>
        </div>
        <div className="w-full max-w-xs">
          <Button onClick={onSignInAgain} size="lg" className="w-full">
            Sign In Again
          </Button>
        </div>
      </div>
    </AuthCard>
  );
};