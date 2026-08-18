"use client";

import React from "react";
import { Card } from "@/components/ui/Card";

interface ReceiptQRCodeProps {
  verificationUrl: string;
}

export const ReceiptQRCode: React.FC<ReceiptQRCodeProps> = ({
  verificationUrl,
}) => {
  return (
    <Card className="p-5 border-border">
      <div className="text-center">
        <h3 className="text-sm font-semibold text-text-primary mb-2">
          Receipt Verification QR
        </h3>
        <p className="text-xs text-text-secondary mb-4">
          Scan this code to open the receipt verification page.
        </p>

        {/* Mock QR Code */}
        <div className="w-40 h-40 mx-auto bg-white border-2 border-border rounded-xl flex items-center justify-center mb-4">
          <div className="w-32 h-32 grid grid-cols-8 grid-rows-8 gap-0.5">
            {Array.from({ length: 64 }).map((_, i) => {
              const row = Math.floor(i / 8);
              const col = i % 8;
              const isCorner =
                (row < 3 && col < 3) ||
                (row < 3 && col > 4) ||
                (row > 4 && col < 3);
              const isDark =
                isCorner || (row + col) % 3 === 0 || (row * col) % 5 === 0;
              return (
                <div
                  key={i}
                  className={`rounded-[2px] ${
                    isDark ? "bg-text-primary" : "bg-white"
                  }`}
                />
              );
            })}
          </div>
        </div>

        <p className="text-[10px] text-text-secondary font-mono">
          {verificationUrl}
        </p>
      </div>
    </Card>
  );
};
