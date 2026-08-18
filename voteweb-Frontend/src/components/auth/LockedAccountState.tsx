"use client";

import React from "react";
import { Lock, LifeBuoy, RotateCcw } from "lucide-react";
import { AuthCard } from "./AuthCard";
import { Button } from "@/components/ui/Button";

interface LockedAccountStateProps {
  onTryAgain: () => void;
  onContactSupport?: () => void;
}

export const LockedAccountState: React.FC<LockedAccountStateProps> = ({
  onTryAgain,
  onContactSupport,
}) => {
  return (
    <AuthCard className="text-center py-10">
      <div className="flex flex-col items-center space-y-5">
        <div className="p-4 bg-warning-50 text-warning-600 rounded-2xl">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-text-primary">Account Temporarily Locked</h2>
          <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
            For security reasons, sign-in is temporarily unavailable. Please try again later or
            contact election administration.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs pt-2">
          <Button onClick={onTryAgain} size="lg" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
          {onContactSupport && (
            <Button variant="secondary" size="lg" onClick={onContactSupport} className="gap-2">
              <LifeBuoy className="w-4 h-4" />
              Contact Support
            </Button>
          )}
        </div>
      </div>
    </AuthCard>
  );
};