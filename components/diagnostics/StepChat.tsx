"use client";

import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface DiagnosticRecord {
  id: string;
  symptom: string;
  ai_summary: string;
  created_at: string;
}

interface StepChatProps {
  diagnostic: DiagnosticRecord | null;
}

export default function StepChat({ diagnostic }: StepChatProps) {
  if (!diagnostic) {
    return (
      <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="text-center text-slate-600 dark:text-slate-400">
          Loading diagnostic information...
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Symptoms Card */}
      <Card className="p-6 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-brand-500 to-cyan-500">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">
              Reported Symptoms
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Initial consultation from{" "}
              {new Date(diagnostic.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <p className="text-slate-900 dark:text-white leading-relaxed">
                {diagnostic.symptom}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Assessment Card */}
      <Card className="p-6 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
            <span className="text-2xl">🤖</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">
              AI Assessment
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Preliminary analysis based on reported symptoms
            </p>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: diagnostic.ai_summary.replace(/\n/g, "<br />"),
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Info Note */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div className="flex-1">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              <strong>Next Steps:</strong> Click &quot;Next&quot; to proceed to the diagnostic tests phase
              where you can run tests and gather more data.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
