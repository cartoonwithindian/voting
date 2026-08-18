"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, Settings, Shield } from "lucide-react"
import { Avatar } from "@/components/ui/Avatar";
import NotificationBell from "@/components/ui/notification-bell";
import { clearAuthCookie } from "@/lib/mock-auth";

export interface AdminNavbarProps {
  onToggleMenu: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ onToggleMenu }) => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 shadow-[0_2px_8px_rgba(32,39,92,0.04)]">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMenu}
          className="p-2 rounded-xl text-text-muted hover:bg-primary-50 hover:text-text-primary active:bg-primary-100 lg:hidden focus-ring cursor-pointer"
          aria-label="Toggle mobile navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-white text-xs">
            CV
          </div>
          <span className="font-semibold text-text-primary text-sm tracking-wide">
            Admin Panel
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary-600" />
          <span className="font-medium text-text-secondary text-sm">
            Election Administration
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <NotificationBell />

        <div className="w-px h-6 bg-border" />

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-primary-50 transition-colors focus-ring cursor-pointer"
          >
            <Avatar name="Election Admin" size="sm" />
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-xs font-semibold text-text-primary leading-none">
                Election Admin
              </span>
              <span className="text-[10px] text-text-muted font-semibold leading-none mt-0.5">
                ADMIN-001
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-border shadow-lg z-50 py-1">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-text-primary">
                    Election Admin
                  </p>
                  <p className="text-xs text-text-muted">ADMIN-001</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                    Election Administrator
                  </span>
                </div>
                <Link
                  href="/admin/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-primary-50 hover:text-primary-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      clearAuthCookie();
                      router.push("/login");
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error-600 hover:bg-error-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
