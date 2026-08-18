"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin-dashboard/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { api } from "@/lib/api-client";
import {
  Vote,
  Users,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  X,
  Edit,
  Loader2,
  RefreshCw,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "REGISTRATION_OPEN", label: "Registration Open" },
  { value: "OPEN", label: "Open (Voting)" },
  { value: "CLOSED", label: "Closed" },
  { value: "RESULTS_PUBLISHED", label: "Results Published" },
];

interface ElectionData {
  id: number;
  name: string;
  description?: string;
  status: string;
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
  results_published_at?: string;
}

function StatusModal({
  isOpen,
  title,
  message,
  confirmText,
  onConfirm,
  onCancel,
  requiresInput,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
  requiresInput?: boolean;
}) {
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  const isDisabled = requiresInput && inputValue !== "CONFIRM";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-50">
              <AlertTriangle className="h-5 w-5 text-warning-600" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-text-muted hover:text-text-secondary cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-text-secondary mb-4">{message}</p>
        {requiresInput && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-1">
              Type <span className="font-bold">CONFIRM</span> to proceed:
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full border border-border-strong rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="CONFIRM"
            />
          </div>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setInputValue("");
              onConfirm();
            }}
            disabled={isDisabled}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ElectionManagementPage() {
  const [election, setElection] = useState<ElectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchElection = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getElections();
      if (res.error) {
        setError(res.error);
        return;
      }

      const data = res.data as { elections?: ElectionData[]; data?: ElectionData[] } | ElectionData[] | undefined;
      let elections: ElectionData[] = [];

      if (Array.isArray(data)) {
        elections = data;
      } else if (data && 'elections' in data && Array.isArray(data.elections)) {
        elections = data.elections;
      } else if (data && 'data' in data && Array.isArray((data as { data: ElectionData[] }).data)) {
        elections = (data as { data: ElectionData[] }).data;
      }

      if (elections.length > 0) {
        // Find the first non-draft election, or the first one
        const active = elections.find(e => e.status !== "DRAFT") || elections[0];
        setElection(active);
        setSelectedStatus(active.status);
      } else {
        setError("No elections found. Create an election first.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load election");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchElection();
    };
    run();
  }, [fetchElection]);

  const handleStatusUpdate = async () => {
    if (!election) return;
    setUpdating(true);
    try {
      const res = await api.updateAdminElectionStatus(election.id, selectedStatus);
      if (res.error) {
        setError(res.error);
        return;
      }
      setElection({ ...election, status: selectedStatus });
      setStatusModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseElection = async () => {
    if (!election) return;
    setUpdating(true);
    try {
      const res = await api.updateAdminElectionStatus(election.id, "CLOSED");
      if (res.error) {
        setError(res.error);
        return;
      }
      setElection({ ...election, status: "CLOSED" });
      setSelectedStatus("CLOSED");
      setCloseModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close election");
    } finally {
      setUpdating(false);
    }
  };

  const handlePublishResults = async () => {
    if (!election) return;
    setUpdating(true);
    try {
      const res = await api.publishElectionResults(election.id);
      if (res.error) {
        setError(res.error);
        return;
      }
      setElection({ ...election, status: "RESULTS_PUBLISHED", results_published_at: new Date().toISOString() });
      setSelectedStatus("RESULTS_PUBLISHED");
      setPublishModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish results");
    } finally {
      setUpdating(false);
    }
  };

  const statusBadgeVariant = (status: string) => {
    const map: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
      DRAFT: "neutral",
      SCHEDULED: "info",
      REGISTRATION_OPEN: "warning",
      OPEN: "success",
      CLOSED: "error",
      RESULTS_PUBLISHED: "info",
    };
    return map[status] || "neutral";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not set";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error && !election) {
    return (
      <AdminLayout>
        <ErrorState title="Failed to load election" message={error} onRetry={fetchElection} />
      </AdminLayout>
    );
  }

  if (!election) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Election Management</h1>
            <p className="text-text-secondary mt-1">
              Configure and manage the election.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchElection} className="gap-1.5">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-3 text-sm text-error">
            {error}
          </div>
        )}

        {/* Election Details Card */}
        <Card className="p-6 border-l-4 border-l-primary-600">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{election.name}</h2>
              <p className="text-sm text-text-secondary">
                Created: {formatDate(election.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusBadgeVariant(election.status)}>{election.status.replace(/_/g, " ")}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-text-secondary">Start Date</p>
              <p className="font-medium text-text-primary mt-1 text-sm">
                {formatDate(election.start_time)}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">End Date</p>
              <p className="font-medium text-text-primary mt-1 text-sm">
                {formatDate(election.end_time)}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Status</p>
              <Badge variant={statusBadgeVariant(election.status)} className="mt-1">
                {election.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Status Control Card */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Edit className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-text-primary">Election Status Control</h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <p className="text-sm text-text-secondary mb-1">Current Status</p>
              <Badge variant={statusBadgeVariant(election.status)}>
                {election.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-medium text-text-primary mb-1">
                New Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-border-strong rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="self-end">
              <Button
                variant="primary"
                size="md"
                onClick={() => setStatusModalOpen(true)}
                disabled={selectedStatus === election.status || updating}
              >
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Edit className="h-4 w-4" />
                )}
                Update Status
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-50">
                <Vote className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">1</p>
                <p className="text-sm text-text-secondary">Election</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success-50">
                <CheckCircle2 className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {election.status === "OPEN" ? "Yes" : "No"}
                </p>
                <p className="text-sm text-text-secondary">Active</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-50">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {formatDate(election.start_time)}
                </p>
                <p className="text-sm text-text-secondary">Starts</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning-50">
                <BarChart3 className="h-5 w-5 text-warning-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {formatDate(election.end_time)}
                </p>
                <p className="text-sm text-text-secondary">Ends</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Danger Zone Card */}
        <Card className="p-6 border-2 border-error-200">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="h-5 w-5 text-error-500" />
            <h2 className="text-lg font-semibold text-text-primary">Danger Zone</h2>
          </div>
          <p className="text-sm text-text-secondary mb-6">
            Irreversible actions that will affect the election.
          </p>
          <div className="space-y-4">
            {/* Close Election */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-error-200 rounded-xl bg-error-50/30">
              <div>
                <p className="font-medium text-text-primary">Close Election</p>
                <p className="text-sm text-text-secondary">
                  Stop voting and close the election immediately.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setCloseModalOpen(true)}
                disabled={election.status === "CLOSED" || updating}
              >
                Close Election
              </Button>
            </div>

            {/* Publish Results */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-primary-200 rounded-xl bg-primary-50/30">
              <div>
                <p className="font-medium text-text-primary">Publish Results</p>
                <p className="text-sm text-text-secondary">
                  Make election results publicly visible to all students.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPublishModalOpen(true)}
                disabled={election.status === "RESULTS_PUBLISHED" || updating}
              >
                Publish Results
              </Button>
            </div>
          </div>
        </Card>

        {/* Modals */}
        <StatusModal
          isOpen={statusModalOpen}
          title="Change Election Status?"
          message={`You are about to change the election status to ${selectedStatus.replace(/_/g, " ")}.`}
          confirmText="Update Status"
          onConfirm={handleStatusUpdate}
          onCancel={() => setStatusModalOpen(false)}
        />

        <StatusModal
          isOpen={closeModalOpen}
          title="Close Election?"
          message="This will immediately stop all voting. Students will no longer be able to cast their votes. This action cannot be undone."
          confirmText="Close Election"
          onConfirm={handleCloseElection}
          onCancel={() => setCloseModalOpen(false)}
          requiresInput
        />

        <StatusModal
          isOpen={publishModalOpen}
          title="Publish Election Results?"
          message="This will make the election results publicly visible to all students. The results will be final and cannot be retracted."
          confirmText="Publish Results"
          onConfirm={handlePublishResults}
          onCancel={() => setPublishModalOpen(false)}
        />
      </div>
    </AdminLayout>
  );
}
