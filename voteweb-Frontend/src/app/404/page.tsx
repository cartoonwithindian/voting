"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-tertiary flex items-center justify-center px-4">
      <div className="bg-white rounded-[20px] border border-border p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🔍</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Page Not Found</h1>
        <p className="text-sm text-text-secondary mb-2">The page you are looking for does not exist or has been moved.</p>
        <p className="text-xs text-text-secondary mb-8">Error Code: 404</p>
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
