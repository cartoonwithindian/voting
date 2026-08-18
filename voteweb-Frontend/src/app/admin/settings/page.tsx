"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin-dashboard/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Bell,
  Palette,
  Globe,
  Shield,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Key,
  Users,
} from "lucide-react";

type Tab = "election" | "notifications" | "security" | "appearance" | "account";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "election", label: "Election Settings", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "account", label: "Account", icon: Users },
];

const electionSettings = [
  { label: "Election Name", value: "Student Council Election 2026" },
  { label: "Election Year", value: "2026" },
  { label: "Institution", value: "National Institute of Technology" },
  { label: "Voting Method", value: "Online Ranked Choice" },
  { label: "Candidate Registration", value: "Feb 15 - Mar 10, 2026" },
  { label: "Voting Period", value: "Mar 15 - Mar 20, 2026" },
  { label: "Results Publication", value: "Mar 22, 2026" },
];

const notificationOptions = [
  {
    id: "candidates",
    label: "Candidate Applications",
    description: "Get notified when students submit new candidate applications",
    enabled: true,
  },
  {
    id: "support",
    label: "Support Issues",
    description: "Receive alerts for new student-reported support issues",
    enabled: true,
  },
  {
    id: "election",
    label: "Election Status",
    description: "Updates on election phase transitions and milestones",
    enabled: true,
  },
  {
    id: "announcements",
    label: "Announcements",
    description: "Notifications when new announcements are published",
    enabled: false,
  },
  {
    id: "system",
    label: "System Alerts",
    description: "Critical system alerts and maintenance notifications",
    enabled: true,
  },
];

const appearanceOptions = [
  { id: "system", label: "System Default", icon: Monitor },
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
];

const possibleRoles = [
  { id: "admin", label: "Election Administrator", description: "Full access to manage elections and administrators" },
  { id: "support", label: "Support Staff", description: "Can manage student issues and support tickets" },
  { id: "readonly", label: "Read Only", description: "View-only access to dashboard and reports" },
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("election");
  const [notifications, setNotifications] = useState(
    notificationOptions.map((n) => ({ ...n }))
  );
  const [selectedAppearance, setSelectedAppearance] = useState("system");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

  const handleSignOut = () => {
    setShowSignOutModal(false);
    router.push("/login");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary mt-1">
            Configure admin dashboard preferences.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tab Navigation */}
          <div className="lg:w-48 flex-shrink-0">
            <Card className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-primary-50 text-primary-700"
                        : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                    }`}
                  >
                    <tab.icon className="h-4 w-4 flex-shrink-0" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-w-0">
            {/* Election Settings */}
            {activeTab === "election" && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary-50">
                    <Globe className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      Election Settings
                    </h2>
                    <p className="text-sm text-text-secondary">
                      Read-only view of current election configuration
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {electionSettings.map((setting) => (
                    <div
                      key={setting.label}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <span className="text-sm text-text-secondary">
                        {setting.label}
                      </span>
                      <span className="text-sm font-medium text-text-primary">
                        {setting.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-primary-800">
                        Read-only settings
                      </p>
                      <p className="text-sm text-primary-600 mt-1">
                        Election settings can only be modified from the Election
                        Management page.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-warning-50">
                    <Bell className="h-5 w-5 text-warning-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      Notifications
                    </h2>
                    <p className="text-sm text-text-secondary">
                      Manage your notification preferences
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="flex items-center justify-between py-4 border-b border-border last:border-0"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-medium text-text-primary">
                          {notif.label}
                        </p>
                        <p className="text-sm text-text-secondary mt-0.5">
                          {notif.description}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleNotification(notif.id)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-ring ${
                          notif.enabled
                            ? "bg-primary-600"
                            : "bg-border"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            notif.enabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-success-50">
                      <Shield className="h-5 w-5 text-success-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-text-primary">
                        Security Summary
                      </h2>
                      <p className="text-sm text-text-secondary">
                        Current security status of your account
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-bg-tertiary rounded-xl">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-text-secondary" />
                        <div>
                          <p className="text-sm text-text-secondary">Password</p>
                          <p className="text-sm font-medium text-success-600 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Protected
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-bg-tertiary rounded-xl">
                      <div className="flex items-center gap-3">
                        <Key className="h-5 w-5 text-text-secondary" />
                        <div>
                          <p className="text-sm text-text-secondary">2FA</p>
                          <p className="text-sm font-medium text-warning-600 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            Not Enabled
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-bg-tertiary rounded-xl">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-text-secondary" />
                        <div>
                          <p className="text-sm text-text-secondary">
                            Active Sessions
                          </p>
                          <p className="text-sm font-medium text-text-primary">1</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-text-secondary" />
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            Change Password
                          </p>
                          <p className="text-sm text-text-secondary">
                            Update your account password
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Change
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <Key className="h-5 w-5 text-text-secondary" />
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            Two-Factor Authentication
                          </p>
                          <p className="text-sm text-text-secondary">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-ring ${
                          twoFactorEnabled
                            ? "bg-primary-600"
                            : "bg-border"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            twoFactorEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Appearance */}
            {activeTab === "appearance" && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary-50">
                    <Palette className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      Appearance
                    </h2>
                    <p className="text-sm text-text-secondary">
                      Customize the look and feel of your dashboard
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {appearanceOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedAppearance(option.id)}
                      className={`relative p-6 rounded-xl border-2 text-center transition-all cursor-pointer ${
                        selectedAppearance === option.id
                          ? "border-primary-600 bg-primary-50"
                          : "border-border hover:border-border-strong bg-white"
                      }`}
                    >
                      {selectedAppearance === option.id && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 className="h-5 w-5 text-primary-600" />
                        </div>
                      )}
                      <option.icon
                        className={`h-8 w-8 mx-auto mb-3 ${
                          selectedAppearance === option.id
                            ? "text-primary-600"
                            : "text-text-muted"
                        }`}
                      />
                      <p
                        className={`text-sm font-medium ${
                          selectedAppearance === option.id
                            ? "text-primary-700"
                            : "text-text-primary"
                        }`}
                      >
                        {option.label}
                      </p>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Account */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary-50">
                      <Users className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-text-primary">
                        Account
                      </h2>
                      <p className="text-sm text-text-secondary">
                        Manage your account role and preferences
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-bg-tertiary rounded-xl">
                      <p className="text-sm text-text-secondary mb-1">Current Role</p>
                      <p className="text-base font-semibold text-text-primary">
                        Election Administrator
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary mb-3">
                        Possible Roles
                      </p>
                      <div className="space-y-2">
                        {possibleRoles.map((role) => (
                          <div
                            key={role.id}
                            className="flex items-center gap-3 p-3 rounded-xl border border-border"
                          >
                            <div
                              className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                                role.id === "admin"
                                  ? "border-primary-600 bg-primary-600"
                                  : "border-border-strong"
                              }`}
                            >
                              {role.id === "admin" && (
                                <div className="h-1.5 w-1.5 bg-white rounded-full" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary">
                                {role.label}
                              </p>
                              <p className="text-xs text-text-secondary">
                                {role.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-error-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-error-50">
                        <LogOut className="h-5 w-5 text-error-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          Sign Out
                        </p>
                        <p className="text-sm text-text-secondary">
                          Sign out of your admin account
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setShowSignOutModal(true)}
                    >
                      <LogOut className="mr-1 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sign Out Modal */}
      <Modal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        title="Sign Out?"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            You will need to sign in again to access the admin dashboard.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowSignOutModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleSignOut}>
              <LogOut className="mr-1 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
