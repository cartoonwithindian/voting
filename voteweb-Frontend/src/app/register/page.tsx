"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { ErrorMessage } from "@/components/auth/ErrorMessage";
import { SuccessState } from "@/components/auth/SuccessState";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api-client";

type RegisterState = "form" | "loading" | "success";

export default function RegisterPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<RegisterState>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email.trim()) e.email = "College email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!studentId.trim()) e.studentId = "Student ID is required";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setPageState("loading");
    try {
      const res = await api.register({
        fullName: name.trim(),
        email: email.trim(),
        studentIdentifier: studentId.trim(),
        password,
      });
      if (res.error) {
        setErrors({ general: res.error });
        setPageState("form");
        return;
      }
      setPageState("success");
    } catch {
      setErrors({ general: "Connection error. Please try again." });
      setPageState("form");
    }
  };

  if (pageState === "success") {
    return (
      <AuthLayout>
        <AuthCard>
          <SuccessState
            title="Registration submitted"
            message="Your account is pending admin approval. You will receive an email once approved."
            actionLabel="Go to Login"
            onAction={() => router.push("/login")}
          />
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard>
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-6 h-6 text-primary-600" />
            </div>
            <AuthHeader
              title="Create Account"
              subtitle="Register for the Student Council Election 2026"
            />
          </div>

          {errors.general && <ErrorMessage message={errors.general} />}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.name && <p className="text-xs text-error-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">College Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.email && <p className="text-xs text-error-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Student ID</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. DBIT2025XXXX"
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
              />
              {errors.studentId && <p className="text-xs text-error-600 mt-1">{errors.studentId}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.password && <p className="text-xs text-error-600 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.confirmPassword && <p className="text-xs text-error-600 mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            isLoading={pageState === "loading"}
            disabled={pageState === "loading"}
          >
            Create Account
          </Button>

          <div className="text-center">
            <Link href="/login" className="text-sm text-primary-600 hover:text-primary-500 font-medium inline-flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
