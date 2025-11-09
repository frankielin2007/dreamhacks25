import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { mapIncomingDiabetesPayload } from "@/lib/risk/map";
import { computeFraminghamDiabetes } from "@/lib/risk/framinghamDiabetes";
import { framinghamDiabetesSchema } from "@/lib/risk/schema";

// Async function to log predictions to Supabase (non-blocking)
async function logPrediction(
  userId: string | null,
  model: string,
  input: Record<string, unknown>,
  probability: number,
  label: string
) {
  try {
    const supabase = createSupabaseServerClient();
    await supabase.from("predictions").insert({
      user_id: userId,
      model,
      input: JSON.stringify(input),
      probability,
      label,
    });
    console.log("✅ Prediction logged to database");
  } catch (err) {
    console.error("⚠️ Failed to log prediction:", err);
    // Don't fail the request if logging fails
  }
}

export async function POST(request: NextRequest) {
  console.log("🩺 Diabetes prediction API called");
  try {
    const body = await request.json();
    console.log("📝 Received request body:", body);

    // Get user ID from Clerk
    const { userId } = await auth();
    console.log("👤 User ID:", userId || "anonymous");

    // Step 1: Map incoming payload (handles both old and new formats)
    const { mapped, isOldFormat, missingFields } =
      mapIncomingDiabetesPayload(body);
    console.log("🔄 Payload mapping:", {
      isOldFormat,
      missingFields,
      mapped,
    });

    // Step 2: Validate with Zod schema (allow defaults for old format)
    let validatedInput;
    try {
      validatedInput = framinghamDiabetesSchema.parse(mapped);
      console.log("✅ Input validated:", validatedInput);
      
      // Warn if using old format with defaults
      if (isOldFormat) {
        console.warn(
          "⚠️ Using old form format with estimated defaults for HDL and triglycerides. Consider updating form for better accuracy."
        );
      }
    } catch (validationError) {
      console.error("❌ Validation error:", validationError);
      return NextResponse.json(
        {
          error: "Invalid input data",
          details:
            validationError instanceof Error
              ? validationError.message
              : "Validation failed",
        },
        { status: 400 }
      );
    }

    // Step 3: Use local Framingham calculator (FastAPI uses wrong PIMA format)
    // The FastAPI endpoint uses the old PIMA diabetes dataset format (8 features)
    // but we're now collecting Framingham data (sex, HDL, triglycerides, etc.)
    // So we'll use the local Framingham calculator for accurate predictions
    const useFastApi = false; // Set to false to use accurate Framingham model
    const fastApiUrl = process.env.FAST_API_URL;
    
    if (useFastApi && fastApiUrl && fastApiUrl !== "mock") {
      console.log("🔗 Trying FastAPI at:", fastApiUrl);
      try {
        // For old format compatibility with FastAPI
        const featuresArray = [
          body.pregnancies || 0,
          body.glucose || validatedInput.fastingGlucose,
          body.blood_pressure || validatedInput.sbp,
          body.skin_thickness || 0,
          body.insulin || 0,
          validatedInput.bmi,
          body.diabetes_pedigree || 0.5,
          validatedInput.age,
        ];

        const mlResponse = await fetch(`${fastApiUrl}/predict-diabetes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ features: featuresArray }),
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (mlResponse.ok) {
          const mlResult = await mlResponse.json();
          console.log("🤖 FastAPI Response:", mlResult);

          // Log to Supabase asynchronously
          logPrediction(
            userId,
            "fastapi_diabetes",
            validatedInput,
            mlResult.probability || 0.5,
            "remote"
          );

          return NextResponse.json({
            testId: body.testId ?? null,
            prediction: mlResult.prediction,
            probability: mlResult.probability,
            message: "Diabetes prediction from FastAPI backend",
            inputData: body,
            rawResponse: mlResult,
          });
        }
      } catch (fastApiError) {
        console.log(
          "⚠️ FastAPI unavailable, falling back to local Framingham calculator:",
          fastApiError instanceof Error ? fastApiError.message : "Unknown error"
        );
      }
    } else {
      console.log("📍 FastAPI not configured, using local Framingham calculator");
    }

    // Step 4: Compute locally with Framingham Diabetes Model
    console.log("🧮 Computing risk with Framingham Diabetes Model...");
    const result = computeFraminghamDiabetes(validatedInput);
    console.log("📊 Framingham result:", result);

    const risk = result.probability; // 0..1
    const riskPct = Math.round(risk * 1000) / 10; // One decimal percentage
    const prediction = riskPct > 20 ? 1 : 0; // Threshold at 20%

    // Step 5: Log to Supabase (non-blocking)
    logPrediction(
      userId,
      "framingham_dm_2007",
      validatedInput,
      risk,
      result.label
    );

    // Step 6: Return in expected format for UI
    return NextResponse.json({
      testId: body.testId ?? null,
      prediction,
      probability: risk,
      message: "Computed locally via Framingham Offspring Diabetes Model (2007)",
      inputData: body,
      rawResponse: {
        model: "framingham_dm_2007",
        riskPercentage: riskPct,
        label: result.label,
        details: result.details,
      },
    });
  } catch (error) {
    console.error("❌ Error in diabetes prediction:", error);
    return NextResponse.json(
      {
        error: "Failed to process diabetes prediction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
