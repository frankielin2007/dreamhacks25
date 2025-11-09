"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, AlertCircle, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    concern?: boolean;
    recommendedTests?: string[];
    summary?: string;
  };
}

interface DiagnosticRecommendation {
  concern: boolean;
  recommendedTests: string[];
  summary: string;
}

interface ChatStartForDiagnosticProps {
  onCreateDiagnostic: (data: {
    title: string;
    summary: string;
    recommendedTests: string[];
  }) => void;
}

export default function ChatStartForDiagnostic({
  onCreateDiagnostic,
}: ChatStartForDiagnosticProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendation, setRecommendation] = useState<DiagnosticRecommendation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const parseAIResponse = (content: string): DiagnosticRecommendation | null => {
    try {
      // Look for JSON blocks in the response
      const jsonMatch = content.match(/\{[\s\S]*"concern"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          concern: parsed.concern ?? false,
          recommendedTests: parsed.recommendedTests ?? [],
          summary: parsed.summary ?? content,
        };
      }
    } catch {
      // If parsing fails, check for keywords to determine if tests are recommended
      console.log("No JSON recommendation found in AI response");
    }

    // Fallback: detect test recommendations from text
    const lowerContent = content.toLowerCase();
    const recommendedTests: string[] = [];
    let concern = false;

    // Check for diabetes test recommendation
    if (
      (lowerContent.includes("diabetes") || lowerContent.includes("glucose")) &&
      (lowerContent.includes("test") || lowerContent.includes("screening") || lowerContent.includes("recommend"))
    ) {
      recommendedTests.push("Fasting Glucose Blood Test");
      concern = true;
    }

    // Check for heart test recommendation
    if (
      (lowerContent.includes("heart") || 
       lowerContent.includes("cardiac") || 
       lowerContent.includes("cardiovascular") ||
       lowerContent.includes("chest pain") ||
       lowerContent.includes("shortness of breath")) &&
      (lowerContent.includes("test") || lowerContent.includes("screening") || lowerContent.includes("recommend"))
    ) {
      recommendedTests.push("Cardiovascular Risk Panel");
      concern = true;
    }

    // Check for kidney test recommendation
    if (
      lowerContent.includes("kidney") &&
      (lowerContent.includes("test") || lowerContent.includes("screening") || lowerContent.includes("recommend"))
    ) {
      recommendedTests.push("Kidney Function Test");
      concern = true;
    }

    // Check for liver test recommendation
    if (
      lowerContent.includes("liver") &&
      (lowerContent.includes("test") || lowerContent.includes("screening") || lowerContent.includes("recommend"))
    ) {
      recommendedTests.push("Liver Enzyme Panel");
      concern = true;
    }

    // If any tests were detected, return the recommendation
    if (recommendedTests.length > 0) {
      return {
        concern,
        recommendedTests,
        summary: content,
      };
    }

    return null;
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: input },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      const aiContent = data.reply || data.message || data.content || "I'm here to help with your health concerns.";

      // Parse for diagnostic recommendations
      const parsed = parseAIResponse(aiContent);
      if (parsed && (parsed.concern || parsed.recommendedTests.length > 0)) {
        setRecommendation(parsed);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiContent,
        metadata: parsed || undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting right now. Please try again or use the manual form.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendTests = async () => {
    if (messages.length === 0) return;
    
    setIsRecommending(true);

    try {
      // Build context from conversation
      const conversationSummary = messages
        .map((m) => `${m.role === "user" ? "Patient" : "Assistant"}: ${m.content}`)
        .join("\n");

      const prompt = `Based on this conversation with a patient, recommend specific medical tests they should take.

Conversation:
${conversationSummary}

Available tests:
- Fasting Glucose Blood Test (for diabetes screening)
- Cardiovascular Risk Panel (for heart health)
- Kidney Function Test
- Liver Enzyme Panel

Respond with ONLY a JSON object in this exact format:
{
  "concern": true,
  "recommendedTests": ["Test Name 1", "Test Name 2"],
  "summary": "Brief clinical summary of why these tests are recommended"
}`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const content = data.reply || data.message || data.content || "";

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*"recommendedTests"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setRecommendation({
          concern: parsed.concern ?? true,
          recommendedTests: parsed.recommendedTests || [],
          summary: parsed.summary || content,
        });
      } else {
        // Fallback: Use text parsing
        const parsed = parseAIResponse(content);
        if (parsed) {
          setRecommendation(parsed);
        } else {
          // No specific tests detected, but user wants to proceed
          setRecommendation({
            concern: true,
            recommendedTests: [],
            summary: "General health screening recommended based on symptoms.",
          });
        }
      }
    } catch (error) {
      console.error("Error getting test recommendations:", error);
    } finally {
      setIsRecommending(false);
    }
  };

  const handleCreateDiagnostic = () => {
    if (!recommendation) return;

    // Extract title from first user message or use default
    const title = messages.find((m) => m.role === "user")?.content.slice(0, 100) || "Symptom assessment";
    
    onCreateDiagnostic({
      title,
      summary: recommendation.summary,
      recommendedTests: recommendation.recommendedTests,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <Card className="p-8 text-center bg-gradient-to-br from-brand-50/50 to-cyan-50/50 dark:from-brand-950/50 dark:to-cyan-950/50 border-brand-200 dark:border-brand-800">
            <Activity className="h-12 w-12 mx-auto mb-4 text-brand-600 dark:text-brand-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Start with Your Symptoms
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Describe what you&apos;re experiencing, and I&apos;ll help assess the situation and recommend appropriate tests.
            </p>
          </Card>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-brand-500 to-cyan-500 text-white border-transparent"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                }`}
              >
                <p className={`text-sm ${message.role === "user" ? "text-white" : "text-slate-900 dark:text-white"}`}>
                  {message.content}
                </p>
                
                {message.metadata && (message.metadata.concern || (message.metadata.recommendedTests && message.metadata.recommendedTests.length > 0)) && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    {message.metadata.concern && (
                      <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">Concern detected</span>
                      </div>
                    )}
                    {message.metadata.recommendedTests && message.metadata.recommendedTests.length > 0 && (
                      <div className="text-xs text-slate-700 dark:text-slate-300">
                        <span className="font-medium">Recommended tests:</span>{" "}
                        {message.metadata.recommendedTests.join(", ")}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analyzing...</span>
              </div>
            </Card>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="mt-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms or health concerns..."
            disabled={isLoading}
            className="flex-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-brand-600 hover:bg-brand-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>

      {/* Recommend Tests Button - Show after conversation starts */}
      {!recommendation && messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Ready for test recommendations?
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  I&apos;ll analyze your symptoms and suggest appropriate screening tests.
                </p>
              </div>
              <Button
                onClick={handleRecommendTests}
                disabled={isRecommending}
                className="bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white shadow-lg"
              >
                {isRecommending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  "Recommend Tests"
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Test Recommendations Display */}
      {recommendation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-4"
        >
          {/* Clinical Summary */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Clinical Summary
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {recommendation.summary}
            </p>
          </Card>

          {/* Recommended Tests */}
          {recommendation.recommendedTests.length > 0 && (
            <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                Recommended Tests ({recommendation.recommendedTests.length})
              </h4>
              <ul className="space-y-2 mb-4">
                {recommendation.recommendedTests.map((test, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <div className="h-2 w-2 rounded-full bg-brand-500" />
                    {test}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleCreateDiagnostic}
                className="w-full bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white shadow-lg"
              >
                Proceed with These Tests
              </Button>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
