"use client"

import { AdminLayout } from "@/components/admin-dashboard/AdminLayout"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { api } from "@/lib/api-client"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trophy,
  Eye,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

interface CandidateResult {
  id: string;
  name: string;
  votes: number;
  percentage: number;
  rank: number;
  status: "winner" | "runner_up" | "other";
}

interface PositionResult {
  position: string;
  totalVotes: number;
  abstained: number;
  candidates: CandidateResult[];
  isTie: boolean;
}

interface ElectionResultsData {
  electionName: string;
  publishedDate: string;
  publishedBy: string;
  status: "not_published" | "published";
  eligibleStudents: number;
  ballotsSubmitted: number;
  participation: number;
  totalPositions: number;
  totalCandidates: number;
  positions: PositionResult[];
}

type LoadingState = "loading" | "success" | "error";

export default function AdminResultsPage() {
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [results, setResults] = useState<ElectionResultsData | null>(null);
  const [selectedElection, setSelectedElection] = useState<number | null>(null);
  const [elections, setElections] = useState<Array<{ id: number; name: string; status: string; results_published_at?: string }>>([]);
  const [expandedPositions, setExpandedPositions] = useState<Record<string, boolean>>({});
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string>("");

  useEffect(() => {
    async function fetchElections() {
      try {
        const response = await api.getElections();
        if ("error" in response) {
          setLoadingState("error");
          setErrorMessage("Failed to load elections");
          return;
        }

        const electionList = Array.isArray(response) ? response : [];
        // Filter to closed/pending elections that could have results
        const relevantElections = electionList.filter(
          (e) => e.status === "CLOSED" || e.status === "PUBLISHED" || e.status === "RESULTS_PUBLISHED"
        );
        setElections(relevantElections);

        if (relevantElections.length > 0) {
          setSelectedElection(relevantElections[0].id);
        } else {
          setLoadingState("success");
        }
      } catch (err) {
        console.error("Failed to fetch elections:", err);
        setLoadingState("error");
        setErrorMessage("An unexpected error occurred");
      }
    }

    fetchElections();
  }, []);

  useEffect(() => {
    async function fetchResults() {
      if (!selectedElection) return;

      setLoadingState("loading");
      setErrorMessage("");

      try {
        const response = await api.getElectionResults(selectedElection);

        if ("error" in response) {
          const errorCode = (response as { error?: { code?: string } }).error?.code;
          if (errorCode === "NOT_PUBLISHED") {
            // Election hasn't published results yet - this is normal for closed but unpublished elections
            setResults(null);
            setLoadingState("success");
            return;
          }
          setLoadingState("error");
          setErrorMessage("Failed to load election results");
          return;
        }

        const backendResults = response as {
          electionName: string;
          publishedAt: string;
          totalEligible: number;
          totalVotes: number;
          participation: number;
          clubs: Array<{
            clubName: string;
            positions: Array<{
              positionName: string;
              candidates: Array<{
                candidateName: string;
                voteCount: number;
                percentage: number;
                rank: number;
              }>;
            }>;
          }>;
        };

        // Calculate totals
        let totalPositions = 0;
        let totalCandidates = 0;
        const positions: PositionResult[] = [];

        backendResults.clubs.forEach((club) => {
          club.positions.forEach((pos) => {
            totalPositions++;
            totalCandidates += pos.candidates.length;

            const totalVotes = pos.candidates.reduce((sum, c) => sum + c.voteCount, 0);

            positions.push({
              position: pos.positionName,
              totalVotes,
              abstained: 0,
              isTie: pos.candidates.filter((c) => c.rank === 1).length > 1,
              candidates: pos.candidates.map((c, idx) => ({
                id: `cand-${idx}`,
                name: c.candidateName,
                votes: c.voteCount,
                percentage: c.percentage,
                rank: c.rank,
                status: c.rank === 1 ? "winner" : c.rank === 2 ? "runner_up" : "other",
              })),
            });
          });
        });

        const publishedDate = backendResults.publishedAt
          ? new Date(backendResults.publishedAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "Not published";

        setResults({
          electionName: backendResults.electionName,
          publishedDate,
          publishedBy: "Election Administration",
          status: backendResults.publishedAt ? "published" : "not_published",
          eligibleStudents: backendResults.totalEligible,
          ballotsSubmitted: backendResults.totalVotes,
          participation: backendResults.participation,
          totalPositions,
          totalCandidates,
          positions,
        });

        // Initialize expanded state
        setExpandedPositions(Object.fromEntries(positions.map((p) => [p.position, true])));
        setLoadingState("success");
      } catch (err) {
        console.error("Failed to fetch results:", err);
        setLoadingState("error");
        setErrorMessage("An unexpected error occurred");
      }
    }

    fetchResults();
  }, [selectedElection]);

  const togglePosition = (position: string) => {
    setExpandedPositions((prev) => ({ ...prev, [position]: !prev[position] }));
  };

  const handlePublish = async () => {
    if (!selectedElection) return;

    setPublishing(true);
    setPublishError("");

    try {
      const response = await api.publishElectionResults(selectedElection);

      if ("error" in response) {
        setPublishError("Failed to publish results. Please try again.");
        return;
      }

      // Refresh results after publishing
      const resultsResponse = await api.getElectionResults(selectedElection);
      if (!("error" in resultsResponse)) {
        // Trigger refresh by updating selected election
        setSelectedElection(null);
        setTimeout(() => setSelectedElection(selectedElection), 100);
      }
    } catch (err) {
      console.error("Failed to publish:", err);
      setPublishError("An unexpected error occurred");
    } finally {
      setPublishing(false);
    }
  };

  const getStatusBadge = () => {
    if (!results) return <Badge variant="warning">No Results</Badge>;

    switch (results.status) {
      case "published":
        return <Badge variant="success">Published</Badge>;
      case "not_published":
        return <Badge variant="warning">Not Published</Badge>;
      default:
        return <Badge variant="neutral">Unknown</Badge>;
    }
  };

  const validationChecklist = [
    { label: "Voting period closed", checked: selectedElection !== null },
    { label: "Ballot processing completed", checked: results !== null },
    { label: "Candidate list finalized", checked: (results?.totalCandidates ?? 0) > 0 },
    { label: "Vote totals calculated", checked: (results?.ballotsSubmitted ?? 0) >= 0 },
    { label: "No unresolved election issues", checked: true },
    { label: "Results ready for publication", checked: results !== null },
  ];

  // Loading state
  if (loadingState === "loading") {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-sm text-text-secondary">Loading election results...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (loadingState === "error") {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="max-w-md w-full text-center p-8 border-border">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Unable to Load Results</h2>
            <p className="text-sm text-text-secondary mb-6">{errorMessage}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Election Results</h1>
            <p className="text-sm text-text-secondary mt-1">
              Review and publish official election results.
            </p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Election Selector */}
        {elections.length > 0 && (
          <Card>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Select Election
            </label>
            <select
              className="w-full p-2 border border-border rounded-lg text-text-primary bg-white"
              value={selectedElection ?? ""}
              onChange={(e) => setSelectedElection(Number(e.target.value))}
            >
              {elections.map((election) => (
                <option key={election.id} value={election.id}>
                  {election.name} ({election.status})
                </option>
              ))}
            </select>
          </Card>
        )}

        {results ? (
          <>
            {/* Results Overview */}
            <Card>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Results Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-primary-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span className="text-xs font-medium text-primary-600">Election Status</span>
                  </div>
                  <p className="text-lg font-bold text-primary-700">
                    {results.status === "published" ? "Results Published" : "Results Pending"}
                  </p>
                </div>
                <div className="bg-primary-50 rounded-xl p-4">
                  <span className="text-xs font-medium text-primary-600 block mb-1">Eligible Students</span>
                  <p className="text-lg font-bold text-primary-700">{results.eligibleStudents.toLocaleString()}</p>
                </div>
                <div className="bg-primary-50 rounded-xl p-4">
                  <span className="text-xs font-medium text-primary-600 block mb-1">Ballots Submitted</span>
                  <p className="text-lg font-bold text-primary-700">{results.ballotsSubmitted.toLocaleString()}</p>
                </div>
                <div className="bg-success-50 rounded-xl p-4">
                  <span className="text-xs font-medium text-success-600 block mb-1">Participation</span>
                  <p className="text-lg font-bold text-success-600">{results.participation}%</p>
                </div>
                <div className="bg-primary-50 rounded-xl p-4 col-span-2 sm:col-span-1">
                  <span className="text-xs font-medium text-primary-600 block mb-1">Positions / Candidates</span>
                  <p className="text-lg font-bold text-primary-700">
                    {results.totalPositions} / {results.totalCandidates}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-neutral-100 flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">Results Status</span>
                {getStatusBadge()}
              </div>
            </Card>

            {/* Validation Checklist */}
            <Card>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Validation Checklist</h2>
              <div className="space-y-3">
                {validationChecklist.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.checked
                          ? "bg-success-100 text-success-600"
                          : "bg-neutral-200 text-neutral-400"
                      }`}
                    >
                      {item.checked ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <span className={`text-sm ${item.checked ? "text-text-primary" : "text-text-secondary"}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Position Results */}
            <div className="space-y-4">
              {results.positions.map((position) => (
                <Card key={position.position}>
                  <button
                    onClick={() => togglePosition(position.position)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      {expandedPositions[position.position] ? (
                        <ChevronUp className="w-5 h-5 text-text-secondary" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-text-secondary" />
                      )}
                      <div>
                        <h3 className="text-base font-semibold text-text-primary">{position.position}</h3>
                        <p className="text-xs text-text-secondary">
                          {position.candidates.length} candidates • {position.totalVotes.toLocaleString()} total votes
                        </p>
                      </div>
                    </div>
                    {position.isTie && (
                      <Badge variant="warning" size="sm">Tie</Badge>
                    )}
                  </button>

                  {expandedPositions[position.position] && (
                    <div className="mt-4">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-3 text-xs font-medium text-text-secondary">Candidate</th>
                            <th className="text-right py-2 px-3 text-xs font-medium text-text-secondary">Votes</th>
                            <th className="text-right py-2 px-3 text-xs font-medium text-text-secondary">%</th>
                            <th className="text-center py-2 px-3 text-xs font-medium text-text-secondary">Rank</th>
                          </tr>
                        </thead>
                        <tbody>
                          {position.candidates
                            .sort((a, b) => a.rank - b.rank)
                            .map((candidate) => (
                              <tr key={candidate.id} className="border-b border-border/50">
                                <td className="py-3 px-3 flex items-center gap-2">
                                  {candidate.status === "winner" && (
                                    <Trophy className="w-3.5 h-3.5 text-primary-600" />
                                  )}
                                  <span className="text-text-primary font-medium">{candidate.name}</span>
                                  {candidate.status === "winner" && (
                                    <Badge variant="success" size="sm">Winner</Badge>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-right text-text-primary font-medium">
                                  {candidate.votes.toLocaleString()}
                                </td>
                                <td className="py-3 px-3 text-right text-text-secondary">{candidate.percentage}%</td>
                                <td className="py-3 px-3 text-center">
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                                    {candidate.rank}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      {position.abstained > 0 && (
                        <div className="mt-3 px-3 py-2 rounded-xl bg-neutral-100 text-xs text-text-secondary">
                          Abstained: <span className="font-medium text-text-primary">{position.abstained}</span>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Result Status Section */}
            <Card>
              <h2 className="text-lg font-semibold text-text-primary mb-3">Result Status</h2>
              <div className="flex items-center gap-3">
                {results.status === "published" && <CheckCircle2 className="w-5 h-5 text-success-600" />}
                {results.status !== "published" && <AlertTriangle className="w-5 h-5 text-warning-500" />}
                <span className="text-sm text-text-secondary">
                  {results.status === "published"
                    ? `Results published on ${results.publishedDate}.`
                    : "Results have not been published yet."}
                </span>
                {getStatusBadge()}
              </div>
            </Card>

            {/* Actions */}
            <Card>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Actions</h2>
              <div className="flex flex-wrap gap-3">
                {results.status !== "published" && (
                  <Button onClick={handlePublish} disabled={publishing}>
                    {publishing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Publish Results
                      </>
                    )}
                  </Button>
                )}
                {results.status === "published" && (
                  <Link href="/student/results">
                    <Button variant="secondary">
                      <Eye className="w-4 h-4" />
                      View Public Results
                    </Button>
                  </Link>
                )}
              </div>
              {publishError && (
                <p className="mt-3 text-sm text-red-500">{publishError}</p>
              )}
            </Card>
          </>
        ) : (
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              No Results Available
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              {selectedElection
                ? "This election has not published results yet."
                : "Select an election to view its results."}
            </p>
            {selectedElection && results === null && (
              <Button onClick={handlePublish} disabled={publishing}>
                {publishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publish Results
                  </>
                )}
              </Button>
            )}
            {publishError && (
              <p className="mt-3 text-sm text-red-500">{publishError}</p>
            )}
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
