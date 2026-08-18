"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Download, Printer, Share2 } from "lucide-react";
import { VoteReceipt } from "@/lib/receipt-data";

interface ReceiptActionsProps {
  receipt: VoteReceipt;
}

export const ReceiptActions: React.FC<ReceiptActionsProps> = ({ receipt }) => {
  const handleDownload = () => {
    const content = `
CAMPUSVOTE
Official Vote Receipt

Election: ${receipt.electionName}
Receipt ID: ${receipt.receiptId}
Status: Vote Recorded
Submitted: ${receipt.submittedAt}

Privacy Notice:
This receipt confirms that a ballot was recorded.
Candidate selections are not displayed.

Verification: ${window.location.origin}${receipt.verificationUrl}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CampusVote-Receipt-${receipt.receiptId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "CampusVote Vote Receipt",
          text: `Vote Receipt for ${receipt.electionName}\nReceipt ID: ${receipt.receiptId}`,
          url: `${window.location.origin}${receipt.verificationUrl}`,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      alert("Sharing is not supported on this device.");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="primary"
        size="sm"
        className="gap-1.5"
        onClick={handleDownload}
      >
        <Download className="w-3.5 h-3.5" />
        Download Receipt
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="gap-1.5"
        onClick={handlePrint}
      >
        <Printer className="w-3.5 h-3.5" />
        Print Receipt
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={handleShare}
      >
        <Share2 className="w-3.5 h-3.5" />
        Share
      </Button>
    </div>
  );
};
