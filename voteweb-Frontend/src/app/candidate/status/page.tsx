"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CandidateLayout } from "@/components/candidate-dashboard/CandidateLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";
import { api, Election } from "@/lib/api-client";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  FileText,
  Shield,
  Loader2,
} from "lucide-react";

interface StatusCandidate {
  id: number;
  name: string;
  position: string;
  isActive: boolean;
  createdAt: string;
  biography: string;
}

export default function CandidateStatusPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [candidate, setCandidate] = useState<StatusCandidate | null>(null);
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const electionRes = await api.getActiveElections();
        if (!electionRes.error) {
          const data = electionRes.data as Record<string, unknown>;
          const list = Array.isArray(data?.elections)
            ? (data.elections as Election[])
            : Array.isArray(data)
              ? (data as unknown as Election[])
              : [];
          setElection(list[0] || null);
        }

        const candidateRes = await api.getCandidate(user.id);
        if (candidateRes.error || !candidateRes.data) {
          setError(candidateRes.error || "Candidate profile not found");
        } else {
          const data = candidateRes.data as Record<string, unknown>;
          const cand = (data.candidate || data) as Record<string, unknown>;
          setCandidate({
            id: Number(cand.id || user.id),
            name: String(cand.name || user.name),
            position: String(cand.position_id || "Candidate"),
            isActive: cand.is_active !== false,
            createdAt: cand.created_at ? String(cand.created_at) : new Date().toISOString(),
            biography: String(cand.description || cand.bio || ""),
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load application status");
      } finally {
        setLoading(false);
      }
    };
    if (authLoading) return;
    if (!isAuthenticated || !user) return;
    fetchStatus();
  }, [user, isAuthenticated, authLoading]);

  if (!isAuthenticated && !authLoading) {
    return (
      <CandidateLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Please sign in to view your application status
          </h2>
          <Link href="/login">
            <Button variant="primary">Sign In</Button>
          </Link>
        </div>
      </CandidateLayout>
    );
  }

  if (loading || authLoading) {
    return (
      <CandidateLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </CandidateLayout>
    );
  }

  if (error || !candidate) {
    return (
      <CandidateLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            {error || "Profile not found"}
          </h2>
          <Link href="/candidate/profile">
            <Button variant="primary">Go to Profile</Button>
          </Link>
        </div>
      </CandidateLayout>
    );
  }

  const isApproved = candidate.isActive;
  const votingOpen = election?.status === "OPEN";
  const resultsPublished = election?.status === "RESULTS_PUBLISHED";

  // Timeline derived from real candidate data
  const timeline = [
    {
      label: "Application Started",
      date: new Date(candidate.createdAt).toLocaleDateString(),
      completed: true,
      current: false,
    },
    {
      label: isApproved ? "Profile Approved" : "Pending Review",
      date: isApproved ? new Date(candidate.createdAt).toLocaleDateString() : null,
      completed: isApproved,
      current: isApproved,
    },
    {
      label: "Profile Published",
      date: isApproved && election ? new Date(election.created_at).toLocaleDateString() : null,
      completed: isApproved,
      current: isApproved && !votingOpen && !resultsPublished,
    },
  ];

  return (
    <CandidateLayout candidateName={candidate.name} candidateId={`CAN-${candidate.id}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Application Status
          </h1>
          <p className="text-sm text-text-secondary">
            Track your candidate application progress.
          </p>
        </div>

        {/* Status Card */}
        {isApproved ? (
          <Card className="p-6 border-success/20 bg-success-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-text-primary mb-1">
                  Candidate Approved
                </h2>
                <p className="text-sm text-text-secondary mb-4">
                  Your profile has been approved and published.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-white">
                    <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">
                      Position
                    </p>
                    <p className="text-sm font-semibold text-text-primary">
                      {candidate.position}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white">
                    <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">
                      Candidate ID
                    </p>
                    <p className="text-sm font-mono font-semibold text-text-primary">
                      CAN-{candidate.id}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white">
                    <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">
                      Application
                    </p>
                    <Badge variant="success" className="text-[10px]">
                      Approved
                    </Badge>
                  </div>
                  <div className="p-3 rounded-xl bg-white">
                    <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">
                      Profile
                    </p>
                    <Badge variant="success" className="text-[10px]">
                      Published
                    </Badge>
                  </div>
                </div>
                <Link href="/candidate/preview">
                  <Button variant="primary" size="sm" className="gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Preview Public Profile
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 border-warning/20 bg-warning-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-text-primary mb-1">
                  Application In Progress
                </h2>
                <p className="text-sm text-text-secondary mb-4">
                  Your candidate profile is not yet approved. Contact election
                  administration if you believe this is a mistake.
                </p>
                <Link href="/candidate/profile">
                  <Button variant="primary" size="sm" className="gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Complete Profile
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Timeline */}
        <Card className="p-6 border-border">
          <h2 className="text-lg font-bold text-text-primary mb-5">
            Application Timeline
          </h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-5">
              {timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      event.completed ? "bg-success" : "bg-border"
                    }`}
                  >
                    {event.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <Clock className="w-4 h-4 text-text-secondary" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-medium ${
                          event.current
                            ? "text-primary-700"
                            : event.completed
                              ? "text-text-primary"
                              : "text-text-secondary"
                        }`}
                      >
                        {event.label}
                      </p>
                      {event.current && (
                        <Badge variant="info" className="text-[10px]">
                          Current Step
                        </Badge>
                      )}
                    </div>
                    {event.date && (
                      <p className="text-xs text-text-secondary mt-0.5">
                        {event.date}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Election Information */}
        <Card className="p-6 border-border">
          <h2 className="text-lg font-bold text-text-primary mb-4">
            Election Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Election</span>
              <span className="font-medium text-text-primary">
                {election?.name || "No active election"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Position</span>
              <span className="font-medium text-text-primary">
                {candidate.position}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Candidate ID</span>
              <span className="font-mono font-medium text-text-primary">
                CAN-{candidate.id}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Voting</span>
              <Badge variant={votingOpen ? "success" : "neutral"} className="text-[10px]">
                {votingOpen ? "Open" : resultsPublished ? "Results Published" : election?.status || "N/A"}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Results</span>
              <span className="font-medium text-text-primary">
                {election?.end_time
                  ? new Date(election.end_time).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </div>
        </Card>

        {/* Guidelines */}
        <Card className="p-6 border-border">
          <div className="flex items-start gap-3 mb-3">
            <Shield className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Candidate Guidelines
              </h2>
            </div>
          </div>
          <ul className="space-y-2 mb-4 ml-8">
            {[
              "Provide accurate profile information.",
              "Follow election administration rules.",
              "Do not impersonate another candidate.",
              "Do not upload offensive content.",
              "Do not use misleading institutional branding.",
              "Do not attempt to manipulate voting systems.",
            ].map((rule, i) => (
              <li
                key={i}
                className="text-sm text-text-secondary flex items-start gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                {rule}
              </li>
            ))}
          </ul>
          <Link href="/student/guidelines">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <ArrowRight className="w-3.5 h-3.5" />
              View Full Guidelines
            </Button>
          </Link>
        </Card>
      </div>
    </CandidateLayout>
  );
}
