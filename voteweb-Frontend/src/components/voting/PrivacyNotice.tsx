"use client";

import React from "react";
import { Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";

export const PrivacyNotice: React.FC = () => {
  return (
    <Card className="p-4 border-primary-100 bg-primary-50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-primary-600" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-primary-700 mb-1">
            Your vote is private
          </h4>
          <p className="text-xs text-primary-600/80 leading-relaxed">
            Your candidate selections are confidential. Review your ballot carefully before submitting.
          </p>
        </div>
      </div>
    </Card>
  );
};
