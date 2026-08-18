"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HelpCircle, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { ErrorMessage } from "@/components/auth/ErrorMessage";
import { SuccessState } from "@/components/auth/SuccessState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api, LoginResponse } from "@/lib/api-client";

type ValidationErrors = Record<string, string>;
type PageState = "form" | "loading" | "success";
type MfaStep = "verify" | "setup" | null;

function validateIdentifier(identifier: string): string | undefined {
  if (!identifier.trim()) return "Student ID or email is required";
  if (identifier.trim().length < 3) return "Enter a valid Student ID or email";
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return undefined;
}

function redirectByRole(router: ReturnType<typeof useRouter>, role?: string) {
  if (role === "ADMIN" || role === "administrator") {
    router.push("/admin/dashboard");
  } else if (role === "CANDIDATE" || role === "candidate") {
    router.push("/candidate/dashboard");
  } else {
    router.push("/student/dashboard");
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pageState, setPageState] = useState<PageState>("form");
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // MFA state
  const [mfaStep, setMfaStep] = useState<MfaStep>(null);
  const [mfaChallenge, setMfaChallenge] = useState<string | null>(null);
  const [enrollmentToken, setEnrollmentToken] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [mfaUri, setMfaUri] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [isSubmittingMfa, setIsSubmittingMfa] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    const identifierError = validateIdentifier(email);
    if (identifierError) newErrors.email = identifierError;
    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isPending || pageState !== "form") return;
      if (!validateForm()) return;

      setIsPending(true);
      setPageState("loading");

      try {
        const response = await api.login(email.trim(), password);

        if (response.error) {
          setErrors({ general: response.error });
          setPageState("form");
          setIsPending(false);
          return;
        }

        const data = response.data as LoginResponse | undefined;

        if (data?.mfaRequired) {
          // Show MFA step while keeping the credentials filled
          setPageState("form");
          setIsPending(false);
          setMfaChallenge(data.mfaChallenge || null);
          setEnrollmentToken(data.enrollmentToken || null);

          if (data.requiresMfaSetup) {
            // First-time MFA: fetch the TOTP secret to display to the user
            try {
              const setup = await api.setupMfa(data.mfaChallenge || "", data.enrollmentToken || "");
              if (setup.error || !setup.data) {
                setMfaError(setup.error || "Could not start MFA setup.");
                setMfaStep(null);
                return;
              }
              setMfaSecret(setup.data.secret);
              setMfaUri(setup.data.provisioningUri);
              setMfaStep("setup");
            } catch {
              setMfaError("Could not start MFA setup.");
              setMfaStep(null);
            }
          } else {
            setMfaStep("verify");
          }
          return;
        }

        if (data?.authenticated && data.user) {
          setPageState("success");
          await new Promise((resolve) => setTimeout(resolve, 1200));
          redirectByRole(router, data.user.role);
          return;
        }

        setErrors({ general: "Login failed" });
        setPageState("form");
        setIsPending(false);
      } catch {
        setErrors({ general: "Connection error. Please try again." });
        setPageState("form");
        setIsPending(false);
      }
    },
    [email, password, isPending, pageState, router, validateForm]
  );

  const handleMfaSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!mfaChallenge || isSubmittingMfa) return;
      if (!/^\d{6}$/.test(mfaCode)) {
        setMfaError("Enter the 6-digit code from your authenticator app.");
        return;
      }

      setIsSubmittingMfa(true);
      setMfaError(null);

      try {
        const response =
          mfaStep === "setup"
            ? await api.verifyMfaSetup(mfaChallenge, enrollmentToken || "", mfaCode)
            : await api.verifyMfa(mfaChallenge, mfaCode);

        if (response.error || !response.data?.authenticated) {
          setMfaError(response.error || "MFA verification failed.");
          setIsSubmittingMfa(false);
          return;
        }

        setPageState("success");
        await new Promise((resolve) => setTimeout(resolve, 1200));
        redirectByRole(router, response.data.user?.role);
      } catch {
        setMfaError("MFA verification failed. Please try again.");
        setIsSubmittingMfa(false);
      }
    },
    [mfaChallenge, enrollmentToken, mfaStep, mfaCode, isSubmittingMfa, router]
  );

  const handleMfaCodeChange = useCallback((value: string) => {
    setMfaCode(value.replace(/\D/g, "").slice(0, 6));
  }, []);

  if (pageState === "success") {
    return <SuccessState title="Success" message="Login successful! Redirecting..." />;
  }

  const showMfa = mfaStep !== null;

  return (
    <AuthLayout>
      <AuthCard>
        {showMfa ? (
          <>
            <AuthHeader
              title={mfaStep === "setup" ? "Set Up Two-Factor Authentication" : "Two-Factor Authentication"}
              subtitle={mfaStep === "setup" ? "Scan the QR code and enter the code from your authenticator app" : "Enter the 6-digit code from your authenticator app"}
            />
            {mfaStep === "setup" && mfaSecret && mfaUri && (
              <div className="mb-4 p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-center">
                <p className="text-xs text-text-secondary font-medium mb-2 text-left">
                  Scan this QR code with your authenticator app, or enter the setup key manually:
                </p>
                <div className="text-left mb-2">
                  <a
                    href={mfaUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-primary-600 hover:text-primary-700"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Open authenticator setup
                  </a>
                </div>
                <div className="font-mono text-xs text-text-secondary break-all bg-white border border-neutral-200 rounded-lg px-3 py-2">
                  {mfaSecret}
                </div>
              </div>
            )}
            <form onSubmit={handleMfaSubmit} noValidate className="space-y-4">
              {mfaError && <ErrorMessage message={mfaError} />}
              <Input
                label="6-digit code"
                type="text"
                inputMode="numeric"
                value={mfaCode}
                onChange={(e) => handleMfaCodeChange(e.target.value)}
                placeholder="000000"
                autoComplete="one-time-code"
                required
              />
              <Button type="submit" isLoading={isSubmittingMfa} className="w-full">
                Verify Code <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <button
                type="button"
                onClick={() => {
                  setMfaStep(null);
                  setMfaError(null);
                  setMfaCode("");
                }}
                className="w-full text-center text-xs text-text-secondary hover:text-primary-600 font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                Back to sign in
              </button>
            </form>
          </>
        ) : (
          <>
            <AuthHeader title="Welcome Back" subtitle="Sign in to your account" />
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {errors.general && <ErrorMessage message={errors.general} />}
              <Input
                label="Student ID or Email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="Enter your Student ID or email"
                autoComplete="username"
                required
              />
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />
              <Button type="submit" isLoading={isPending} className="w-full">
                Sign In <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
            <div className="mt-6 flex items-center justify-between text-xs">
              <Link href="/forgot-password" className="text-primary-600 hover:text-primary-700 font-semibold">
                Forgot password?
              </Link>
              <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                Create account
              </Link>
            </div>
          </>
        )}
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <p className="text-xs text-text-secondary font-semibold text-center">
            <HelpCircle className="w-3.5 h-3.5 inline mr-1" />
            Need help? <Link href="/student/help" className="text-primary-600 hover:underline">Contact Support</Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}