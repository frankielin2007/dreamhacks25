"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import PageContainer from "@/components/app/PageContainer";
import ChatStartForDiagnostic from "@/components/diagnostics/ChatStartForDiagnostic";
import { createDiagnostic, createDiagnosticFromChat } from "./actions";
import { Loader2, MessageSquare, FileText } from "lucide-react";

// Zod validation schema
const DiagnosticSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  symptoms: z.string().min(10, "Symptoms description must be at least 10 characters"),
  duration: z.enum(["hours", "days", "weeks"]),
  severity: z.coerce.number().min(1).max(5, "Severity must be between 1 and 5"),
});

type DiagnosticFormData = z.infer<typeof DiagnosticSchema>;
type TabType = "chat" | "manual";

export default function NewDiagnosticPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<DiagnosticFormData>({
    title: "",
    symptoms: "",
    duration: "days",
    severity: 3,
  });

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Validate with Zod
      const validated = DiagnosticSchema.parse(formData);

      // Call server action
      await createDiagnostic(validated);
      // Redirect happens in the server action
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod errors
        const formattedErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(formattedErrors);
      } else {
        // Server error
        setErrors({
          submit: error instanceof Error ? error.message : "Failed to create diagnostic",
        });
      }
      setIsSubmitting(false);
    }
  };

  const handleChatDiagnostic = async (data: {
    title: string;
    summary: string;
    recommendedTests: string[];
  }) => {
    setIsSubmitting(true);
    try {
      await createDiagnosticFromChat(data);
      // Redirect happens in the server action
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to create diagnostic",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
            Create New Diagnostic
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Start with a conversation or enter details manually
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "chat"
                ? "bg-gradient-to-r from-brand-500 to-cyan-500 text-white shadow-lg"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "manual"
                ? "bg-gradient-to-r from-brand-500 to-cyan-500 text-white shadow-lg"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <FileText className="h-4 w-4" />
            Manual
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "chat" ? (
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-h-[600px] flex flex-col">
            <ChatStartForDiagnostic onCreateDiagnostic={handleChatDiagnostic} />
          </Card>
        ) : (
          <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <form onSubmit={handleManualSubmit} className="space-y-6">
              {/* Title Field */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-900 dark:text-white">
                  Diagnostic Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Chest pain assessment"
                  className={`bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 ${
                    errors.title ? "border-red-500 dark:border-red-500" : ""
                  }`}
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                )}
              </div>

              {/* Symptoms Field */}
              <div className="space-y-2">
                <Label htmlFor="symptoms" className="text-slate-900 dark:text-white">
                  Symptoms Description *
                </Label>
                <textarea
                  id="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  placeholder="Describe the patient's symptoms in detail..."
                  rows={5}
                  className={`w-full px-3 py-2 rounded-md border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                    errors.symptoms ? "border-red-500 dark:border-red-500" : ""
                  }`}
                  disabled={isSubmitting}
                />
                {errors.symptoms && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.symptoms}</p>
                )}
              </div>

              {/* Duration and Severity Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Duration Field */}
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-slate-900 dark:text-white">
                    Duration *
                  </Label>
                  <select
                    id="duration"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: e.target.value as "hours" | "days" | "weeks",
                      })
                    }
                    className={`w-full px-3 py-2 rounded-md border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      errors.duration ? "border-red-500 dark:border-red-500" : ""
                    }`}
                    disabled={isSubmitting}
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                  {errors.duration && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.duration}</p>
                  )}
                </div>

                {/* Severity Field */}
                <div className="space-y-2">
                  <Label htmlFor="severity" className="text-slate-900 dark:text-white">
                    Severity (1-5) *
                  </Label>
                  <select
                    id="severity"
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData({ ...formData, severity: parseInt(e.target.value) })
                    }
                    className={`w-full px-3 py-2 rounded-md border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      errors.severity ? "border-red-500 dark:border-red-500" : ""
                    }`}
                    disabled={isSubmitting}
                  >
                    <option value="1">1 - Mild</option>
                    <option value="2">2 - Moderate</option>
                    <option value="3">3 - Significant</option>
                    <option value="4">4 - Severe</option>
                    <option value="5">5 - Critical</option>
                  </select>
                  {errors.severity && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.severity}</p>
                  )}
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white shadow-lg flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Diagnostic"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
