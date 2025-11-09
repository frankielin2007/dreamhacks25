"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@clerk/nextjs";
import PageContainer from "@/components/app/PageContainer";
import { Card } from "@/components/ui/card";
import { FileText, Heart, Droplet, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Diagnostic {
  id: string;
  user_id: string;
  symptom: string;
  ai_summary: string;
  hospital: string;
  created_at: string;
}

interface Prediction {
  id: string;
  user_id: string;
  model: string;
  input: Record<string, unknown>;
  probability: number;
  label: string;
  created_at: string;
}

interface DiagnosticWithPrediction extends Diagnostic {
  predictions: Prediction[];
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function TestsPage() {
  const { user } = useUser();
  const [diagnostics, setDiagnostics] = useState<DiagnosticWithPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiagnostics = async () => {
      if (!user?.id) return;

      try {
        // Fetch diagnostics
        const { data: diagnosticsData, error: diagError } = await supabase
          .from("diagnostics")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (diagError) {
          console.error("Error fetching diagnostics:", diagError);
          setDiagnostics([]);
          return;
        }

        // Fetch predictions
        const { data: predictionsData, error: predError } = await supabase
          .from("predictions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (predError) {
          console.error("Error fetching predictions:", predError);
          // Still show diagnostics even if predictions fail
          setDiagnostics(
            diagnosticsData?.map((d) => ({ ...d, predictions: [] })) || []
          );
          return;
        }

        // Group predictions by diagnostic (match by timestamp proximity)
        const diagnosticsWithPredictions = diagnosticsData?.map((diagnostic) => {
          const diagnosticTime = new Date(diagnostic.created_at).getTime();
          const relatedPredictions = predictionsData?.filter((pred) => {
            const predTime = new Date(pred.created_at).getTime();
            // Match predictions within 5 minutes of diagnostic
            return Math.abs(diagnosticTime - predTime) < 5 * 60 * 1000;
          }) || [];

          return {
            ...diagnostic,
            predictions: relatedPredictions,
          };
        }) || [];

        setDiagnostics(diagnosticsWithPredictions);
      } catch (error) {
        console.error("Error:", error);
        setDiagnostics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnostics();
  }, [user?.id]);

  const getRiskColor = (label: string) => {
    const lowerLabel = label?.toLowerCase();
    if (lowerLabel?.includes("high")) {
      return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/30";
    } else if (lowerLabel?.includes("medium") || lowerLabel?.includes("moderate")) {
      return "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/30";
    } else if (lowerLabel?.includes("low")) {
      return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/30";
    }
    return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-950/30";
  };

  const getRiskIcon = (label: string) => {
    const lowerLabel = label?.toLowerCase();
    if (lowerLabel?.includes("high")) {
      return <TrendingUp className="h-4 w-4" />;
    } else if (lowerLabel?.includes("medium") || lowerLabel?.includes("moderate")) {
      return <Minus className="h-4 w-4" />;
    } else if (lowerLabel?.includes("low")) {
      return <TrendingDown className="h-4 w-4" />;
    }
    return <AlertCircle className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading test results...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-2">
          <span className="text-gradient">Test Results</span>
        </h1>
        <p className="text-muted-foreground">
          View your diagnostic test results and risk assessments
        </p>
      </motion.div>

      {/* Results List */}
      {diagnostics.length === 0 ? (
        <Card className="glass p-12 text-center border-border/50">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-950 mb-6">
            <FileText className="h-10 w-10 text-brand-600 dark:text-brand-400" />
          </div>
          <h3 className="text-2xl font-display font-semibold mb-3">
            No Test Results Yet
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Complete a diagnostic assessment to see your test results and risk predictions here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {diagnostics.map((diagnostic, index) => {
            const hashedPredictions = diagnostic.predictions || [];
            const heartPrediction = hashedPredictions.find((p) =>
              p.model?.toLowerCase().includes("heart") ||
              p.model?.toLowerCase().includes("cardiovascular") ||
              p.model?.toLowerCase().includes("framingham")
            );
            const diabetesPrediction = hashedPredictions.find((p) =>
              p.model?.toLowerCase().includes("diabetes")
            );

            return (
              <motion.div
                key={diagnostic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass border-border/50 hover:shadow-soft transition-shadow">
                  <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-display font-semibold mb-2">
                          {diagnostic.symptom || "General Checkup"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(diagnostic.created_at).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      {diagnostic.hospital && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300">
                          {diagnostic.hospital}
                        </span>
                      )}
                    </div>

                    {/* AI Summary */}
                    {diagnostic.ai_summary && (
                      <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          AI Analysis
                        </p>
                        <p className="text-sm leading-relaxed">
                          {diagnostic.ai_summary}
                        </p>
                      </div>
                    )}

                    {/* Predictions */}
                    {hashedPredictions.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">
                          Risk Assessments
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          {heartPrediction && (
                            <div className="p-4 rounded-lg border border-border/50 bg-card">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950/30">
                                  <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                  <p className="font-semibold">Cardiovascular Risk</p>
                                  <p className="text-xs text-muted-foreground">10-year risk assessment</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${getRiskColor(heartPrediction.label)}`}>
                                  {getRiskIcon(heartPrediction.label)}
                                  {heartPrediction.label?.toUpperCase()}
                                </span>
                                <span className="text-2xl font-display font-bold">
                                  {(heartPrediction.probability * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          )}

                          {diabetesPrediction && (
                            <div className="p-4 rounded-lg border border-border/50 bg-card">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                                  <Droplet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-semibold">Diabetes Risk</p>
                                  <p className="text-xs text-muted-foreground">Type 2 diabetes assessment</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${getRiskColor(diabetesPrediction.label)}`}>
                                  {getRiskIcon(diabetesPrediction.label)}
                                  {diabetesPrediction.label?.toUpperCase()}
                                </span>
                                <span className="text-2xl font-display font-bold">
                                  {(diabetesPrediction.probability * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
