"use client";

import React from "react";

interface Filters {
  position: string;
  department: string;
  year: string;
}

interface CandidateFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const positionOptions = [
  { value: "all", label: "All Positions" },
  { value: "President", label: "President" },
  { value: "Vice President", label: "Vice President" },
  { value: "General Secretary", label: "General Secretary" },
  { value: "Treasurer", label: "Treasurer" },
  { value: "Cultural Secretary", label: "Cultural Secretary" },
];

const departmentOptions = [
  { value: "all", label: "All Departments" },
  { value: "BCA", label: "BCA" },
  { value: "BBA", label: "BBA" },
  { value: "B.Tech", label: "B.Tech" },
  { value: "B.Com", label: "B.Com" },
  { value: "Economics", label: "Economics" },
  { value: "Fine Arts", label: "Fine Arts" },
  { value: "Mass Communication", label: "Mass Communication" },
  { value: "Other", label: "Other" },
];

const yearOptions = [
  { value: "all", label: "All Years" },
  { value: "1st Year", label: "1st Year" },
  { value: "2nd Year", label: "2nd Year" },
  { value: "3rd Year", label: "3rd Year" },
  { value: "4th Year", label: "4th Year" },
];

export const CandidateFilters: React.FC<CandidateFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const handleChange = (field: keyof Filters, value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <div className="min-w-[160px]">
        <label className="text-[10px] font-medium text-text-secondary uppercase tracking-wider block mb-1">
          Position
        </label>
        <select
          value={filters.position}
          onChange={(e) => handleChange("position", e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-border text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {positionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[160px]">
        <label className="text-[10px] font-medium text-text-secondary uppercase tracking-wider block mb-1">
          Department
        </label>
        <select
          value={filters.department}
          onChange={(e) => handleChange("department", e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-border text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {departmentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[140px]">
        <label className="text-[10px] font-medium text-text-secondary uppercase tracking-wider block mb-1">
          Year
        </label>
        <select
          value={filters.year}
          onChange={(e) => handleChange("year", e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-border text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {yearOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
