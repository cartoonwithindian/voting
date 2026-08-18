"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Scale, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api, Candidate as ApiCandidate } from "@/lib/api-client";
import { useEffect } from "react";

interface CandidateData {
  id: string;
  name: string;
  position: string;
  department: string;
  year: string;
  photoInitials: string;
  campaignSymbol: string;
  verified: boolean;
  biography: string;
  manifestos: { title: string; content: string }[];
}

import { CandidateGrid } from "@/components/candidate/CandidateGrid";
import { CandidateSearch } from "@/components/candidate/CandidateSearch";
import { CandidateFilters } from "@/components/candidate/CandidateFilters";
import { CandidateSort } from "@/components/candidate/CandidateSort";
import { CandidateCount } from "@/components/candidate/CandidateCount";
import { EmptyState } from "@/components/ui/EmptyState";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";

export default function CandidatePage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const res = await api.getCandidates();
        if (res.error) { setCandidates([]); setLoading(false); return; }
        const data = res.data as { data?: ApiCandidate[] } | ApiCandidate[] | undefined;
        let list: ApiCandidate[] = [];
        if (Array.isArray(data)) list = data;
        else if (data && 'data' in data && Array.isArray(data.data)) list = data.data;

        setCandidates(list.map((c) => ({
          id: String(c.id),
          name: c.name,
          position: String(c.position_id),
          department: "",
          year: "",
          photoInitials: c.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase(),
          campaignSymbol: c.name[0]?.toUpperCase() || "?",
          verified: c.is_active,
          biography: c.description || c.manifesto || "",
          manifestos: [],
        })));
      } catch { setCandidates([]); }
      finally { setLoading(false); }
    };
    fetchCandidates();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    position: "all",
    department: "all",
    year: "all",
  });
  const [sortBy, setSortBy] = useState("name-asc");

  const [comparedIds, setComparedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const toggleCompare = (id: string) => {
    setComparedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearCompare = () => setComparedIds(new Set());
  const clearSelect = () => setSelectedIds(new Set());

  const filteredCandidates = useMemo(() => {
    let results = [...candidates];

    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.id.toLowerCase().includes(lower) ||
          c.position.toLowerCase().includes(lower) ||
          c.department.toLowerCase().includes(lower)
      );
    }

    if (filters.position !== "all") {
      results = results.filter((c) => c.position === filters.position);
    }

    if (filters.department !== "all") {
      results = results.filter((c) => c.department === filters.department);
    }

    if (filters.year !== "all") {
      results = results.filter((c) => c.year === filters.year);
    }

    if (sortBy === "name-asc") {
      results.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      results.sort((a, b) => b.name.localeCompare(a.name));
    }

    return results;
  }, [candidates, searchQuery, filters, sortBy]);

  return (
    <StudentLayout>
      {error && (
        <div className="max-w-7xl mx-auto w-full px-4 pt-6">
          <ErrorState
            title="Something went wrong"
            message={error}
            onRetry={() => setError(null)}
          />
        </div>
      )}
        <div className="py-6 border-b border-border shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Candidates</h1>
              <p className="text-sm text-text-secondary">
                Review candidate profiles and manifestos before making your decision.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-50 text-sm">
              <span className="text-primary-600 font-medium">Student Council Election 2026</span>
              <span className="text-text-secondary">Voting Open</span>
            </div>
          </div>
        </div>
      </div>

      {comparedIds.size > 0 && (
        <div className="bg-primary-50 border-b border-primary-100 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">
                {comparedIds.size} candidate{comparedIds.size !== 1 ? "s" : ""} added to comparison
              </span>
              <Badge variant="info" className="text-[10px]">Max 3</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/student/candidates/compare?ids=${Array.from(comparedIds).join(",")}`}>
                <Button variant="primary" size="sm" className="gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  Compare
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={clearCompare}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="bg-success-50 border-b border-success-100 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success-600" />
              <span className="text-sm font-medium text-success-700">
                {selectedIds.size} candidate{selectedIds.size !== 1 ? "s" : ""} selected for voting
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5"
                onClick={() => router.push("/student/vote")}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Continue to Vote
              </Button>
              <Button variant="ghost" size="sm" onClick={clearSelect}>
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-5">
          <CandidateSearch
            onSearchChange={setSearchQuery}
            placeholder="Search candidates..."
          />

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-0">
              <CandidateFilters filters={filters} onFilterChange={setFilters} />
            </div>
            <CandidateSort sortBy={sortBy} onSortChange={setSortBy} />
            <CandidateCount count={filteredCandidates.length} />
          </div>

          {filteredCandidates.length > 0 ? (
            <CandidateGrid
              candidates={filteredCandidates}
              onCompare={toggleCompare}
              comparedIds={comparedIds}
              onSelect={toggleSelect}
              selectedIds={selectedIds}
            />
          ) : (
            <EmptyState
              title="No Candidates Found"
              description="Try changing your search or filters."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery("");
                    setFilters({ position: "all", department: "all", year: "all" });
                  }}
                >
                  Clear Filters
                </Button>
              }
            />
          )}
        </div>
      </main>
    </StudentLayout>
  );
}
