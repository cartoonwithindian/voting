"use client";

import React, { useState, useEffect } from "react";
import { CandidateLayout } from "@/components/candidate-dashboard/CandidateLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

type ApplicationStatus = "draft" | "submitted" | "under_review" | "changes_requested" | "approved" | "rejected";

const STATUS_MAP: Record<ApplicationStatus, { label: string; variant: "default" | "success" | "warning" | "error" | "info" | "neutral"; description: string }> = {
  draft: { label: "Draft", variant: "neutral", description: "Your profile is in draft. Submit it for review." },
  submitted: { label: "Submitted", variant: "info", description: "Your profile has been submitted and is awaiting review." },
  under_review: { label: "Under Review", variant: "warning", description: "Election administration is reviewing your profile." },
  changes_requested: { label: "Changes Requested", variant: "error", description: "Please update your profile as requested by the admin." },
  approved: { label: "Approved", variant: "success", description: "Your profile is approved and published. Voters can see it." },
  rejected: { label: "Rejected", variant: "error", description: "Your profile was not approved. Please contact admin." },
};

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
  applicationStatus: ApplicationStatus;
  profileCompletion: number;
  socialLinks: { email: string; phone: string };
}

export default function CandidateProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    biography: "",
    department: "",
    year: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const startEditing = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        biography: profile.biography,
        department: profile.department,
        year: profile.year,
        email: profile.socialLinks.email,
        phone: profile.socialLinks.phone,
      });
    }
    setErrors({});
    setIsEditing(true);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        // Try to fetch candidate profile from API
        const res = await api.getCandidate(user.id);
        if (res.error || !res.data) {
          // Fallback to basic profile from auth data
          setProfile({
            id: `CAN-${user.id}`,
            name: user.name,
            position: "Candidate",
            department: "",
            year: "",
            biography: "",
            campaignLogo: null,
            campaignTitle: "",
            campaignDescription: "",
            manifesto: [],
            applicationStatus: "draft",
            profileCompletion: 0,
            socialLinks: { email: user.email, phone: "" },
          });
        } else {
          const data = res.data as Record<string, unknown>;
          const candidate = (data.candidate || data) as Record<string, unknown>;
          setProfile({
            id: String(candidate.id || user.id),
            name: String(candidate.name || user.name),
            position: String(candidate.position_id || "Candidate"),
            department: "",
            year: "",
            biography: String(candidate.description || candidate.bio || ""),
            campaignLogo: null,
            campaignTitle: "",
            campaignDescription: "",
            manifesto: [],
            applicationStatus: candidate.is_active ? "approved" : "draft",
            profileCompletion: 50,
            socialLinks: { email: user.email, phone: "" },
          });
        }
      } catch {
        setProfile({
          id: `CAN-${user.id}`,
          name: user.name,
          position: "Candidate",
          department: "",
          year: "",
          biography: "",
          campaignLogo: null,
          campaignTitle: "",
          campaignDescription: "",
          manifesto: [],
          applicationStatus: "draft",
          profileCompletion: 0,
          socialLinks: { email: user.email, phone: "" },
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
          Please sign in to view your candidate profile.
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

  const statusInfo = STATUS_MAP[profile.applicationStatus];

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Display name is required";
    if (!formData.biography.trim()) newErrors.biography = "Biography is required";
    if (formData.biography.length > 500) newErrors.biography = "Biography must be 500 characters or fewer";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      biography: profile.biography,
      department: profile.department,
      year: profile.year,
      email: profile.socialLinks.email,
      phone: profile.socialLinks.phone,
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <CandidateLayout
      candidateName={profile.name}
      candidateId={profile.id}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Candidate Profile</h1>
            <p className="text-sm text-text-secondary mt-1">
              Manage your public candidate profile and campaign information.
            </p>
          </div>
          <Button
            variant={isEditing ? "outline" : "primary"}
            onClick={() => (isEditing ? handleCancel() : startEditing())}
          >
            {isEditing ? "Cancel Editing" : "Edit Profile"}
          </Button>
        </div>

        {/* Profile Display / Edit Form */}
        <Card className="p-6 sm:p-8">
          {isEditing ? (
            /* Edit Form */
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">Edit Profile</h2>

              {/* Read-only fields info */}
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-sm text-primary-700">
                <p className="font-medium">Read-only fields</p>
                <p className="mt-1 text-xs text-primary-600">
                  Candidate ID, Position, and Application Status cannot be edited.
                </p>
              </div>

              {/* Editable fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Candidate ID
                  </label>
                  <input
                    type="text"
                    value={profile.id}
                    disabled
                    className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text-secondary bg-primary-50 font-mono cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Position
                  </label>
                  <input
                    type="text"
                    value={profile.position}
                    disabled
                    className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text-secondary bg-primary-50 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Application Status
                  </label>
                  <div className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text-secondary bg-primary-50">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Display Name <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.name && (
                    <p className="text-xs text-error-600 font-medium mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Short Biography <span className="text-error-500">*</span>
                  </label>
                  <textarea
                    value={formData.biography}
                    onChange={(e) => handleChange("biography", e.target.value)}
                    maxLength={500}
                    rows={4}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.biography && (
                      <p className="text-xs text-error-600 font-medium">{errors.biography}</p>
                    )}
                    <p className="text-xs text-text-muted ml-auto">
                      {formData.biography.length} / 500
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleChange("department", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Year
                    </label>
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) => handleChange("year", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Campaign Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Campaign Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <Button onClick={handleSave}>Save Profile</Button>
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              </div>
            </div>
          ) : (
            /* Profile Display */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-white">{initials}</span>
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-text-primary">{profile.name}</h2>
                  <p className="font-mono text-sm text-text-secondary">{profile.id}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-text-secondary">{profile.position}</span>
                    <span className="text-text-muted">·</span>
                    <span className="text-sm text-text-secondary">{profile.department}</span>
                    <span className="text-text-muted">·</span>
                    <span className="text-sm text-text-secondary">{profile.year}</span>
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">Biography</h3>
                <p className="text-sm text-text-primary leading-relaxed">{profile.biography}</p>
              </div>

              {/* Application Status */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-secondary">Application Status:</span>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>

              {/* Campaign Logo */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Campaign Logo</h3>
                {profile.campaignLogo ? (
                  <div className="relative h-16 rounded-xl overflow-hidden border border-border">
                    <Image
                      src={profile.campaignLogo}
                      alt="Campaign Logo"
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                ) : (
                  <div className="h-16 w-32 bg-neutral-100 border border-dashed border-border rounded-xl flex items-center justify-center">
                    <span className="text-xs text-text-muted">No logo uploaded</span>
                  </div>
                )}
              </div>

              {/* Edit Button */}
              <div className="pt-4 border-t border-border">
                <Button onClick={startEditing}>Edit Profile</Button>
              </div>
            </div>
          )}
        </Card>

        {/* Profile Status Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Profile Status</h2>
          <div className="flex items-center gap-3">
            <Badge variant={statusInfo.variant} size="md">{statusInfo.label}</Badge>
          </div>
          <p className="text-sm text-text-secondary mt-2">{statusInfo.description}</p>
        </Card>
      </div>
    </CandidateLayout>
  );
}
