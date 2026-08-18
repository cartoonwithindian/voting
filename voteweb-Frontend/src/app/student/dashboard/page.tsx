"use client";

/**
 * Student Dashboard
 * Real-time data from backend API
 */

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { ErrorState } from "@/components/ui/ErrorState";
import { api, Election, Announcement, Notification } from "@/lib/api-client";

// Helper to extract array data from API response
function extractArrayData<T>(response: { data?: unknown; error?: string }, fallback: T[] = []): T[] {
  if (response.error) return fallback;
  if (!response.data) return fallback;

  // Handle { data: [...] }
  if (typeof response.data === 'object' && response.data !== null && 'data' in response.data) {
    const d = response.data as { data: unknown };
    if (Array.isArray(d.data)) {
      return d.data as unknown as T[];
    }
  }
  // Handle [...]
  if (Array.isArray(response.data)) {
    return response.data as unknown as T[];
  }
  return fallback;
}

export default function StudentDashboardPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all dashboard data in parallel
      const [electionsRes, announcementsRes, notificationsRes] = await Promise.all([
        api.getElections(),
        api.getAnnouncements(),
        api.getNotifications(),
      ]);

      setElections(extractArrayData<Election>(electionsRes).slice(0, 10));
      setAnnouncements(extractArrayData<Announcement>(announcementsRes).slice(0, 5));
      setNotifications(extractArrayData<Notification>(notificationsRes).slice(0, 5));

      if (electionsRes.error || announcementsRes.error || notificationsRes.error) {
        setError("Some data failed to load");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchDashboardData();
    };
    run();
  }, [fetchDashboardData]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return "Unknown date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading dashboard...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <ErrorState
          title="Failed to load dashboard"
          message={error}
          onRetry={fetchDashboardData}
        />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">Welcome back! Here are your upcoming elections.</p>
        </div>

        {/* Active Elections */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Active Elections</h2>
            <Link href="/student/vote" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all
            </Link>
          </div>

          {elections.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <p>No active elections at the moment.</p>
              <p className="text-sm mt-1">Check back later for upcoming elections.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {elections.map((election) => (
                <Link
                  key={election.id}
                  href={`/student/vote?election=${election.id}`}
                  className="block p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-text-primary">{election.name}</h3>
                      <p className="text-sm text-text-secondary mt-1 line-clamp-1">
                        {election.description || "No description"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-muted">
                        {formatDate(election.start_time || election.created_at)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        election.status === "OPEN" ? "bg-success-100 text-success-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {election.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Notifications</h2>
              <Link href="/notifications" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all
              </Link>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-6 text-text-secondary">
                <p>No new notifications.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{notification.title}</p>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{notification.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Announcements</h2>
            <span className="text-sm text-text-secondary font-medium">
              Latest
            </span>
            </div>

            {announcements.length === 0 ? (
              <div className="text-center py-6 text-text-secondary">
                <p>No announcements.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((announcement) => (
                  <div key={announcement.id} className="border-l-4 border-primary pl-3">
                    <h4 className="text-sm font-medium text-text-primary">{announcement.title}</h4>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                      {announcement.message}
                    </p>
                    <span className="text-xs text-text-muted mt-1 block">
                      {formatDate(announcement.published_at || announcement.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
