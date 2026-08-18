"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  FAQ_ITEMS,
  HELP_TOPICS,
  SYSTEM_STATUS,
  TROUBLESHOOTING,
} from "@/lib/help-data";
import {
  Search,
  X,
  Vote,
  LogIn,
  FileText,
  AlertCircle,
  ChevronDown,
  HelpCircle,
  Mail,
  Phone,
  Wrench,
  MessageSquare,
} from "lucide-react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const [openTroubleshooting, setOpenTroubleshooting] = useState<number | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lower = searchQuery.toLowerCase();
    const results: { title: string; description: string; category: string }[] = [];
    HELP_TOPICS.forEach((t) => {
      if (t.title.toLowerCase().includes(lower) || t.content.toLowerCase().includes(lower)) {
        results.push({ title: t.title, description: t.description, category: "Topic" });
      }
    });
    FAQ_ITEMS.forEach((f) => {
      if (f.question.toLowerCase().includes(lower) || f.answer.toLowerCase().includes(lower)) {
        results.push({ title: f.question, description: f.answer, category: "FAQ" });
      }
    });
    return results;
  }, [searchQuery]);

  return (
    <StudentLayout>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-text-primary">Help & Support</h1>
                  <Badge variant="success" className="text-[10px]">Support Available</Badge>
                </div>
                <p className="text-sm text-text-secondary">
                  Find answers, report issues, and get help with CampusVote.
                </p>
              </div>
              <Link href="/student/help/requests">
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  My Requests
                </Button>
              </Link>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                placeholder="How can we help?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div>
                <p className="text-sm text-text-secondary mb-3">
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
                </p>
                {searchResults.length === 0 ? (
                  <Card className="p-6 text-center border-border">
                    <p className="text-sm text-text-secondary mb-3">No help articles found.</p>
                    <Button variant="secondary" size="sm" onClick={() => setSearchQuery("")}>
                      Clear Search
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((r, i) => (
                      <Card key={i} className="p-4 border-border">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-text-primary">{r.title}</h4>
                              <Badge variant="neutral" className="text-[10px]">{r.category}</Badge>
                            </div>
                            <p className="text-xs text-text-secondary line-clamp-2">{r.description}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Help Cards */}
            {!searchQuery && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Vote, title: "Voting Help", desc: "Learn how to cast and submit your vote.", href: "#how-to-vote" },
                  { icon: LogIn, title: "Login & Account", desc: "Troubleshoot sign-in and account issues.", href: "#login-issue" },
                  { icon: FileText, title: "Vote Receipt", desc: "Learn how receipts and verification work.", href: "#find-receipt" },
                  { icon: AlertCircle, title: "Technical Issue", desc: "Report a problem with CampusVote.", href: "/student/help/report" },
                ].map((card) => (
                  <Card key={card.title} className="p-5 border-border hover:border-primary-200 transition-colors">
                    <card.icon className="w-6 h-6 text-primary-400 mb-3" />
                    <h3 className="text-sm font-semibold text-text-primary mb-1">{card.title}</h3>
                    <p className="text-xs text-text-secondary mb-3">{card.desc}</p>
                    {card.href.startsWith("#") ? (
                      <button
                        onClick={() => {
                          const id = card.href.slice(1);
                          setOpenTopic(id);
                          document.getElementById("common-topics")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="text-xs font-medium text-primary-600 hover:text-primary-700"
                      >
                        View &rarr;
                      </button>
                    ) : (
                      <Link href={card.href} className="text-xs font-medium text-primary-600 hover:text-primary-700">
                        Report Issue &rarr;
                      </Link>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* Common Topics */}
            {!searchQuery && (
              <section id="common-topics">
                <Card className="p-5 border-border">
                  <h2 className="text-lg font-bold text-text-primary mb-4">Common Help Topics</h2>
                  <div className="space-y-2">
                    {HELP_TOPICS.map((topic) => (
                      <div key={topic.id} className="border border-border rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenTopic(openTopic === topic.id ? null : topic.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-primary-50/50 transition-colors"
                        >
                          <span className="text-sm font-medium text-text-primary pr-4">{topic.title}</span>
                          <ChevronDown className={`w-4 h-4 text-text-secondary shrink-0 transition-transform ${openTopic === topic.id ? "rotate-180" : ""}`} />
                        </button>
                        {openTopic === topic.id && (
                          <div className="px-4 pb-4">
                            <p className="text-sm text-text-secondary leading-relaxed">{topic.content}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </section>
            )}

            {/* FAQ */}
            {!searchQuery && (
              <section>
                <Card className="p-5 border-border">
                  <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary-400" />
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-2">
                    {FAQ_ITEMS.map((faq, i) => (
                      <div key={i} className="border border-border rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-primary-50/50 transition-colors"
                        >
                          <span className="text-sm font-medium text-text-primary pr-4">{faq.question}</span>
                          <ChevronDown className={`w-4 h-4 text-text-secondary shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                        </button>
                        {openFaq === i && (
                          <div className="px-4 pb-4">
                            <p className="text-sm text-text-secondary leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </section>
            )}

            {/* Troubleshooting */}
            {!searchQuery && (
              <section>
                <Card className="p-5 border-border">
                  <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-primary-400" />
                    Quick Troubleshooting
                  </h2>
                  <div className="space-y-2">
                    {TROUBLESHOOTING.map((item, i) => (
                      <div key={i} className="border border-border rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenTroubleshooting(openTroubleshooting === i ? null : i)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-primary-50/50 transition-colors"
                        >
                          <span className="text-sm font-medium text-text-primary pr-4">{item.problem}</span>
                          <ChevronDown className={`w-4 h-4 text-text-secondary shrink-0 transition-transform ${openTroubleshooting === i ? "rotate-180" : ""}`} />
                        </button>
                        {openTroubleshooting === i && (
                          <div className="px-4 pb-4">
                            <ol className="space-y-2">
                              {item.steps.map((step, si) => (
                                <li key={si} className="flex items-start gap-2 text-sm text-text-secondary">
                                  <span className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-700 shrink-0 mt-0.5">
                                    {si + 1}
                                  </span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </section>
            )}

            {/* Report Issue */}
            {!searchQuery && (
              <section>
                <Card className="p-5 border-primary-100 bg-primary-50">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-primary-700 mb-1">Having a Problem?</h3>
                      <p className="text-xs text-primary-600/80 mb-3">
                        Tell us what went wrong and the election support team can review the issue.
                      </p>
                      <Link href="/student/help/report">
                        <Button variant="primary" size="sm" className="gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Report an Issue
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </section>
            )}

            {/* System Status + Contact */}
            {!searchQuery && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* System Status */}
                <Card className="p-5 border-border">
                  <h3 className="text-sm font-semibold text-text-primary mb-3">System Status</h3>
                  <div className="space-y-2">
                    {SYSTEM_STATUS.map((s) => (
                      <div key={s.name} className="flex items-center justify-between p-2 rounded-lg bg-primary-50/50">
                        <span className="text-xs text-text-secondary">{s.name}</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-success" />
                          <span className="text-[10px] font-medium text-success">Operational</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-text-secondary mt-2">Demo status</p>
                </Card>

                {/* Contact Admin */}
                <Card className="p-5 border-border">
                  <h3 className="text-sm font-semibold text-text-primary mb-2">Election Administration</h3>
                  <p className="text-xs text-text-secondary mb-4">
                    For election-related questions or issues that cannot be resolved through Help & Support.
                  </p>
                  <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => setShowContactModal(true)}>
                    <Mail className="w-3.5 h-3.5" />
                    Contact Administration
                  </Button>
                </Card>
              </div>
            )}
          </div>
        </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowContactModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-semibold text-text-primary">Election Administration</h3>
            <p className="text-xs text-text-secondary">Mock contact details for demonstration purposes.</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50">
                <Mail className="w-4 h-4 text-primary-600" />
                <div>
                  <p className="text-[10px] text-text-secondary uppercase">Email</p>
                  <p className="text-sm text-text-primary">election-admin@example.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50">
                <Phone className="w-4 h-4 text-primary-600" />
                <div>
                  <p className="text-[10px] text-text-secondary uppercase">Phone</p>
                  <p className="text-sm text-text-primary">+91 XXXXX XXXXX</p>
                </div>
              </div>
            </div>
            <Button variant="primary" size="sm" className="w-full" onClick={() => setShowContactModal(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}
