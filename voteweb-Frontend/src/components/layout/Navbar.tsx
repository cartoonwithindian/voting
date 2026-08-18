"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, Settings, User } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Dropdown } from "../ui/Dropdown";
import NotificationBell from "../ui/notification-bell";
import { clearAuthCookie } from "@/lib/mock-auth";

export interface NavbarProps {
  onToggleMenu: () => void;
  studentName: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMenu, studentName }) => {
  const router = useRouter();
  const dropdownItems = [
    {
      label: "My Profile",
      icon: <User className="w-4 h-4" />,
      onClick: () => {
        router.push("/student/profile");
      },
    },
    {
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
      onClick: () => {
        router.push("/student/settings");
      },
    },
    {
      label: "Logout",
      icon: <LogOut className="w-4 h-4" />,
      danger: true,
      onClick: () => {
        clearAuthCookie();
        router.push("/login");
      },
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 shadow-[0_2px_8px_rgba(32,39,92,0.04)]">
      {/* Left side: Brand/Mobile toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMenu}
          className="p-2 rounded-xl text-text-muted hover:bg-primary-50 hover:text-text-primary active:bg-primary-100 lg:hidden focus-ring cursor-pointer"
          aria-label="Toggle mobile navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile brand */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-white text-xs">
            CV
          </div>
          <span className="font-semibold text-text-primary text-sm tracking-wide">CampusVote</span>
        </div>

        {/* Desktop context */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="font-medium text-text-secondary text-sm">Student Council Election 2026</span>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <NotificationBell />

        {/* Divider */}
        <div className="w-px h-6 bg-border" />

        {/* Student Dropdown */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-primary-50 transition-colors focus-ring cursor-pointer">
              <Avatar name={studentName} size="sm" />
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs font-semibold text-text-primary leading-none">{studentName}</span>
                <span className="text-[10px] text-text-muted font-semibold leading-none mt-0.5">Student</span>
              </div>
              <ChevronDown className="w-4 h-4 text-text-muted" />
            </button>
          }
          items={dropdownItems}
          align="right"
        />
      </div>
    </header>
  );
};