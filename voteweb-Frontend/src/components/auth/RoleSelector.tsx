"use client";

import React from "react";
import { GraduationCap, Mic, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/auth-types";

interface RoleSelectorProps {
  selectedRole: UserRole;
  onSelect: (role: UserRole) => void;
}

const roleOptions: {
  id: UserRole;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: "student", label: "Student", description: "Participate in elections", icon: GraduationCap },
  { id: "candidate", label: "Candidate", description: "Manage your candidate profile", icon: Mic },
  { id: "administrator", label: "Administrator", description: "Manage election administration", icon: ShieldCheck },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onSelect }) => {
  return (
    <div className="space-y-2.5">
      <label className="text-sm font-semibold text-text-primary block">
        Sign in as
      </label>
      <div
        className="grid grid-cols-3 gap-2.5"
        role="radiogroup"
        aria-label="Sign in as"
      >
        {roleOptions.map((role) => {
          const Icon = role.icon;
          const isActive = selectedRole === role.id;
          return (
            <button
              key={role.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onSelect(role.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-150 cursor-pointer text-center",
                isActive
                  ? "border-primary-600 bg-primary-50 shadow-[0_2px_12px_rgba(39,52,139,0.12)]"
                  : "border-border bg-white hover:border-primary-300 hover:bg-primary-50/50"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  isActive ? "bg-primary-600 text-white" : "bg-primary-50 text-primary-600"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p
                  className={cn(
                    "text-xs font-semibold",
                    isActive ? "text-primary-700" : "text-text-primary"
                  )}
                >
                  {role.label}
                </p>
                <p className="text-[10px] text-text-muted leading-tight hidden sm:block">
                  {role.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};