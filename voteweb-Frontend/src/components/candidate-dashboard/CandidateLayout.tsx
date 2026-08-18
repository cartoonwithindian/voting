"use client";

import React, { useState } from "react";
import { CandidateSidebar } from "./CandidateSidebar";
import { CandidateNavbar } from "./CandidateNavbar";
import { MobileNav } from "@/components/layout/MobileNav";

export interface CandidateLayoutProps {
  children: React.ReactNode;
  candidateName?: string;
  candidateId?: string;
}

export const CandidateLayout: React.FC<CandidateLayoutProps> = ({
  children,
  candidateName = "Aarav Sharma",
  candidateId = "CAN-001",
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F7F8FC] overflow-hidden">
      <div className="hidden lg:flex">
        <CandidateSidebar />
      </div>
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        customSidebar={
          <CandidateSidebar
            className="w-full h-full border-r-0 rounded-none"
            onNavigate={() => setMobileNavOpen(false)}
          />
        }
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <CandidateNavbar
          onToggleMenu={() => setMobileNavOpen((prev) => !prev)}
          candidateName={candidateName}
          candidateId={candidateId}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
