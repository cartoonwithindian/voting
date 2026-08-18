"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw, Clock } from "lucide-react";
export default function ServerError() {
  const [retrying, setRetrying] = useState(false);
  const [errorTime, setErrorTime] = useState<string | null>(null);

  useEffect(() => {
    // Deferred so the timestamp renders only after hydration (avoids SSR mismatch)
    const t = setTimeout(() => setErrorTime(new Date().toLocaleString()), 0);
    return () => clearTimeout(t);
  }, []);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => { window.location.reload(); }, 1500);
  };

  return (
    <div className="min-h-screen bg-bg-tertiary flex items-center justify-center px-4">
      <div className="bg-white rounded-[20px] border border-border p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-error-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Something went wrong</h1>
        <p className="text-sm text-text-secondary mb-2">Our system encountered an unexpected error. We have been notified and are working to fix it.</p>
        <div className="bg-bg-tertiary rounded-[12px] p-4 mb-8">
          <div className="flex items-center justify-center gap-2 text-xs text-text-secondary">
            <Clock size={14} />
            <span>Error logged at {errorTime || ""}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button onClick={handleRetry} disabled={retrying}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-[12px] text-sm font-semibold hover:bg-primary-500 transition-colors disabled:opacity-50">
            <RefreshCw size={16} className={retrying ? "animate-spin" : ""} />
            {retrying ? "Retrying..." : "Try Again"}
          </button>
          <Link href="/"
            className="flex items-center gap-2 bg-bg-tertiary text-primary-600 px-6 py-3 rounded-[12px] text-sm font-semibold hover:bg-border transition-colors">
            <Home size={16} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
