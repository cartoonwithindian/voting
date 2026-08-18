"use client";

import React, { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin-dashboard/AdminLayout";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Search,
  Clock,
} from "lucide-react";

// Activity types for filtering
const ACTION_TYPES = [
  "All",
  "Election Created",
  "Election Updated",
  "Student Authorized",
  "Vote Cast",
] as const;

const DATE_FILTERS = ["All", "Today", "Last 7 Days", "Last 30 Days"] as const;

interface ActivityEntry {
  id: number;
  action: string;
  target: string;
  admin: string;
  timestamp: string;
}

export default function ActivityPage() {
  const [search, setSearch] = useState("");
  const [actionType, setActionType] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<string>("All");

  const [activities] = useState<ActivityEntry[]>([]);

  const filteredActivity = useMemo(() => {
    return activities.filter((entry) => {
      if (search && !entry.action.toLowerCase().includes(search.toLowerCase()) &&
          !entry.target.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (actionType !== "All" && entry.action !== actionType) {
        return false;
      }
      return true;
    });
  }, [search, actionType, activities]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Activity Log</h1>
          <p className="text-sm font-semibold text-text-secondary">
            Track all administrative actions and system events.
          </p>
        </div>

        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search activities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm"
              />
            </div>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm"
            >
              {ACTION_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm"
            >
              {DATE_FILTERS.map((filter) => (
                <option key={filter} value={filter}>{filter}</option>
              ))}
            </select>
          </div>
        </Card>

        <Card className="overflow-hidden">
          {filteredActivity.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Administrative actions will appear here once available."
              icon={<Clock className="w-8 h-8 text-text-muted" />}
            />
          ) : (
            <div className="divide-y divide-border">
              {filteredActivity.map((entry) => (
                <div key={entry.id} className="p-4 hover:bg-bg-secondary transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">
                        <span className="font-medium">{entry.admin}</span>{" "}
                        <span className="text-text-secondary">{entry.action}</span>{" "}
                        <span className="font-medium">{entry.target}</span>
                      </p>
                      <p className="text-xs text-text-muted mt-1">{entry.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
