"use client";

/**
 * Admin Dashboard
 * Real-time data from backend API with fallback to mock data
 */

import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin-dashboard/AdminLayout";
import { ErrorState } from "@/components/ui/ErrorState";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api-client";
import {
  Users,
  BarChart3,
  Vote,
  CheckCircle2,
  ArrowRight,
  Megaphone,
  AlertCircle,
  UserCheck,
  Activity,
} from "lucide-react";

interface ElectionData {
  id: number;
  name: string;
  status: string;
  start_time?: string;
  end_time?: string;
}

interface AnnouncementData {
  id: number;
  title: string;
  message: string;
  is_active: boolean;
  published_at?: string;
  created_at: string;
}

interface SupportData {
  id: number;
  student_id: number;
  category: string;
  subject: string;
  status: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [elections, setElections] = useState<ElectionData[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [issues, setIssues] = useState<SupportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all dashboard data in parallel
      const [electionsRes, announcementsRes, supportRes] = await Promise.all([
        api.getAdminElections(),
        api.getAnnouncements(),
        api.getAdminSupportRequests(),
      ]);

      // Handle elections response
      if (electionsRes.error) {
        setError(electionsRes.error);
        setElections([]);
      } else if (electionsRes.data && typeof electionsRes.data === 'object') {
        const data = electionsRes.data as { data?: ElectionData[] } | ElectionData[];
        if ('data' in data && Array.isArray(data.data)) {
          setElections(data.data);
        } else if (Array.isArray(data)) {
          setElections(data as unknown as ElectionData[]);
        } else {
          setElections([]);
        }
      } else {
        setElections([]);
      }

      // Handle announcements response
      if (announcementsRes.error) {
        // Use mock announcements as fallback
        setAnnouncements([]);
      } else if (announcementsRes.data && typeof announcementsRes.data === 'object') {
        const data = announcementsRes.data as { data?: AnnouncementData[] } | AnnouncementData[];
        if ('data' in data && Array.isArray(data.data)) {
          setAnnouncements(data.data);
        } else if (Array.isArray(data)) {
          setAnnouncements(data as unknown as AnnouncementData[]);
        } else {
          setAnnouncements([]);
        }
      } else {
        setAnnouncements([]);
      }

      // Handle support requests response
      if (supportRes.error) {
        setIssues([]);
      } else if (supportRes.data && typeof supportRes.data === 'object') {
        const data = supportRes.data as { data?: SupportData[] } | SupportData[];
        if ('data' in data && Array.isArray(data.data)) {
          setIssues(data.data);
        } else if (Array.isArray(data)) {
          setIssues(data as unknown as SupportData[]);
        } else {
          setIssues([]);
        }
      } else {
        setIssues([]);
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

  // Calculate stats from real data
  const openElections = elections.filter(e => e.status === "OPEN");
  const openIssues = issues.filter(i => i.status === "open");
  const publishedAnnouncements = announcements.filter(a => a.is_active);

  const stats = [
    {
      label: "Total Elections",
      value: elections.length.toString(),
      icon: Vote,
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      label: "Open Elections",
      value: openElections.length.toString(),
      icon: CheckCircle2,
      color: "text-success-600",
      bg: "bg-success-50",
    },
    {
      label: "Announcements",
      value: publishedAnnouncements.length.toString(),
      icon: Megaphone,
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      label: "Support Tickets",
      value: openIssues.length.toString(),
      icon: AlertCircle,
      color: "text-warning-600",
      bg: "bg-warning-50",
    },
  ];

  const quickActions = [
    {
      label: "Manage Elections",
      icon: Vote,
      href: "/admin/elections",
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      label: "View Reports",
      icon: BarChart3,
      href: "/admin/reports",
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      label: "Student Management",
      icon: Users,
      href: "/admin/students",
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      label: "Approve Candidates",
      icon: UserCheck,
      href: "/admin/candidates",
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      label: "Support Tickets",
      icon: AlertCircle,
      href: "/admin/issues",
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      label: "View Activity",
      icon: Activity,
      href: "/admin/activity",
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
  ];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "error" | "info" | "default" | "neutral"> = {
      OPEN: "success",
      CLOSED: "default",
      DRAFT: "neutral",
      SCHEDULED: "info",
      RESULTS_PUBLISHED: "info",
      REGISTRATION_OPEN: "warning",
    };
    return variants[status] || "default";
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-text-secondary">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <ErrorState
          title="Failed to load dashboard"
          message={error}
          onRetry={fetchDashboardData}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
            <p className="text-text-secondary mt-1">Overview of voting system</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-sm text-text-secondary">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <div className={`p-2 rounded-lg ${action.bg} mb-2`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <span className="text-sm font-medium text-text-primary text-center">
                  {action.label}
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Elections */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Active Elections</h2>
              <a href="/admin/elections" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="space-y-3">
              {elections.length === 0 ? (
                <p className="text-sm text-text-secondary">No elections found</p>
              ) : (
                elections.slice(0, 5).map((election) => (
                  <div key={election.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">{election.name}</p>
                      <p className="text-xs text-text-secondary">
                        Ends: {formatDate(election.end_time)}
                      </p>
                    </div>
                    <Badge variant={getStatusBadge(election.status)}>{election.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Support Tickets</h2>
              <a href="/admin/issues" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="space-y-3">
              {issues.length === 0 ? (
                <p className="text-sm text-text-secondary">No open tickets</p>
              ) : (
                issues.slice(0, 5).map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">{issue.subject}</p>
                      <p className="text-xs text-text-secondary">{issue.category}</p>
                    </div>
                    <Badge variant={issue.status === "open" ? "warning" : "default"}>
                      {issue.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Activity Log Placeholder */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
            <a href="/admin/activity" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="space-y-3">
            {([] as Array<{id: number; action: string; target: string; admin: string; timestamp: string}>).length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-4">No recent activity</p>
            ) : ([] as Array<{id: number; action: string; target: string; admin: string; timestamp: string}>).slice(0, 5).map((entry, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-1.5 bg-primary-100 rounded-full">
                  <Activity className="h-3.5 w-3.5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{entry.admin}</span>{" "}
                    <span className="text-text-secondary">{entry.action}</span>{" "}
                    <span className="font-medium">{entry.target}</span>
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {formatDate(entry.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
