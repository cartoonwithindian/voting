"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { api } from "@/lib/api-client";
import { SupportRequest, apiValueToCategory } from "@/lib/help-data"
import {
  ArrowLeft,
  User,
  Headphones,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; variant: "info" | "warning" | "success" | "neutral" }> = {
  open: { label: "Open", variant: "info" },
  in_review: { label: "In Review", variant: "warning" },
  waiting: { label: "Waiting for Student", variant: "warning" },
  resolved: { label: "Resolved", variant: "success" },
  closed: { label: "Closed", variant: "neutral" },
};

interface TimelineEvent {
  date: string;
  description: string;
}

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.requestId as string;

  const [request, setRequest] = useState<SupportRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequest = useCallback(async () => {
    if (!requestId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.getSupportRequest(parseInt(requestId));
      if (res.error) {
        setError(res.error);
        setRequest(null);
      } else {
        const data = res.data as Record<string, unknown>;
        if (data) {
          setRequest(data as unknown as SupportRequest);
        } else {
          setError("Request not found");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load request");
      setRequest(null);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    const run = async () => {
      await fetchRequest();
    };
    run();
  }, [fetchRequest]);

  // Generate timeline from request data
  const getTimeline = (req: SupportRequest): TimelineEvent[] => {
    const events: TimelineEvent[] = [
      {
        date: new Date(req.created_at).toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        description: "Support request submitted",
      },
    ];

    if (req.admin_notes) {
      events.push({
        date: new Date(req.updated_at || req.created_at).toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        description: "Admin response received",
      });
    }

    return events;
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary text-sm">Loading...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error || !request) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <ErrorState
            title="Request Not Found"
            message={error || "The support request could not be found."}
            action={{
              label: "Back to Requests",
              onClick: () => router.push("/student/help/requests"),
            }}
          />
        </div>
      </StudentLayout>
    );
  }

  const status = STATUS_CONFIG[request.status] || { label: request.status, variant: "neutral" as const };
  const timeline = getTimeline(request);

  return (
    <StudentLayout>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link
              href="/student/help/requests"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-text-secondary" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-text-primary">Support Request</h1>
              <p className="text-xs text-text-secondary">#{request.id}</p>
            </div>
          </div>

          {/* Status Card */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Badge variant={status.variant} className="text-xs">
                {status.label}
              </Badge>
              <span className="text-xs text-text-secondary">
                {apiValueToCategory(request.category)}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-secondary mb-1">Subject</p>
                <p className="text-sm font-medium text-text-primary">{request.description}</p>
              </div>

              {request.response && (
                <div className="p-3 bg-primary-50 rounded-lg">
                  <p className="text-xs text-text-secondary mb-1">Admin Response</p>
                  <p className="text-sm text-text-primary">{request.response}</p>
                </div>
              )}

              {request.admin_notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-text-secondary mb-1">Additional Notes</p>
                  <p className="text-sm text-text-primary">{request.admin_notes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Timeline</h2>
            <div className="space-y-4">
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                      {i === 0 ? (
                        <User className="w-3.5 h-3.5 text-primary-600" />
                      ) : (
                        <Headphones className="w-3.5 h-3.5 text-primary-600" />
                      )}
                    </div>
                    {i < timeline.length - 1 && (
                      <div className="w-px h-full bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-xs text-text-secondary">{event.date}</p>
                    <p className="text-sm text-text-primary">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Create New Request */}
          <div className="text-center pt-4">
            <Link href="/student/help/report">
              <Button variant="outline" size="sm">
                Submit New Request
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
