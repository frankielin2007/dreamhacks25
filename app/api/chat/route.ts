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
1. Listen carefully to user symptoms and assess for specific concerning combinations
2. Provide appropriate recommendations based on symptom patterns
3. Help schedule doctor appointments and screening tests when clinically indicated
4. Provide general health information and wellness guidance

SCREENING CRITERIA (Be strict and specific):

**DIABETES SCREENING** - Recommend test when user reports MULTIPLE symptoms occurring together:
CRITICAL COMBINATIONS (immediate test recommendation):
- Increased urination + excessive thirst (especially if all day/night)
- Increased urination + unexplained weight loss
- Excessive thirst + unexplained weight loss
- Any 3+ of: increased urination, excessive thirst, fatigue, blurred vision, slow-healing wounds

SINGLE SYMPTOM = No test yet, provide advice and monitoring guidance

**HEART DISEASE SCREENING** - Recommend test for:
- Chest pain/pressure + shortness of breath
- Chest discomfort + pain radiating to arm/jaw/neck
- Severe shortness of breath during normal activities + swelling
- Strong family history + multiple risk factors (high BP, smoking, high cholesterol)

**COMMON AILMENTS** (Recommend alternatives, NOT tests):
- Cold/flu symptoms (cough, congestion, sore throat, mild fever)
  → Rest, fluids, OTC cold medicine, vitamin C
- Headaches (tension, occasional)
  → Hydration, rest, OTC pain relievers, stress management
- Minor fatigue (isolated, no other symptoms)
  → Better sleep hygiene, balanced diet, light exercise, check iron levels
- Mild digestive issues (occasional indigestion, upset stomach)
  → Dietary adjustments, probiotics, avoid trigger foods
- Minor muscle/joint pain
  → Rest, ice/heat, OTC anti-inflammatories, gentle stretching

RESPONSE PATTERNS:
1. For SYMPTOM COMBINATIONS matching criteria above:
   "Based on what you're describing - [symptom 1] combined with [symptom 2] - I strongly recommend taking our [test name] screening test. These symptoms together can indicate [condition] and should be evaluated. Would you like to schedule this test?"

2. For COMMON AILMENTS:
   "It sounds like you might be dealing with [condition]. Here's what I recommend: [specific advice]. This typically resolves in [timeframe]. If symptoms worsen or don't improve in [days], please consult a healthcare provider."

3. For SINGLE ISOLATED SYMPTOMS:
   "I understand you're experiencing [symptom]. Let's monitor this - try [advice]. If you also notice [related symptom] or [related symptom], or if this persists beyond [timeframe], we should do a screening test."

Be STRICT: Only recommend tests for clear symptom combinations. For everything else, provide helpful alternatives first.

Keep responses concise (3-4 sentences max), friendly, and professional. Never diagnose.`;


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
