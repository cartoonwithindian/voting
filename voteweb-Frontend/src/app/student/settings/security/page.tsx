"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import {
  ArrowLeft,
  Lock,
  Shield,
  Monitor,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});
  const { user } = useAuth();

  const getPasswordStrength = (pw: string): { label: string; color: string; width: string } => {
    if (pw.length === 0) return { label: "", color: "bg-border", width: "w-0" };
    if (pw.length < 8) return { label: "Weak", color: "bg-error", width: "w-1/3" };
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw) && pw.length >= 8) return { label: "Strong", color: "bg-success", width: "w-full" };
    return { label: "Medium", color: "bg-warning", width: "w-2/3" };
  };

  const strength = getPasswordStrength(newPassword);

  const validatePassword = () => {
    const newErrors: typeof errors = {};
    if (!currentPassword) newErrors.current = "Current password is required.";
    if (newPassword.length < 8) newErrors.new = "Password must be at least 8 characters.";
    if (newPassword !== confirmPassword) newErrors.confirm = "Passwords do not match.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    setIsChanging(true);
    setChangeError(null);
    const res = await api.changePassword(currentPassword, newPassword);
    setIsChanging(false);
    if (res.error) {
      setChangeError(res.error);
      return;
    }
    setPasswordChanged(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordChanged(false), 3000);
  };

  return (
    <StudentLayout>
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <Link href="/student/settings">
                <Button variant="ghost" size="sm" className="gap-1.5 mb-3">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Settings
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-text-primary">Security Settings</h1>
              <p className="text-sm text-text-secondary">
                Manage your password, two-factor authentication, and active sessions.
              </p>
            </div>

            {/* Password Changed Toast */}
            {passwordChanged && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-success-50 border border-success/20 text-sm text-success">
                <CheckCircle2 className="w-4 h-4" />
                Password changed successfully.
              </div>
            )}

            {/* Change Password Error */}
            {changeError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-error-50 border border-error/20 text-sm text-error">
                <AlertCircle className="w-4 h-4" />
                {changeError}
              </div>
            )}

            {/* Change Password */}
            <Card className="p-5 border-border">
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary-400" />
                Change Password
              </h2>
              <div className="space-y-4 max-w-md">
                {/* Current Password */}
                <div>
                  <label className="text-[10px] font-medium text-text-secondary uppercase tracking-wider block mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 rounded-xl border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary-600"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.current && <p className="text-xs text-error mt-1">{errors.current}</p>}
                </div>

                {/* New Password */}
                <div>
                  <label className="text-[10px] font-medium text-text-secondary uppercase tracking-wider block mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 rounded-xl border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary-600"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-text-secondary">Password strength</span>
                        <span className={`text-[10px] font-medium ${
                          strength.label === "Strong" ? "text-success" :
                          strength.label === "Medium" ? "text-warning" : "text-error"
                        }`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
                      </div>
                    </div>
                  )}
                  {errors.new && <p className="text-xs text-error mt-1">{errors.new}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-[10px] font-medium text-text-secondary uppercase tracking-wider block mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 rounded-xl border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirm && <p className="text-xs text-error mt-1">{errors.confirm}</p>}
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="gap-1.5"
                  onClick={handleChangePassword}
                  isLoading={isChanging}
                  disabled={isChanging}
                >
                  <Lock className="w-4 h-4" />
                  {isChanging ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </Card>

            {/* Two-Factor Authentication */}
            <Card className="p-5 border-border">
              <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-400" />
                Two-Factor Authentication
              </h2>
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary-50/50 mb-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">Status</p>
                  <p className="text-xs text-text-secondary">Add an extra security step when signing in.</p>
                </div>
                <Badge variant="warning" className="text-[10px]">Not Enabled</Badge>
              </div>
              <Button variant="secondary" size="sm" className="gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Enable 2FA
              </Button>
            </Card>

            {/* Active Sessions */}
            <Card className="p-5 border-border">
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-primary-400" />
                Active Sessions
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-success-50 border border-success/20">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-text-secondary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary">
                          {user?.name || "This device"}
                        </p>
                        <Badge variant="success" className="text-[10px]">Current</Badge>
                      </div>
                      <p className="text-xs text-text-secondary">
                        {user?.role ? `${user.role.charAt(0) + user.role.slice(1).toLowerCase()} account` : "Signed in on this device"} &bull; This session
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-3">
                Session history is not available yet. Your session stays active until you sign
                out or it expires.
              </p>
            </Card>
          </div>
    </StudentLayout>
  );
}
