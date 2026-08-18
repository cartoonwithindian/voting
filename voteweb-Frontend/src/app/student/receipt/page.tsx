"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ReceiptHeader } from "@/components/receipt/ReceiptHeader";
import { ReceiptId } from "@/components/receipt/ReceiptId";
import { ReceiptInformation } from "@/components/receipt/ReceiptInformation";
import { PrivacyNotice } from "@/components/receipt/PrivacyNotice";
import { ReceiptQRCode } from "@/components/receipt/ReceiptQRCode";
import { ReceiptVerification } from "@/components/receipt/ReceiptVerification";
import { ReceiptHistory } from "@/components/receipt/ReceiptHistory";
import { api } from "@/lib/api-client";
import { ArrowLeft, Users, Loader2, AlertTriangle } from "lucide-react";

interface VoteReceipt {
  id: number;
  receipt_hash: string;
  election_id: number;
  election_name?: string;
  created_at: string;
  verified_at?: string;
}

interface ReceiptHistoryItem {
  electionName: string;
  receiptId: string;
  status: string;
  date: string;
}

export default function ReceiptPage() {
  const [receipt, setReceipt] = useState<VoteReceipt | null>(null);
  const [history, setHistory] = useState<ReceiptHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get all elections first
      const electionsRes = await api.getElections();
      if (electionsRes.error) {
        setError("Failed to load elections");
        setLoading(false);
        return;
      }

      // Extract elections list
      const data = electionsRes.data as Record<string, unknown>;
      let elections: { id: number; status?: string }[] = [];
      if ('elections' in data && Array.isArray((data as { elections: { id: number; status?: string }[] }).elections)) {
        elections = (data as { elections: { id: number; status?: string }[] }).elections;
      } else if ('data' in data && Array.isArray((data as { data: { id: number; status?: string }[] }).data)) {
        elections = (data as { data: { id: number; status?: string }[] }).data;
      } else if (Array.isArray(data)) {
        elections = data as unknown as { id: number; status?: string }[];
      }

      if (elections.length === 0) {
        setError("No elections found.");
        setLoading(false);
        return;
      }

      // Check vote status for each election, then only fetch receipts for voted elections
      const receipts: VoteReceipt[] = [];
      for (const election of elections.slice(0, 5)) {
        // First check if user has voted in this election
        const voteStatusRes = await api.checkVoteStatus(election.id);
        if (voteStatusRes.error) continue;

        const voteData = voteStatusRes.data as Record<string, unknown>;
        const votedPositions = voteData?.voted_positions as unknown[] | undefined;
        const hasVoted = Array.isArray(votedPositions) && votedPositions.length > 0;

        if (!hasVoted) continue;

        // User has voted, fetch the receipt
        const res = await api.getReceipt(election.id);
        if (!res.error && res.data) {
          const rData = res.data as Record<string, unknown>;
          if ('receipt' in rData) {
            receipts.push((rData.receipt as VoteReceipt) || rData as unknown as VoteReceipt);
          } else {
            receipts.push(rData as unknown as VoteReceipt);
          }
        }
      }

      if (receipts.length > 0) {
        setReceipt(receipts[0]);
        setHistory(receipts.map(r => ({
          electionName: r.election_name || `Election #${r.election_id}`,
          receiptId: r.receipt_hash,
          status: r.verified_at ? "verified" : "recorded",
          date: new Date(r.created_at).toLocaleDateString(),
        })));
      } else {
        setError("No vote receipts found. You may not have voted yet.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load receipts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchReceipts();
    };
    run();
  }, [fetchReceipts]);

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </StudentLayout>
    );
  }

  if (error || !receipt) {
    return (
      <StudentLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-8 text-center border-border">
            <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              {error || "No Receipt Found"}
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              {error === "No vote receipts found. You may not have voted yet."
                ? "You don't have any vote receipts yet. Vote in an election to receive a receipt."
                : "Unable to load your vote receipt."}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/student/dashboard">
                <Button variant="secondary" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/student/vote">
                <Button variant="primary" className="gap-2">
                  Vote Now
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  const receiptId = receipt.receipt_hash;

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Receipt Header */}
        <ReceiptHeader
          electionName={receipt.election_name || "Election Vote"}
        />

        {/* Receipt ID */}
        <ReceiptId receiptId={receiptId} />

        {/* Receipt Information */}
        <ReceiptInformation
          receipt={{
            id: String(receipt.id),
            receiptId: receipt.receipt_hash,
            electionName: receipt.election_name || "Election Vote",
            status: "recorded",
            submittedAt: new Date(receipt.created_at).toLocaleString(),
            submittedDate: new Date(receipt.created_at).toLocaleDateString(),
            submittedTime: new Date(receipt.created_at).toLocaleTimeString(),
            electionStatus: "Voting Complete",
            verificationUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${receipt.receipt_hash}`,
          }}
        />

        {/* Privacy Notice */}
        <PrivacyNotice />

        {/* Receipt QR Code */}
        <ReceiptQRCode
          verificationUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${receiptId}`}
        />

        {/* Verification */}
        <ReceiptVerification />

        {/* Receipt History */}
        <ReceiptHistory history={history as unknown as import("@/lib/receipt-data").ReceiptHistoryItem[]} />

        {/* Navigation */}
        <div className="flex flex-wrap gap-3 justify-center pb-8">
          <Link href="/student/dashboard">
            <Button variant="secondary" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/student/candidates">
            <Button variant="ghost" className="gap-2">
              <Users className="w-4 h-4" />
              View Candidates
            </Button>
          </Link>
        </div>
      </div>
    </StudentLayout>
  );
}
