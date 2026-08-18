"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface ReceiptHeaderProps {
  electionName: string;
}

export const ReceiptHeader: React.FC<ReceiptHeaderProps> = ({
  electionName,
}) => {
  return (
    <div className="text-center mb-8">
      <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-10 h-10 text-success" />
      </div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        Your Vote Has Been Recorded
      </h1>
      <p className="text-sm text-text-secondary max-w-md mx-auto">
        Your ballot for {electionName} was successfully submitted.
      </p>
    </div>
  );
};
