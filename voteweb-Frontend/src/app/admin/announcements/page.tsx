"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Megaphone, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { AdminLayout } from "@/components/admin-dashboard/AdminLayout";
import { api } from "@/lib/api-client";

interface Announcement {
  id: number;
  title: string;
  message: string;
  is_active: boolean;
  published_at?: string;
  created_at: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAnnouncements();
      if (res.error) {
        setError(res.error);
      } else if (res.data && typeof res.data === 'object' && 'data' in res.data) {
        setAnnouncements((res.data as { data: Announcement[] }).data);
      } else if (Array.isArray(res.data)) {
        setAnnouncements(res.data as unknown as Announcement[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchAnnouncements();
    };
    run();
  }, [fetchAnnouncements]);

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
        <ErrorState title="Error Loading Announcements" message={error} onRetry={fetchAnnouncements} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Announcements</h1>
            <p className="text-sm font-semibold text-text-secondary">Manage election announcements.</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Announcement
          </Button>
        </div>

        {announcements.length === 0 ? (
          <EmptyState
            title="No announcements yet"
            description="Create your first announcement to communicate with voters."
            icon={<Megaphone className="w-8 h-8 text-primary-300" />}
          />
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <Card key={ann.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary">{ann.title}</h3>
                      <Badge variant={ann.is_active ? "success" : "neutral"}>
                        {ann.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary">{ann.message}</p>
                    <p className="text-xs text-text-muted mt-2">
                      Created: {new Date(ann.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-error" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">New Announcement</h3>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Announcement title"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Message</label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Announcement message"
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (!newTitle.trim() || !newMessage.trim()) return;
                  setCreating(true);
                  try {
                    const res = await api.createAdminAnnouncement({
                      title: newTitle.trim(),
                      content: newMessage.trim(),
                      is_active: true,
                    });
                    if (!res.error) {
                      setShowModal(false);
                      setNewTitle("");
                      setNewMessage("");
                      fetchAnnouncements();
                    }
                  } finally {
                    setCreating(false);
                  }
                }}
                disabled={creating || !newTitle.trim() || !newMessage.trim()}
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
