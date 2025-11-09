import { NextRequest, NextResponse } from "next/server";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: Message[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    // Validate the request body
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      );
    }

    // Get Cloudflare credentials from environment
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      console.error("Cloudflare credentials not configured");
      return getFallbackResponse(body.messages);
    }

    // Get the last user message
    const lastMessage = body.messages[body.messages.length - 1];
    const userInput = lastMessage.content;

    // System prompt for medical chatbot
    const systemPrompt = `You are a helpful medical assistant for FluxCare, a healthcare platform. 

Your main responsibilities:
1. Listen carefully to user symptoms and health concerns
2. Proactively suggest relevant health screening tests when symptoms indicate potential conditions
3. Help schedule doctor appointments for concerning symptoms
4. Provide general health information

IMPORTANT SCREENING CRITERIA:

**Diabetes Screening** - Suggest when user mentions:
- Increased urination (especially at night)
- Excessive thirst
- Increased hunger despite eating
- Unexplained weight loss
- Fatigue or tiredness
- Blurred vision
- Slow-healing sores or frequent infections
- Tingling in hands or feet

**Heart Disease Screening** - Suggest when user mentions:
- Chest pain or discomfort
- Shortness of breath
- Pain in neck, jaw, throat, upper abdomen, or back
- Numbness or weakness in legs or arms
- Irregular heartbeat or palpitations
- Dizziness or lightheadedness
- Swelling in legs, ankles, or feet
- Family history of heart disease
- High blood pressure or cholesterol concerns

When you detect symptoms matching a screening test:
1. Acknowledge their concern empathetically
2. Explain which test would be helpful and why
3. Clearly state: "I recommend taking our [test name] screening test"
4. Mention they can access it from their dashboard
5. Always advise consulting a healthcare provider for concerning symptoms

Keep responses concise (3-4 sentences max), friendly, and professional. Never diagnose - only suggest screenings and recommend professional consultation.`;


    // Prepare messages for Cloudflare AI
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...body.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Call Cloudflare Workers AI
    const aiResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: aiMessages,
          stream: false,
        }),
      }
    );

    if (!aiResponse.ok) {
      console.error(
        "Cloudflare AI API error:",
        aiResponse.status,
        await aiResponse.text()
      );
      return getFallbackResponse(body.messages);
    }

    const aiData = await aiResponse.json();
    const reply = aiData.result?.response || aiData.result?.content || "I'm sorry, I couldn't process that.";

    // Determine response type based on content and user input
    let type = "general";
    let testId: string | undefined;
    let testName: string | undefined;
    const lowerReply = reply.toLowerCase();
    const lowerInput = userInput.toLowerCase();
    
    // Check if AI is recommending a test
    const isDiabetesTest = 
      lowerReply.includes("diabetes") && 
      (lowerReply.includes("test") || lowerReply.includes("screening") || lowerReply.includes("recommend"));
    
    const isHeartTest = 
      (lowerReply.includes("heart") || lowerReply.includes("cardiac") || lowerReply.includes("cardiovascular")) && 
      (lowerReply.includes("test") || lowerReply.includes("screening") || lowerReply.includes("recommend"));
    
    // Check for diabetes-related symptoms in user input
    const diabetesSymptoms = [
      "thirsty", "thirst", "urination", "urinating", "pee", "peeing",
      "hungry", "hunger", "weight loss", "fatigue", "tired", "blurred vision",
      "slow healing", "tingling", "frequent infection"
    ];
    
    const hasDiabetesSymptoms = diabetesSymptoms.some(symptom => lowerInput.includes(symptom));
    
    // Check for heart-related symptoms in user input
    const heartSymptoms = [
      "chest pain", "chest pressure", "chest discomfort", "shortness of breath",
      "breathe", "breathing", "heart", "palpitation", "irregular heartbeat",
      "dizzy", "dizziness", "lightheaded", "swelling", "numbness"
    ];
    
    const hasHeartSymptoms = heartSymptoms.some(symptom => lowerInput.includes(symptom));
    
    // Determine type and assign specific testId based on context
    if (isDiabetesTest || hasDiabetesSymptoms) {
      type = "test";
      testId = "fasting_glucose_blood_test";
      testName = "Fasting Glucose Blood Test";
    } else if (isHeartTest || hasHeartSymptoms) {
      type = "test";
      testId = "cardiovascular_risk_panel";
      testName = "Cardiovascular Risk Panel";
    } else if (
      lowerInput.includes("test") ||
      lowerInput.includes("screening") ||
      lowerReply.includes("screening test")
    ) {
      type = "test";
    } else if (
      lowerInput.includes("appointment") ||
      lowerInput.includes("doctor") ||
      lowerReply.includes("appointment")
    ) {
      type = "doctor";
    }

    return NextResponse.json({
      reply: reply,
      type: type,
      testId: testId,
      testName: testName,
      status: "success",
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return getFallbackResponse([]);
  }
}

// Fallback to rule-based responses if AI fails
function getFallbackResponse(messages: Message[]) {
  const lastMessage = messages[messages.length - 1];
  const userInput = lastMessage?.content?.toLowerCase() || "";

  let reply = "";
  let type = "general";
  let testId: string | undefined;
  let testName: string | undefined;

  // Check for diabetes symptoms
  const diabetesSymptoms = [
    "thirsty", "thirst", "urination", "urinating", "pee", "peeing",
    "hungry", "hunger", "weight loss", "fatigue", "tired"
  ];
  
  const hasDiabetesSymptoms = diabetesSymptoms.some(symptom => userInput.includes(symptom));
  
  // Check for heart symptoms
  const heartSymptoms = [
    "chest pain", "chest pressure", "shortness of breath", "breathe",
    "heart", "palpitation", "dizzy", "dizziness"
  ];
  
  const hasHeartSymptoms = heartSymptoms.some(symptom => userInput.includes(symptom));

  if (hasDiabetesSymptoms) {
    type = "test";
    testId = "fasting_glucose_blood_test";
    testName = "Fasting Glucose Blood Test";
    reply =
      "I notice you're experiencing symptoms that could be related to diabetes. I recommend taking our diabetes screening test to check your blood glucose levels. You can access it from your dashboard. Please also consult with a healthcare provider about your symptoms.";
  } else if (hasHeartSymptoms) {
    type = "test";
    testId = "cardiovascular_risk_panel";
    testName = "Cardiovascular Risk Panel";
    reply =
      "Your symptoms could be related to cardiovascular health. I recommend taking our heart disease screening test. You can access it from your dashboard. Please seek immediate medical attention if you're experiencing severe chest pain or difficulty breathing.";
  } else if (
    userInput.includes("test") ||
    userInput.includes("diabetes") ||
    userInput.includes("heart") ||
    userInput.includes("screening")
  ) {
    type = "test";
    reply =
      "I can help you with health screenings! Would you like to take a diabetes screening test or a heart disease assessment? You can access these tests from your dashboard.";
  } else if (
    userInput.includes("appointment") ||
    userInput.includes("doctor") ||
    userInput.includes("schedule")
  ) {
    type = "doctor";
    reply =
      "I can help you schedule an appointment with a doctor. Would you like me to take you to the appointments page?";
  } else if (
    userInput.includes("hello") ||
    userInput.includes("hi") ||
    userInput.includes("hey")
  ) {
    reply =
      "Hello! I'm your FluxCare health assistant. I can help you with health screening tests, scheduling appointments, and general health information. How can I assist you today?";
  } else {
    reply =
      "I'm your FluxCare health assistant. I can help you with health screenings, appointment scheduling, and viewing your test results. What would you like to do?";
  }

  return NextResponse.json({
    reply: reply,
    type: type,
    testId: testId,
    testName: testName,
    status: "success",
  });
}
