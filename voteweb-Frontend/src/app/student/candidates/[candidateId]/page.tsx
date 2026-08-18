"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Settings, Scale, Download, FileText, CheckCircle2 } from "lucide-react"
import { api } from "@/lib/api-client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation";
import { StudentLayout } from "@/components/layout/StudentLayout";

interface CandidateData {
  id: string; name: string; position: string; department: string; year: string;
  photoInitials: string; campaignSymbol: string; verified: boolean; biography: string;
  manifestos: { title: string; content: string }[];
}

export default function CandidateProfilePage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const router = useRouter();
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      setLoading(true);
      try {
        const res = await api.getCandidate(parseInt(candidateId));
        if (res.error || !res.data) { setLoading(false); return; }
        const data = res.data as { candidate?: Record<string, unknown> } | Record<string, unknown>;
        const c = (data.candidate || data) as Record<string, unknown>;
        setCandidate({
          id: String(c.id),
          name: String(c.name),
          position: String(c.position_id),
          department: "", year: "",
          photoInitials: String(c.name).split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase(),
          campaignSymbol: String(c.name)[0]?.toUpperCase() || "?",
          verified: !!c.is_active,
          biography: String(c.description || c.bio || ""),
          manifestos: [],
        });
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchCandidate();
  }, [candidateId]);

  if (!candidate) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-text-primary">Candidate Not Found</h1>
        <p className="text-text-secondary">The candidate profile you requested does not exist.</p>
        <Link href="/student/candidates">
          <button className="px-4 py-2 rounded-xl border border-border text-sm text-text-primary hover:bg-primary-50 transition-colors">
            Back to Candidates
          </button>
        </Link>
      </div>
    );
  }

  return (
    <StudentLayout>
        <div className="max-w-7xl mx-auto">

          {/* Profile Header Card */}
          <div className="mb-6">
            <div className="relative h-64 rounded-2xl overflow-hidden mb-5 bg-gradient-to-br from-primary-500 to-primary-700">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {candidate.name.split(" ")[0][0]}{candidate.name.split(" ")[1]?.[0] || ""}
                  </span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent p-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-white text-base"
                  >
                    {candidate.name.split(" ")[0][0]}{candidate.name.split(" ")[1][0]}
                  </div>
                  <div>
                    <h2 className="font-bold text-text-primary">{candidate.name}</h2>
                    <p className="text-sm text-text-secondary">{candidate.position}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-6 pb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="success" className="text-[10px]">✓ Verified Profile</Badge>
                  <Badge variant="neutral" className="text-[10px]">{candidate.id}</Badge>
                  <span className="text-xs text-text-secondary">{candidate.department} • {candidate.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/student/candidates">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Settings className="w-3.5 h-3.5" />
                      Back to Candidates
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* About Candidate Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-text-primary border-b border-border pb-3">
                About the Candidate
              </h2>
              <p className="text-text-secondary leading-relaxed">{candidate.biography}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Manifesto Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-text-primary border-b border-border pb-3">
                    Manifesto
                    <Badge variant="neutral" className="text-[10px] ml-2">Manifesto</Badge>
                  </h2>
                </div>

                <div className="prose mt-4">
                  {candidate.manifestos.map((section, index) => (
                    <div key={index} className="mb-5 p-4 bg-primary-50 rounded-xl">
                      <h3 className="font-medium text-primary-400 mb-2">{section.title}</h3>
                      <p className="text-text-secondary">{section.content}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => document.querySelector('.prose')?.scrollIntoView({ behavior: 'smooth' })}>
                    <FileText className="w-3.5 h-3.5" />View Full Manifesto
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => {
                    const text = candidate.manifestos.map(s => `${s.title}\n\n${s.content}`).join('\n\n---\n\n');
                    const blob = new Blob([`${candidate.name} - Manifesto\n\n${text}`], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${candidate.name.replace(/\s+/g, '_')}_manifesto.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}>
                    <Download className="w-3.5 h-3.5" />Download Manifesto
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="p-5">
                <h3 className="font-bold text-text-primary mb-4 border-b border-border pb-3">Candidate Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Candidate ID</span><span className="font-medium text-text-primary font-mono">{candidate.id}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Position</span><span className="font-medium text-text-primary">{candidate.position}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Department</span><span className="font-medium text-text-primary">{candidate.department}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Year</span><span className="font-medium text-text-primary">{candidate.year}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Election</span><span className="font-medium text-text-primary">Student Council Election 2026</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Profile Status</span><Badge variant={candidate.verified ? "success" : "warning"} className="text-[10px]">{candidate.verified ? "Verified" : "Pending"}</Badge></div>
                </div>
              </Card>

              <Card className="p-5 text-center">
                <h3 className="font-bold text-text-primary mb-3 border-b border-border pb-3">Campaign Symbol</h3>
                <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center mx-auto text-3xl">{candidate.campaignSymbol}</div>
                <p className="text-xs text-text-secondary mt-2">Unique campaign identifier</p>
              </Card>

              <div className="space-y-2">
                <Button variant="secondary" className="w-full gap-2" onClick={() => router.push(`/student/candidates/compare?ids=${candidate.id}`)}><Scale className="w-4 h-4" />Compare</Button>
                <Button variant="primary" className="w-full gap-2" onClick={() => router.push('/student/vote')}><CheckCircle2 className="w-4 h-4" />Select for Voting</Button>
                <Link href="/student/candidates"><Button variant="ghost" className="w-full gap-2 justify-center"><Settings className="w-4 h-4" />Back to Candidates</Button></Link>
              </div>
            </div>
          </div>
        </div>
      </StudentLayout>
  );
}