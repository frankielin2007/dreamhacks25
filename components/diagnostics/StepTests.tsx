"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Beaker, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface TestRecord {
  id: string;
  diagnostic_id: string;
  test_name: string;
  status: string;
  result_file: string;
  test_id: string;
}

interface StepTestsProps {
  tests: TestRecord[];
  onSelectTest: (test: TestRecord) => void;
}

export default function StepTests({ tests, onSelectTest }: StepTestsProps) {
  const pendingTests = tests.filter((t) => t.status === "pending");
  const completedTests = tests.filter((t) => t.status === "completed");
  const inProgressTests = tests.filter((t) => t.status === "in_progress");

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: {
        bg: "bg-yellow-100 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800",
        text: "text-yellow-800 dark:text-yellow-300",
        icon: <Clock className="w-3 h-3" />,
      },
      completed: {
        bg: "bg-green-100 dark:bg-green-950/30 border-green-200 dark:border-green-800",
        text: "text-green-800 dark:text-green-300",
        icon: <CheckCircle2 className="w-3 h-3" />,
      },
      in_progress: {
        bg: "bg-blue-100 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
        text: "text-blue-800 dark:text-blue-300",
        icon: <AlertCircle className="w-3 h-3" />,
      },
    };

    const config = configs[status as keyof typeof configs] || configs.pending;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text}`}
      >
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
      </span>
    );
  };

  if (tests.length === 0) {
    return (
      <Card className="p-12 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-lg text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-gradient-to-r from-brand-500 to-cyan-500">
            <Beaker className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">
              No Tests Assigned
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              No diagnostic tests have been assigned to this case yet. Tests will appear here once
              they are recommended.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 backdrop-blur-lg bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
                {pendingTests.length}
              </div>
              <div className="text-xs text-yellow-700 dark:text-yellow-300">Pending</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 backdrop-blur-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                {inProgressTests.length}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300">In Progress</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 backdrop-blur-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-200">
                {completedTests.length}
              </div>
              <div className="text-xs text-green-700 dark:text-green-300">Completed</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tests Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {tests.map((test) => (
          <Card
            key={test.id}
            className="p-5 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start gap-3">
                <h3 className="font-semibold text-slate-900 dark:text-white leading-tight flex-1">
                  {test.test_name}
                </h3>
                {getStatusBadge(test.status)}
              </div>

              {/* Test ID */}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Test ID:</span>
                <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1 rounded">
                  {test.test_id}
                </span>
              </div>

              {/* Result File Link */}
              {test.result_file && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Results:</span>
                  <a
                    href={test.result_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
                  >
                    View File →
                  </a>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {test.status === "pending" && (
                  <Button
                    onClick={() => onSelectTest(test)}
                    className="flex-1 bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white shadow-md"
                  >
                    Enter Results
                  </Button>
                )}
                {test.status === "completed" && test.result_file && (
                  <Button
                    onClick={() => onSelectTest(test)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md"
                  >
                    View Results
                  </Button>
                )}
                {test.status === "in_progress" && (
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-300 dark:border-slate-700"
                  >
                    Check Status
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Info Note */}
      {pendingTests.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <span className="text-xl">📋</span>
            <div className="flex-1">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>Action Required:</strong> You have {pendingTests.length} pending{" "}
                {pendingTests.length === 1 ? "test" : "tests"}. Click &quot;Enter Results&quot; to
                input test data and view ML-powered risk predictions.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
