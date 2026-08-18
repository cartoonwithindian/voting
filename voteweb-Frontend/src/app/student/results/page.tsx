"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api-client";
import {
  CheckCircle2,
  Trophy,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Loader2,
} from "lucide-react";

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

type LoadingState = "loading" | "success" | "not_published" | "error";

export default function StudentResultsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [results, setResults] = useState<ElectionResultsData | null>(null);

  useEffect(() => {
    async function fetchResults() {
      setLoadingState("loading");
      setErrorMessage("");

      try {
        // Get the latest election with results published
        const electionsResponse = await api.getElections();

        if ("error" in electionsResponse) {
          setLoadingState("error");
          setErrorMessage("Failed to load elections");
          return;
        }

        // Find the first election with published results
        const elections = Array.isArray(electionsResponse) ? electionsResponse : [];
        const publishedElection = elections.find(
          (e: { results_published_at?: string }) => e.results_published_at
        );

        if (!publishedElection) {
          setLoadingState("not_published");
          return;
        }

        // Fetch results for this election
        const resultsResponse = await api.getElectionResults(publishedElection.id);

        if ("error" in resultsResponse) {
          const errorCode = (resultsResponse as { error?: { code?: string } }).error?.code;
          if (errorCode === "NOT_PUBLISHED") {
            setLoadingState("not_published");
          } else {
            setLoadingState("error");
            setErrorMessage("Failed to load election results");
          }
          return;
        }

        // Transform backend data to UI format
        const backendResults = resultsResponse as {
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

        // Calculate total positions and candidates
        let totalPositions = 0;
        let totalCandidates = 0;
        const positions: PositionResult[] = [];

        backendResults.clubs.forEach((club) => {
          club.positions.forEach((pos) => {
            totalPositions++;
            totalCandidates += pos.candidates.length;

            // Calculate total votes for this position
            const totalVotes = pos.candidates.reduce((sum, c) => sum + c.voteCount, 0);

            positions.push({
              position: pos.positionName,
              totalVotes,
              abstained: 0, // Not provided by backend
              isTie: pos.candidates.filter((c) => c.rank === 1).length > 1,
              candidates: pos.candidates.map((c, idx) => ({
                id: `cand-${idx}`,
                name: c.candidateName,
                votes: c.voteCount,
                percentage: c.percentage,
                rank: c.rank,
                status:
                  c.rank === 1
                    ? "winner"
                    : c.rank === 2
                    ? "runner_up"
                    : "other",
              })),
            });
          });
        });

        // Format published date
        const publishedDate = new Date(backendResults.publishedAt).toLocaleDateString(
          "en-US",
          { day: "numeric", month: "long", year: "numeric" }
        );

        setResults({
          electionName: backendResults.electionName,
          publishedDate,
          publishedBy: "Election Administration",
          status: "published",
          eligibleStudents: backendResults.totalEligible,
          ballotsSubmitted: backendResults.totalVotes,
          participation: backendResults.participation,
          totalPositions,
          totalCandidates,
          positions,
        });

        setLoadingState("success");
      } catch (err) {
        console.error("Failed to fetch results:", err);
        setLoadingState("error");
        setErrorMessage("An unexpected error occurred");
      }
    }

    fetchResults();
  }, []);

  // Loading state
  if (loadingState === "loading") {
    return (
      <StudentLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-sm text-text-secondary">Loading election results...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Results not published
  if (loadingState === "not_published") {
    return (
      <StudentLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="max-w-md w-full text-center p-8 border-border">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-primary-300" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              Results Not Published Yet
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              Official election results will appear here after they are
              published by Election Administration.
            </p>
            <Button
              variant="primary"
              onClick={() => router.push("/student/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Dashboard
            </Button>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  // Error state
  if (loadingState === "error") {
    return (
      <StudentLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="max-w-md w-full text-center p-8 border-border">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              Unable to Load Results
            </h2>
            <p className="text-sm text-text-secondary mb-6">{errorMessage}</p>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              Try Again
            </Button>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  // Success state - results loaded
  if (!results) {
    return null;
  }

  const filteredPositions = results.positions.filter((position) => {
    const matchesSearch =
      position.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      position.candidates.some((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesFilter =
      positionFilter === "all" || position.position === positionFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Election Results
            </h1>
            <p className="text-sm text-text-secondary">
              Official results for the Student Council Election 2026.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success">Official Results</Badge>
          </div>
        </div>

        {/* Status Card */}
        <Card className="p-5 border-success/20 bg-success-50">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Official Results
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Results published by Election Administration.
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-text-secondary">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Published: {results.publishedDate}
                </span>
                <span className="text-xs text-text-secondary">
                  {results.electionName}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Summary */}
        <Card className="p-5 border-border">
          <h3 className="text-sm font-bold text-text-primary mb-4">
            Election Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Positions Contested", value: results.totalPositions },
              { label: "Candidates", value: results.totalCandidates },
              { label: "Eligible Students", value: results.eligibleStudents.toLocaleString() },
              { label: "Ballots Submitted", value: results.ballotsSubmitted.toLocaleString() },
              { label: "Participation", value: `${results.participation}%` },
              { label: "Status", value: "Official Results", isBadge: true },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-xl bg-primary-50/50">
                <div className="text-xs text-text-secondary mb-1">{item.label}</div>
                {item.isBadge ? (
                  <Badge variant="success" className="text-xs">
                    {item.value}
                  </Badge>
                ) : (
                  <div className="text-lg font-bold text-text-primary">
                    {item.value}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Search and Filter */}
        <Card className="p-4 border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="all">All Positions</option>
              {results.positions.map((p) => (
                <option key={p.position} value={p.position}>
                  {p.position}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Results by Position */}
        <div className="space-y-4">
          {filteredPositions.map((position) => {
            const isExpanded = expandedPosition === position.position;
            const winner = position.candidates.find((c) => c.status === "winner");

            return (
              <Card
                key={position.position}
                className="border-border overflow-hidden"
              >
                {/* Position Header */}
                <button
                  onClick={() =>
                    setExpandedPosition(isExpanded ? null : position.position)
                  }
                  className="w-full p-4 flex items-center justify-between hover:bg-primary-50/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-base font-bold text-text-primary">
                        {position.position}
                      </h3>
                      <p className="text-xs text-text-secondary">
                        {position.totalVotes.toLocaleString()} votes •{" "}
                        {position.candidates.length} candidates
                        {position.isTie && (
                          <span className="text-amber-600 ml-1">• Tie</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-text-secondary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-text-secondary" />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {/* Winner Alert */}
                    {winner && (
                      <div className="p-4 bg-success-50 border-b border-success/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="w-4 h-4 text-success" />
                          <span className="text-sm font-bold text-success">
                            Winner
                          </span>
                          {position.isTie && (
                            <Badge variant="warning" className="text-xs ml-2">
                              Tie
                            </Badge>
                          )}
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-success/20 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-success flex items-center justify-center font-bold text-white text-sm">
                              {winner.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-success" />
                                <span className="text-sm font-bold text-text-primary">
                                  {winner.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-text-secondary">
                                  {winner.votes.toLocaleString()} votes
                                </span>
                                <span className="text-xs font-medium text-success">
                                  {winner.percentage}%
                                </span>
                              </div>
                            </div>
                            <Badge variant="success" className="text-[10px]">Winner</Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Results Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-primary-50/50">
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                              Candidate
                            </th>
                            <th className="px-4 py-2.5 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                              Votes
                            </th>
                            <th className="px-4 py-2.5 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                              Percentage
                            </th>
                            <th className="px-4 py-2.5 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                              Rank
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {position.candidates
                            .sort((a, b) => a.rank - b.rank)
                            .map((c) => (
                              <tr key={c.id} className="border-b border-border/50">
                                <td className="py-2.5 flex items-center gap-2">
                                  {c.status === "winner" && (
                                    <Trophy className="w-3.5 h-3.5 text-success" />
                                  )}
                                  <span className="text-text-primary font-medium">
                                    {c.name}
                                  </span>
                                </td>
                                <td className="py-2.5 text-right text-text-secondary">
                                  {c.votes.toLocaleString()}
                                </td>
                                <td className="py-2.5 text-right text-text-secondary">
                                  {c.percentage}%
                                </td>
                                <td className="py-2.5 text-right">
                                  <Badge
                                    variant={
                                      c.rank === 1
                                        ? "success"
                                        : c.rank === 2
                                        ? "info"
                                        : "neutral"
                                    }
                                    className="text-[10px]"
                                  >
                                    {c.rank === 1
                                      ? "1st"
                                      : c.rank === 2
                                      ? "2nd"
                                      : `${c.rank}th`}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Empty State for Search */}
        {filteredPositions.length === 0 && (
          <Card className="p-8 text-center border-border">
            <Search className="w-8 h-8 text-text-secondary mx-auto mb-3" />
            <h3 className="text-sm font-medium text-text-primary mb-1">
              No results found
            </h3>
            <p className="text-xs text-text-secondary">
              Try adjusting your search or filter
            </p>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-text-secondary pt-4">
          <p>This is an official election result record.</p>
          <p className="mt-1">
            Results are verified and published by Election Administration.
          </p>
        </div>
      </div>
    </StudentLayout>
  );
}
