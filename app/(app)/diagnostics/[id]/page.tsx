"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import PageContainer from "@/components/app/PageContainer";
import Stepper, { type StepId, steps } from "@/components/diagnostics/Stepper";
import StepChat from "@/components/diagnostics/steps/StepChat";
import StepTests from "@/components/diagnostics/StepTests";
import StepResults from "@/components/diagnostics/StepResults";
import StepRisk from "@/components/diagnostics/StepRisk";
import StepBook from "@/components/diagnostics/StepBook";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface DiagnosticRecord {
  id: string;
  user_id: string;
  symptom: string;
  ai_summary: string;
  hospital: string;
  scheduled_date: string;
  test_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TestRecord {
  id: string;
  diagnostic_id: string;
  test_name: string;
  status: string;
  result_file: string;
  test_id: string;
}

interface Appointment {
  id: string;
  user_id: string;
  diagnostic_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function DiagnosticDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id as string;

  // Get step from URL, default to "chat" if no tests, else "tests"
  const urlStep = searchParams?.get("step") as StepId | null;
  
  const [diagnostic, setDiagnostic] = useState<DiagnosticRecord | null>(null);
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskResults, setRiskResults] = useState<{
    diabetes?: { probability: number; label: string; riskCategory?: string };
    heart?: { probability: number; label: string; riskCategory?: string };
  }>({});

  // Determine initial step
  const getInitialStep = (): StepId => {
    if (urlStep && steps.find((s) => s.id === urlStep)) {
      return urlStep;
    }
    // Default: "chat" if no tests yet, else "tests"
    return tests.length === 0 ? "chat" : "tests";
  };

  const [currentStep, setCurrentStep] = useState<StepId>(getInitialStep());

  // Update step when URL changes or tests load
  useEffect(() => {
    if (urlStep && steps.find((s) => s.id === urlStep)) {
      setCurrentStep(urlStep);
    } else if (!loading) {
      setCurrentStep(tests.length === 0 ? "chat" : "tests");
    }
  }, [urlStep, tests.length, loading]);

  // Determine completed steps
  const getCompletedSteps = (): StepId[] => {
    const completed: StepId[] = [];
    
    // Chat is always completed if diagnostic exists
    if (diagnostic) {
      completed.push("chat");
    }
    
    // Tests completed if there are any tests
    if (tests.length > 0) {
      completed.push("tests");
    }
    
    // Results completed if any test is completed
    const hasCompletedTests = tests.some((t) => t.status === "completed");
    if (hasCompletedTests) {
      completed.push("results");
      completed.push("risk"); // Risk is available when results exist
    }
    
    // Book completed if there are appointments
    if (appointments.length > 0) {
      completed.push("book");
    }
    
    return completed;
  };

  const completedSteps = getCompletedSteps();

  const refreshAppointments = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("diagnostic_id", id)
        .order("created_at", { ascending: false });

      if (!error) {
        setAppointments(data || []);
      }
    } catch (error) {
      console.error("Error refreshing appointments:", error);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Fetch diagnostic
        const { data: diagnosticData, error: diagnosticError } = await supabase
          .from("diagnostics")
          .select("*")
          .eq("id", id)
          .single();

        if (diagnosticError) {
          console.error("Error fetching diagnostic:", diagnosticError);
          setLoading(false);
          return;
        }

        // Fetch tests
        const { data: testsData, error: testsError } = await supabase
          .from("tests")
          .select("id, diagnostic_id, test_name, status, result_file, test_id")
          .eq("diagnostic_id", id);

        if (testsError) {
          console.error("Error fetching tests:", testsError);
        }

        // Fetch appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from("appointments")
          .select("*")
          .eq("diagnostic_id", id)
          .order("created_at", { ascending: false });

        if (appointmentsError) {
          console.error("Error fetching appointments:", appointmentsError);
        }

        setDiagnostic(diagnosticData);
        setTests(testsData || []);
        setAppointments(appointmentsData || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const navigateToStep = (step: StepId) => {
    router.replace(`/diagnostics/${id}?step=${step}`, { scroll: false });
  };

  const handleNext = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      navigateToStep(steps[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      navigateToStep(steps[currentIndex - 1].id);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading diagnostic details...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!diagnostic) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Diagnostic Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The diagnostic you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => router.push("/diagnostics")}>
            Return to Diagnostics
          </Button>
        </div>
      </PageContainer>
    );
  }

  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === steps.length - 1;

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <button
            onClick={() => router.push("/diagnostics")}
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Diagnostics
          </button>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
            Diagnostic Journey
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Follow the steps below to complete your diagnostic assessment
          </p>
        </div>

        {/* Stepper */}
        <Stepper currentStep={currentStep} completedSteps={completedSteps} />

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === "chat" && <StepChat diagnostic={diagnostic} />}
          {currentStep === "tests" && (
            <StepTests tests={tests} onSelectTest={() => {/* TODO: Implement test modals */}} />
          )}
          {currentStep === "results" && (
            <StepResults 
              tests={tests} 
              diagnosticId={id} 
              onNext={handleNext}
              onRiskCalculated={setRiskResults}
            />
          )}
          {currentStep === "risk" && (
            <StepRisk 
              tests={tests} 
              diagnosticId={id}
              riskResults={riskResults}
              appointments={appointments}
              onRefreshAppointments={refreshAppointments}
            />
          )}
          {currentStep === "book" && (
            <StepBook
              appointments={appointments}
              diagnosticId={id}
              tests={tests}
              onRefreshAppointments={refreshAppointments}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isFirstStep}
            className="border-slate-300 dark:border-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-sm text-slate-600 dark:text-slate-400">
            Step {currentIndex + 1} of {steps.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={isLastStep}
            className="bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white shadow-md"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

// Export types for future use
export type { DiagnosticRecord, TestRecord, Appointment };
