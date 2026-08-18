"use client";

import { Wrench, Clock, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-bg-tertiary flex items-center justify-center px-4">
      <div className="bg-white rounded-[20px] border border-border p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-warning-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wrench size={28} className="text-warning-600" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Scheduled Maintenance</h1>
        <p className="text-sm text-text-secondary mb-6">We are currently performing system maintenance to improve your experience. The system will be back online shortly.</p>
        <div className="bg-bg-tertiary rounded-[12px] p-4 mb-8">
          <div className="flex items-center justify-center gap-2 text-sm text-text-primary">
            <Clock size={16} />
            <span className="font-medium">Estimated completion: {getNextMaintenanceWindow()}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => window.history.back()}
            className="flex items-center gap-2 bg-bg-tertiary text-primary-600 px-6 py-3 rounded-[12px] text-sm font-semibold hover:bg-border transition-colors">
            <ArrowLeft size={16} /> Go Back
          </button>
          <Link href="/"
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-[12px] text-sm font-semibold hover:bg-primary-500 transition-colors">
            <Home size={16} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function getNextMaintenanceWindow(): string {
  const now = new Date();
  const next = new Date(now);
  next.setHours(next.getHours() + 2, 0, 0, 0);
  return next.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
