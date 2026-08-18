"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin-dashboard/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ErrorState } from "@/components/ui/ErrorState";
import { api } from "@/lib/api-client";
import {
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Loader2,
} from "lucide-react";

interface Position {
  id: number;
  club_id: number;
  name: string;
  description?: string;
  display_order: number;
  max_selections: number;
  is_active: boolean;
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [deletingPosition, setDeletingPosition] = useState<Position | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxSelections: 1,
    displayOrder: 1,
  });

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get elections first, then clubs, then positions
      const electionsRes = await api.getElections();
      if (electionsRes.error) {
        setError(electionsRes.error);
        setLoading(false);
        return;
      }

      const electionsData = electionsRes.data as { elections?: { id: number }[]; data?: { id: number }[] } | { id: number }[] | undefined;
      let elections: { id: number }[] = [];
      if (Array.isArray(electionsData)) {
        elections = electionsData;
      } else if (electionsData && 'elections' in electionsData && Array.isArray(electionsData.elections)) {
        elections = electionsData.elections;
      } else if (electionsData && 'data' in electionsData && Array.isArray((electionsData as { data: { id: number }[] }).data)) {
        elections = (electionsData as { data: { id: number }[] }).data;
      }

      if (elections.length === 0) {
        setPositions([]);
        setLoading(false);
        return;
      }

      // Get clubs for first election
      const clubsRes = await api.getElectionClubs(elections[0].id);
      if (clubsRes.error) {
        setError(clubsRes.error);
        setLoading(false);
        return;
      }

      const clubsData = clubsRes.data as { data?: { id: number }[] } | { id: number }[] | undefined;
      let clubs: { id: number }[] = [];
      if (Array.isArray(clubsData)) {
        clubs = clubsData;
      } else if (clubsData && 'data' in clubsData && Array.isArray(clubsData.data)) {
        clubs = clubsData.data;
      }

      // Get positions for all clubs
      const allPositions: Position[] = [];
      for (const club of clubs) {
        const posRes = await api.getPositions(club.id);
        if (posRes.error) continue;

        const posData = posRes.data as { data?: Position[] } | Position[] | undefined;
        if (Array.isArray(posData)) {
          allPositions.push(...posData);
        } else if (posData && 'data' in posData && Array.isArray(posData.data)) {
          allPositions.push(...posData.data);
        }
      }

      setPositions(allPositions.sort((a, b) => a.display_order - b.display_order));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load positions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchPositions();
    };
    run();
  }, [fetchPositions]);

  const handleOpenAdd = () => {
    setEditingPosition(null);
    setFormData({
      name: "",
      description: "",
      maxSelections: 1,
      displayOrder: positions.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (position: Position) => {
    setEditingPosition(position);
    setFormData({
      name: position.name,
      description: position.description || "",
      maxSelections: position.max_selections,
      displayOrder: position.display_order,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      if (editingPosition) {
        // Update existing position
        await api.updateAdminPosition(editingPosition.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          display_order: formData.displayOrder,
          max_selections: formData.maxSelections,
        });
      } else {
        // Create new position - need a club ID
        // For now, use the first club from the first election
        const electionsRes = await api.getElections();
        const electionsData = electionsRes.data as { elections?: { id: number }[] } | undefined;
        const elections = electionsData?.elections || [];
        if (elections.length > 0) {
          const clubsRes = await api.getElectionClubs(elections[0].id);
          const clubsData = clubsRes.data as { data?: { id: number }[] } | undefined;
          const clubs = clubsData?.data || [];
          if (clubs.length > 0) {
            await api.createAdminPosition(clubs[0].id, {
              name: formData.name.trim(),
              description: formData.description.trim() || undefined,
              display_order: formData.displayOrder,
              max_selections: formData.maxSelections,
            });
          }
        }
      }
      setIsModalOpen(false);
      setEditingPosition(null);
      fetchPositions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save position");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (position: Position) => {
    setDeletingPosition(position);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingPosition) return;
    setSaving(true);
    try {
      // Note: Backend doesn't have a DELETE endpoint for positions
      // In production, this would call api.deleteAdminPosition(deletingPosition.id)
      setError("Position deletion not yet supported by the backend API");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete position");
    } finally {
      setSaving(false);
      setIsDeleteModalOpen(false);
      setDeletingPosition(null);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setPositions((prev) => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated.map((p, i) => ({ ...p, display_order: i + 1 }));
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === positions.length - 1) return;
    setPositions((prev) => {
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated.map((p, i) => ({ ...p, display_order: i + 1 }));
    });
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

  if (error && positions.length === 0) {
    return (
      <AdminLayout>
        <ErrorState title="Failed to load positions" message={error} onRetry={fetchPositions} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Election Positions</h1>
            <p className="text-gray-500 mt-1">
              Manage election positions and their configuration.
            </p>
          </div>
          <Button variant="primary" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Position
          </Button>
        </div>

        {error && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-3 text-sm text-error">
            {error}
          </div>
        )}

        {/* Positions List */}
        {positions.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-gray-100">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No Positions</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                No election positions have been created yet. Add a position to get started.
              </p>
              <Button variant="primary" onClick={handleOpenAdd}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Position
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {positions.map((position, index) => (
              <Card key={position.id} className="p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base">
                      {position.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {position.description || "No description"}
                    </p>
                  </div>
                  <Badge variant={position.is_active ? "success" : "neutral"}>
                    {position.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span>
                    Max Selections:{" "}
                    <span className="font-medium text-gray-900">
                      {position.max_selections}
                    </span>
                  </span>
                  <span>
                    Order:{" "}
                    <span className="font-medium text-gray-900">{position.display_order}</span>
                  </span>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === positions.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(position)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDelete(position)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add / Edit Position Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPosition(null);
          }}
          title={editingPosition ? "Edit Position" : "Add Position"}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Position Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. President"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe the role and responsibilities..."
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Max Selections
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.maxSelections}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxSelections: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      displayOrder: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingPosition(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!formData.name.trim() || saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingPosition ? "Save Changes" : "Add Position"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletingPosition(null);
          }}
          title="Delete Position"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{deletingPosition?.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingPosition(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Delete Position
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
