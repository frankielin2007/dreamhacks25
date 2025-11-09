"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Heart, Droplet, Loader2, CheckCircle2 } from "lucide-react";

interface TestRecord {
  id: string;
  diagnostic_id: string;
  test_name: string;
  status: string;
  result_file: string;
  test_id: string;
}

interface RiskResult {
  probability: number;
  label: string;
  riskCategory?: string;
  model?: string;
}

interface StepResultsProps {
  tests: TestRecord[];
  diagnosticId: string;
  onNext?: () => void;
  onRiskCalculated?: (results: {
    diabetes?: RiskResult;
    heart?: RiskResult;
  }) => void;
}

export default function StepResults({ tests, diagnosticId, onNext, onRiskCalculated }: StepResultsProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<{
    diabetes?: RiskResult;
    heart?: RiskResult;
  }>({});
  
  // Note: diagnosticId is available for future use (e.g., saving results to database)
  console.log("StepResults diagnosticId:", diagnosticId);
  
  // Common fields
  const [sex, setSex] = useState<"male" | "female">("male");
  const [age, setAge] = useState("");
  const [sbp, setSbp] = useState("");
  const [hdl, setHdl] = useState("");
  const [onBpTherapy, setOnBpTherapy] = useState(false);
  
  // Diabetes-specific fields
  const [bmi, setBmi] = useState("");
  const [triglycerides, setTriglycerides] = useState("");
  const [fastingGlucose, setFastingGlucose] = useState("");
  const [parentalDiabetes, setParentalDiabetes] = useState(false);
  
  // Heart disease-specific fields
  const [totalChol, setTotalChol] = useState("");
  const [smoker, setSmoker] = useState(false);
  const [diabetes, setDiabetes] = useState(false);

  const hasDiabetesTest = tests.some(t => 
    t.test_id.includes("diabetes") || 
    t.test_name.toLowerCase().includes("diabetes") ||
    t.test_name.toLowerCase().includes("glucose")
  );
  
  const hasHeartTest = tests.some(t => 
    t.test_id.includes("heart") || 
    t.test_id.includes("cvd") ||
    t.test_name.toLowerCase().includes("heart") ||
    t.test_name.toLowerCase().includes("cardiovascular") ||
    t.test_name.toLowerCase().includes("cholesterol")
  );

  const handleCalculateRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    try {
      const calculatedResults: {
        diabetes?: RiskResult;
        heart?: RiskResult;
      } = {};
      
      // Calculate diabetes risk if applicable
      if (hasDiabetesTest) {
        const diabetesPayload = {
          sex,
          age: parseFloat(age),
          bmi: parseFloat(bmi),
          sbp: parseFloat(sbp),
          onBpTherapy,
          hdl: parseFloat(hdl),
          tg: parseFloat(triglycerides),
          fastingGlucose: parseFloat(fastingGlucose),
          parentalHistory: parentalDiabetes,
        };
        
        console.log("🩺 Sending diabetes prediction:", diabetesPayload);
        
        const diabetesRes = await fetch("/api/predict-diabetes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(diabetesPayload),
        });
        
        if (diabetesRes.ok) {
          calculatedResults.diabetes = await diabetesRes.json();
          console.log("✅ Diabetes result:", calculatedResults.diabetes);
        } else {
          const error = await diabetesRes.json();
          console.error("❌ Diabetes prediction failed:", error);
        }
      }
      
      // Calculate heart disease risk if applicable
      if (hasHeartTest) {
        const heartPayload = {
          sex,
          age: parseFloat(age),
          totalChol: parseFloat(totalChol),
          hdl: parseFloat(hdl),
          sbp: parseFloat(sbp),
          treated: onBpTherapy,
          smoker,
          diabetes,
        };
        
        console.log("🫀 Sending heart prediction:", heartPayload);
        
        const heartRes = await fetch("/api/predict-heart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(heartPayload),
        });
        
        if (heartRes.ok) {
          calculatedResults.heart = await heartRes.json();
          console.log("✅ Heart result:", calculatedResults.heart);
        } else {
          const error = await heartRes.json();
          console.error("❌ Heart prediction failed:", error);
        }
      }
      
      setResults(calculatedResults);
      
      // Notify parent component of calculated results
      if (onRiskCalculated) {
        onRiskCalculated(calculatedResults);
      }
    } catch (error) {
      console.error("Error calculating risk:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 backdrop-blur-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-green-500">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-display font-bold text-green-900 dark:text-green-200 mb-1">
              Enter Test Results
            </h2>
            <p className="text-sm text-green-700 dark:text-green-300">
              Input your test results below to calculate your health risk scores
            </p>
          </div>
        </div>
      </Card>

      {/* Recommended Tests Info */}
      {tests.length > 0 && (
        <Card className="p-4 backdrop-blur-lg bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            📋 Recommended Tests
          </h3>
          <div className="flex flex-wrap gap-2">
            {tests.map((test) => (
              <span
                key={test.id}
                className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
              >
                {test.test_name}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Input Form */}
      <form onSubmit={handleCalculateRisk} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <select
                id="sex"
                value={sex}
                onChange={(e) => setSex(e.target.value as "male" | "female")}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age (years)</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 45"
                min="20"
                max="79"
                required
              />
            </div>
          </div>
        </Card>

        {/* Blood Pressure & Cholesterol */}
        <Card className="p-6 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
            Blood Pressure & Cholesterol
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sbp">Systolic Blood Pressure (mmHg)</Label>
              <Input
                id="sbp"
                type="number"
                value={sbp}
                onChange={(e) => setSbp(e.target.value)}
                placeholder="e.g., 120"
                min="90"
                max="200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hdl">HDL Cholesterol (mg/dL)</Label>
              <Input
                id="hdl"
                type="number"
                value={hdl}
                onChange={(e) => setHdl(e.target.value)}
                placeholder="e.g., 50"
                min="20"
                max="100"
                required
              />
            </div>
            {hasHeartTest && (
              <div className="space-y-2">
                <Label htmlFor="totalChol">Total Cholesterol (mg/dL)</Label>
                <Input
                  id="totalChol"
                  type="number"
                  value={totalChol}
                  onChange={(e) => setTotalChol(e.target.value)}
                  placeholder="e.g., 200"
                  min="100"
                  max="405"
                  required={hasHeartTest}
                />
              </div>
            )}
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="onBpTherapy"
                checked={onBpTherapy}
                onChange={(e) => setOnBpTherapy(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
              />
              <Label htmlFor="onBpTherapy" className="cursor-pointer">
                On BP medication
              </Label>
            </div>
          </div>
        </Card>

        {/* Diabetes-specific fields */}
        {hasDiabetesTest && (
          <Card className="p-6 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              <Droplet className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Diabetes Risk Factors
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bmi">BMI (Body Mass Index)</Label>
                <Input
                  id="bmi"
                  type="number"
                  step="0.1"
                  value={bmi}
                  onChange={(e) => setBmi(e.target.value)}
                  placeholder="e.g., 25.5"
                  min="15"
                  max="60"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="triglycerides">Triglycerides (mg/dL)</Label>
                <Input
                  id="triglycerides"
                  type="number"
                  value={triglycerides}
                  onChange={(e) => setTriglycerides(e.target.value)}
                  placeholder="e.g., 150"
                  min="30"
                  max="1000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fastingGlucose">Fasting Glucose (mg/dL)</Label>
                <Input
                  id="fastingGlucose"
                  type="number"
                  value={fastingGlucose}
                  onChange={(e) => setFastingGlucose(e.target.value)}
                  placeholder="e.g., 100"
                  min="60"
                  max="200"
                  required
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="parentalDiabetes"
                  checked={parentalDiabetes}
                  onChange={(e) => setParentalDiabetes(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                />
                <Label htmlFor="parentalDiabetes" className="cursor-pointer">
                  Parent has diabetes
                </Label>
              </div>
            </div>
          </Card>
        )}

        {/* Heart disease-specific fields */}
        {hasHeartTest && (
          <Card className="p-6 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              <Heart className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Cardiovascular Risk Factors
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="smoker"
                  checked={smoker}
                  onChange={(e) => setSmoker(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                />
                <Label htmlFor="smoker" className="cursor-pointer">
                  Current smoker
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="diabetes"
                  checked={diabetes}
                  onChange={(e) => setDiabetes(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                />
                <Label htmlFor="diabetes" className="cursor-pointer">
                  Has diabetes
                </Label>
              </div>
            </div>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isCalculating}
          className="w-full bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white shadow-lg py-6 text-lg"
        >
          {isCalculating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Calculating Risk...
            </>
          ) : (
            <>
              <Activity className="w-5 h-5 mr-2" />
              Calculate Risk Scores
            </>
          )}
        </Button>
      </form>

      {/* Results Display */}
      {(results.diabetes || results.heart) && (
        <div className="space-y-4">
          <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            Risk Assessment Results
          </h3>
          
          {results.diabetes && (
            <Card className="p-6 backdrop-blur-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-500">
                  <Droplet className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    Diabetes Risk
                  </h4>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {(results.diabetes.probability * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    8-year risk: <span className="font-medium">{results.diabetes.label}</span>
                  </p>
                  {results.diabetes.riskCategory && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Category: <span className="font-medium">{results.diabetes.riskCategory}</span>
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}
          
          {results.heart && (
            <Card className="p-6 backdrop-blur-lg bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-red-500">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">
                    Cardiovascular Disease Risk
                  </h4>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                    {(results.heart.probability * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    10-year risk: <span className="font-medium">{results.heart.label}</span>
                  </p>
                  {results.heart.riskCategory && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Category: <span className="font-medium">{results.heart.riskCategory}</span>
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {onNext && (
            <Button
              onClick={onNext}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg py-6 text-lg"
            >
              Continue to Risk Summary
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
