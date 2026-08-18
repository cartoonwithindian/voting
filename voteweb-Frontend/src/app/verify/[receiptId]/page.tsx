"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, XCircle, ArrowLeft, Shield, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";

interface ReceiptData {
  valid: boolean;
  receipt?: {
    receiptId: string;
    receiptHash: string;
    electionName?: string;
    votedAt?: string;
  };
}

export default function VerifyPage() {
  const { receiptId } = useParams<{ receiptId: string }>();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  const verifyReceipt = useCallback(async () => {
    if (!receiptId) return;
    setLoading(true);
    try {
      const res = await api.getReceiptById(receiptId);
      if (res.error) {
        setReceipt({ valid: false });
        return;
      }

      // Backend returns { valid, receipt: { ... } } at the top level
      const data = res as unknown as ReceiptData;
      setReceipt(data);
    } catch {
      setReceipt({ valid: false });
    } finally {
      setLoading(false);
    }
  }, [receiptId]);

  useEffect(() => {
    const run = async () => {
      await verifyReceipt();
    };
    run();
  }, [verifyReceipt]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex flex-col">
        <div className="bg-white border-b border-border py-4 px-6">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-white text-xs">CV</div>
            <span className="font-semibold text-text-primary text-sm">CampusVote</span>
          </div>
        </div>
        <main className="flex-1 flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-border py-4 px-6">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-white text-xs">CV</div>
          <span className="font-semibold text-text-primary text-sm">CampusVote</span>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-lg w-full space-y-6">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-xl font-bold text-text-primary mb-1">Vote Receipt Verification</h1>
            <p className="text-sm text-text-secondary">Verify the authenticity of a CampusVote receipt.</p>
          </div>

          {receipt?.valid && receipt.receipt ? (
            <>
              {/* Valid Receipt */}
              <Card className="p-6 border-border text-center">
                <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-lg font-bold text-success mb-2">Valid Receipt</h2>
                <p className="text-sm text-text-secondary mb-6">This receipt belongs to a successfully recorded ballot.</p>

                <div className="space-y-3 text-left bg-primary-50 rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Receipt Hash</span>
                    <span className="font-mono font-medium text-text-primary text-xs">{receipt.receipt.receiptHash?.substring(0, 16)}...</span>
                  </div>
                  {receipt.receipt.electionName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Election</span>
                      <span className="text-text-primary">{receipt.receipt.electionName}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Status</span>
                    <Badge variant="success" className="text-[10px]">Ballot Recorded</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Submitted</span>
                    <span className="text-text-primary">
                      {receipt.receipt.votedAt
                        ? new Date(receipt.receipt.votedAt).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Privacy Notice */}
              <Card className="p-4 border-primary-100 bg-primary-50">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-xs text-primary-700 mb-1">Privacy Protected</h4>
                    <p className="text-[11px] text-primary-600/80 leading-relaxed">
                      This verification only confirms that a ballot was recorded. Student identity and candidate selections are never displayed.
                    </p>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            /* Invalid Receipt */
            <Card className="p-6 border-border text-center">
              <div className="w-16 h-16 rounded-full bg-error-50 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-error" />
              </div>
              <h2 className="text-lg font-bold text-text-primary mb-2">Receipt Not Found</h2>
              <p className="text-sm text-text-secondary mb-2">We couldn&apos;t verify this receipt. The Receipt ID may be incorrect.</p>
              <p className="text-xs text-text-secondary mb-6 font-mono">{receiptId}</p>
            </Card>
          )}

          {/* Back */}
          <div className="text-center">
            <Link href="/login">
              <Button variant="secondary" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Sign In to View Your Receipt
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
