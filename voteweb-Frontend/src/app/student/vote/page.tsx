"use client";

import React, { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { VotingProgress } from "@/components/voting/VotingProgress";
import { ElectionInfoCard } from "@/components/voting/ElectionInfoCard";
import { CandidateVotingCard } from "@/components/voting/CandidateVotingCard";
import { AbstainOption } from "@/components/voting/AbstainOption";
import { VotingNavigation } from "@/components/voting/VotingNavigation";
import { LeaveVotingModal } from "@/components/voting/LeaveVotingModal";
import { VotingClosedState, NotEligibleState, AlreadyVotedState } from "@/components/voting/VotingStates";
import { VotingProvider, useVoting } from "@/components/voting/VotingContext";
import { fetchVotingElection as fetchVotingData, type VotingElection, type VotingPosition } from "@/lib/api-election";
import { api } from "@/lib/api-client";
import { AlertTriangle, Loader2 } from "lucide-react";

function VotePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const electionIdFromUrl = searchParams.get("election");

  const [election, setElection] = useState<VotingElection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);

  const { setCandidate, setAbstain, getSelection, initializePositions } = useVoting();

  // Resolve which election to load: prefer ?election=, otherwise pick the first open election
  const requestedElectionId = electionIdFromUrl ? parseInt(electionIdFromUrl, 10) : 0;
  const [electionId, setElectionId] = useState(requestedElectionId || 0);

  // When no election was requested, auto-select the first open election
  useEffect(() => {
    if (electionId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await api.getElections({ status: "OPEN" });
      if (cancelled) return;
      const data = res.data as { elections?: { id: number }[] } | { id?: number }[] | undefined;
      const list = Array.isArray(data)
        ? data
        : Array.isArray((data as { elections?: { id: number }[] })?.elections)
          ? (data as { elections: { id: number }[] }).elections
          : [];
      if (list.length > 0 && list[0].id) {
        setElectionId(list[0].id);
      } else {
        setError("No open elections available");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [electionId]);

  useEffect(() => {
    if (!electionId) return;
    async function loadElection() {
      setLoading(true);
      setError(null);
      const result = await fetchVotingData(electionId);
      if (result.error) {
        setError(result.error);
      } else if (result.election) {
        setElection(result.election);
        initializePositions(result.election.positions.map(p => ({ id: p.id.toString(), clubId: p.clubId })));
      }
      setLoading(false);
    }
    loadElection();
  }, [electionId, initializePositions]);

  const currentPositionData: VotingPosition | undefined = election?.positions[currentPosition];
  const currentSelection = getSelection(currentPositionData?.id.toString() || "");
  const hasSelection = currentSelection?.candidateId !== undefined && currentSelection?.candidateId !== null;

  const handleSelectCandidate = useCallback((candidateId: string | number) => {
    if (currentPositionData) {
      setCandidate(currentPositionData.id.toString(), String(candidateId), currentPositionData.clubId);
    }
  }, [currentPositionData, setCandidate]);

  const handleAbstain = useCallback(() => {
    if (currentPositionData) setAbstain(currentPositionData.id.toString());
  }, [currentPositionData, setAbstain]);

  const handleNavigation = useCallback((direction: "prev" | "next") => {
    if (direction === "prev" && currentPosition > 0) {
      setCurrentPosition(p => p - 1);
    } else if (direction === "next" && election) {
      if (currentPosition < election.positions.length - 1) {
        setCurrentPosition(p => p + 1);
      } else {
        router.push("/student/vote/review?election=" + election.id);
      }
    }
  }, [currentPosition, election, router]);

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-text-secondary">Loading election...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error || !election) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-6 max-w-md text-center">
            <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-text-primary mb-2">Unable to Load Election</h2>
            <p className="text-text-secondary text-sm">{error || "No election available"}</p>
            <Button variant="primary" size="md" className="mt-4" onClick={() => router.push("/student/dashboard")}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  if (election.status === "closed") return <StudentLayout><VotingClosedState /></StudentLayout>;
  if (election.status === "not_eligible") return <StudentLayout><NotEligibleState /></StudentLayout>;
  if (election.status === "already_voted") return <StudentLayout><AlreadyVotedState /></StudentLayout>;

  return (
    <StudentLayout>
      <LeaveVotingModal isOpen={showLeaveModal} onStay={() => setShowLeaveModal(false)} onLeave={() => router.push("/student/dashboard")} />
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary">{election.name}</h1>
            <p className="text-sm text-text-secondary">Select your candidates</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowLeaveModal(true)}>Leave</Button>
        </div>
        <VotingProgress currentStep={0} totalSteps={3} />
        <ElectionInfoCard election={election} />
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="primary">Position {currentPosition + 1} of {election.positions.length}</Badge>
            <span className="text-sm text-text-secondary">{currentPositionData?.name}</span>
          </div>
          <h2 className="text-lg font-semibold mb-4">{currentPositionData?.name}</h2>
          <div className="space-y-3 mb-6">
            {currentPositionData?.candidates.map(candidate => (
              <CandidateVotingCard key={candidate.id} candidate={candidate} isSelected={currentSelection?.candidateId === candidate.id.toString()} onSelect={handleSelectCandidate} />
            ))}
          </div>
          <AbstainOption isAbstained={false} onAbstain={handleAbstain} />
          <VotingNavigation currentStep={0} totalSteps={3} hasSelection={hasSelection} onPrevious={() => handleNavigation("prev")} onNext={() => handleNavigation("next")} />
          {currentPosition === election.positions.length - 1 && hasSelection && (
            <div className="flex justify-center pt-4">
              <Button size="lg" onClick={() => router.push("/student/vote/review?election=" + election.id)}>Review Ballot</Button>
            </div>
          )}
        </Card>
      </div>
    </StudentLayout>
  );
}

export default function VotePage() {
  return (
    <VotingProvider>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
        <VotePageInner />
      </Suspense>
    </VotingProvider>
  );
}
