"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Copy } from "lucide-react";
interface ReceiptIdProps {
  receiptId: string;
}

export const ReceiptId: React.FC<ReceiptIdProps> = ({ receiptId }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(receiptId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-5 border-border">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wider block mb-1">
            Receipt ID
          </span>
          <span className="text-lg font-bold text-primary-600 font-mono tracking-wide">
            {receiptId}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </Card>
  );
};
