"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";

interface CandidateSearchProps {
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export const CandidateSearch: React.FC<CandidateSearchProps> = ({
  onSearchChange,
  placeholder = "Search candidates...",
}) => {
  const [query, setQuery] = useState("");

  const handleChange = (value: string) => {
    setQuery(value);
    onSearchChange(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearchChange("");
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-text-secondary" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
        aria-label="Search candidates"
      />
      {query.trim().length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-secondary hover:text-primary-600 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
