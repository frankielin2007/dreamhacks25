"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Heart, 
  Activity, 
  Calendar, 
  TrendingDown,
  Lightbulb,
  Apple,
  Dumbbell,
  Moon,
  Stethoscope
} from "lucide-react";

interface RiskResult {
  probability: number;
  label: string;
  riskCategory?: string;
}

interface LowRiskReassuranceProps {
  riskResults: {
    diabetes?: RiskResult;
    heart?: RiskResult;
  };
  maxRisk: number;
}

export default function LowRiskReassurance({ riskResults, maxRisk }: LowRiskReassuranceProps) {
  const [reminderSet, setReminderSet] = useState(false);

  const handleSetReminder = () => {
    // In production, this would call an API to schedule a reminder
    setReminderSet(true);
    console.log("✅ Lab recheck reminder set for 3 months");
  };

  return (
    <div className="space-y-6">
      {/* Positive Results Header */}
      <Card className="p-6 backdrop-blur-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-green-500">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-display font-bold text-green-900 dark:text-green-200 mb-2">
              ✅ Good News - Low Risk Assessment
            </h2>
            <p className="text-sm text-green-700 dark:text-green-300 mb-4">
              Your risk assessment shows a <strong>{(maxRisk * 100).toFixed(1)}%</strong> probability, 
              which falls within the low-risk category. Continue your healthy habits to maintain these positive results!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {riskResults.diabetes && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-green-800 dark:text-green-200">
                    <strong>Diabetes:</strong> {(riskResults.diabetes.probability * 100).toFixed(1)}% - {riskResults.diabetes.label}
                  </span>
                </div>
              )}
              {riskResults.heart && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-green-800 dark:text-green-200">
                    <strong>Heart Disease:</strong> {(riskResults.heart.probability * 100).toFixed(1)}% - {riskResults.heart.label}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Risk Trend Visualization */}
      <Card className="p-6 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-blue-500">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Your Health Status
          </h3>
        </div>
        
        <div className="space-y-4">
          {riskResults.diabetes && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Diabetes Risk
                </span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {(riskResults.diabetes.probability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${riskResults.diabetes.probability * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Well below the 20% high-risk threshold
              </p>
            </div>
          )}
          
          {riskResults.heart && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Cardiovascular Risk
                </span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {(riskResults.heart.probability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${riskResults.heart.probability * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Well below the 20% high-risk threshold
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Self-Care Instructions */}
      <Card className="p-6 backdrop-blur-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-blue-500">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
            Keep Up The Good Work!
          </h3>
        </div>
        
        <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
          Your results are excellent! Here are some tips to maintain your health:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-white/60 dark:bg-slate-800/60">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Apple className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm">
                Balanced Diet
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Continue eating plenty of fruits, vegetables, and whole grains. Limit processed foods and sugary drinks.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-white/60 dark:bg-slate-800/60">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Dumbbell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm">
                Regular Exercise
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Aim for 150 minutes of moderate activity per week. Walking, swimming, or cycling are excellent choices.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-white/60 dark:bg-slate-800/60">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm">
                Quality Sleep
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Get 7-9 hours of sleep each night. Good sleep supports metabolic and cardiovascular health.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-white/60 dark:bg-slate-800/60">
            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
              <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm">
                Stress Management
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Practice relaxation techniques like meditation or yoga. Manage stress to protect your heart.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Follow-up Recommendation */}
      <Card className="p-6 backdrop-blur-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-purple-500">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">
              Recommended Follow-Up
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
              To stay on top of your health, we recommend rechecking your labs in <strong>3 months</strong>. 
              Regular monitoring helps catch any changes early.
            </p>
            
            {!reminderSet ? (
              <Button
                onClick={handleSetReminder}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Set 3-Month Reminder
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Reminder set! We&apos;ll email you in 3 months.</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* When to Seek Care */}
      <Card className="p-6 backdrop-blur-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-amber-500">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
              When to Contact Your Doctor
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
              While your current risk is low, contact your healthcare provider if you experience:
            </p>
            <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>New or worsening symptoms (chest pain, shortness of breath, excessive thirst)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>Significant weight changes or fatigue</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>Family history changes (new diagnosis in close relatives)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>Major lifestyle changes affecting your health</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Completion Message */}
      <Card className="p-6 backdrop-blur-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-700 text-center">
        <Activity className="w-12 h-12 mx-auto mb-3 text-brand-500" />
        <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">
          Assessment Complete! 🎉
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
          You&apos;ve completed your health assessment. Keep up the great work, and remember that 
          prevention is the best medicine!
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Thank you for using <strong className="text-brand-500">FluxCare</strong> - 
          Your AI-powered health companion
        </p>
      </Card>
    </div>
  );
}
