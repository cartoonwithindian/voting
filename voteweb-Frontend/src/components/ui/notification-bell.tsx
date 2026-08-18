"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { api, Notification } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getNotifications();
      if (!res.error && res.data) {
        const data = res.data as Record<string, unknown>;
        let notifs: Notification[] = [];
        if ('data' in data && Array.isArray((data as { data: Notification[] }).data)) {
          notifs = (data as { data: Notification[] }).data;
        } else if (Array.isArray(data)) {
          notifs = data as unknown as Notification[];
        }
        setNotifications(notifs);
        setUnread(notifs.filter(n => !n.is_read).length);
      }
    } catch {
      // Silently fail, notifications are not critical
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const run = async () => {
      await fetchNotifications();
    };
    run();
    // Poll for new notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-bg-tertiary transition-colors text-text-secondary hover:text-primary-600">
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-error-600 rounded-full" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-border z-50">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <span className="text-sm font-semibold text-text-primary">Notifications</span>
            <span className="text-xs text-text-secondary">{unread} unread</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-secondary">No notifications</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <Link key={n.id} href={n.action_url || "/notifications"} onClick={() => setOpen(false)}
                  className={`block px-4 py-3 hover:bg-bg-tertiary transition-colors ${!n.is_read ? "bg-bg-tertiary/40" : ""}`}>
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!n.is_read ? "bg-primary-600" : "bg-transparent"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{n.title}</p>
                      <p className="text-xs text-text-secondary mt-0.5 truncate">{n.message}</p>
                      {n.created_at && (
                        <p className="text-xs text-text-muted mt-0.5">{formatDate(n.created_at)}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          <Link href="/notifications" onClick={() => setOpen(false)}
            className="block text-center text-xs font-medium text-primary-600 hover:text-primary-500 py-2 border-t border-border">
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
}
