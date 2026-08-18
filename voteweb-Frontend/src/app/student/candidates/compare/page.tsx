"use client";

import React, { useMemo, Suspense } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Scale, CheckCircle2, ArrowLeft } from "lucide-react";
import { api, Candidate as ApiCandidate } from "@/lib/api-client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { StudentLayout } from "@/components/layout/StudentLayout";

function CompareContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") || "";
  const selectedIds = idsParam.split(",").filter(Boolean);
  const [allCandidates, setAllCandidates] = useState<{ id: string; name: string; position: string; department: string; year: string; photoInitials: string; verified: boolean; biography: string; manifestos: { title: string; content: string }[]; campaignSymbol: string }[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const res = await api.getCandidates();
      if (res.error) return;
      const data = res.data as { data?: ApiCandidate[] } | ApiCandidate[] | undefined;
      let list: ApiCandidate[] = [];
      if (Array.isArray(data)) list = data;
      else if (data && 'data' in data && Array.isArray(data.data)) list = data.data;
      setAllCandidates(list.map((c) => ({
        id: String(c.id), name: c.name, position: String(c.position_id),
        department: "", year: "",
        photoInitials: c.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase(),
        verified: c.is_active, biography: c.description || c.manifesto || "",
        manifestos: [], campaignSymbol: c.name[0]?.toUpperCase() || "?",
      })));
    };
    fetchAll();
  }, []);

  const candidates = useMemo(
    () => allCandidates.filter((c) => selectedIds.includes(c.id)),
    [allCandidates, selectedIds]
  );

  if (candidates.length === 0) {
    return (
      <StudentLayout>
        <main className="flex-1 p-8 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Scale className="w-12 h-12 text-primary-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-text-primary mb-2">No Candidates to Compare</h1>
          <p className="text-text-secondary mb-6">Select up to 3 candidates from the candidates page to compare.</p>
          <Link href="/student/candidates">
            <Button variant="primary" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Candidates
            </Button>
          </Link>
        </div>
        </main>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <Link href="/student/candidates">
              <Button variant="ghost" size="sm" className="gap-1.5 mb-3">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Candidates
              </Button>
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Compare Candidates</h1>
                <p className="text-sm text-text-secondary">Side-by-side comparison of factual information only.</p>
              </div>
              <Badge variant="info" className="text-[10px] w-fit">{candidates.length} of 3 selected</Badge>
            </div>
          </div>

          {/* Candidate headers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="bg-white border border-border rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                    {candidate.photoInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-primary truncate">{candidate.name}</h3>
                    <p className="text-xs text-text-secondary">{candidate.position}</p>
                    <p className="text-[10px] text-text-muted">{candidate.department} &bull; {candidate.year}</p>
                  </div>
                  {candidate.verified && (
                    <Badge variant="success" className="text-[10px] shrink-0">&#10003; Verified</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Basic Info Table */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-text-primary mb-4 border-b border-border pb-3">Basic Information</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-text-secondary w-40">Field</th>
                    {candidates.map((c) => (
                      <th key={c.id} className="text-left p-3 font-medium text-text-primary">{c.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr>
                    <td className="p-3 text-text-secondary">Candidate ID</td>
                    {candidates.map((c) => <td key={c.id} className="p-3 font-mono text-text-primary">{c.id}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-text-secondary">Position</td>
                    {candidates.map((c) => <td key={c.id} className="p-3 text-text-primary">{c.position}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-text-secondary">Department</td>
                    {candidates.map((c) => <td key={c.id} className="p-3 text-text-primary">{c.department}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-text-secondary">Year</td>
                    {candidates.map((c) => <td key={c.id} className="p-3 text-text-primary">{c.year}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-text-secondary">Status</td>
                    {candidates.map((c) => (
                      <td key={c.id} className="p-3">
                        <Badge variant={c.verified ? "success" : "warning"} className="text-[10px]">
                          {c.verified ? "Verified" : "Pending"}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-text-secondary">Campaign Symbol</td>
                    {candidates.map((c) => <td key={c.id} className="p-3 text-2xl">{c.campaignSymbol}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Biographies */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-text-primary mb-4 border-b border-border pb-3">Biography</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates.map((c) => (
                <div key={c.id} className="p-4 bg-primary-50 rounded-xl">
                  <h3 className="font-medium text-primary-600 mb-2">{c.name}</h3>
                  <p className="text-text-secondary text-sm">{c.biography}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Manifestos */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-text-primary mb-4 border-b border-border pb-3">Manifesto</h2>
            <div className="space-y-6">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="border-l-2 border-primary-200 pl-4">
                  <h3 className="font-medium text-text-primary mb-3">{candidate.name} &mdash; {candidate.position}</h3>
                  <div className="space-y-3">
                    {candidate.manifestos.map((section, index) => (
                      <div key={index} className="p-3 bg-primary-50 rounded-xl">
                        <h4 className="font-medium text-primary-600 mb-1">{section.title}</h4>
                        <p className="text-text-secondary text-sm">{section.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/student/vote">
              <Button variant="primary" size="lg" className="gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Continue to Vote
              </Button>
            </Link>
            <Link href="/student/candidates">
              <Button variant="secondary" size="lg" className="gap-2">
                <ArrowLeft className="w-5 h-5" />
                Back to Candidates
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <StudentLayout>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-pulse space-y-4">
            <div className="h-8 bg-primary-100 rounded w-48" />
            <div className="h-4 bg-primary-50 rounded w-96" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-white border border-border rounded-2xl" />
              ))}
            </div>
          </div>
        </main>
      </StudentLayout>
    }>
      <CompareContent />
    </Suspense>
  );
}
