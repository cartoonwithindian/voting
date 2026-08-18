"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api-client";
import { API_CATEGORIES, categoryToApiValue } from "@/lib/help-data";
import {
  ArrowLeft,
  AlertCircle,
  X,
  CheckCircle2,
  Shield,
  FileText,
  Upload,
} from "lucide-react";

export default function ReportIssuePage() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [receiptId, setReceiptId] = useState("");
  const [screenshot, setScreenshot] = useState<{ name: string; preview: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [errors, setErrors] = useState<{ category?: string; description?: string; general?: string }>({});

  const validate = () => {
    const newErrors: { category?: string; description?: string } = {};
    if (!category) {
      newErrors.category = "Please select a category";
    }
    if (!description.trim()) {
      newErrors.description = "Please describe your issue";
    } else if (description.trim().length < 20) {
      newErrors.description = "Please provide more detail (at least 20 characters)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Convert friendly category to API value
      const apiCategory = categoryToApiValue(category);

      const res = await api.createSupportRequest({
        category: apiCategory,
        subject: `${category}: ${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`,
        description: description,
        priority: "normal",
      });

      if (res.error) {
        setErrors({ general: res.error });
        setIsSubmitting(false);
        return;
      }

      // Extract request ID from response
      const data = res.data as Record<string, unknown>;
      const newRequestId = data?.id || data?.request_id || `SR-${Date.now()}`;
      setRequestId(String(newRequestId));
      setSubmitted(true);

      // Store in session storage for the detail page
      if (typeof window !== "undefined") {
        const newRequest = {
          id: newRequestId,
          category: apiCategory,
          status: "open",
          created_at: new Date().toISOString(),
          description: description,
        };
        const existingRequests = JSON.parse(sessionStorage.getItem("pending_requests") || "[]");
        existingRequests.push(newRequest);
        sessionStorage.setItem("pending_requests", JSON.stringify(existingRequests));
      }
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : "Failed to submit request" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <StudentLayout>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Request Submitted</h1>
            <p className="text-text-secondary mb-6">
              Your support request has been submitted. Our team will review it and get back to you shortly.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-xs text-text-secondary mb-1">Request ID</p>
              <p className="text-lg font-mono font-semibold text-text-primary">{requestId}</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push("/student/help")}>
                Back to Help
              </Button>
              <Button variant="primary" onClick={() => router.push("/student/help/requests")}>
                View My Requests
              </Button>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/student/help" className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-text-secondary" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Report an Issue</h1>
              <p className="text-sm text-text-secondary">Submit a support request</p>
            </div>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
              <p className="text-sm text-error">{errors.general}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Category <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {API_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setCategory(cat.label);
                      if (errors.category) setErrors(e => ({ ...e, category: undefined }));
                    }}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      category === cat.label
                        ? "border-primary bg-primary-50 text-primary"
                        : "border-border hover:border-primary-300"
                    }`}
                  >
                    <p className="text-sm font-medium">{cat.label}</p>
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="text-xs text-error mt-1">{errors.category}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Description <span className="text-error">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors(e => ({ ...e, description: undefined }));
                }}
                placeholder="Please describe your issue in detail..."
                className="w-full h-32 px-3 py-2 rounded-lg border border-border bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              />
              <div className="flex justify-between mt-1">
                {errors.description ? (
                  <p className="text-xs text-error">{errors.description}</p>
                ) : (
                  <p></p>
                )}
                <p className="text-xs text-text-muted">{description.length}/1000</p>
              </div>
            </div>

            {/* Receipt ID (optional) */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Receipt ID <span className="text-text-muted">(optional)</span>
              </label>
              <input
                type="text"
                value={receiptId}
                onChange={(e) => setReceiptId(e.target.value)}
                placeholder="If your issue is related to a specific vote..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Screenshot Upload (UI only - not implemented) */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Screenshot <span className="text-text-muted">(optional)</span>
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary-300 transition-colors">
                {screenshot ? (
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-text-muted" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-text-primary">{screenshot.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setScreenshot(null)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4 text-text-secondary" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
                    <p className="text-sm text-text-secondary">
                      Drag and drop or{" "}
                      <button type="button" className="text-primary hover:underline">
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-text-muted mt-1">PNG, JPG up to 5MB</p>
                  </>
                )}
              </div>
            </div>

            {/* Security Notice */}
            <Card className="bg-warning-50 border-warning-200">
              <div className="flex gap-2">
                <Shield className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-warning font-medium">
                  Do not include your password, authentication code, or candidate selections in your support request.
                </p>
              </div>
            </Card>

            {/* Submit */}
            <Button
              variant="primary"
              size="lg"
              className="w-full gap-2"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              <AlertCircle className="w-4 h-4" />
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
