"use client";

// Support/help data types and constants for CampusVote
// This file contains UI types and mappings - API calls go through api-client

export type SupportStatus = "open" | "in_review" | "waiting" | "resolved" | "closed";

export interface SupportRequest {
  id: number;
  category: string;
  status: SupportStatus;
  created_at: string;
  description: string;
  receipt_id?: string;
  response?: string;
  admin_notes?: string;
  priority?: string;
  updated_at?: string;
  subject?: string;
}

export interface TimelineEvent {
  date: string;
  description: string;
}

// Backend API categories (use these when submitting to backend)
export const API_CATEGORIES = [
  { value: "login", label: "Login Problem" },
  { value: "voting", label: "Voting Problem" },
  { value: "candidate_info", label: "Candidate Information" },
  { value: "receipt", label: "Vote Receipt" },
  { value: "technical", label: "Technical Error" },
  { value: "account", label: "Account Problem" },
  { value: "other", label: "Other" },
] as const;

// UI-friendly category labels (display only)
export const CATEGORY_LABELS: Record<string, string> = {
  login: "Login Problem",
  voting: "Voting Problem",
  candidate_info: "Candidate Information",
  receipt: "Vote Receipt",
  technical: "Technical Error",
  account: "Account Problem",
  other: "Other",
};

// Map friendly label to API value
export function categoryToApiValue(label: string): string {
  const found = API_CATEGORIES.find(c => c.label === label);
  return found ? found.value : "other";
}

// Map API value to friendly label
export function apiValueToCategory(value: string): string {
  return CATEGORY_LABELS[value] || value;
}

// Status display mapping
export const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_review: "In Review",
  waiting: "Waiting for Response",
  resolved: "Resolved",
  closed: "Closed",
};

// Mock data - UI presentation constants only (NOT business data)
export const MOCK_SUPPORT_REQUESTS: SupportRequest[] = [];

export const ISSUE_CATEGORIES = [
  "Login Problem",
  "Voting Problem",
  "Candidate Information",
  "Vote Receipt",
  "Technical Error",
  "Account Problem",
  "Other",
];

// Help topics (UI-only)
export const HELP_TOPICS = [
  { id: "login", title: "Login & Account", content: "Get help with logging in and managing your account.", description: "Get help with logging in and managing your account.", icon: "User" },
  { id: "voting", title: "Voting Process", content: "Learn how to cast your vote and understand the process.", description: "Learn how to cast your vote and understand the process.", icon: "CheckSquare" },
  { id: "receipt", title: "Vote Receipt", content: "How to verify and understand your vote receipt.", description: "How to verify and understand your vote receipt.", icon: "FileText" },
  { id: "technical", title: "Technical Issues", content: "Troubleshoot technical problems with the voting system.", description: "Troubleshoot technical problems with the voting system.", icon: "AlertTriangle" },
  { id: "candidates", title: "Candidates", content: "Learn about candidates and their manifestos.", description: "Learn about candidates and their manifestos.", icon: "Users" },
  { id: "results", title: "Results", content: "How to view and understand election results.", description: "How to view and understand election results.", icon: "BarChart" },
];

// System status (UI-only constants)
export const SYSTEM_STATUS = [
  { name: "Voting System", status: "operational" },
  { name: "Database", status: "operational" },
  { name: "Notifications", status: "operational" },
];

// Troubleshooting steps (UI-only data)
export const TROUBLESHOOTING = [
  {
    problem: "Login isn't working",
    steps: [
      "Check your email/student credentials.",
      "Check your internet connection.",
      "Try refreshing the page.",
      "Try signing in again.",
      "Contact support if the issue continues.",
    ],
  },
  {
    problem: "Voting page isn't loading",
    steps: [
      "Refresh the page.",
      "Check your internet connection.",
      "Sign out and sign in again.",
      "Try another supported browser.",
      "Contact support.",
    ],
  },
  {
    problem: "Receipt isn't showing",
    steps: [
      "Refresh the receipt page.",
      "Check My Receipts.",
      "Wait briefly if the receipt is still generating.",
      "Submit a support request if the issue continues.",
    ],
  },
];

// FAQ items (UI-only constants)
export const FAQ_ITEMS = [
  {
    question: "How do I vote?",
    answer: "Log in and navigate to the election page during the voting period.",
  },
  {
    question: "Can I change my vote?",
    answer: "No, once submitted your vote is final.",
  },
  {
    question: "How do I get a receipt?",
    answer: "A receipt is automatically generated after voting.",
  },
];
