"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

import {
  Bell,
  Palette,
  Globe,
  Shield,
  LogOut,
  Trash2,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type SettingsTab = "notifications" | "appearance" | "language" | "security" | "account";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("notifications");
  const [notifications, setNotifications] = useState({
    electionReminders: true,
    voteConfirmation: true,
    resultsPublished: true,
    systemAnnouncements: true,
    helpSupportUpdates: true,
  });
  const [appearance, setAppearance] = useState<"system" | "light" | "dark">("system");
  const [language, setLanguage] = useState("en");
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSignOut = () => {
    setShowSignOutModal(false);
    router.push("/login");
  };

  const SETTINGS_TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "language", label: "Language", icon: Globe },
    { id: "security", label: "Security", icon: Shield },
    { id: "account", label: "Account", icon: LogOut },
  ];

  return (
    <>
    <StudentLayout>
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
              <p className="text-sm text-text-secondary">
                Manage your CampusVote preferences and account settings.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Settings Navigation */}
              <div className="lg:w-48 shrink-0">
                <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
                  {SETTINGS_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary-50 text-primary-700"
                          : "text-text-secondary hover:bg-primary-50 hover:text-primary-700"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings Content */}
              <div className="flex-1 min-w-0 space-y-6">
                {/* Notifications */}
                {activeTab === "notifications" && (
                  <Card className="p-5 border-border">
                    <h2 className="text-lg font-bold text-text-primary mb-4">Notifications</h2>
                    <div className="space-y-4">
                      {([
                        { key: "electionReminders" as const, label: "Election reminders", desc: "Receive reminders about upcoming election deadlines." },
                        { key: "voteConfirmation" as const, label: "Vote confirmation", desc: "Receive confirmation after your ballot is successfully recorded." },
                        { key: "resultsPublished" as const, label: "Results published", desc: "Get notified when official election results are published." },
                        { key: "systemAnnouncements" as const, label: "System announcements", desc: "Receive important system updates and maintenance notices." },
                        { key: "helpSupportUpdates" as const, label: "Help & Support updates", desc: "Get notified about help request responses." },
                      ]).map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-primary-50/50">
                          <div>
                            <p className="text-sm font-medium text-text-primary">{item.label}</p>
                            <p className="text-xs text-text-secondary">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => toggleNotification(item.key)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${
                              notifications[item.key] ? "bg-primary-600" : "bg-border"
                            }`}
                            role="switch"
                            aria-checked={notifications[item.key]}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                                notifications[item.key] ? "translate-x-5" : ""
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Appearance */}
                {activeTab === "appearance" && (
                  <Card className="p-5 border-border">
                    <h2 className="text-lg font-bold text-text-primary mb-4">Appearance</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {([
                        { id: "system" as const, label: "System Default", icon: Monitor },
                        { id: "light" as const, label: "Light", icon: Sun },
                        { id: "dark" as const, label: "Dark", icon: Moon },
                      ]).map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setAppearance(option.id)}
                          className={`p-4 rounded-xl border-2 text-center transition-colors ${
                            appearance === option.id
                              ? "border-primary-600 bg-primary-50"
                              : "border-border hover:border-primary-200"
                          }`}
                        >
                          <option.icon className={`w-6 h-6 mx-auto mb-2 ${appearance === option.id ? "text-primary-600" : "text-text-secondary"}`} />
                          <span className={`text-sm font-medium ${appearance === option.id ? "text-primary-700" : "text-text-primary"}`}>
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Language */}
                {activeTab === "language" && (
                  <Card className="p-5 border-border">
                    <h2 className="text-lg font-bold text-text-primary mb-4">Language</h2>
                    <div className="space-y-3">
                      {[
                        { id: "en", label: "English" },
                        { id: "hi", label: "Hindi" },
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => setLanguage(lang.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-colors ${
                            language === lang.id
                              ? "border-primary-600 bg-primary-50"
                              : "border-border hover:border-primary-200"
                          }`}
                        >
                          <span className="text-sm font-medium text-text-primary">{lang.label}</span>
                          {language === lang.id && <CheckCircle2 className="w-5 h-5 text-primary-600" />}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-text-secondary mt-3">
                      Language preferences will apply across the CampusVote interface.
                    </p>
                  </Card>
                )}

                {/* Security */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <Card className="p-5 border-border">
                      <h2 className="text-lg font-bold text-text-primary mb-4">Security Summary</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { label: "Password", value: "Protected", status: "success" },
                          { label: "Two-Factor Auth", value: "Not Enabled", status: "warning" },
                          { label: "Account Status", value: "Active", status: "success" },
                          { label: "Election Eligibility", value: "Eligible", status: "success" },
                        ].map((item) => (
                          <div key={item.label} className="p-3 rounded-xl bg-primary-50/50">
                            <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">{item.label}</p>
                            <Badge variant={item.status as "success" | "warning"} className="text-[10px]">{item.value}</Badge>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Link href="/student/settings/security">
                      <Card className="p-4 border-border hover:border-primary-200 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-primary-600" />
                            <div>
                              <p className="text-sm font-medium text-text-primary">Security Settings</p>
                              <p className="text-xs text-text-secondary">Manage password, 2FA, and sessions</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-text-secondary" />
                        </div>
                      </Card>
                    </Link>
                  </div>
                )}

                {/* Account */}
                {activeTab === "account" && (
                  <div className="space-y-6">
                    <Card className="p-5 border-border">
                      <h2 className="text-lg font-bold text-text-primary mb-4">Account</h2>
                      <div className="space-y-4">
                        <button
                          onClick={() => setShowSignOutModal(true)}
                          className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-primary-50 transition-colors text-left"
                        >
                          <LogOut className="w-5 h-5 text-error" />
                          <div>
                            <p className="text-sm font-medium text-text-primary">Sign Out</p>
                            <p className="text-xs text-text-secondary">Sign out of your CampusVote account</p>
                          </div>
                        </button>

                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="w-full flex items-center gap-3 p-4 rounded-xl border border-error/20 hover:bg-error-50 transition-colors text-left"
                        >
                          <Trash2 className="w-5 h-5 text-error" />
                          <div>
                            <p className="text-sm font-medium text-error">Request Account Deletion</p>
                            <p className="text-xs text-text-secondary">Account deletion may be restricted by college administration</p>
                          </div>
                        </button>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
    </StudentLayout>

    {/* Sign Out Modal */}
    {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSignOutModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-error-50 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-error" />
              </div>
              <h3 className="font-semibold text-text-primary">Sign Out?</h3>
            </div>
            <p className="text-sm text-text-secondary">
              You will need to sign in again to access CampusVote.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="md" className="flex-1" onClick={() => setShowSignOutModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="md" className="flex-1" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
    )}

    {/* Delete Account Modal */}
    {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <h3 className="font-semibold text-text-primary">Request Account Deletion?</h3>
            </div>
            <p className="text-sm text-text-secondary">
              Your institution may need to review account deletion requests. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="md" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="md" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                Request Deletion
              </Button>
            </div>
          </div>
        </div>
    )}
    </>
  );
}