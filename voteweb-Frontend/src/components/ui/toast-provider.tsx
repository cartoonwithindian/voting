"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastVariant = "success" | "info" | "warning" | "error";
interface Toast { id: string; message: string; variant: ToastVariant; }
interface Ctx { toasts: Toast[]; toast: (msg: string, v?: ToastVariant) => void; dismiss: (id: string) => void; }
const Ctx = createContext<Ctx>({ toasts: [], toast() {}, dismiss() {} });
export const useToast = () => useContext(Ctx);
let next = 0;
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, set] = useState<Toast[]>([]);
  const dismiss = useCallback((id: string) => set(t => t.filter(x => x.id !== id)), []);
  const toast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = String(++next);
    set(t => [...t, { id, message, variant }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);
  return (
    <Ctx.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className={`pointer-events-auto px-5 py-3 rounded-[12px] shadow-lg border text-sm font-medium flex items-center gap-3 animate-[slideIn_0.2s_ease-out] ${t.variant === "success" ? "bg-success-600/10 border-success-600/30 text-success-600" : t.variant === "error" ? "bg-error-600/10 border-error-600/30 text-error-600" : t.variant === "warning" ? "bg-warning-600/10 border-warning-600/30 text-[#E2930D]" : "bg-primary-600/10 border-primary-600/30 text-primary-600"}`}>
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-current opacity-60 hover:opacity-100">✕</button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
