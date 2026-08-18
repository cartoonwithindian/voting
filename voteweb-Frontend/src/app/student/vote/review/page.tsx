"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VotingProgress } from "@/components/voting/VotingProgress";
import { PrivacyNotice } from "@/components/voting/PrivacyNotice";
import { ConfirmationModal } from "@/components/voting/ConfirmationModal";
import { VotingProvider, useVoting } from "@/components/voting/VotingContext";
import { fetchVotingElection as fetchVotingData, submitVoteToBackend as submitVote, type VotingElection } from "@/lib/api-election";
import { Loader2, AlertTriangle } from "lucide-react";

const STEPS = ["Select", "Review", "Confirm"];

function ReviewPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selections } = useVoting();
  const [election, setElection] = useState<VotingElection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const electionParam = searchParams.get("election");
  const electionId = electionParam ? parseInt(electionParam, 10) : 0;

  useEffect(() => {
    if (!electionId) {
      router.replace("/student/vote");
      return;
    }
    async function loadElection() {
      setLoading(true);
      const result = await fetchVotingData(electionId);
      if (result.error) {
        setError(result.error);
      } else if (result.election) {
        setElection(result.election);
      }
      setLoading(false);
    }
    loadElection();
  }, [electionId, router]);

  const handleChangeSelection = () => {
    router.push("/student/vote?election=" + electionId);
  };

  const handleSubmit = () => setShowModal(true);

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    let receiptId = "";
    for (const sel of selections) {
      if (!sel.candidateId || !sel.clubId) continue;
      const result = await submitVote(electionId, parseInt(sel.clubId.toString()), parseInt(sel.positionId.toString()), parseInt(sel.candidateId.toString()));
      if (!result.success) {
        setSubmitError(result.error || "Failed to submit vote");
        setIsSubmitting(false);
        return;
      }
      if (result.receiptId) receiptId = result.receiptId;
    }
    setIsSubmitting(false);
    setShowModal(false);
    router.push("/student/vote/success" + (receiptId ? "?receipt=" + receiptId : ""));
  };

  if (loading) {
    return <StudentLayout><div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></StudentLayout>;
  }

  if (error || !election) {
    return <StudentLayout><div className="flex items-center justify-center min-h-[400px]"><Card className="p-6 max-w-md text-center"><AlertTriangle className="w-12 h-12 text-warning mx-auto mb-3" /><h2 className="text-lg font-semibold mb-2">Unable to Load</h2><p className="text-text-secondary text-sm">{error || "No data"}</p><Button className="mt-4" onClick={() => router.push("/student/dashboard")}>Dashboard</Button></Card></div></StudentLayout>;
  }

  const selected = selections.filter(s => s.candidateId).map(s => {
    const pos = election.positions.find(p => p.id.toString() === s.positionId);
    const cand = pos?.candidates.find(c => c.id.toString() === s.candidateId);
    return { position: pos?.name || "?", candidate: cand?.name || "?", club: pos?.clubName || "" };
  });

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Review Your Ballot</h1>
          <p className="text-sm text-text-secondary">Confirm your selections</p>
        </div>

        <VotingProgress currentStep={1} totalSteps={3} steps={STEPS} />

        <Card className="divide-y divide-border">
          {selected.map((item, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">{item.position} ({item.club})</p>
                <p className="font-medium">{item.candidate}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleChangeSelection}>Change</Button>
            </div>
          ))}
        </Card>

        {submitError && <Card className="p-4 border-error-200 bg-error-50"><p className="text-error-600 text-sm">{submitError}</p></Card>}

        <PrivacyNotice />
        <ConfirmationModal isOpen={showModal} onBack={() => setShowModal(false)} onConfirm={handleConfirmSubmit} isSubmitting={isSubmitting} />
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleChangeSelection}>Back</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit Vote"}</Button>
        </div>
      </div>
    </StudentLayout>
  );
}

export default function ReviewPage() {
  return (
    <VotingProvider>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
        <ReviewPageInner />
      </Suspense>
    </VotingProvider>
  );
}
