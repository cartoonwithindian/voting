"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ReceiptHistoryItem } from "@/lib/receipt-data";
import { CheckCircle2, Eye } from "lucide-react";

interface ReceiptHistoryProps {
  history: ReceiptHistoryItem[];
}

export const ReceiptHistory: React.FC<ReceiptHistoryProps> = ({ history }) => {
  return (
    <Card className="p-5 border-border">
      <h3 className="text-sm font-semibold text-text-primary mb-4 border-b border-border pb-3">
        My Vote Receipts
      </h3>
      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.receiptId}
            className="flex items-center justify-between p-3 rounded-xl bg-primary-50/50 border border-border/50"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-text-primary truncate">
                  {item.electionName}
                </span>
                <Badge variant="success" className="text-[10px] shrink-0">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Recorded
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-text-secondary">
                <span className="font-mono">{item.receiptId}</span>
                <span>{item.date}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-1.5 shrink-0 ml-3">
              <Eye className="w-3.5 h-3.5" />
              View
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
