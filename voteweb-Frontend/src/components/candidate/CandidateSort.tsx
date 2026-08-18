"use client";

import React from "react";
import { ArrowUpDown } from "lucide-react";

interface CandidateSortProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

const sortOptions = [
  { value: "name-asc", label: "Name A\u2013Z" },
  { value: "name-desc", label: "Name Z\u2013A" },
];

export const CandidateSort: React.FC<CandidateSortProps> = ({
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-3.5 h-3.5 text-text-secondary" />
      <label className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">
        Sort
      </label>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-3 py-2 rounded-xl border border-border text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
