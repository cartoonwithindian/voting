"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";

interface VerifiedReceipt {
  receiptId: string;
  electionName: string;
  submittedAt: string;
}

export const ReceiptVerification: React.FC = () => {
  const [inputId, setInputId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerifiedReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    const receiptId = inputId.trim();
    if (!receiptId) return;

    setIsVerifying(true);
    setResult(null);
    setError(null);

    const res = await api.getReceiptById(receiptId);
    setIsVerifying(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    // Backend returns { valid, receipt: { receiptId, electionName, votedAt, ... } }
    const raw = res as unknown as Record<string, unknown>;
    const nested = (raw.data as Record<string, unknown> | undefined) || {};
    const receipt = (raw.receipt || nested.receipt || nested || {}) as Record<string, unknown>;
    setResult({
      receiptId: String(receipt.receiptId || receipt.id || receiptId),
      electionName: String(receipt.electionName || receipt.election_name || "Election"),
      submittedAt: String(receipt.votedAt || receipt.createdAt || receipt.submittedAt || ""),
    });
  };

  return (
    <Card className="p-5 border-border">
      <h3 className="text-sm font-semibold text-text-primary mb-1">
        Verify Your Receipt
      </h3>
      <p className="text-xs text-text-secondary mb-4">
        Use your Receipt ID to confirm that this receipt is valid.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter Receipt ID"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          className="flex-1 px-3 py-2 rounded-xl border border-border text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleVerify}
          disabled={isVerifying || !inputId.trim()}
          isLoading={isVerifying}
          className="gap-1.5"
        >
          {!isVerifying && <Search className="w-3.5 h-3.5" />}
          Verify
        </Button>
      </div>

      {isVerifying && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary-50 text-sm text-primary-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          Verifying Receipt...
        </div>
      )}

      {result && (
        <div className="p-4 rounded-xl bg-success-50 border border-success/20">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="font-semibold text-sm text-success">
              Receipt Verified
            </span>
          </div>
          <p className="text-xs text-text-secondary mb-3">
            This receipt belongs to a successfully recorded ballot for {result.electionName}.
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-secondary">Receipt ID</span>
              <span className="font-mono text-text-primary">{result.receiptId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Election</span>
              <span className="text-text-primary">{result.electionName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Submitted</span>
              <span className="text-text-primary">
                {result.submittedAt
                  ? new Date(result.submittedAt).toLocaleString()
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Status</span>
              <Badge variant="success" className="text-[10px]">Vote Recorded</Badge>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-error-50 border border-error/20">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-error" />
            <span className="font-semibold text-sm text-error">
              Receipt Not Found
            </span>
          </div>
          <p className="text-xs text-text-secondary mb-3">
            {error}. Check the Receipt ID and try again.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setError(null);
              setInputId("");
            }}
          >
            Try Again
          </Button>
        </div>
      )}
    </Card>
  );
};
