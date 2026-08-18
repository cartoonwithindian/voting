"use client"

import { AdminLayout } from "@/components/admin-dashboard/AdminLayout"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { EmptyState } from "@/components/ui/EmptyState"
import { ErrorState } from "@/components/ui/ErrorState"
import { api } from "@/lib/api-client"
import {
  Search,
  Eye,
  AlertCircle,
  ArrowLeft,
  X,
  Loader2,
} from "lucide-react"
import { useState, useMemo, useEffect, useCallback } from "react"

interface Candidate {
  id: number;
  position_id: number;
  name: string;
  description?: string;
  manifesto?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function CandidateManagementPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCandidates();
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      const data = res.data as { data?: Candidate[] } | Candidate[] | undefined;
      if (Array.isArray(data)) {
        setCandidates(data);
      } else if (data && 'data' in data && Array.isArray(data.data)) {
        setCandidates(data.data);
      } else {
        setCandidates([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchCandidates();
    };
    run();
  }, [fetchCandidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(c.id).includes(searchQuery)
      return matchesSearch;
    });
  }, [searchQuery, candidates]);

  const openReview = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowPanel(true);
  };

  const closeReview = () => {
    setShowPanel(false);
    setSelectedCandidate(null);
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

  if (error) {
    return (
      <AdminLayout>
        <ErrorState title="Failed to load candidates" message={error} onRetry={fetchCandidates} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Candidate Management</h1>
          <p className="text-text-secondary mt-1">Review and manage candidate applications.</p>
        </div>

        {/* Filters Bar */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search candidate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </Card>

        {/* Candidate Table */}
        <Card>
          {filteredCandidates.length === 0 ? (
            <EmptyState
              title="No Candidates Found"
              description="No candidates match the current filters."
              icon={<AlertCircle className="w-8 h-8 text-text-muted" />}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Position ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Created</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="border-b border-border hover:bg-bg-tertiary transition-colors">
                      <td className="px-4 py-3 text-sm text-text-secondary font-mono">#{candidate.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-text-primary">{candidate.name}</div>
                        {candidate.description && (
                          <div className="text-xs text-text-secondary mt-0.5 line-clamp-1">{candidate.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">#{candidate.position_id}</td>
                      <td className="px-4 py-3">
                        <Badge variant={candidate.is_active ? "success" : "warning"}>
                          {candidate.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {new Date(candidate.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReview(candidate)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Review Panel Overlay */}
        {showPanel && selectedCandidate && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeReview}
            />
            <div className="relative ml-auto w-full max-w-lg bg-white shadow-2xl overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={closeReview} className="p-1 hover:bg-bg-tertiary rounded-lg transition-colors">
                    <ArrowLeft className="h-5 w-5 text-text-secondary" />
                  </button>
                  <h2 className="text-lg font-semibold text-text-primary">Candidate Review</h2>
                </div>
                <button onClick={closeReview} className="p-1 hover:bg-bg-tertiary rounded-lg transition-colors">
                  <X className="h-5 w-5 text-text-muted" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Candidate Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-muted">Name</label>
                      <p className="text-sm font-medium text-text-primary">{selectedCandidate.name}</p>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted">ID</label>
                      <p className="text-sm font-medium text-text-primary font-mono">#{selectedCandidate.id}</p>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted">Position ID</label>
                      <p className="text-sm font-medium text-text-primary">#{selectedCandidate.position_id}</p>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted">Status</label>
                      <Badge variant={selectedCandidate.is_active ? "success" : "warning"}>
                        {selectedCandidate.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedCandidate.description && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Description</h3>
                    <p className="text-sm text-text-primary leading-relaxed bg-bg-tertiary rounded-lg p-4">
                      {selectedCandidate.description}
                    </p>
                  </div>
                )}

                {/* Manifesto */}
                {selectedCandidate.manifesto && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Manifesto</h3>
                    <p className="text-sm text-text-primary leading-relaxed bg-bg-tertiary rounded-lg p-4">
                      {selectedCandidate.manifesto}
                    </p>
                  </div>
                )}

                {/* Created */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Created</h3>
                  <p className="text-sm text-text-primary">
                    {new Date(selectedCandidate.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-border pt-6">
                  <Button onClick={closeReview} variant="outline" className="w-full">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
