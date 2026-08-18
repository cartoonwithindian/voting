"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  Megaphone,
  FileText,
  BarChart3,
  Eye,
  HelpCircle,
  Settings,
  LogOut,
} from "lucide-react";

export interface CandidateSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

const MENU_ITEMS = [
  { label: "Dashboard", href: "/candidate/dashboard", icon: LayoutDashboard },
  { label: "My Profile", href: "/candidate/profile", icon: User },
  { label: "Campaign", href: "/candidate/campaign", icon: Megaphone },
  { label: "Manifesto", href: "/candidate/manifesto", icon: FileText },
  { label: "Application Status", href: "/candidate/status", icon: BarChart3 },
  { label: "Preview Profile", href: "/candidate/preview", icon: Eye },
  { label: "Help & Support", href: "/student/help", icon: HelpCircle },
  { label: "Settings", href: "/candidate/settings", icon: Settings },
];

export const CandidateSidebar: React.FC<CandidateSidebarProps> = ({
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
            Candidate Portal
          </span>
        </div>
      </div>

      <nav className="flex-1 py-5 px-4 space-y-1.5 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
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
      </nav>

      <div className="p-4 border-t border-border shrink-0">
        <button
          onClick={() => {
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
