"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Loader2, AlertCircle, Activity, ChevronRight, Beaker } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DiagnosticRecord {
  id: string;
  symptom: string;
  ai_summary: string;
  created_at: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface TestRecommendation {
  recommendedTests: string[];
  summary: string;
}

interface StepChatProps {
  diagnostic: DiagnosticRecord | null;
}

export default function StepChat({ diagnostic }: StepChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendation, setRecommendation] = useState<TestRecommendation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with diagnostic info
  useEffect(() => {
    if (diagnostic && messages.length === 0) {
      const initialMessage: Message = {
        id: "initial",
        role: "assistant",
        content: `I see you're experiencing: "${diagnostic.symptom}". I can help recommend diagnostic tests based on your symptoms. Feel free to share more details or ask questions.`,
      };
      setMessages([initialMessage]);
    }
  }, [diagnostic, messages.length]);

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
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || data.message || data.content || "I'm here to help!",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendTests = async () => {
    if (!diagnostic) return;

    setIsRecommending(true);

    try {
      // Build context from chat messages
      const chatContext = messages
        .map((m) => `${m.role === "user" ? "Patient" : "AI"}: ${m.content}`)
        .join("\n");

      const prompt = `Based on the following patient conversation and symptoms, recommend specific diagnostic tests and provide a summary.

Patient symptoms: ${diagnostic.symptom}
Initial assessment: ${diagnostic.ai_summary}

Conversation:
${chatContext}

Please respond in this exact JSON format:
{
  "recommendedTests": ["test_id_1", "test_id_2"],
  "summary": "Detailed clinical summary"
}

Available test IDs: fasting_glucose_blood_test, cardiovascular_risk_panel, kidney_function_test, liver_enzyme_panel`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      const data = await response.json();
      const content = data.reply || data.message || data.content || "";

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*"recommendedTests"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setRecommendation({
          recommendedTests: parsed.recommendedTests || [],
          summary: parsed.summary || content,
        });
      } else {
        // Fallback if no JSON found
        setRecommendation({
          recommendedTests: [],
          summary: content,
        });
      }
    } catch (error) {
      console.error("Error getting recommendations:", error);
      setRecommendation({
        recommendedTests: [],
        summary: "Unable to generate recommendations at this time.",
      });
    } finally {
      setIsRecommending(false);
    }
  };

  const handleProceedWithTests = async () => {
    if (!diagnostic || !recommendation) return;

    try {
      // Create test records via server action
      const response = await fetch(`/api/diagnostics/${diagnostic.id}/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tests: recommendation.recommendedTests.map((testId) => ({
            test_id: testId,
            test_name: formatTestName(testId),
            status: "pending",
          })),
          summary: recommendation.summary,
        }),
      });

      if (response.ok) {
        // Navigate to tests step
        router.replace(`/diagnostics/${diagnostic.id}?step=tests`);
      } else {
        console.error("Failed to create tests");
      }
    } catch (error) {
      console.error("Error creating tests:", error);
    }
  };

  const formatTestName = (testId: string): string => {
    return testId
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (!diagnostic) {
    return (
      <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="text-center text-slate-600 dark:text-slate-400">
          Loading diagnostic information...
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Initial Symptoms Card */}
      <Card className="p-6 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-brand-500 to-cyan-500">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">
              Initial Symptoms
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Reported on{" "}
              {new Date(diagnostic.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <p className="text-slate-900 dark:text-white leading-relaxed">
                {diagnostic.symptom}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Interactive Chat */}
      <Card className="backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col" style={{ height: "500px" }}>
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">AI Medical Assistant</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Discuss your symptoms to get personalized test recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-brand-500 to-cyan-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-slate-600 dark:text-slate-400" />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe additional symptoms or ask questions..."
              disabled={isLoading}
              className="flex-1 bg-white dark:bg-slate-900"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>

      {/* Recommendation Section */}
      {!recommendation ? (
        <Card className="p-6 backdrop-blur-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Beaker className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-200 mb-1">
                  Ready for Test Recommendations?
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Based on your conversation, I can recommend specific diagnostic tests
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.replace(`/diagnostics/${diagnostic.id}?step=tests`)}
                className="border-slate-300 dark:border-slate-700 text-sm"
              >
                Skip to Tests
              </Button>
              <Button
                onClick={handleRecommendTests}
                disabled={isRecommending}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                {isRecommending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Recommend Tests
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary Card */}
          <Card className="p-6 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Clinical Summary
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {recommendation.summary}
                </p>
              </div>
            </div>
          </Card>

          {/* Recommended Tests */}
          {recommendation.recommendedTests.length > 0 ? (
            <Card className="p-6 backdrop-blur-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
              <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-3 flex items-center gap-2">
                <Beaker className="w-5 h-5" />
                Recommended Diagnostic Tests
              </h3>
              <ul className="space-y-2 mb-4">
                {recommendation.recommendedTests.map((testId, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-purple-800 dark:text-purple-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    {formatTestName(testId)}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleProceedWithTests}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
              >
                Proceed with These Tests
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          ) : (
            <Card className="p-6 backdrop-blur-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div className="flex-1">
                  <p className="text-sm text-amber-900 dark:text-amber-200 mb-3">
                    No specific tests were recommended based on the current conversation. You can continue chatting for more details or skip to the tests phase.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => router.replace(`/diagnostics/${diagnostic.id}?step=tests`)}
                    className="border-amber-300 dark:border-amber-700"
                  >
                    Skip to Tests
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
