"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { ErrorMessage } from "@/components/auth/ErrorMessage";
import { SuccessState } from "@/components/auth/SuccessState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";


type ForgotPasswordState = "form" | "loading" | "success";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pageState, setPageState] = useState<ForgotPasswordState>("form");

  const validateEmail = (value: string): string | null => {
    if (!value.trim()) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Enter a valid college email address.";
    const domain = value.split("@")[1]?.toLowerCase() || "";
    if (domain === "gmail.com" || domain === "yahoo.com" || domain === "outlook.com") {
      return "Enter a valid college email address.";
    }
    return null;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const emailError = validateEmail(email);
      if (emailError) {
        setError(emailError);
        return;
      }

      setPageState("loading");

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setPageState("success");
    },
    [email]
  );

  if (pageState === "success") {
    return (
      <AuthLayout>
        <AuthCard>
          <SuccessState
            title="Check Your Email"
            message="If an eligible account exists, password reset instructions will be provided."
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
          title="Forgot Password?"
          subtitle="Enter your registered college email address and we'll guide you through the next step."
        />

        <AuthCard className="space-y-5">
          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="College Email"
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              error={error ?? undefined}
              autoComplete="email"
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
                "Sending..."
              ) : (
                <>
                  Continue
                  <Mail className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </AuthCard>

        <p className="text-xs text-text-muted text-center">
          For your security, we won&apos;t reveal whether an email address is registered.
        </p>
      </div>
    </AuthLayout>
  );
}