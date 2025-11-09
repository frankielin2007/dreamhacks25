import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

interface OnboardingRequest {
  clerkUserId: string;
  phone_number: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  insurance_provider?: string;
  insurance_id?: string;
  group_number?: string;
}

export async function POST(request: NextRequest) {
  console.log("🎯 Onboarding API called");
  try {
    const body: OnboardingRequest = await request.json();
    console.log("📝 Received onboarding data:", body);

    // Validate required fields
    const {
      clerkUserId,
      phone_number,
      street_address,
      city,
      state,
      zip_code,
      insurance_provider,
      insurance_id,
      group_number,
    } = body;

    if (
      !clerkUserId ||
      !phone_number ||
      !street_address ||
      !city ||
      !state ||
      !zip_code
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: clerkUserId, phone_number, street_address, city, state, zip_code",
        },
        { status: 400 }
      );
    }

    // Create Supabase server client
    const supabase = createSupabaseServerClient();

    // First, check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("clerk_user_id")
      .eq("clerk_user_id", clerkUserId)
      .single();

    let data, error;

    if (!existingUser) {
      console.log("👤 User doesn't exist, creating new user record");
      // User doesn't exist, create them (upsert)
      const upsertResult = await supabase
        .from("users")
        .upsert(
          {
            clerk_user_id: clerkUserId,
            phone_number,
            street_address,
            city,
            state,
            zip_code,
            insurance_provider: insurance_provider || null,
            insurance_id: insurance_id || null,
            group_number: group_number || null,
            onboarding_completed: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "clerk_user_id" }
        )
        .select()
        .single();

      data = upsertResult.data;
      error = upsertResult.error;
    } else {
      console.log("📝 User exists, updating onboarding info");
      // User exists, update their onboarding information
      const updateResult = await supabase
        .from("users")
        .update({
          phone_number,
          street_address,
          city,
          state,
          zip_code,
          insurance_provider: insurance_provider || null,
          insurance_id: insurance_id || null,
          group_number: group_number || null,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("clerk_user_id", clerkUserId)
        .select()
        .single();

      data = updateResult.data;
      error = updateResult.error;
    }

    if (error) {
      console.error("Supabase operation error:", error);
      return NextResponse.json(
        {
          error: "Failed to save onboarding information",
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Onboarding completed for user:", clerkUserId);

    return NextResponse.json({
      message: "Onboarding completed successfully",
      user: data,
    });
  } catch (error) {
    console.error("Error in onboarding:", error);
    return NextResponse.json(
      {
        error: "Failed to process onboarding",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
