"use client";

import React, { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminNavbar } from "./AdminNavbar";
import { MobileNav } from "@/components/layout/MobileNav";

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F7F8FC] overflow-hidden">
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        customSidebar={
          <AdminSidebar
            className="w-full h-full border-r-0 rounded-none"
            onNavigate={() => setMobileNavOpen(false)}
          />
        }
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminNavbar
          onToggleMenu={() => setMobileNavOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
