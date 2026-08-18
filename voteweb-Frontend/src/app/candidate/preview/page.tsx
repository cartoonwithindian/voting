"use client";

import React from "react";
import { CandidateLayout } from "@/components/candidate-dashboard/CandidateLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, Eye } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface CandidateProfile {
  id: string;
  name: string;
  position: string;
  department: string;
  year: string;
  biography: string;
  campaignLogo: string | null;
  campaignTitle: string;
  campaignDescription: string;
  manifesto: { id: string; title: string; content: string }[];
  applicationStatus: string;
  verificationBadge: boolean;
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "approved":
      return "success";
    case "under_review":
    case "submitted":
      return "warning";
    case "rejected":
      return "error";
    case "changes_requested":
      return "warning";
    default:
      return "neutral";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Draft";
    case "submitted":
      return "Submitted";
    case "under_review":
      return "Under Review";
    case "changes_requested":
      return "Changes Requested";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

function getStatusDescription(status: string) {
  switch (status) {
    case "draft":
      return "Only you can see it. Your profile is not visible to anyone else until you submit it for review.";
    case "submitted":
      return "Your profile has been submitted and is waiting for election administration review.";
    case "under_review":
      return "Election administration can review it. Your profile is currently being evaluated.";
    case "changes_requested":
      return "Election administration has requested changes to your profile. Please review and update accordingly.";
    case "approved":
      return "Visible to eligible students. Your profile has been approved and is now publicly visible.";
    case "rejected":
      return "Not published. Your profile was not approved and is not visible to students.";
    default:
      return "";
  }
}

export default function CandidateProfilePreviewPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await api.getCandidate(user.id);
        if (res.error || !res.data) {
          setProfile({
            id: `CAN-${user.id}`,
            name: user.name,
            position: "Candidate",
            department: "", year: "", biography: "",
            campaignLogo: null, campaignTitle: "", campaignDescription: "",
            manifesto: [], applicationStatus: "draft", verificationBadge: false,
          });
        } else {
          const data = res.data as Record<string, unknown>;
          const c = (data.candidate || data) as Record<string, unknown>;
          setProfile({
            id: String(c.id || user.id),
            name: String(c.name || user.name),
            position: String(c.position_id || "Candidate"),
            department: "", year: "",
            biography: String(c.description || c.bio || ""),
            campaignLogo: null, campaignTitle: "", campaignDescription: "",
            manifesto: [],
            applicationStatus: c.is_active ? "approved" : "draft",
            verificationBadge: !!c.is_active,
          });
        }
      } catch {
        setProfile({
          id: `CAN-${user.id}`, name: user.name, position: "Candidate",
          department: "", year: "", biography: "",
          campaignLogo: null, campaignTitle: "", campaignDescription: "",
          manifesto: [], applicationStatus: "draft", verificationBadge: false,
        });
      } finally {
        setLoading(false);
      }
    };
    if (authLoading) return;
    if (!isAuthenticated || !user) return;
    fetchProfile();
  }, [user, isAuthenticated, authLoading]);

  if (!isAuthenticated && !authLoading) {
    return (
      <CandidateLayout>
        <div className="text-center py-12 text-text-secondary">
          Please sign in to view your profile preview.
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

  if (!profile) {
    return (
      <CandidateLayout>
        <div className="text-center py-12 text-text-secondary">Profile not found.</div>
      </CandidateLayout>
    );
  }
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <CandidateLayout candidateName={profile.name} candidateId={profile.id}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Candidate Profile Preview
          </h1>
          <p className="text-text-secondary mt-1">
            See how your profile appears to students during the election.
          </p>
        </div>

        {/* Notice Banner */}
        <Card className="border-primary-100 bg-primary-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-100">
              <Eye className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-700">
                This is how students will see your approved profile.
              </p>
              <p className="text-xs text-primary-500 mt-0.5">
                Review your profile carefully before submitting for approval.
              </p>
            </div>
          </div>
        </Card>

        {/* Profile Preview - styled like student-facing candidate profile */}
        <div className="relative rounded-2xl overflow-hidden bg-primary-50">
          <div className="p-6">
            {/* Top section with avatar and info */}
            <div className="flex items-start gap-4 mb-5">
              {/* Large avatar/initials */}
              {profile.campaignLogo ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                  <Image
                    src={profile.campaignLogo}
                    alt={profile.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-primary-600 flex items-center justify-center font-bold text-white text-2xl shadow-sm">
                  {initials}
                </div>
              )}

              <div className="flex-1">
                <h2 className="text-xl font-bold text-text-primary">
                  {profile.name}
                </h2>
                <Badge variant="info" className="mt-1">
                  {profile.position}
                </Badge>
                <p className="text-sm text-text-secondary mt-2">
                  {profile.department} &middot; {profile.year}
                </p>
                {profile.verificationBadge && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle2 className="w-4 h-4 text-success-500" />
                    <span className="text-sm font-medium text-success-600">
                      Verified
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Logo Section */}
            {profile.campaignLogo && (
              <div className="mb-4 p-3 bg-white rounded-xl border border-border">
                <p className="text-xs text-text-secondary mb-2">Campaign Logo</p>
                <div className="relative h-16">
                  <Image
                    src={profile.campaignLogo}
                    alt="Campaign logo"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
            )}

            {/* Campaign Title & Description */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-text-primary">
                {profile.campaignTitle}
              </h3>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                {profile.campaignDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Biography Section */}
        <Card>
          <h3 className="text-lg font-bold text-text-primary border-b border-border pb-3">
            About
          </h3>
          <p className="text-text-secondary leading-relaxed mt-4">
            {profile.biography}
          </p>
        </Card>

        {/* Manifesto Section */}
        <Card>
          <h3 className="text-lg font-bold text-text-primary border-b border-border pb-3">
            Manifesto
          </h3>
          <div className="mt-4 space-y-4">
            {profile.manifesto.length > 0 ? (
              profile.manifesto.map((section) => (
                <div
                  key={section.id}
                  className="p-4 bg-primary-50 rounded-xl"
                >
                  <h4 className="font-medium text-primary-400 mb-2">
                    {section.title}
                  </h4>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-text-secondary text-sm italic">
                No manifesto available
              </p>
            )}
          </div>
        </Card>

        {/* Profile Visibility Section */}
        <Card>
          <h3 className="text-lg font-bold text-text-primary border-b border-border pb-3">
            Profile Visibility
          </h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary">Current Status:</span>
              <Badge variant={getStatusBadgeVariant(profile.applicationStatus)}>
                {getStatusLabel(profile.applicationStatus)}
              </Badge>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {getStatusDescription(profile.applicationStatus)}
            </p>
          </div>
        </Card>
      </div>
    </CandidateLayout>
  );
}
