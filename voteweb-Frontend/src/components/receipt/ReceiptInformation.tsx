"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2 } from "lucide-react";
import { VoteReceipt } from "@/lib/receipt-data";

interface ReceiptInformationProps {
  receipt: VoteReceipt;
}

export const ReceiptInformation: React.FC<ReceiptInformationProps> = ({
  receipt,
}) => {
  const rows = [
    { label: "Election", value: receipt.electionName },
    { label: "Receipt ID", value: receipt.receiptId, mono: true },
    {
      label: "Status",
      value: (
        <Badge variant="success" className="text-[10px]">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Vote Recorded
        </Badge>
      ),
    },
    { label: "Submitted", value: receipt.submittedAt },
    { label: "Election Status", value: receipt.electionStatus },
  ];

  return (
    <Card className="p-5 border-border">
      <h3 className="text-sm font-semibold text-text-primary mb-4 border-b border-border pb-3">
        Receipt Information
      </h3>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4">
            <span className="text-xs text-text-secondary font-medium">
              {row.label}
            </span>
            <span
              className={`text-sm text-text-primary text-right ${
                row.mono ? "font-mono" : ""
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
