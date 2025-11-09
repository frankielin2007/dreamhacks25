"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageContainer from "@/components/app/PageContainer";
import {
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowRight,
  Activity,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// Mock data for trends (predictions per day over last 7 days)
const trendData = [
  { day: "Mon", predictions: 12 },
  { day: "Tue", predictions: 19 },
  { day: "Wed", predictions: 15 },
  { day: "Thu", predictions: 25 },
  { day: "Fri", predictions: 22 },
  { day: "Sat", predictions: 18 },
  { day: "Sun", predictions: 20 },
];

// Risk distribution colors
const RISK_COLORS = {
  high: "#EF4444", // red-500
  moderate: "#F59E0B", // amber-500
  low: "#10B981", // green-500
};

interface DiagnosticRecord {
  id: string;
  symptom: string;
  ai_summary: string;
  status: string;
  created_at: string;
  test_name?: string;
}

interface KPIData {
  patientsOnboarded: number;
  highRiskCases: number;
  minutesSaved: number;
  riskDistribution: Array<{ name: string; value: number; color: string }>;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [diagnostics, setDiagnostics] = useState<DiagnosticRecord[]>([]);
  const [kpiData, setKpiData] = useState<KPIData>({
    patientsOnboarded: 0,
    highRiskCases: 0,
    minutesSaved: 0,
    riskDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        // Fetch diagnostics
        const { data: diagnosticsData, error: diagnosticsError } =
          await supabase
            .from("diagnostics")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5);

        if (!diagnosticsError && diagnosticsData) {
          setDiagnostics(diagnosticsData);

          // Calculate KPIs
          const totalDiagnostics = diagnosticsData.length;
          
          // Mock high-risk calculation (in real app, fetch from predictions table)
          const highRisk = Math.floor(totalDiagnostics * 0.3);
          
          // Calculate risk distribution
          const low = Math.floor(totalDiagnostics * 0.5);
          const moderate = Math.floor(totalDiagnostics * 0.2);
          const high = totalDiagnostics - low - moderate;

          setKpiData({
            patientsOnboarded: totalDiagnostics,
            highRiskCases: highRisk,
            minutesSaved: totalDiagnostics * 12, // 12 minutes saved per diagnostic
            riskDistribution: [
              { name: "Low Risk", value: low, color: RISK_COLORS.low },
              { name: "Moderate", value: moderate, color: RISK_COLORS.moderate },
              { name: "High Risk", value: high, color: RISK_COLORS.high },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* KPI Cards */}
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
          {/* Patients Onboarded */}
          <Card className="glass p-6 border-border/50 hover:shadow-soft transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Patients Onboarded
                </p>
                <h3 className="text-3xl font-display font-bold mt-2">
                  {kpiData.patientsOnboarded}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  +12% from last week
                </p>
              </div>
              <div className="p-3 rounded-lg bg-brand-500/10">
                <Users className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
            </div>
          </Card>

          {/* High-Risk Cases */}
          <Card className="glass p-6 border-border/50 hover:shadow-soft transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  High-Risk Cases
                </p>
                <h3 className="text-3xl font-display font-bold mt-2">
                  {kpiData.highRiskCases}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Activity className="h-3 w-3 text-amber-500" />
                  Requires attention
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>

          {/* Minutes Saved */}
          <Card className="glass p-6 border-border/50 hover:shadow-soft transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Minutes Saved
                </p>
                <h3 className="text-3xl font-display font-bold mt-2">
                  {kpiData.minutesSaved}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  ~{Math.floor(kpiData.minutesSaved / 60)}h {kpiData.minutesSaved % 60}m total
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2">
          {/* Trend Chart */}
          <Card className="glass p-6 border-border/50">
            <div className="mb-4">
              <h3 className="font-display font-semibold text-lg">
                Predictions Trend
              </h3>
              <p className="text-sm text-muted-foreground">
                Daily predictions over the last 7 days
              </p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorPredictions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="predictions"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPredictions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Risk Distribution Donut */}
          <Card className="glass p-6 border-border/50">
            <div className="mb-4">
              <h3 className="font-display font-semibold text-lg">
                Risk Distribution
              </h3>
              <p className="text-sm text-muted-foreground">
                Patient risk categories breakdown
              </p>
            </div>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={kpiData.riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {kpiData.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {kpiData.riskDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Diagnostics Table */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-border/50">
            <div className="p-6 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold text-lg">
                    Recent Diagnostics
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your latest patient assessments
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/diagnostics" className="flex items-center gap-2">
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Type</TableHead>
                  <TableHead>Symptom</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diagnostics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No diagnostics yet. Start by running a test.
                    </TableCell>
                  </TableRow>
                ) : (
                  diagnostics.map((diagnostic) => (
                    <TableRow key={diagnostic.id}>
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-medium">
                          {diagnostic.test_name || "General"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {diagnostic.symptom}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-muted-foreground">
                        {diagnostic.ai_summary}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            diagnostic.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                              : diagnostic.status === "scheduled"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {diagnostic.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(diagnostic.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/diagnostics/${diagnostic.id}`}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </motion.div>

        {/* Analytics CTA */}
        <motion.div variants={itemVariants}>
          <Card className="glass p-6 border-brand-200 dark:border-brand-800 bg-gradient-to-br from-brand-50/50 to-accent-50/50 dark:from-brand-950/50 dark:to-accent-950/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-lg mb-1">
                  Want deeper insights?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Explore comprehensive analytics and trends for all your patients
                </p>
              </div>
              <Button asChild className="bg-brand-600 hover:bg-brand-700 text-white">
                <Link href="/analytics" className="flex items-center gap-2">
                  See all analytics
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
