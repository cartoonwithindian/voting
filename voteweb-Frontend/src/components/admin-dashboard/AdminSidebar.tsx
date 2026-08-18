"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { clearAuthCookie } from "@/lib/mock-auth";
import {
  LayoutDashboard,
  Vote,
  Users,
  UserCheck,
  BarChart3,
  Calendar,
  Megaphone,
  AlertCircle,
  Clock,
  Settings,
  LogOut,
} from "lucide-react";

export interface AdminSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

const MENU_SECTIONS = [
  {
    label: "ELECTION MANAGEMENT",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Election", href: "/admin/election", icon: Vote },
      { label: "Positions", href: "/admin/positions", icon: BarChart3 },
      { label: "Schedule", href: "/admin/schedule", icon: Calendar },
      { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    ],
  },
  {
    label: "USER MANAGEMENT",
    items: [
      { label: "Candidates", href: "/admin/candidates", icon: Users },
      { label: "Students", href: "/admin/students", icon: UserCheck },
    ],
  },
  {
    label: "RESULTS & REPORTS",
    items: [
      { label: "Results", href: "/admin/results", icon: BarChart3 },
      { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { label: "Issues", href: "/admin/issues", icon: AlertCircle },
      { label: "Activity Log", href: "/admin/activity", icon: Clock },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  className,
  onNavigate,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white border-r border-border shadow-[4px_0_20px_rgba(32,39,92,0.04)] w-68 shrink-0 rounded-r-2xl",
        className
      )}
    >
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-white text-sm">
          CV
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary tracking-wide text-sm">
            CampusVote
          </span>
          <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
            Admin Panel
          </span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-4 space-y-4 overflow-y-auto">
        {MENU_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-4 mb-2">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer",
                      isActive
                        ? "bg-primary-50 text-primary-700 shadow-sm shadow-primary-500/10"
                        : "text-text-secondary hover:bg-primary-50 hover:text-primary-700"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-colors shrink-0",
                        isActive ? "text-primary-700" : "text-text-muted"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border shrink-0">
        <button
          onClick={() => {
            clearAuthCookie();
            router.push("/login");
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-error-600 hover:bg-error-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
