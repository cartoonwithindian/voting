"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Eye, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { AdminLayout } from "@/components/admin-dashboard/AdminLayout";
import { api } from "@/lib/api-client";
import { STATUS_LABELS } from "@/lib/help-data";

interface SupportRequest {
  id: number;
  student_id: number;
  category: string;
  description: string;
  status: string;
  created_at: string;
}

const STATUSES = ["All", "open", "in_review", "waiting", "resolved", "closed"] as const;

export default function IssuesPage() {
  const [issues, setIssues] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedIssue, setSelectedIssue] = useState<SupportRequest | null>(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminSupportRequests();
      if (res.error) {
        setError(res.error);
        setIssues([]);
      } else if (Array.isArray(res.data)) {
        setIssues(res.data as unknown as SupportRequest[]);
      } else if (res.data && typeof res.data === 'object' && 'data' in res.data) {
        setIssues((res.data as { data: SupportRequest[] }).data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load issues");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchIssues();
    };
    run();
  }, [fetchIssues]);

  const filteredIssues = issues.filter((issue) => {
    if (search && !issue.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (statusFilter !== "All" && issue.status !== statusFilter) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <ErrorState title="Failed to load issues" message={error} onRetry={fetchIssues} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Support Issues</h1>
          <p className="text-sm font-semibold text-text-secondary">
            View and manage student support requests.
          </p>
        </div>

        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search issues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s === "All" ? "All Statuses" : STATUS_LABELS[s] || s}</option>
              ))}
            </select>
          </div>
        </Card>

        {filteredIssues.length === 0 ? (
          <EmptyState
            title="No issues found"
            description="No support requests match your filters."
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-secondary border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredIssues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-bg-tertiary">
                      <td className="px-4 py-3 text-sm text-text-primary">#{issue.id}</td>
                      <td className="px-4 py-3">
                        <Badge variant="neutral">{issue.category}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary max-w-xs truncate">
                        {issue.description}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            issue.status === "resolved" ? "success" :
                            issue.status === "open" ? "warning" : "neutral"
                          }
                        >
                          {STATUS_LABELS[issue.status] || issue.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedIssue(issue)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Modal isOpen={!!selectedIssue} onClose={() => setSelectedIssue(null)} title="Support Request Details">
          {selectedIssue && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Issue #{selectedIssue.id}</h2>
                <Badge
                  variant={
                    selectedIssue.status === "resolved" ? "success" :
                    selectedIssue.status === "open" ? "warning" : "neutral"
                  }
                >
                  {STATUS_LABELS[selectedIssue.status] || selectedIssue.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-text-secondary">Category: {selectedIssue.category}</p>
                <p className="text-sm text-text-secondary">
                  Submitted: {new Date(selectedIssue.created_at).toLocaleString()}
                </p>
              </div>
              <div className="bg-bg-secondary p-3 rounded-lg">
                <p className="text-sm">{selectedIssue.description}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setSelectedIssue(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
