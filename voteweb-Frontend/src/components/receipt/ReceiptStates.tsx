"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader2, Clock, AlertCircle, Search } from "lucide-react";

export function ReceiptLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-primary-400 animate-spin mb-4" />
      <p className="text-sm text-text-secondary">Loading receipt...</p>
    </div>
  );
}

export function ReceiptPending() {
  return (
    <Card className="p-8 text-center border-border">
      <div className="w-16 h-16 rounded-2xl bg-warning-50 flex items-center justify-center mx-auto mb-4">
        <Clock className="w-8 h-8 text-warning" />
      </div>
      <h2 className="text-lg font-bold text-text-primary mb-2">
        Receipt Being Generated
      </h2>
      <p className="text-sm text-text-secondary mb-4">
        Your vote has been submitted. Your receipt is being prepared.
      </p>
      <div className="mb-4">
        <span className="text-xs font-medium text-text-secondary">Status: </span>
        <span className="text-xs font-medium text-warning">Pending</span>
      </div>
      <Button variant="primary" size="sm" className="gap-1.5">
        <Loader2 className="w-3.5 h-3.5" />
        Refresh Status
      </Button>
    </Card>
  );
}

export function ReceiptNotFound() {
  const router = useRouter();
  return (
    <Card className="p-8 text-center border-border">
      <div className="w-16 h-16 rounded-2xl bg-border flex items-center justify-center mx-auto mb-4">
        <Search className="w-8 h-8 text-text-secondary" />
      </div>
      <h2 className="text-lg font-bold text-text-primary mb-2">
        Receipt Not Found
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        We couldn&apos;t find a receipt associated with this request.
      </p>
      <Button variant="primary" size="sm" onClick={() => router.push("/student/dashboard")}>
        Return to Dashboard
      </Button>
    </Card>
  );
}

export function ReceiptError() {
  const router = useRouter();
  return (
    <Card className="p-8 text-center border-border">
      <div className="w-16 h-16 rounded-2xl bg-error-50 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-error" />
      </div>
      <h2 className="text-lg font-bold text-text-primary mb-2">
        Unable to Load Receipt
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        We couldn&apos;t load your receipt right now. Please try again.
      </p>
      <div className="flex flex-col gap-3">
        <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
          Try Again
        </Button>
        <Button variant="ghost" size="sm" onClick={() => router.push("/student/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    </Card>
  );
}
