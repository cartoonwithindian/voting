"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  customSidebar?: React.ReactNode;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose, customSidebar }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 lg:hidden transition-all duration-300",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      {/* Backdrop overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-primary-900/50 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Drawer content */}
      <div
        className={cn(
          "absolute top-0 left-0 bottom-0 w-72 bg-white shadow-[0_20px_40px_rgba(32,39,92,0.2)] transform transition-transform duration-300 ease-in-out flex flex-col z-50 rounded-tr-2xl rounded-br-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close Button Inside Drawer */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:bg-primary-50 hover:text-text-primary transition-colors focus-ring cursor-pointer"
            aria-label="Close mobile menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {customSidebar || (
          <Sidebar className="w-full h-full border-r-0 rounded-none" onNavigate={onClose} />
        )}
      </div>
    </div>
  );
};