"use client";

import React from "react";
import { ShieldOff, ArrowLeft } from "lucide-react";
import { AuthCard } from "./AuthCard";
import { Button } from "@/components/ui/Button";

interface UnauthorizedStateProps {
  onReturnToLogin: () => void;
}

export const UnauthorizedState: React.FC<UnauthorizedStateProps> = ({
  onReturnToLogin,
}) => {
  return (
    <AuthCard className="text-center py-10">
      <div className="flex flex-col items-center space-y-5">
        <div className="p-4 bg-error-50 text-error-500 rounded-2xl">
          <ShieldOff className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-text-primary">Access Restricted</h2>
          <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
            You don&apos;t have permission to access this area.
          </p>
        </div>
        <div className="w-full max-w-xs">
          <Button onClick={onReturnToLogin} size="lg" className="w-full gap-2">
            <ArrowLeft className="w-4 h-4" />
            Return to Login
          </Button>
        </div>
      </div>
    </AuthCard>
  );
};