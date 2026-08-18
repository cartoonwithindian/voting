"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SessionExpiredState } from "@/components/auth/SessionExpiredState";

export default function SessionExpiredPage() {
  const router = useRouter();
  return (
    <AuthLayout>
      <SessionExpiredState onSignInAgain={() => router.push("/login")} />
    </AuthLayout>
  );
}