"use client";
import { WifiOff, RefreshCw } from "lucide-react";
import { useSyncExternalStore } from "react";

const subscribe = (callback: () => void) => {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
};

const getSnapshot = () => navigator.onLine;

const getServerSnapshot = () => true;

export default function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (online) return null;

  return (
    <div className="w-full bg-amber-100 border-b border-amber-200 px-4 py-2 text-sm text-amber-800 flex items-center justify-center gap-2">
      <WifiOff size={16} className="shrink-0" />
      <span>You appear to be offline. Some features may be unavailable.</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="ml-2 inline-flex items-center gap-1 font-medium text-amber-900 hover:text-amber-950 transition-colors"
      >
        <RefreshCw size={14} />
        Retry
      </button>
    </div>
  );
}