"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Shield } from "lucide-react";

export const PrivacyNotice: React.FC = () => {
  return (
    <Card className="p-5 border-primary-100 bg-primary-50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-primary-600" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-primary-700 mb-1">
            Your ballot choices are private
          </h4>
          <p className="text-xs text-primary-600/80 leading-relaxed">
            This receipt confirms that your ballot was recorded. It does not display or reveal the candidates you selected.
          </p>
        </div>
      </div>
    </Card>
  );
};
