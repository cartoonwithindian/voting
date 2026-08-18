"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { UnauthorizedState } from "@/components/auth/UnauthorizedState";

export default function UnauthorizedPage() {
  const router = useRouter();
  return (
    <AuthLayout>
      <UnauthorizedState onReturnToLogin={() => router.push("/login")} />
    </AuthLayout>
  );
}