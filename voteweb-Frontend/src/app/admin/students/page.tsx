"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Search, Eye, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { AdminLayout } from "@/components/admin-dashboard/AdminLayout";
import { api } from "@/lib/api-client";

interface AdminStudent {
  id: string;
  name: string;
  email: string;
  department: string;
  year: string;
  eligibility: "Eligible" | "Not Eligible" | "Pending Verification";
  votingStatus: "Not Voted" | "Voted";
  accountStatus: "Active" | "Suspended" | "Pending";
}

const DEPARTMENTS = ["All", "BCA", "BBA", "BSc IT"] as const;
const YEARS = ["All", "1st Year", "2nd Year", "3rd Year"] as const;
const ELIGIBILITIES = ["All", "Eligible", "Not Eligible", "Pending Verification"] as const;
const VOTING_STATUSES = ["All", "Not Voted", "Voted"] as const;

function getEligibilityBadgeVariant(eligibility: AdminStudent["eligibility"]) {
  switch (eligibility) {
    case "Eligible":
      return "success";
    case "Not Eligible":
      return "error";
    case "Pending Verification":
      return "warning";
  }
}

function getAccountBadgeVariant(status: AdminStudent["accountStatus"]) {
  switch (status) {
    case "Active":
      return "success";
    case "Suspended":
      return "error";
    case "Pending":
      return "warning";
  }
}

export default function StudentsPage() {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<string>("All");
  const [year, setYear] = useState<string>("All");
  const [eligibility, setEligibility] = useState<string>("All");
  const [votingStatus, setVotingStatus] = useState<string>("All");
  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminStudents();
      if (res.error) {
        setError(res.error);
        setStudents([]);
      } else {
        const data = res.data as Record<string, unknown>;
        let studentList: Array<Record<string, unknown>> = [];
        if ('data' in data && Array.isArray((data as { data: Array<Record<string, unknown>> }).data)) {
          studentList = (data as { data: Array<Record<string, unknown>> }).data;
        } else if (Array.isArray(data)) {
          studentList = data as unknown as Array<Record<string, unknown>>;
        }
        // Map to AdminStudent format
        setStudents(studentList.map((s: Record<string, unknown>) => ({
          id: String(s.id),
          name: String(s.name || ''),
          email: String(s.email || ''),
          department: s.department as string || "BCA",
          year: s.year as string || "1st Year",
          eligibility: (s.is_active ? "Eligible" : "Not Eligible") as AdminStudent["eligibility"],
          votingStatus: "Not Voted" as const,
          accountStatus: (s.is_active ? "Active" : "Suspended") as AdminStudent["accountStatus"],
        })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchStudents();
    };
    run();
  }, [fetchStudents]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.id.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (department !== "All" && s.department !== department) return false;
      if (year !== "All" && s.year !== year) return false;
      if (eligibility !== "All" && s.eligibility !== eligibility) return false;
      if (votingStatus !== "All" && s.votingStatus !== votingStatus) return false;
      return true;
    });
  }, [students, search, department, year, eligibility, votingStatus]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <ErrorState title="Failed to load students" message={error} onRetry={fetchStudents} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Student Management</h1>
          <p className="text-sm font-semibold text-text-secondary">View and manage student accounts.</p>
        </div>

        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search by ID or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm">
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm">
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={eligibility} onChange={(e) => setEligibility(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm">
              {ELIGIBILITIES.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <select value={votingStatus} onChange={(e) => setVotingStatus(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm">
              {VOTING_STATUSES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </Card>

        {filteredStudents.length === 0 ? (
          <EmptyState title="No students found" description="Try adjusting your filters." />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-secondary border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Department</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Eligibility</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Voting Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Account</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-bg-secondary/50">
                      <td className="px-4 py-3 text-sm text-text-secondary font-mono">{student.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-text-primary">{student.name}</div>
                        <div className="text-xs text-text-muted">{student.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">{student.department} · {student.year}</td>
                      <td className="px-4 py-3">
                        <Badge variant={getEligibilityBadgeVariant(student.eligibility) as "success" | "error" | "warning"}>
                          {student.eligibility}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm">
                          {student.votingStatus === "Voted" ? (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-text-muted" />
                          )}
                          {student.votingStatus}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getAccountBadgeVariant(student.accountStatus) as "success" | "error" | "warning"}>
                          {student.accountStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(student)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} title="Student Details">
          {selectedStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-xl font-bold text-primary">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedStudent.name}</h3>
                  <p className="text-sm text-text-muted">{selectedStudent.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-text-muted">ID:</span> {selectedStudent.id}</div>
                <div><span className="text-text-muted">Department:</span> {selectedStudent.department}</div>
                <div><span className="text-text-muted">Year:</span> {selectedStudent.year}</div>
                <div><span className="text-text-muted">Eligibility:</span> {selectedStudent.eligibility}</div>
                <div><span className="text-text-muted">Voting Status:</span> {selectedStudent.votingStatus}</div>
                <div><span className="text-text-muted">Account Status:</span> {selectedStudent.accountStatus}</div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
