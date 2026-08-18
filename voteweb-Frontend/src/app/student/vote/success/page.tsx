"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Button } from "@/components/ui/Button";
import { VoteSuccessAnimation } from "@/components/voting/VoteSuccessAnimation/VoteSuccessAnimation";
import { ArrowLeft, FileText } from "lucide-react";

function SuccessPageInner() {
  const searchParams = useSearchParams();
  const receiptId = searchParams.get("receipt");

  return (
    <StudentLayout>
      <div className="flex flex-col items-center justify-center min-h-full py-8">
        <VoteSuccessAnimation voteReference={receiptId || undefined} />
        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-md px-4">
          <Link href="/student/receipt" className="flex-1">
            <Button variant="primary" className="w-full gap-2">
              <FileText className="w-4 h-4" />
              View My Receipt
            </Button>
          </Link>
          <Link href="/student/dashboard" className="flex-1">
            <Button variant="ghost" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </StudentLayout>
  );
}

export default function VoteSuccessPage() {
  return (
    <Suspense fallback={<StudentLayout><div className="flex items-center justify-center min-h-[400px]"><div className="text-text-secondary">Loading...</div></div></StudentLayout>}>
      <SuccessPageInner />
    </Suspense>
  );
}