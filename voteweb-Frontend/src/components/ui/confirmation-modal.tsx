"use client";
import { AlertTriangle, X } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({ open, title, message, confirmLabel = "Confirm", onConfirm, onCancel }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-[16px] shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <button onClick={onCancel} className="absolute top-3 right-3 p-1 hover:bg-bg-tertiary rounded-full">
          <X size={16} className="text-text-secondary" />
        </button>
        <div className="w-12 h-12 bg-warning-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-warning-600" />
        </div>
        <h3 className="text-lg font-bold text-text-primary text-center mb-2">{title}</h3>
        <p className="text-sm text-text-secondary text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 bg-bg-tertiary text-primary-600 rounded-[12px] text-sm font-semibold hover:bg-border transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-error-600 text-white rounded-[12px] text-sm font-semibold hover:bg-error-600/90 transition-colors">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SuccessModal({ open, title, message, onClose }: { open: boolean; title: string; message: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-[16px] shadow-xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 bg-success-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✅</span>
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
        <p className="text-sm text-text-secondary mb-6">{message}</p>
        <button onClick={onClose} className="w-full px-4 py-2.5 bg-success-600 text-white rounded-[12px] text-sm font-semibold hover:bg-success-600/90 transition-colors">
          Got it
        </button>
      </div>
    </div>
  );
}

export function DangerConfirmationModal({ open, title, message, confirmLabel = "Yes, delete", onConfirm, onCancel }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-[16px] shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <button onClick={onCancel} className="absolute top-3 right-3 p-1 hover:bg-bg-tertiary rounded-full">
          <X size={16} className="text-text-secondary" />
        </button>
        <div className="w-12 h-12 bg-error-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🗑️</span>
        </div>
        <h3 className="text-lg font-bold text-text-primary text-center mb-2">{title}</h3>
        <p className="text-sm text-text-secondary text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 bg-bg-tertiary text-primary-600 rounded-[12px] text-sm font-semibold hover:bg-border transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-error-600 text-white rounded-[12px] text-sm font-semibold hover:bg-error-600/90 transition-colors">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
