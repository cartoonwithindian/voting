"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ELECTION_INFO,
  GUIDELINE_SECTIONS,
  VOTING_RULES,
  VOTING_STEPS,
  AFTER_VOTING_STEPS,
  TIMELINE_EVENTS,
  FAQ_ITEMS,
} from "@/lib/guidelines-data";
import {
  Search,
  X,
  Check,
  ChevronDown,
  Calendar,
  Clock,
  Users,
  Globe,
  Vote,
  FileText,
  Download,
  Printer,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Info,
  Lock,
  Star,
} from "lucide-react";

const NAV_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "eligibility", label: "Eligibility" },
  { id: "how-to-vote", label: "How to Vote" },
  { id: "voting-rules", label: "Voting Rules" },
  { id: "privacy", label: "Vote Privacy" },
  { id: "receipt", label: "Receipt" },
  { id: "dates", label: "Important Dates" },
  { id: "candidates", label: "Candidates" },
  { id: "neutrality", label: "Neutrality" },
  { id: "after-voting", label: "After Voting" },
  { id: "faq", label: "FAQs" },
];

export default function GuidelinesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_ITEMS;
    const lower = searchQuery.toLowerCase();
    return FAQ_ITEMS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(lower) ||
        faq.answer.toLowerCase().includes(lower)
    );
  }, [searchQuery]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return GUIDELINE_SECTIONS;
    const lower = searchQuery.toLowerCase();
    return GUIDELINE_SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(lower) ||
        s.content.toLowerCase().includes(lower)
    );
  }, [searchQuery]);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const lines = [
      "CAMPUSVOTE",
      "Student Council Election 2026",
      "Election Guidelines",
      "",
      "=".repeat(40),
      "",
    ];
    GUIDELINE_SECTIONS.forEach((s) => {
      lines.push(s.title.toUpperCase());
      lines.push(s.content);
      lines.push("");
    });
    lines.push("VOTING RULES");
    VOTING_RULES.forEach((r, i) => lines.push(`${i + 1}. ${r}`));
    lines.push("");
    lines.push("IMPORTANT DATES");
    TIMELINE_EVENTS.forEach((e) =>
      lines.push(`${e.label}: ${e.date}${e.time ? " • " + e.time : ""}`)
    );
    lines.push("");
    lines.push("FAQs");
    FAQ_ITEMS.forEach((f) => {
      lines.push(`Q: ${f.question}`);
      lines.push(`A: ${f.answer}`);
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CampusVote-Election-Guidelines-2026.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <StudentLayout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:p-8">
            <div className="flex gap-8 py-6">
              {/* Desktop TOC Sidebar */}
              <aside className="hidden lg:block w-56 shrink-0">
                <div className="sticky top-6 space-y-1">
                  <h3 className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-3 px-3">
                    Sections
                  </h3>
                  {NAV_SECTIONS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveSection(s.id);
                        document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        activeSection === s.id
                          ? "bg-primary-50 text-primary-700"
                          : "text-text-secondary hover:bg-primary-50 hover:text-primary-700"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1 min-w-0 space-y-8">
                {/* Header */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant="info" className="text-[10px]">
                      Student Council Election 2026
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="text-xs font-medium text-success">Voting Open</span>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-text-primary mb-1">
                    Election Guidelines
                  </h1>
                  <p className="text-sm text-text-secondary">
                    Everything you need to know before participating in the Student Council Election 2026.
                  </p>
                </div>

                {/* Mobile Nav + Search + Actions */}
                <div className="flex flex-wrap gap-3 items-center">
                  {/* Mobile section dropdown */}
                  <div className="lg:hidden relative">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setMobileNavOpen(!mobileNavOpen)}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Browse Sections
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                    {mobileNavOpen && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-20 py-1 w-48">
                        {NAV_SECTIONS.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setActiveSection(s.id);
                              setMobileNavOpen(false);
                              document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-primary-50 hover:text-primary-700"
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search election guidelines..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={handlePrint}>
                    <Printer className="w-3.5 h-3.5" />
                    Print / PDF
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleDownload}>
                    <Download className="w-3.5 h-3.5" />
                    Download TXT
                  </Button>
                </div>

                {/* Election at a Glance */}
                <Card className="p-5 border-border" id="overview">
                  <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary-400" />
                    Election at a Glance
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[
                      { icon: Vote, label: "Election", value: ELECTION_INFO.name },
                      { icon: Calendar, label: "Voting Date", value: ELECTION_INFO.votingDate },
                      { icon: Clock, label: "Voting Time", value: ELECTION_INFO.votingTime },
                      { icon: Users, label: "Eligible Voters", value: ELECTION_INFO.eligibleVoters },
                      { icon: Globe, label: "Voting Method", value: ELECTION_INFO.votingMethod },
                    ].map((item) => (
                      <div key={item.label} className="text-center p-3 rounded-xl bg-primary-50/50">
                        <item.icon className="w-5 h-5 text-primary-400 mx-auto mb-1.5" />
                        <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-0.5">
                          {item.label}
                        </p>
                        <p className="text-xs font-medium text-text-primary">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Search Results */}
                {searchQuery && (
                  <div>
                    <p className="text-sm text-text-secondary mb-3">
                      {filteredSections.length + filteredFaqs.length} results found
                    </p>
                    {filteredSections.length === 0 && filteredFaqs.length === 0 && (
                      <Card className="p-6 text-center border-border">
                        <p className="text-sm text-text-secondary mb-3">No matching guidelines found.</p>
                        <Button variant="secondary" size="sm" onClick={() => setSearchQuery("")}>
                          Clear Search
                        </Button>
                      </Card>
                    )}
                  </div>
                )}

                {/* Overview */}
                <section id="overview-section">
                  <Card className="p-5 border-border">
                    <h2 className="text-lg font-bold text-text-primary mb-3">Election Overview</h2>
                    <p className="text-sm text-text-secondary leading-relaxed mb-4">
                      {GUIDELINE_SECTIONS.find((s) => s.id === "overview")?.content}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        "Review candidate profiles and manifestos",
                        "Compare candidates side-by-side",
                        "Select one candidate per position",
                        "Abstain from any position",
                        "Review your ballot before submitting",
                        "Receive a receipt after submission",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </Card>
                </section>

                {/* Eligibility */}
                <section id="eligibility">
                  <Card className="p-5 border-border">
                    <h2 className="text-lg font-bold text-text-primary mb-4">Who Can Vote?</h2>
                    <div className="space-y-2 mb-5">
                      {[
                        "Registered student",
                        "Active student account",
                        "Eligible for the current election",
                        "Has not already submitted a ballot",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm text-text-primary">{item}</span>
                        </div>
                      ))}
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary mb-3">Who Cannot Vote?</h3>
                    <div className="space-y-2">
                      {[
                        "Students whose accounts are not eligible for this election",
                        "Students who have already submitted their ballot",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-error-50 flex items-center justify-center">
                            <X className="w-3 h-3 text-error" />
                          </div>
                          <span className="text-sm text-text-secondary">{item}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </section>

                {/* How to Vote */}
                <section id="how-to-vote">
                  <Card className="p-5 border-border">
                    <h2 className="text-lg font-bold text-text-primary mb-4">How to Vote</h2>
                    <div className="space-y-4">
                      {VOTING_STEPS.map((s) => (
                        <div key={s.step} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {s.step}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-text-primary">{s.title}</h4>
                            <p className="text-xs text-text-secondary">{s.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </section>

                {/* Voting Rules */}
                <section id="voting-rules">
                  <Card className="p-5 border-border">
                    <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      Important Voting Rules
                    </h2>
                    <div className="space-y-2">
                      {VOTING_RULES.map((rule, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-xl bg-primary-50/50"
                        >
                          <span className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-700 shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-sm text-text-primary">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </section>

                {/* Privacy */}
                <section id="privacy">
                  <Card className="p-5 border-primary-100 bg-primary-50">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                        <Lock className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-primary-700">Your Vote Is Private</h2>
                        <p className="text-sm text-primary-600/80 leading-relaxed mt-1">
                          Your candidate selections are treated as confidential ballot information. The vote receipt
                          confirms that a ballot was recorded but does not display your candidate selections.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <div className="p-3 rounded-xl bg-white/60">
                        <h4 className="text-xs font-semibold text-primary-700 mb-1">Do not share</h4>
                        <ul className="text-xs text-primary-600/80 space-y-1">
                          <li>Your password</li>
                          <li>Your student account</li>
                          <li>Receipt information unnecessarily</li>
                        </ul>
                      </div>
                      <div className="p-3 rounded-xl bg-white/60">
                        <h4 className="text-xs font-semibold text-primary-700 mb-1">What we protect</h4>
                        <ul className="text-xs text-primary-600/80 space-y-1">
                          <li>Your candidate selections</li>
                          <li>Your voting identity</li>
                          <li>Ballot contents</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </section>

                {/* Receipt */}
                <section id="receipt">
                  <Card className="p-5 border-border">
                    <h2 className="text-lg font-bold text-text-primary mb-3">
                      Understanding Your Vote Receipt
                    </h2>
                    <p className="text-sm text-text-secondary mb-4">
                      After submitting your vote, CampusVote provides a receipt.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl bg-success-50 border border-success/20">
                        <h4 className="text-xs font-semibold text-success mb-2">Receipt contains</h4>
                        <ul className="text-xs text-text-secondary space-y-1">
                          <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-success" /> Receipt ID</li>
                          <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-success" /> Election name</li>
                          <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-success" /> Submission status</li>
                          <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-success" /> Date and time</li>
                          <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-success" /> Verification info</li>
                        </ul>
                      </div>
                      <div className="p-3 rounded-xl bg-error-50 border border-error/20">
                        <h4 className="text-xs font-semibold text-error mb-2">Receipt does NOT contain</h4>
                        <ul className="text-xs text-text-secondary space-y-1">
                          <li className="flex items-center gap-1.5"><X className="w-3 h-3 text-error" /> Candidate selections</li>
                          <li className="flex items-center gap-1.5"><X className="w-3 h-3 text-error" /> Selected candidate names</li>
                          <li className="flex items-center gap-1.5"><X className="w-3 h-3 text-error" /> Ballot contents</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link href="/student/receipt">
                        <Button variant="secondary" size="sm" className="gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          View My Receipt
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </section>

                {/* Important Dates */}
                <section id="dates">
                  <Card className="p-5 border-border">
                    <h2 className="text-lg font-bold text-text-primary mb-4">Important Dates</h2>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                      <div className="space-y-4">
                        {TIMELINE_EVENTS.map((event, i) => (
                          <div key={i} className="flex items-start gap-4 relative">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                                event.isCurrent
                                  ? "bg-primary-600 text-white"
                                  : "bg-white border-2 border-border text-text-secondary"
                              }`}
                            >
                              {event.isCurrent ? (
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="flex-1 pb-2">
                              <div className="flex items-center gap-2">
                                <h4 className={`text-sm font-semibold ${event.isCurrent ? "text-primary-600" : "text-text-primary"}`}>
                                  {event.label}
                                </h4>
                                {event.isCurrent && (
                                  <Badge variant="success" className="text-[10px]">Current</Badge>
                                )}
                              </div>
                              <p className="text-xs text-text-secondary">
                                {event.date}
                                {event.time && ` • ${event.time}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </section>

                {/* Candidates */}
                <section id="candidates">
                  <Card className="p-5 border-border">
                    <h2 className="text-lg font-bold text-text-primary mb-3">Candidate Information</h2>
                    <p className="text-sm text-text-secondary mb-4">
                      Candidates are reviewed and published by election administration. Students can view profiles, read
                      biographies and manifestos, and compare factual information.
                    </p>
                    <div className="p-3 rounded-xl bg-primary-50 mb-4">
                      <p className="text-xs text-primary-700 font-medium">
                        CampusVote does not recommend or rank candidates. All candidates receive equal visual treatment.
                      </p>
                    </div>
                    <Link href="/student/candidates">
                      <Button variant="secondary" size="sm" className="gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        View Candidates
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </Card>
                </section>

                {/* Neutrality */}
                <section id="neutrality">
                  <Card className="p-5 border-border">
                    <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary-400" />
                      Neutral Election Platform
                    </h2>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      CampusVote provides the tools needed to participate in the election without recommending or promoting
                      individual candidates. Candidate profiles receive equal visual treatment. No candidate popularity
                      rankings are displayed. No candidate recommendations are provided.
                    </p>
                  </Card>
                </section>

                {/* After Voting */}
                <section id="after-voting">
                  <Card className="p-5 border-border">
                    <h2 className="text-lg font-bold text-text-primary mb-4">What Happens After You Vote?</h2>
                    <div className="space-y-4">
                      {AFTER_VOTING_STEPS.map((s) => (
                        <div key={s.step} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold shrink-0">
                            {s.step}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-text-primary">{s.title}</h4>
                            <p className="text-xs text-text-secondary">{s.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </section>

                {/* FAQ */}
                <section id="faq">
                  <Card className="p-5 border-border">
                    <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-primary-400" />
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-2">
                      {filteredFaqs.map((faq, i) => (
                        <div key={i} className="border border-border rounded-xl overflow-hidden">
                          <button
                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-primary-50/50 transition-colors"
                          >
                            <span className="text-sm font-medium text-text-primary pr-4">
                              {faq.question}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-text-secondary shrink-0 transition-transform ${
                                openFaq === i ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {openFaq === i && (
                            <div className="px-4 pb-4">
                              <p className="text-sm text-text-secondary leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                </section>

                {/* Help */}
                <section>
                  <Card className="p-5 border-primary-100 bg-primary-50">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-primary-700 mb-1">Need Help?</h3>
                        <p className="text-xs text-primary-600/80 mb-3">
                          If you experience a technical issue while voting, contact Election Administration through
                          the Help & Support section.
                        </p>
                        <div className="flex gap-2">
                          <Link href="/student/help">
                            <Button variant="secondary" size="sm" className="gap-1.5">
                              Help & Support
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                </section>
              </div>
            </div>
          </div>
    </StudentLayout>
  );
}
