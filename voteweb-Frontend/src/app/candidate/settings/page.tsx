"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CandidateLayout } from "@/components/candidate-dashboard/CandidateLayout"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
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
} from "lucide-react"

export default function CandidateSettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("notifications")
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [settings, setSettings] = useState({
    notifications: {
      electionReminders: true,
      profileStatusUpdates: true,
      applicationChanges: true,
      systemAnnouncements: false,
    },
    appearance: "system" as "system" | "light" | "dark",
    language: "en" as "en" | "hi",
  })

  const tabs = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "language", label: "Language", icon: Globe },
    { id: "security", label: "Security", icon: Shield },
    { id: "account", label: "Account", icon: Trash2 },
  ]

  const toggleNotification = (key: keyof typeof settings.notifications) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }))
  }

  const handleSignOut = () => {
    setShowSignOutModal(false)
    router.push("/login")
  }

  const notificationOptions = [
    {
      key: "electionReminders" as const,
      label: "Election Reminders",
      description: "Get notified about upcoming elections and deadlines.",
    },
    {
      key: "profileStatusUpdates" as const,
      label: "Profile Status Updates",
      description: "Receive alerts when your profile status changes.",
    },
    {
      key: "applicationChanges" as const,
      label: "Application Changes",
      description: "Get notified about updates to your candidature applications.",
    },
    {
      key: "systemAnnouncements" as const,
      label: "System Announcements",
      description: "Important system-wide announcements and maintenance notices.",
    },
  ]

  const appearanceOptions = [
    { value: "system" as const, label: "System Default", icon: Monitor },
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
  ]

  const languageOptions = [
    { value: "en" as const, label: "English" },
    { value: "hi" as const, label: "Hindi" },
  ]

  return (
    <CandidateLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage your candidate account preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-48 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
            ))}
          </div>

          <div className="flex-1">
            {activeTab === "notifications" && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Notifications</h2>
                <p className="text-sm text-gray-500 mb-6">Choose what notifications you receive.</p>
                <div className="space-y-4">
                  {notificationOptions.map((option) => (
                    <div
                      key={option.key}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 mr-4">
                        <p className="text-sm font-medium text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                      <button
                        onClick={() => toggleNotification(option.key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.notifications[option.key] ? "bg-primary-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.notifications[option.key] ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === "appearance" && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Appearance</h2>
                <p className="text-sm text-gray-500 mb-6">Customize the look and feel of the application.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {appearanceOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSettings((prev) => ({ ...prev, appearance: option.value }))}
                      className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                        settings.appearance === option.value
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <option.icon
                        className={`w-8 h-8 ${
                          settings.appearance === option.value ? "text-primary-600" : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          settings.appearance === option.value ? "text-primary-700" : "text-gray-600"
                        }`}
                      >
                        {option.label}
                      </span>
                      {settings.appearance === option.value && (
                        <CheckCircle2 className="w-5 h-5 text-primary-600" />
                      )}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === "language" && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Language</h2>
                <p className="text-sm text-gray-500 mb-6">Select your preferred language.</p>
                <div className="space-y-3">
                  {languageOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSettings((prev) => ({ ...prev, language: option.value }))}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        settings.language === option.value
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span
                        className={`text-sm font-medium ${
                          settings.language === option.value ? "text-primary-700" : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </span>
                      {settings.language === option.value && (
                        <CheckCircle2 className="w-5 h-5 text-primary-600" />
                      )}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === "security" && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Security</h2>
                <p className="text-sm text-gray-500 mb-6">Manage your account security settings.</p>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Password</p>
                        <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                      </div>
                      <Badge variant="success">Protected</Badge>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                      </div>
                      <Badge variant="warning">Not Enabled</Badge>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Account Status</p>
                        <p className="text-sm text-gray-500">Your account is in good standing.</p>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Shield className="w-4 h-4 mr-2" />
                    Security Settings
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === "account" && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Account</h2>
                <p className="text-sm text-gray-500 mb-6">Manage your account actions.</p>
                <div className="space-y-4">
                  <button
                    onClick={() => setShowSignOutModal(true)}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-5 h-5 text-gray-500" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">Sign Out</p>
                        <p className="text-sm text-gray-500">Sign out of your candidate account.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-5 h-5 text-red-500" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-red-900">Request Account Deletion</p>
                        <p className="text-sm text-red-600">Permanently delete your account and data.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSignOutModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Sign Out?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              You will need to sign in again to access your candidate account.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowSignOutModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSignOut}>Sign Out</Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Request Account Deletion?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              This action will send a deletion request to your institution for review. Your account
              and associated data will be permanently deleted once approved.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This process may take up to 7 business days to complete.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => setShowDeleteModal(false)}>
                Request Deletion
              </Button>
            </div>
          </div>
        </div>
      )}
    </CandidateLayout>
  )
}
