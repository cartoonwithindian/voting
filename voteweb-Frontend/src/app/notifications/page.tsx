"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, Search, Filter, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";

interface Notification {
  id: number;
  type: string;
  category: string;
  priority: string;
  title: string;
  message?: string;
  action_url?: string;
  action_label?: string;
  is_read: boolean;
  created_at: string;
}

const NOTIFICATION_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "voting", label: "Voting" },
  { value: "election", label: "Election" },
  { value: "candidate", label: "Candidate" },
  { value: "support", label: "Support" },
  { value: "account", label: "Account" },
  { value: "system", label: "System" },
];

const iconMap: Record<string, string> = {
  success: "✅",
  info: "ℹ️",
  warning: "⚠️",
  error: "🚨",
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getNotifications();
      if (res.error) {
        setError(res.error);
        setNotifications([]);
        return;
      }

      const data = res.data as { data?: Notification[] } | Notification[] | undefined;
      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (data && 'data' in data && Array.isArray(data.data)) {
        setNotifications(data.data);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchNotifications();
    };
    run();
  }, [fetchNotifications]);

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter !== "all" && n.category !== filter) return false;
    if (search) return n.title.toLowerCase().includes(search.toLowerCase()) || (n.message && n.message.toLowerCase().includes(search.toLowerCase()));
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markRead = async (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await api.markNotificationRead(id);
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await api.markAllNotificationsRead();
  };

  const unread = filtered.filter((n) => !n.is_read);
  const read = filtered.filter((n) => n.is_read);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7FF] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7FF]">
      <div className="bg-white border-b border-[#E4E6F2]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/student/dashboard" className="p-2 hover:bg-[#EEF0FF] rounded-full transition-colors">
            <ArrowLeft size={20} className="text-[#70759A]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#20275C]">Notifications</h1>
            <p className="text-sm text-[#70759A]">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-sm text-[#27348B] font-medium hover:text-[#4F55C8] flex items-center gap-1">
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#70759A]" />
          <input type="text" placeholder="Search notifications..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F7F7FF] border border-[#E4E6F2] rounded-[12px] text-sm focus:outline-none focus:ring-2 focus:ring-[#27348B]/20 focus:border-[#27348B] placeholder:text-[#70759A]" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {NOTIFICATION_CATEGORIES.map((cat) => {
            const count = cat.value === "all" ? notifications.length : cat.value === "unread" ? unreadCount : notifications.filter((n) => n.category === cat.value).length;
            return (
              <button key={cat.value} onClick={() => setFilter(cat.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === cat.value ? "bg-[#27348B] text-white" : "bg-white text-[#70759A] hover:bg-[#EEF0FF] border border-[#E4E6F2]"}`}>
                <Filter size={12} />
                {cat.label}
                {count > 0 && <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-current/10 text-[10px]">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-error-50 border border-error-200 rounded-lg p-3 text-sm text-error">
            {error}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 pb-8">
        {unread.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-[#70759A] uppercase tracking-wider mb-3 px-1">New</h2>
            <div className="space-y-2">
              {unread.map((n) => (
                <div key={n.id}
                  className="bg-white rounded-[14px] border border-[#E4E6F2] p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => markRead(n.id)}>
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{iconMap[n.type] || "ℹ️"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#20275C]">{n.title}</p>
                      {n.message && <p className="text-sm text-[#70759A] mt-0.5">{n.message}</p>}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-[#70759A]">{formatTime(n.created_at)}</span>
                        {n.action_url && n.action_label && (
                          <Link href={n.action_url} onClick={(e) => e.stopPropagation()}
                            className="text-xs font-medium text-[#27348B] hover:text-[#4F55C8] flex items-center gap-1">
                            {n.action_label} <ChevronRight size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {read.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-[#70759A] uppercase tracking-wider mb-3 px-1">Earlier</h2>
            <div className="space-y-2">
              {read.map((n) => (
                <div key={n.id}
                  className="bg-white rounded-[14px] border border-[#E4E6F2] p-4 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => markRead(n.id)}>
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{iconMap[n.type] || "ℹ️"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#20275C]">{n.title}</p>
                      {n.message && <p className="text-sm text-[#70759A] mt-0.5">{n.message}</p>}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-[#70759A]">{formatTime(n.created_at)}</span>
                        {n.action_url && n.action_label && (
                          <Link href={n.action_url} onClick={(e) => e.stopPropagation()}
                            className="text-xs font-medium text-[#27348B] hover:text-[#4F55C8] flex items-center gap-1">
                            {n.action_label} <ChevronRight size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                    <Check size={16} className="text-[#35B779] shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Bell size={48} className="mx-auto text-[#E4E6F2] mb-4" />
            <h3 className="text-lg font-semibold text-[#20275C] mb-1">No notifications</h3>
            <p className="text-sm text-[#70759A]">
              {search ? "Try adjusting your search" : filter === "unread" ? "All caught up!" : "You have no notifications in this category."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}
