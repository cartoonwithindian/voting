"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

interface VoteSuccessAnimationProps {
  voteReference?: string;
  onComplete?: () => void;
}

export function VoteSuccessAnimation({ voteReference, onComplete }: VoteSuccessAnimationProps) {
  const [step, setStep] = useState<"submitting" | "processing" | "success" | "printing" | "complete">("submitting");
  const [printProgress, setPrintProgress] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setStep("processing"), 2000));
    timers.push(setTimeout(() => setStep("success"), 4000));
    timers.push(setTimeout(() => {
      setStep("printing");
      const interval = setInterval(() => {
        setPrintProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1.5;
        });
      }, 25);
    }, 5000));
    timers.push(setTimeout(() => setStep("complete"), 7000));
    timers.push(setTimeout(() => { if (onComplete) onComplete(); }, 18000));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const now = new Date();
  const date = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  // Deterministic barcode derived from the vote reference so renders are pure
  const barcodeWidths = useMemo(() => {
    const seed = voteReference || "voteweb";
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return Array.from({ length: 32 }, (_, i) => {
      const byte = (hash >>> (i % 16)) & 0xff;
      return byte % 5 > 1 ? 3 : 1;
    });
  }, [voteReference]);

  const maxReceiptHeight = 350;
  const receiptHeight = (printProgress / 100) * maxReceiptHeight;

  return (
    <div className="flex flex-col items-center justify-center min-h-[650px] w-full max-w-lg mx-auto px-4">
      <style>{`
        @keyframes checkPop {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.3) rotate(5deg); }
          75% { transform: scale(0.9) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .check-animate { animation: checkPop 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
        .fade-animate { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>

      {/* Steps 1-2: Loading */}
      {(step === "submitting" || step === "processing") && (
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            {step === "submitting" ? "Submitting your vote..." : "Processing your vote..."}
          </h2>
          <p className="text-text-secondary text-sm">
            {step === "submitting" ? "Please wait while we securely record your vote." : "Verifying and recording securely..."}
          </p>
        </div>
      )}

      {/* Step 3: Success */}
      {step === "success" && (
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 check-animate">
            <CheckCircle2 className="w-14 h-14 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Vote Recorded!</h2>
          <p className="text-text-secondary text-sm">Printing your receipt...</p>
        </div>
      )}

      {/* Step 4: Printing Receipt */}
      {(step === "printing" || step === "complete") && (
        <div className="flex flex-col items-center">
          {/* Printer (Fixed at top) */}
          <div className="relative z-10">
            {/* Printer Body */}
            <div className="w-80 bg-gradient-to-b from-gray-600 to-gray-800 rounded-lg px-6 py-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-white text-xs font-medium">PRINTING</span>
                </div>
                <div className="text-white text-xs font-mono">{Math.round(printProgress)}%</div>
              </div>
            </div>
            {/* Printer Slot */}
            <div className="w-80 h-3 bg-gray-900 rounded-b-lg"></div>
          </div>

          {/* Receipt Paper - Grows DOWN from printer slot */}
          <div className="relative">
            <div 
              className="w-80 bg-white shadow-2xl overflow-hidden"
              style={{ height: `${receiptHeight}px`, transition: "height 0.05s linear" }}
            >
              <div className="p-6 font-mono text-sm">
                {/* Header */}
                <div className="text-center border-b-2 border-dashed border-gray-300 pb-3 mb-4">
                  <div className="text-base font-bold tracking-wider">VOTE RECEIPT</div>
                  <div className="text-green-600 text-xs mt-1">✓ VOTE SUBMITTED</div>
                </div>

                {/* Reference */}
                <div className="bg-gray-50 p-3 rounded mb-4">
                  <div className="text-xs text-gray-500 mb-1">Vote Reference</div>
                  <div className="text-sm font-bold text-gray-800 break-all">
                    {voteReference || "PENDING"}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-semibold text-gray-800">{date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time:</span>
                    <span className="font-semibold text-gray-800">{time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="text-green-600 font-bold">VERIFIED</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-dashed border-gray-200 my-4"></div>

                {/* Message */}
                <div className="text-center text-xs text-gray-400">
                  <p>Your vote has been securely recorded.</p>
                  <p className="mt-1">Thank you for voting!</p>
                </div>

                {/* Barcode */}
                <div className="flex justify-center gap-[2px] mt-4 pt-3 border-t border-gray-100">
                  {barcodeWidths.map((width, i) => (
                    <div 
                      key={i} 
                      className="bg-gray-800 rounded-sm"
                      style={{ width: `${width}px`, height: "24px" }}
                    ></div>
                  ))}
                </div>

                {/* Tear Pattern */}
                <div className="h-4 mt-2" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 8px, #f0f0f0 8px, #f0f0f0 16px)" }}></div>
              </div>
            </div>
          </div>

          {/* Complete Message */}
          {step === "complete" && (
            <div className="mt-6 text-center fade-animate">
              <h2 className="text-xl font-bold text-text-primary mb-1">Receipt Printed!</h2>
              <p className="text-text-secondary text-sm">Your vote has been securely recorded.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VoteSuccessAnimation;