"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Loader2,
  User,
  Bell
} from "lucide-react";

interface RiskResult {
  probability: number;
  label: string;
  riskCategory?: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

interface HighRiskCareSchedulingProps {
  diagnosticId: string;
  riskResults: {
    diabetes?: RiskResult;
    heart?: RiskResult;
  };
  maxRisk: number;
  existingAppointments: Appointment[];
  onRefreshAppointments: () => void;
}

export default function HighRiskCareScheduling({
  diagnosticId,
  riskResults,
  maxRisk,
  existingAppointments,
  onRefreshAppointments,
}: HighRiskCareSchedulingProps) {
  const { user } = useUser();
  const [isScheduling, setIsScheduling] = useState(false);
  const [isGeneratingPacket, setIsGeneratingPacket] = useState(false);
  const [packetGenerated, setPacketGenerated] = useState(false);
  
  // Start with no appointment scheduled - user must explicitly schedule
  const [appointmentScheduled, setAppointmentScheduled] = useState(false);
  
  // Appointment form fields
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("09:00");
  const [notes, setNotes] = useState("");

  // Auto-generate pre-visit packet on mount
  useEffect(() => {
    if (!packetGenerated) {
      generatePreVisitPacket();
    }
  }, []);

  const generatePreVisitPacket = async () => {
    setIsGeneratingPacket(true);
    try {
      // Simulate packet generation - in production, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Call API to save pre-visit packet to database
      // This should include:
      // - Patient symptoms
      // - Test results
      // - Risk scores
      // - Suggested ICD-10 codes
      
      setPacketGenerated(true);
      console.log("✅ Pre-visit packet generated for diagnostic:", diagnosticId);
    } catch (error) {
      console.error("Failed to generate pre-visit packet:", error);
    } finally {
      setIsGeneratingPacket(false);
    }
  };

  const handleScheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please sign in to schedule an appointment");
      return;
    }

    setIsScheduling(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          diagnosticId,
          preferredDate: appointmentDate,
          preferredTime: appointmentTime,
          isHighRisk: true, // Flag for doctor dashboard - creates consultation type
        }),
      });

      if (response.ok) {
        setAppointmentScheduled(true);
        await onRefreshAppointments();
        
        // Show success message with pending approval note
        alert("✅ High-priority appointment request submitted!\n\nYour appointment is pending doctor confirmation. You'll receive a confirmation email once approved by your healthcare provider.");
      } else {
        const error = await response.json();
        console.error("Failed to schedule appointment:", error);
        alert("Failed to schedule appointment. Please try again.");
      }
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsScheduling(false);
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 0.3) return "red";
    if (risk >= 0.2) return "orange";
    return "yellow";
  };

  const riskColor = getRiskColor(maxRisk);
  const colorClasses = {
    red: {
      bg: "from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-900 dark:text-red-200",
      icon: "bg-red-500",
      button: "from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600",
    },
    orange: {
      bg: "from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20",
      border: "border-orange-200 dark:border-orange-800",
      text: "text-orange-900 dark:text-orange-200",
      icon: "bg-orange-500",
      button: "from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
    },
    yellow: {
      bg: "from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
      border: "border-yellow-200 dark:border-yellow-800",
      text: "text-yellow-900 dark:text-yellow-200",
      icon: "bg-yellow-500",
      button: "from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600",
    },
  };

  const colors = colorClasses[riskColor];

  return (
    <div className="space-y-6">
      {/* High Risk Alert */}
      <Card className={`p-6 backdrop-blur-lg bg-gradient-to-r ${colors.bg} ${colors.border}`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${colors.icon} animate-pulse`}>
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-display font-bold ${colors.text} mb-2`}>
              High Risk Detected - Immediate Care Recommended
            </h2>
            <p className={`text-sm ${colors.text} mb-4`}>
              Your risk assessment indicates a <strong>{(maxRisk * 100).toFixed(1)}%</strong> probability, 
              which requires clinical attention. We&apos;ve prepared everything you need for a seamless consultation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {riskResults.diabetes && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className={colors.text}>
                    <strong>Diabetes:</strong> {(riskResults.diabetes.probability * 100).toFixed(1)}%
                  </span>
                </div>
              )}
              {riskResults.heart && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className={colors.text}>
                    <strong>Heart Disease:</strong> {(riskResults.heart.probability * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Pre-Visit Packet Status */}
      <Card className="p-6 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${packetGenerated ? 'bg-green-500' : 'bg-blue-500'}`}>
            {isGeneratingPacket ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : packetGenerated ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : (
              <FileText className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              {isGeneratingPacket ? "Preparing Your Pre-Visit Packet..." : 
               packetGenerated ? "✅ Pre-Visit Packet Ready" : "Pre-Visit Packet"}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {packetGenerated 
                ? "Your complete medical summary has been prepared for your clinician. This includes your symptoms, test results, risk assessment, and suggested diagnostic codes."
                : "Generating a comprehensive summary for your doctor..."
              }
            </p>
            {packetGenerated && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Symptoms & medical history compiled</span>
                </div>
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Test results & risk scores included</span>
                </div>
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ICD-10 codes suggested for billing</span>
                </div>
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Flagged as high-risk in doctor&apos;s dashboard</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Appointment Scheduling */}
      {!appointmentScheduled ? (
        <Card className="p-6 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-lg bg-gradient-to-r ${colors.button}`}>
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                Schedule Priority Consultation
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Book an appointment with a clinician at Shands Hospital
              </p>
            </div>
          </div>

          <form onSubmit={handleScheduleAppointment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointmentDate">Preferred Date</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointmentTime">Preferred Time</Label>
                <select
                  id="appointmentTime"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                >
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific concerns or questions for your doctor..."
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white min-h-[100px]"
              />
            </div>

            <Button
              type="submit"
              disabled={isScheduling}
              className={`w-full bg-gradient-to-r ${colors.button} text-white shadow-lg py-6 text-lg`}
            >
              {isScheduling ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5 mr-2" />
                  Confirm Priority Appointment
                </>
              )}
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="p-6 backdrop-blur-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-amber-500">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-display font-bold text-amber-900 dark:text-amber-200 mb-2">
                ⏳ Appointment Request Submitted
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                Your high-priority consultation request has been submitted and is pending doctor confirmation. You&apos;ll receive a confirmation email once approved by your healthcare provider.
              </p>
              {existingAppointments[0] && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
                    <Calendar className="w-4 h-4" />
                    <span>
                      <strong>Date:</strong> {new Date(existingAppointments[0].appointment_date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
                    <Clock className="w-4 h-4" />
                    <span><strong>Time:</strong> {existingAppointments[0].appointment_time}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Preparation Instructions */}
      <Card className="p-6 backdrop-blur-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-500">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
              📋 What to Bring & Prepare
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>Valid photo ID</strong> and insurance card</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>Fasting required:</strong> No food 8 hours before (water okay)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>Medication list:</strong> Bring all current medications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>Arrive 15 minutes early</strong> for check-in</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>Questions prepared:</strong> Write down any concerns</span>
              </li>
            </ul>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-4 italic">
              💡 You&apos;ll receive email reminders 24 hours and 2 hours before your appointment
            </p>
          </div>
        </div>
      </Card>

      {/* Location Info */}
      <Card className="p-4 backdrop-blur-lg bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-slate-500 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="text-slate-900 dark:text-white font-semibold mb-1">
              📍 Shands Hospital
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              1600 SW Archer Rd, Gainesville, FL 32610<br />
              Phone: (352) 265-0111
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
