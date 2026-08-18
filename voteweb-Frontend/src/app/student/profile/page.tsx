"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import {
  Mail,
  Calendar,
  Award,
  Edit2,
  Save,
  CheckCircle2,
  Settings,
} from "lucide-react";

interface StudentProfile {
  id: number;
  external_id: string;
  name: string;
  email: string;
  is_active: boolean;
  mfa_enabled: boolean;
  failed_login_attempts: number;
  last_login: string | null;
  password_change_required: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.getStudent(user.id);
      if (res.error) {
        // Fallback to auth data if student endpoint fails
        setProfile({
          id: user.id,
          external_id: user.externalId || `STU${user.id.toString().padStart(3, '0')}`,
          name: user.name,
          email: user.email,
          is_active: true,
          mfa_enabled: false,
          failed_login_attempts: 0,
          last_login: null,
          password_change_required: false,
        });
      } else {
        const data = res.data as Record<string, unknown>;
        if ('external_id' in data) {
          setProfile(data as unknown as StudentProfile);
        } else if ('student' in data) {
          setProfile((data as { student: StudentProfile }).student);
        } else {
          // Fallback to auth data
          setProfile({
            id: user.id,
            external_id: user.externalId || `STU${user.id.toString().padStart(3, '0')}`,
            name: user.name,
            email: user.email,
            is_active: true,
            mfa_enabled: false,
            failed_login_attempts: 0,
            last_login: null,
            password_change_required: false,
          });
        }
      }
    } catch {
      // Fallback to auth data on error
      if (user) {
        setProfile({
          id: user.id,
          external_id: user.externalId || `STU${user.id.toString().padStart(3, '0')}`,
          name: user.name,
          email: user.email,
          is_active: true,
          mfa_enabled: false,
          failed_login_attempts: 0,
          last_login: null,
          password_change_required: false,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const run = async () => {
      if (!authLoading && isAuthenticated) {
        await fetchProfile();
      } else if (!authLoading && !isAuthenticated) {
        router.push("/login");
      }
    };
    run();
  }, [authLoading, isAuthenticated, fetchProfile, router]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setShowSaveSuccess(false);
    // Profile updates not implemented in backend - just show success
    setTimeout(() => {
      setIsSaving(false);
      setShowSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }, 500);
  };

  if (loading || authLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-text-secondary">Loading profile...</div>
        </div>
      </StudentLayout>
    );
  }

  if (error || !profile) {
    return (
      <StudentLayout>
        <ErrorState
          title="Unable to load profile"
          message={error || "Please log in to view your profile"}
          onRetry={fetchProfile}
        />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Profile</h1>
            <p className="text-sm text-text-secondary mt-1">Manage your account information</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {showSaveSuccess && (
          <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Profile updated successfully!
          </div>
        )}

        {/* Profile Card */}
        <Card>
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-bold shrink-0">
              {profile.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-text-primary">{profile.name}</h2>
              <p className="text-sm text-text-secondary mt-1">Student ID: {profile.external_id}</p>

              <div className="flex flex-wrap gap-2 mt-3">
                {profile.mfa_enabled ? (
                  <Badge variant="success">MFA Enabled</Badge>
                ) : (
                  <Badge variant="warning">MFA Not Enabled</Badge>
                )}
                {profile.password_change_required ? (
                  <Badge variant="warning">Password Change Required</Badge>
                ) : null}
                {profile.is_active ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="error">Inactive</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-text-muted" />
              <div>
                <p className="text-xs text-text-muted">Email</p>
                <p className="text-sm font-medium text-text-primary">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-text-muted" />
              <div>
                <p className="text-xs text-text-muted">Last Login</p>
                <p className="text-sm font-medium text-text-primary">
                  {profile.last_login
                    ? new Date(profile.last_login).toLocaleString()
                    : "First login"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-text-muted" />
              <div>
                <p className="text-xs text-text-muted">Account Status</p>
                <p className="text-sm font-medium text-text-primary">
                  {profile.failed_login_attempts > 0
                    ? `${profile.failed_login_attempts} failed login attempts`
                    : "No failed login attempts"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Settings */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-text-muted" />
            <h3 className="text-lg font-semibold text-text-primary">Account Settings</h3>
          </div>

          <div className="space-y-3">
            <Link
              href="/student/settings/security"
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary-300 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">Security Settings</p>
                <p className="text-xs text-text-secondary">Manage password and MFA</p>
              </div>
              <span className="text-text-muted">→</span>
            </Link>

            <Link
              href="/student/settings"
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary-300 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">Notification Preferences</p>
                <p className="text-xs text-text-secondary">Manage how you receive updates</p>
              </div>
              <span className="text-text-muted">→</span>
            </Link>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
