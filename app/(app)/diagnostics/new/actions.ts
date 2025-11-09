"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface CreateDiagnosticInput {
  title: string;
  symptoms: string;
  duration: "hours" | "days" | "weeks";
  severity: number;
}

export async function createDiagnostic(input: CreateDiagnosticInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("diagnostics")
    .insert({
      user_id: userId,
      symptom: input.title,
      ai_summary: input.symptoms,
      hospital: "",
      scheduled_date: new Date().toISOString(),
      status: "scheduled",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating diagnostic:", error);
    throw new Error(error.message || "Failed to create diagnostic");
  }

  revalidatePath("/dashboard");
  redirect(`/diagnostics/${data.id}`);
}

interface CreateDiagnosticFromChatInput {
  title: string;
  summary: string;
  recommendedTests: string[];
}

export async function createDiagnosticFromChat(input: CreateDiagnosticFromChatInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const supabase = createSupabaseServerClient();
  
  // Create the diagnostic
  const { data: diagnostic, error: diagnosticError } = await supabase
    .from("diagnostics")
    .insert({
      user_id: userId,
      symptom: input.title || "Symptom assessment",
      ai_summary: input.summary,
      hospital: "",
      scheduled_date: new Date().toISOString(),
      status: "scheduled",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (diagnosticError) {
    console.error("Error creating diagnostic:", diagnosticError);
    throw new Error(diagnosticError.message || "Failed to create diagnostic");
  }

  // If there are recommended tests, create test records
  if (input.recommendedTests && input.recommendedTests.length > 0) {
    const testRecords = input.recommendedTests.map((testName) => ({
      diagnostic_id: diagnostic.id,
      test_name: testName,
      status: "pending",
      result_file: "",
      test_id: `${testName}-${Date.now()}`,
    }));

    const { error: testsError } = await supabase
      .from("tests")
      .insert(testRecords);

    if (testsError) {
      console.error("Error creating test records:", testsError);
      // Don't throw - diagnostic is already created
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/diagnostics");
  
  // Redirect to book step to schedule appointment for the recommended tests
  redirect(`/diagnostics/${diagnostic.id}?step=book`);
}
