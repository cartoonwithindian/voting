"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CandidateLayout } from "@/components/candidate-dashboard/CandidateLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";
import { api, Notification, Election } from "@/lib/api-client";
import {
  User,
  Megaphone,
  FileText,
  Eye,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bell,
  Shield,
  BookOpen,
  TrendingUp,
  Loader2,
} from "lucide-react";

interface DashboardCandidate {
  id: number;
  name: string;
  position: string;
  biography: string;
  campaignLogo: string | null;
  applicationStatus: "draft" | "approved";
  profileCompletion: number;
  electionName: string;
  electionStatus: string;
  resultsDate: string;
  createdAt: string;
}

export default function CandidateDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [candidate, setCandidate] = useState<DashboardCandidate | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        // Load active election
        let election: Election | null = null;
        const electionRes = await api.getActiveElections();
        if (!electionRes.error) {
          const data = electionRes.data as Record<string, unknown>;
          const list = Array.isArray(data?.elections)
            ? (data.elections as Election[])
            : Array.isArray(data)
              ? (data as unknown as Election[])
              : [];
          election = list[0] || null;
        }

        // Load candidate profile
        const candidateRes = await api.getCandidate(user.id);
        const data = candidateRes.data as Record<string, unknown> | undefined;
        const cand = (data?.candidate || data || {}) as Record<string, unknown>;

        const name = String(cand.name || user.name || "Candidate");
        const biography = String(cand.description || cand.bio || "");
        const campaignLogo = cand.image_url ? String(cand.image_url) : null;
        const isActive = cand.is_active !== false;
        const positionName = cand.position_id ? String(cand.position_id) : "Candidate";
        const createdAt = cand.created_at ? String(cand.created_at) : new Date().toISOString();

        // Compute profile completion from real fields
        const checklistItems = [
          !!name,
          !!biography,
          !!campaignLogo,
          !!cand.position_id,
        ];
        const completed = checklistItems.filter(Boolean).length;
        const profileCompletion = Math.round((completed / checklistItems.length) * 100);

        setCandidate({
          id: Number(cand.id || user.id),
          name,
          position: positionName,
          biography,
          campaignLogo,
          applicationStatus: isActive ? "approved" : "draft",
          profileCompletion,
          electionName: election?.name || "No active election",
          electionStatus: election?.status || "N/A",
          resultsDate: election?.end_time
            ? new Date(election.end_time).toLocaleDateString()
            : "—",
          createdAt,
        });

        // Load notifications
        const notifRes = await api.getNotifications();
        if (!notifRes.error) {
          const nData = notifRes.data as { data?: Notification[] } | Notification[] | undefined;
          if (Array.isArray(nData)) {
            setNotifications(nData);
          } else if (nData && "data" in nData && Array.isArray(nData.data)) {
            setNotifications(nData.data);
          } else {
            setNotifications([]);
          }
        } else {
          setNotifications([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    if (authLoading) return;
    if (!isAuthenticated || !user) return;
    fetchDashboard();
  }, [user, isAuthenticated, authLoading]);

  if (!isAuthenticated && !authLoading) {
    return (
      <CandidateLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Please sign in to view your dashboard
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            Sign in with your candidate credentials to continue.
          </p>
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
          <p className="text-sm text-text-secondary mb-6">
            We couldn&apos;t load your candidate dashboard. Try again shortly.
          </p>
          <Link href="/candidate/profile">
            <Button variant="primary">Go to Profile</Button>
          </Link>
        </div>
      </CandidateLayout>
    );
  }

  const isApproved = candidate.applicationStatus === "approved";
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <CandidateLayout candidateName={candidate.name} candidateId={`CAN-${candidate.id}`}>
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Candidate Dashboard
            </h1>
            <p className="text-sm text-text-secondary">
              Manage your candidate profile and election campaign information.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="info" size="md">
              {candidate.electionName}
            </Badge>
            <div
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl ${
                candidate.electionStatus === "OPEN"
                  ? "text-success-600 bg-success-50 border border-success-100"
                  : "text-text-secondary bg-neutral-50 border border-border"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  candidate.electionStatus === "OPEN"
                    ? "bg-success-500 animate-pulse"
                    : "bg-neutral-400"
                }`}
              />
              {candidate.electionStatus === "OPEN"
                ? "Voting Open"
                : candidate.electionStatus === "RESULTS_PUBLISHED"
                  ? "Results Published"
                  : candidate.electionStatus}
            </div>
          </div>
        </div>

        {/* Application Status */}
        <Card className="!p-0 overflow-hidden">
          <div
            className={`border-b px-6 py-4 ${
              isApproved ? "bg-success-50 border-success-100" : "bg-warning-50 border-warning-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isApproved ? "bg-success-500" : "bg-warning-500"
                }`}
              >
                {isApproved ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h3 className={`font-semibold ${isApproved ? "text-success-700" : "text-warning-700"}`}>
                  {isApproved ? "Approved" : "Draft"}
                </h3>
                <p className={`text-sm ${isApproved ? "text-success-600" : "text-warning-600"}`}>
                  {isApproved
                    ? "Your candidate profile has been approved."
                    : "Your profile is not yet approved by election administration."}
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-text-secondary mb-1">Position</p>
                <p className="font-semibold text-text-primary">{candidate.position}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Candidate ID</p>
                <p className="font-semibold text-text-primary font-mono">CAN-{candidate.id}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Application</p>
                <Badge variant={isApproved ? "success" : "warning"} size="sm">
                  {isApproved ? "Approved" : "Draft"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Profile</p>
                <Badge variant={isApproved ? "success" : "neutral"} size="sm">
                  {isApproved ? "Published" : "Not Published"}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Completion */}
          <Card className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-text-primary">Profile Completion</h3>
            </div>
            <div className="text-center mb-4">
              <span className="text-4xl font-bold text-primary-600">
                {candidate.profileCompletion}%
              </span>
              <p className="text-xs text-text-secondary mt-1">
                Based on your candidate profile fields
              </p>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2 mb-5">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${candidate.profileCompletion}%` }}
              />
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Candidate name", done: !!candidate.name },
                { label: "Biography", done: !!candidate.biography },
                { label: "Campaign logo", done: !!candidate.campaignLogo },
                { label: "Position assigned", done: candidate.position !== "Candidate" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-neutral-300 flex-shrink-0" />
                  )}
                  <span
                    className={`text-sm ${
                      item.done ? "text-text-primary" : "text-text-secondary"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/candidate/profile">
              <Card hoverable className="h-full">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center mb-3">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <h4 className="font-semibold text-text-primary mb-1">Edit Profile</h4>
                <p className="text-xs text-text-secondary">Update your profile information</p>
              </Card>
            </Link>
            <Link href="/candidate/campaign">
              <Card hoverable className="h-full">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center mb-3">
                  <Megaphone className="w-5 h-5 text-primary-600" />
                </div>
                <h4 className="font-semibold text-text-primary mb-1">Manage Campaign</h4>
                <p className="text-xs text-text-secondary">Upload logo and campaign info</p>
              </Card>
            </Link>
            <Link href="/candidate/manifesto">
              <Card hoverable className="h-full">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <h4 className="font-semibold text-text-primary mb-1">Edit Manifesto</h4>
                <p className="text-xs text-text-secondary">Create your election manifesto</p>
              </Card>
            </Link>
            <Link href="/candidate/preview">
              <Card hoverable className="h-full">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center mb-3">
                  <Eye className="w-5 h-5 text-primary-600" />
                </div>
                <h4 className="font-semibold text-text-primary mb-1">Preview Profile</h4>
                <p className="text-xs text-text-secondary">See how students view you</p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Notifications & Election Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-text-primary">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="primary" className="text-[10px]">{unreadCount} new</Badge>
                )}
              </div>
              <Link href="/notifications">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {notifications.length === 0 && (
                <div className="text-center py-8 text-sm text-text-secondary">
                  No notifications yet.
                </div>
              )}
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-border"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-white border border-border">
                    {notification.type === "success" && (
                      <CheckCircle2 className="w-4 h-4 text-success-500" />
                    )}
                    {notification.type === "warning" && (
                      <AlertTriangle className="w-4 h-4 text-warning-500" />
                    )}
                    {notification.type === "error" && (
                      <AlertTriangle className="w-4 h-4 text-error-500" />
                    )}
                    {(notification.type === "info" || !notification.type) && (
                      <Bell className="w-4 h-4 text-primary-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-sm text-text-primary">{notification.title}</p>
                      {!notification.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary-500" />
                      )}
                    </div>
                    {notification.message && (
                      <p className="text-xs text-text-secondary">{notification.message}</p>
                    )}
                    <p className="text-[10px] text-text-muted mt-1">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Election Information */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-text-primary">Election Information</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-border">
                <span className="text-sm text-text-secondary">Election</span>
                <span className="text-sm font-medium text-text-primary">{candidate.electionName}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-border">
                <span className="text-sm text-text-secondary">Position</span>
                <span className="text-sm font-medium text-text-primary">{candidate.position}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-border">
                <span className="text-sm text-text-secondary">Candidate ID</span>
                <span className="text-sm font-medium text-text-primary font-mono">CAN-{candidate.id}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-border">
                <span className="text-sm text-text-secondary">Registered</span>
                <span className="text-sm font-medium text-text-primary">
                  {new Date(candidate.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-border">
                <span className="text-sm text-text-secondary">Voting</span>
                <Badge variant={candidate.electionStatus === "OPEN" ? "success" : "neutral"} size="sm">
                  {candidate.electionStatus === "OPEN"
                    ? "Open"
                    : candidate.electionStatus === "RESULTS_PUBLISHED"
                      ? "Results Published"
                      : candidate.electionStatus || "N/A"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-border">
                <span className="text-sm text-text-secondary">Results Date</span>
                <span className="text-sm font-medium text-text-primary">{candidate.resultsDate}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Guidelines & Help */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Candidate Guidelines */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-text-primary">Candidate Guidelines</h3>
            </div>
            <ul className="space-y-2.5 mb-5">
              <li className="flex items-start gap-2.5 text-sm text-text-secondary">
                <CheckCircle2 className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                Provide accurate profile information.
              </li>
              <li className="flex items-start gap-2.5 text-sm text-text-secondary">
                <CheckCircle2 className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                Follow election administration rules.
              </li>
              <li className="flex items-start gap-2.5 text-sm text-text-secondary">
                <CheckCircle2 className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                Do not impersonate another candidate.
              </li>
              <li className="flex items-start gap-2.5 text-sm text-text-secondary">
                <CheckCircle2 className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                Do not upload offensive content.
              </li>
            </ul>
            <Link href="/student/guidelines">
              <Button variant="outline" size="sm" className="w-full">
                <BookOpen className="w-4 h-4" />
                View Full Guidelines
              </Button>
            </Link>
          </Card>

          {/* Need Help */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-text-primary">Need Help?</h3>
            </div>
            <p className="text-sm text-text-secondary mb-5">
              Contact election administration if you have questions about your candidate profile,
              application status, or election rules.
            </p>
            <Link href="/student/help">
              <Button variant="primary" size="md" className="w-full">
                Help &amp; Support
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </CandidateLayout>
  );
}
