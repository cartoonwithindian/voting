"use client";

import React from "react";

interface CandidateCountProps {
  count: number;
}

export const CandidateCount: React.FC<CandidateCountProps> = ({ count }) => {
  return (
    <div className="text-sm text-text-secondary">
      <span className="font-medium">{count}</span> Candidate{count !== 1 ? "s" : ""}
    </div>
  );
};
