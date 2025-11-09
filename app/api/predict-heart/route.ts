import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { mapIncomingCvdPayload } from "@/lib/risk/map";
import { computeFraminghamCvd } from "@/lib/risk/framinghamCvd";
import { framinghamCvdSchema } from "@/lib/risk/schema";

// Async function to log predictions to Supabase (non-blocking)
async function logPrediction(
  userId: string | null,
  model: string,
  input: any,
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
  console.log("🫀 Heart disease prediction API called");
  try {
    const body = await request.json();
    console.log("📝 Received request body:", body);

    // Get user ID from Clerk
    const { userId } = await auth();
    console.log("👤 User ID:", userId || "anonymous");

    // Step 1: Map incoming payload (handles both old and new formats)
    const { mapped, isOldFormat, missingFields } = mapIncomingCvdPayload(body);
    console.log("🔄 Payload mapping:", {
      isOldFormat,
      missingFields,
      mapped,
    });

    // Step 2: Check for missing required fields
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error:
            "Missing required fields for accurate Framingham CVD risk calculation",
          missingFields,
          message: `Please provide: ${missingFields.join(", ")}. These fields are required for the Framingham General CVD model.`,
          hint: isOldFormat
            ? "It looks like you're using an old format. The most critical missing field is HDL cholesterol, which is required for accurate cardiovascular risk calculation."
            : "Please fill in all required fields in the form.",
        },
        { status: 400 }
      );
    }

    // Step 3: Validate with Zod schema
    let validatedInput;
    try {
      validatedInput = framinghamCvdSchema.parse(mapped);
      console.log("✅ Input validated:", validatedInput);
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

    // Step 4: Try FastAPI first if configured
    const fastApiUrl = process.env.FAST_API_URL;
    if (fastApiUrl && fastApiUrl !== "mock") {
      console.log("🔗 Trying FastAPI at:", fastApiUrl);
      try {
        // For old format compatibility with FastAPI
        const sexNumeric = validatedInput.sex === "male" ? 1 : 0;
        const smokingNumeric = validatedInput.smoker ? 1 : 0;

        const featuresArray = [
          validatedInput.age,
          sexNumeric,
          smokingNumeric,
          body.cigsPerDay || 0,
          validatedInput.treated ? 1 : 0,
          body.prevalentStroke || 0,
          body.prevalentHyp || 0,
          validatedInput.diabetes ? 1 : 0,
          validatedInput.totalChol,
          validatedInput.sbp,
          body.diaBP || 80,
          body.BMI || 25,
          body.heartRate || 75,
        ];

        const mlResponse = await fetch(`${fastApiUrl}/predict-heart`, {
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
            "fastapi_heart",
            validatedInput,
            mlResult.probability || 0.5,
            "remote"
          );

          return NextResponse.json({
            testId: body.testId ?? null,
            prediction: mlResult.prediction,
            probability: mlResult.probability,
            message: "Heart disease prediction from FastAPI backend",
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
      console.log(
        "📍 FastAPI not configured, using local Framingham CVD calculator"
      );
    }

    // Step 5: Compute locally with Framingham General CVD Model
    console.log("🧮 Computing risk with Framingham CVD Model...");
    const result = computeFraminghamCvd(validatedInput);
    console.log("📊 Framingham result:", result);

    const risk = result.probability; // 0..1
    const riskPct = Math.round(risk * 1000) / 10; // One decimal percentage
    const prediction = riskPct > 20 ? 1 : 0; // Threshold at 20%

    // Step 6: Log to Supabase (non-blocking)
    logPrediction(userId, "framingham_cvd_2008", validatedInput, risk, result.label);

    // Step 7: Return in expected format for UI
    return NextResponse.json({
      testId: body.testId ?? null,
      prediction,
      probability: risk,
      message:
        "Computed locally via Framingham General CVD 10-Year Risk Model (2008)",
      inputData: body,
      rawResponse: {
        model: "framingham_cvd_2008",
        riskPercentage: riskPct,
        label: result.label,
        details: result.details,
      },
    });
  } catch (error) {
    console.error("❌ Error in heart disease prediction:", error);
    return NextResponse.json(
      {
        error: "Failed to process heart disease prediction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
