"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";

export interface StudentLayoutProps {
  children: React.ReactNode;
  studentName?: string;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({
  children,
  studentName = "Anurag Gupta",
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F7F8FC] overflow-hidden">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onToggleMenu={() => setMobileNavOpen((prev) => !prev)}
          studentName={studentName}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
