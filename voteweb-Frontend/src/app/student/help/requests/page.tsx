"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { SupportRequest, apiValueToCategory } from "@/lib/help-data"
import {
  ArrowLeft,
  FileText,
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  Plus,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; variant: "info" | "warning" | "success" | "neutral" }> = {
  open: { label: "Open", variant: "info" },
  in_review: { label: "In Review", variant: "warning" },
  waiting: { label: "Waiting for Student", variant: "warning" },
  resolved: { label: "Resolved", variant: "success" },
  closed: { label: "Closed", variant: "neutral" },
};

export default function RequestsPage() {
  const { isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSupportRequests();
      if (res.error) {
        setError(res.error);
        setRequests([]);
      } else {
        // Extract data from response
        const data = res.data as Record<string, unknown>;
        if ('data' in data && Array.isArray((data as { data: SupportRequest[] }).data)) {
          setRequests((data as { data: SupportRequest[] }).data);
        } else if (Array.isArray(data)) {
          setRequests(data as unknown as SupportRequest[]);
        } else {
          setRequests([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load support requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const run = async () => {
        await fetchRequests();
      };
      run();
    }
  }, [isAuthenticated, fetchRequests]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <Clock className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error && requests.length === 0) {
    return (
      <StudentLayout>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            <ErrorState
              title="Failed to load support requests"
              message={error}
              onRetry={fetchRequests}
            />
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link
              href="/student/help"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-text-secondary" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-text-primary">Support Requests</h1>
              <p className="text-sm text-text-secondary">View and manage your support requests</p>
            </div>
            <Link href="/student/help/report">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </Link>
          </div>

          {/* Requests List */}
          {requests.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h2 className="text-lg font-medium text-text-primary mb-2">No support requests</h2>
              <p className="text-sm text-text-secondary mb-4">
                You haven&apos;t submitted any support requests yet.
              </p>
              <Link href="/student/help/report">
                <Button variant="secondary">Submit a Request</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const status = STATUS_CONFIG[req.status] || { label: req.status, variant: "neutral" as const };
                return (
                  <Link key={req.id} href={`/student/help/request/${req.id}`}>
                    <Card className="hover:border-primary-300 transition-colors cursor-pointer">
                      <div className="flex items-start gap-4 p-4">
                        <div className={`p-2 rounded-lg ${
                          req.status === 'resolved' ? 'bg-success-50' :
                          req.status === 'open' ? 'bg-primary-50' : 'bg-warning-50'
                        }`}>
                          {req.status === 'resolved' ? (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          ) : req.status === 'open' ? (
                            <AlertCircle className="w-5 h-5 text-primary" />
                          ) : (
                            <Clock className="w-5 h-5 text-warning" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-medium text-text-primary truncate">
                              {req.subject || apiValueToCategory(req.category)}
                            </h3>
                            <Badge variant={status.variant} className="text-[10px] shrink-0">
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-text-secondary mb-1">
                            {apiValueToCategory(req.category)}
                          </p>
                          <p className="text-xs text-text-secondary">
                            Submitted: {formatDate(req.created_at)}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-secondary shrink-0" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
