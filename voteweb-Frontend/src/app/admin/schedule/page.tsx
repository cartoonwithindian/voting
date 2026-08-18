"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin-dashboard/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { api } from "@/lib/api-client";
import { Calendar, Clock, CheckCircle2, Plus, X, Loader2 } from "lucide-react";

interface Election {
  id: number;
  name: string;
  status: string;
  start_time?: string;
  end_time?: string;
  created_at: string;
}

interface ScheduleEvent {
  id: string;
  event: string;
  date: string;
  time: string;
  description: string;
  status: "Completed" | "Upcoming" | "In Progress";
}

export default function AdminSchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ event: "", date: "", time: "", description: "" });

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getElections();
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      const data = res.data as { elections?: Election[]; data?: Election[] } | Election[] | undefined;
      let elections: Election[] = [];
      if (Array.isArray(data)) {
        elections = data;
      } else if (data && 'elections' in data && Array.isArray(data.elections)) {
        elections = data.elections;
      } else if (data && 'data' in data && Array.isArray((data as { data: Election[] }).data)) {
        elections = (data as { data: Election[] }).data;
      }

      // Convert elections to schedule events
      const scheduleEvents: ScheduleEvent[] = elections.map((election) => {
        const now = new Date();
        const start = election.start_time ? new Date(election.start_time) : null;
        const end = election.end_time ? new Date(election.end_time) : null;

        let status: ScheduleEvent["status"] = "Upcoming";
        if (start && end && now >= start && now <= end) {
          status = "In Progress";
        } else if (end && now > end) {
          status = "Completed";
        } else if (election.status === "CLOSED" || election.status === "RESULTS_PUBLISHED") {
          status = "Completed";
        }

        return {
          id: String(election.id),
          event: election.name,
          date: start ? start.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "TBD",
          time: start ? start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "—",
          description: election.status === "CLOSED" ? "Election has ended" : 
                       election.status === "RESULTS_PUBLISHED" ? "Results published" :
                       election.status === "OPEN" ? "Voting is open" :
                       `Status: ${election.status}`,
          status,
        };
      });

      setEvents(scheduleEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchSchedule();
    };
    run();
  }, [fetchSchedule]);

  const handleAdd = () => {
    setFormData({ event: "", date: "", time: "", description: "" });
    setShowAddModal(true);
  };

  const handleSave = () => {
    // In production, this would call an API to create a schedule event
    // For now, just add to local state
    if (!formData.event.trim()) return;
    setEvents((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        event: formData.event,
        date: formData.date || "TBD",
        time: formData.time || "—",
        description: formData.description,
        status: "Upcoming",
      },
    ]);
    setShowAddModal(false);
    setFormData({ event: "", date: "", time: "", description: "" });
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
        <ErrorState title="Failed to load schedule" message={error} onRetry={fetchSchedule} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Election Schedule</h1>
            <p className="text-sm text-text-secondary">View the election timeline and important dates.</p>
          </div>
          <Button variant="primary" size="sm" className="gap-1.5" onClick={handleAdd}>
            <Plus className="w-3.5 h-3.5" />
            Add Event
          </Button>
        </div>

        <Card className="p-6 border-border">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-5">
              {events.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-text-muted" />
                  <p>No schedule events found.</p>
                </div>
              ) : (
                events.map((event) => {
                  const statusVariant =
                    event.status === "Completed"
                      ? "success"
                      : event.status === "In Progress"
                      ? "warning"
                      : "info";
                  return (
                    <div key={event.id} className="flex items-start gap-4 relative">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                          event.status === "Completed"
                            ? "bg-success"
                            : event.status === "In Progress"
                            ? "bg-warning"
                            : "bg-primary-100"
                        }`}
                      >
                        {event.status === "Completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : event.status === "In Progress" ? (
                          <Clock className="w-4 h-4 text-white" />
                        ) : (
                          <Calendar className="w-4 h-4 text-primary-600" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-text-primary">{event.event}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-text-secondary">{event.date}</p>
                              {event.time !== "—" && (
                                <>
                                  <span className="text-text-muted">•</span>
                                  <p className="text-xs text-text-secondary">{event.time}</p>
                                </>
                              )}
                            </div>
                            <p className="text-xs text-text-secondary mt-1">{event.description}</p>
                          </div>
                          <Badge variant={statusVariant as "success" | "warning" | "info"} className="text-[10px] shrink-0">
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">Add Event</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-primary-50">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-medium text-text-secondary uppercase tracking-wider block mb-1">Event Name</label>
                <input value={formData.event} onChange={(e) => setFormData((p) => ({ ...p, event: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-medium text-text-secondary uppercase tracking-wider block mb-1">Date</label>
                  <input value={formData.date} onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-text-secondary uppercase tracking-wider block mb-1">Time</label>
                  <input value={formData.time} onChange={(e) => setFormData((p) => ({ ...p, time: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-medium text-text-secondary uppercase tracking-wider block mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" size="md" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button variant="primary" size="md" className="flex-1" onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
