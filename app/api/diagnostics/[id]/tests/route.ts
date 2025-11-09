import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

interface TestInput {
  test_id: string;
  test_name: string;
  status: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const diagnosticId = id;
    const body = await request.json();
    const { tests, summary } = body as {
      tests: TestInput[];
      summary?: string;
    };

    if (!tests || !Array.isArray(tests)) {
      return NextResponse.json(
        { error: "Tests array is required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // Verify diagnostic belongs to user
    const { data: diagnostic, error: diagError } = await supabase
      .from("diagnostics")
      .select("id, user_id")
      .eq("id", diagnosticId)
      .eq("user_id", userId)
      .single();

    if (diagError || !diagnostic) {
      return NextResponse.json(
        { error: "Diagnostic not found" },
        { status: 404 }
      );
    }

    // Update diagnostic summary if provided
    if (summary) {
      await supabase
        .from("diagnostics")
        .update({ ai_summary: summary })
        .eq("id", diagnosticId);
    }

    // Upsert tests (insert or update if exists)
    const testRecords = tests.map((test) => ({
      diagnostic_id: diagnosticId,
      test_id: test.test_id,
      test_name: test.test_name,
      status: test.status || "pending",
      result_file: "",
    }));

    const { data: createdTests, error: testError } = await supabase
      .from("tests")
      .upsert(testRecords, {
        onConflict: "diagnostic_id,test_id",
        ignoreDuplicates: false,
      })
      .select();

    if (testError) {
      console.error("Error creating tests:", testError);
      return NextResponse.json(
        { error: "Failed to create tests" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tests: createdTests,
      message: `${createdTests?.length || 0} test(s) created`,
    });
  } catch (error) {
    console.error("Error in tests API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const diagnosticId = id;
    const supabase = createSupabaseServerClient();

    // Verify diagnostic belongs to user
    const { data: diagnostic, error: diagError } = await supabase
      .from("diagnostics")
      .select("id, user_id")
      .eq("id", diagnosticId)
      .eq("user_id", userId)
      .single();

    if (diagError || !diagnostic) {
      return NextResponse.json(
        { error: "Diagnostic not found" },
        { status: 404 }
      );
    }

    // Get tests for this diagnostic
    const { data: tests, error: testError } = await supabase
      .from("tests")
      .select("*")
      .eq("diagnostic_id", diagnosticId)
      .order("created_at", { ascending: false });

    if (testError) {
      console.error("Error fetching tests:", testError);
      return NextResponse.json(
        { error: "Failed to fetch tests" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tests: tests || [],
    });
  } catch (error) {
    console.error("Error in tests API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
