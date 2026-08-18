"use client";

import React from "react";
import { CheckCircle2, FileCheck2, ShieldCheck } from "lucide-react";

export const AuthBranding: React.FC = () => {
  const features = [
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "Secure & Anonymous",
      description: "Your vote is encrypted and never linked to your identity.",
    },
    {
      icon: <FileCheck2 className="w-5 h-5" />,
      title: "Transparent & Verifiable",
      description: "Independent cryptographic receipts confirm your ballot.",
    },
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: "Trusted & Neutral",
      description: "A fair election process for all students.",
    },
  ];

  return (
    <div className="relative z-10 flex flex-col h-full">
      {/* Top branding */}
      <div className="pt-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary-600">
          Secure. Simple. Student-led.
        </p>
      </div>

      {/* Middle content */}
      <div className="flex-1 flex flex-col justify-center py-10">
        <h2 className="text-3xl xl:text-4xl font-bold text-text-primary leading-tight tracking-tight">
          Participate in your student
          <br className="hidden xl:block" /> council election.
        </h2>
        <p className="mt-4 text-base text-text-secondary leading-relaxed max-w-md">
          Engage in your student council election through a simple, secure, and
          trusted digital voting experience.
        </p>

        <div className="mt-8 space-y-4 max-w-sm">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-3">
              <div className="p-2.5 bg-primary-100 rounded-xl shrink-0">
                {feature.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{feature.title}</p>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pb-2">
        <p className="text-[11px] text-text-muted">
          &copy; 2026 CampusVote — Student Council Election Platform.
        </p>
      </div>
    </div>
  );
};