"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Lock, Clock, ArrowLeft, CalendarX } from "lucide-react";

export function VotingClosedState() {
  return (
    <div className="flex h-screen bg-[#F7F8FC] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onToggleMenu={() => {}} studentName="Anurag Gupta" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <Card className="max-w-md mx-auto p-8 text-center border-border">
            <div className="w-16 h-16 rounded-2xl bg-border flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-text-secondary" />
            </div>
            <h1 className="text-xl font-bold text-text-primary mb-2">Voting Is Closed</h1>
            <p className="text-sm text-text-secondary mb-4">
              The voting period for this election has ended.
            </p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <CalendarX className="w-4 h-4 text-text-secondary" />
              <span className="text-sm text-text-secondary">10 August 2026 &bull; 5:00 PM</span>
            </div>
            <Link href="/student/dashboard">
              <Button variant="primary" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Return to Dashboard
              </Button>
            </Link>
          </Card>
        </main>
      </div>
    </div>
  );
}

export function NotEligibleState() {
  return (
    <div className="flex h-screen bg-[#F7F8FC] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onToggleMenu={() => {}} studentName="Anurag Gupta" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <Card className="max-w-md mx-auto p-8 text-center border-border">
            <div className="w-16 h-16 rounded-2xl bg-error-50 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-error" />
            </div>
            <h1 className="text-xl font-bold text-text-primary mb-2">
              You Are Not Eligible to Vote
            </h1>
            <p className="text-sm text-text-secondary mb-6">
              Your account is not currently eligible to participate in this election.
            </p>
            <Link href="/student/dashboard">
              <Button variant="primary" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Return to Dashboard
              </Button>
            </Link>
          </Card>
        </main>
      </div>
    </div>
  );
}

export function AlreadyVotedState() {
  return (
    <div className="flex h-screen bg-[#F7F8FC] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onToggleMenu={() => {}} studentName="Anurag Gupta" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <Card className="max-w-md mx-auto p-8 text-center border-border">
            <div className="w-16 h-16 rounded-2xl bg-success-50 flex items-center justify-center mx-auto mb-4">
              <Badge variant="success" className="w-8 h-8 rounded-full flex items-center justify-center text-lg">
                &#10003;
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-text-primary mb-2">Vote Already Submitted</h1>
            <p className="text-sm text-text-secondary mb-4">
              Your ballot for this election has already been submitted.
            </p>
            <Badge variant="success" className="mb-6">&#10003; Vote Recorded</Badge>
            <div className="flex flex-col gap-3">
              <Link href="/student/receipt">
                <Button variant="primary" className="w-full gap-2">
                  View Vote Receipt
                </Button>
              </Link>
              <Link href="/student/dashboard">
                <Button variant="ghost" className="w-full gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}

export function SessionExpiredState() {
  return (
    <div className="flex h-screen bg-[#F7F8FC] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onToggleMenu={() => {}} studentName="Anurag Gupta" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <Card className="max-w-md mx-auto p-8 text-center border-border">
            <div className="w-16 h-16 rounded-2xl bg-warning-50 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-warning" />
            </div>
            <h1 className="text-xl font-bold text-text-primary mb-2">Your Session Has Expired</h1>
            <p className="text-sm text-text-secondary mb-6">
              For your security, please sign in again.
            </p>
            <Link href="/login">
              <Button variant="primary" className="gap-2">
                Sign In Again
              </Button>
            </Link>
          </Card>
        </main>
      </div>
    </div>
  );
}
