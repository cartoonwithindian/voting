"use client";
import { useState, useEffect } from "react";
import { Clock, RefreshCw, LogOut } from "lucide-react";
import Link from "next/link";

interface Props { open: boolean; }

export default function SessionExpired({ open }: Props) {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!open || countdown <= 0) return;
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [open, countdown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-[16px] shadow-xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 bg-warning-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock size={24} className="text-warning-600" />
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-2">Session Expired</h3>
        <p className="text-sm text-text-secondary mb-6">Your session has expired due to inactivity. Please log in again.</p>
        <div className="flex gap-3">
          <Link href="/login"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-[12px] text-sm font-semibold hover:bg-primary-500 transition-colors">
            <LogOut size={16} /> Log In Again
          </Link>
          <button disabled
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-bg-tertiary text-text-secondary rounded-[12px] text-sm font-semibold cursor-not-allowed">
            <RefreshCw size={16} className="animate-spin" /> Auto-refresh in {countdown}s
          </button>
        </div>
      </div>
    </div>
  );
}
