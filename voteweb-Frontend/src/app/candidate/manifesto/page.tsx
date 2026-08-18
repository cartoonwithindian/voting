"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CandidateLayout } from "@/components/candidate-dashboard/CandidateLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";
import { api, Candidate } from "@/lib/api-client";
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface ManifestoSection {
  id: string;
  title: string;
  content: string;
}

const MAX_CHARS = 500;

/**
 * Parse a candidate `description` into manifesto sections.
 * Sections are stored as `## Title\n\nContent` blocks separated by blank lines.
 * Plain blocks without a title marker get a default "Introduction" title.
 */
function parseSections(description: string | null | undefined): ManifestoSection[] {
  if (!description || !description.trim()) return [];
  const blocks = description
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const titleMatch = block.match(/^##\s+(.+)$/m);
    if (titleMatch) {
      return {
        id: `s-${index + 1}`,
        title: titleMatch[1].trim(),
        content: block.replace(/^##\s+.+$/m, "").trim(),
      };
    }
    return { id: `s-${index + 1}`, title: "Introduction", content: block };
  });
}

function serializeSections(sections: ManifestoSection[]): string {
  return sections
    .map((s) => `## ${s.title}\n\n${s.content}`)
    .join("\n\n");
}

export default function CandidateManifestoPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [sections, setSections] = useState<ManifestoSection[]>([]);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSection, setNewSection] = useState<{ title: string; content: string }>({
    title: "",
    content: "",
  });

  const findCandidate = useCallback(async (): Promise<Candidate | null> => {
    if (!user) return null;

    // Prefer a name match from the public candidate list (candidate ids are not
    // guaranteed to equal student ids), then fall back to id lookup.
    try {
      const listRes = await api.getCandidates();
      const listData = (listRes as { data?: Candidate[] }).data;
      if (Array.isArray(listData)) {
        const byName = listData.find(
          (c) => c.name.toLowerCase() === user.name.toLowerCase()
        );
        if (byName) return byName;
      }
    } catch {
      // Fall through to id lookup
    }

    try {
      const res = await api.getCandidate(user.id);
      const data = (res as { data?: { candidate?: Candidate } }).data;
      return data?.candidate || null;
    } catch {
      return null;
    }
  }, [user]);

  useEffect(() => {
    const load = async () => {
      if (authLoading) return;
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const found = await findCandidate();
      setCandidate(found);
      if (found) {
        setSections(parseSections(found.description));
        setLoadError(null);
      } else {
        setLoadError(
          "Your candidate profile could not be found. Contact election administration to have your candidacy registered."
        );
      }
      setLoading(false);
    };
    load();
  }, [user, isAuthenticated, authLoading, findCandidate]);

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = (id: string, updatedTitle: string, updatedContent: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, title: updatedTitle, content: updatedContent } : s
      )
    );
    setEditingId(null);
    setSaveMessage(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      setSections((prev) => prev.filter((s) => s.id !== id));
      if (editingId === id) setEditingId(null);
      setSaveMessage(null);
    }
  };

  const handleAddSection = () => {
    if (!newSection.title.trim() || !newSection.content.trim()) return;
    const id = `m-${Date.now()}`;
    setSections((prev) => [...prev, { id, title: newSection.title, content: newSection.content }]);
    setNewSection({ title: "", content: "" });
    setShowAddForm(false);
    setSaveMessage(null);
  };

  const handlePublish = async () => {
    if (!candidate) return;
    if (sections.length === 0) {
      setSaveMessage("Add at least one section before saving.");
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    const res = await api.updateCandidate(candidate.id, {
      description: serializeSections(sections),
    });
    setSaving(false);
    if (res.error) {
      setSaveMessage(`Save failed: ${res.error}`);
    } else {
      setSaveMessage("Manifesto saved successfully.");
      setCandidate((prev) => (prev ? { ...prev, description: serializeSections(sections) } : prev));
    }
  };

  if (loading || authLoading) {
    return (
      <CandidateLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout>
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              My Manifesto
            </h1>
            <p className="text-sm text-text-secondary">
              Create and manage your election manifesto.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="info" size="md">
              {sections.length} {sections.length === 1 ? "section" : "sections"}
            </Badge>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePublish}
              isLoading={saving}
              disabled={saving || !candidate || sections.length === 0}
              className="gap-1.5"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Manifesto"}
            </Button>
          </div>
        </div>

        {saveMessage && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
              saveMessage.startsWith("Save failed")
                ? "bg-error-50 text-error"
                : "bg-success-50 text-success"
            }`}
          >
            {saveMessage.startsWith("Save failed") ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {saveMessage}
          </div>
        )}

        {loadError && (
          <Card>
            <div className="flex items-start gap-3 p-4">
              <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">Manifesto unavailable</p>
                <p className="text-sm text-text-secondary mt-1">{loadError}</p>
              </div>
            </div>
          </Card>
        )}

        {!loadError && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">Manifesto Editor</h2>
                {!showAddForm && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAddForm(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Add Section
                  </Button>
                )}
              </div>

              {/* Add New Section Form */}
              {showAddForm && (
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-text-primary">New Section</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddForm(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={newSection.title}
                        onChange={(e) =>
                          setNewSection((prev) => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="e.g. Academic Support"
                        className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        Content
                      </label>
                      <textarea
                        value={newSection.content}
                        onChange={(e) =>
                          setNewSection((prev) => ({ ...prev, content: e.target.value }))
                        }
                        placeholder="Describe your priorities for this section..."
                        maxLength={MAX_CHARS}
                        rows={4}
                        className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      />
                      <p className="text-xs text-text-secondary mt-1 text-right">
                        {newSection.content.length}/{MAX_CHARS}
                      </p>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddSection}
                        disabled={!newSection.title.trim() || !newSection.content.trim()}
                      >
                        <Save className="w-4 h-4" />
                        Save Section
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Existing Sections */}
              {sections.length === 0 && !showAddForm && (
                <Card>
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-text-primary mb-1">
                      No Manifesto Added
                    </h3>
                    <p className="text-sm text-text-secondary mb-4">
                      Add your manifesto so eligible students can learn about your
                      priorities.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowAddForm(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Add Section
                    </Button>
                  </div>
                </Card>
              )}

              {sections.map((section) => (
                <Card key={section.id}>
                  {editingId === section.id ? (
                    <ManifestoEditForm
                      section={section}
                      maxChars={MAX_CHARS}
                      onSave={(title, content) => handleSave(section.id, title, content)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div>
                      <h3 className="font-semibold text-text-primary mb-1">
                        {section.title}
                      </h3>
                      <p className="text-sm text-text-secondary mb-4 whitespace-pre-wrap">
                        {section.content}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(section.id)}
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(section.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">Your Manifesto</h2>
              <Card>
                {sections.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-14 h-14 text-neutral-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-text-primary mb-1">
                      No Manifesto Added
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Add your manifesto so eligible students can learn about your
                      priorities.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-text-primary">
                        {candidate?.name || user?.name || "Candidate"}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Candidate Manifesto
                      </p>
                    </div>
                    {sections.map((section, index) => (
                      <div
                        key={section.id}
                        className="p-4 bg-neutral-50 border border-border rounded-xl"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                            {index + 1}
                          </span>
                          <h4 className="font-semibold text-text-primary">
                            {section.title}
                          </h4>
                        </div>
                        <p className="text-sm text-text-secondary whitespace-pre-wrap">
                          {section.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </CandidateLayout>
  );
}

function ManifestoEditForm({
  section,
  maxChars,
  onSave,
  onCancel,
}: {
  section: ManifestoSection;
  maxChars: number;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState(section.content);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Section Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={maxChars}
          rows={4}
          className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-text-secondary">
            {content.length}/{maxChars}
          </p>
          {content.length >= maxChars && (
            <p className="text-xs text-warning-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Character limit reached
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onSave(title, content)}
          disabled={!title.trim() || !content.trim()}
        >
          <Save className="w-4 h-4" />
          Save
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
