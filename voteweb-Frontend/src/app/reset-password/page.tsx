"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SuccessState } from "@/components/auth/SuccessState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";


type ResetPasswordState = "form" | "loading" | "success";

interface FormErrors {
  newPassword?: string;
  confirmPassword?: string;
}

function validateNewPassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password is too short (minimum 8 characters).";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  return null;
}

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [pageState, setPageState] = useState<ResetPasswordState>("form");

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    const passwordError = validateNewPassword(newPassword);
    if (passwordError) newErrors.newPassword = passwordError;

    if (newPassword && !confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [newPassword, confirmPassword]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (pageState === "loading") return;

      if (!validateForm()) return;

      setPageState("loading");

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In production, this would call api.changePassword()
      setPageState("success");
    },
    [pageState, validateForm]
  );

  if (pageState === "success") {
    return (
      <AuthLayout>
        <AuthCard>
          <SuccessState
            title="Password reset successfully"
            message="Your password has been updated. You can now sign in using your new password."
          />
          <Link href="/login" className="block mt-2">
            <Button variant="secondary" size="lg" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Return to Login
            </Button>
          </Link>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-5">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <AuthHeader
          title="Create New Password"
          subtitle="Choose a strong password for your account."
        />

        <AuthCard className="space-y-5">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
              }}
              error={errors.newPassword}
              autoComplete="new-password"
              aria-required="true"
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              error={errors.confirmPassword}
              autoComplete="new-password"
              aria-required="true"
            />

            <Button
              type="submit"
              isLoading={pageState === "loading"}
              disabled={pageState === "loading"}
              className="w-full h-12 gap-2 rounded-xl"
              size="lg"
            >
              {pageState === "loading" ? (
                "Resetting..."
              ) : (
                <>
                  Reset Password
                  <ShieldCheck className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </AuthCard>

        {/* Password Requirements */}
        <Card className="p-4 bg-white border-border rounded-2xl">
          <p className="text-xs font-semibold text-text-secondary mb-2">
            Password Requirements:
          </p>
          <ul className="space-y-1 text-[11px] text-text-muted list-disc list-inside">
            <li>At least 8 characters long</li>
            <li>At least one uppercase letter</li>
            <li>At least one lowercase letter</li>
            <li>At least one number</li>
          </ul>
        </Card>
      </div>
    </AuthLayout>
  );
}