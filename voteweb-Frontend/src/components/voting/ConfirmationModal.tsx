"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, ArrowLeft } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  isSubmitting,
  onConfirm,
  onBack,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onBack} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">Submit Your Vote?</h3>
            <p className="text-xs text-text-secondary">
              Once submitted, your ballot cannot be changed.
            </p>
          </div>
        </div>

        <p className="text-sm text-text-secondary">
          Please make sure your selections are correct before submitting.
        </p>

        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            size="md"
            className="flex-1 gap-1.5"
            onClick={onBack}
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1 gap-1.5"
            onClick={onConfirm}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting Vote..." : "Submit Vote"}
          </Button>
        </div>
      </div>
    </div>
  );
};
