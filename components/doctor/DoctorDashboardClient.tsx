"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  CheckCircle,
  Activity,
  Stethoscope,
  FlaskConical,
  Calendar,
} from "lucide-react";
import AvailabilityManager from "@/components/availability/AvailabilityManager";
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

interface ConfirmedAppointment {
  id: string;
  user_id: string;
  diagnostic_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
  appointment_type?: string; // 'test' or 'consultation'
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    street_address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    insurance_provider?: string;
    insurance_id?: string;
    group_number?: string;
  } | null;
  diagnostic: {
    symptom: string;
    ai_summary: string;
    hospital: string;
    created_at: string;
  } | null;
}

interface Stats {
  total: number;
  confirmed: number;
  scheduled: number;
  cancelled: number;
  todayAppointments: number;
}

interface DoctorDashboardClientProps {
  initialAppointments: ConfirmedAppointment[];
  initialStats: Stats;
}

// Mock trend data (appointments per day over last 7 days)
const trendData = [
  { day: "Mon", appointments: 8 },
  { day: "Tue", appointments: 12 },
  { day: "Wed", appointments: 10 },
  { day: "Thu", appointments: 15 },
  { day: "Fri", appointments: 14 },
  { day: "Sat", appointments: 6 },
  { day: "Sun", appointments: 9 },
];

// Status distribution colors
const RISK_COLORS = {
  scheduled: "#F59E0B", // amber-500
  confirmed: "#10B981", // green-500
  cancelled: "#EF4444", // red-500
};

export default function DoctorDashboardClient({
  initialAppointments,
  initialStats,
}: DoctorDashboardClientProps) {
  const router = useRouter();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [stats, setStats] = useState(initialStats);
  const [selectedPatient, setSelectedPatient] =
    useState<ConfirmedAppointment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"appointments" | "availability">("appointments");

  console.log("🔍 Doctor Dashboard - Active Tab:", activeTab);

  // High-risk patients: consultation type, not confirmed and not cancelled
  const highRiskCount = appointments.filter(
    (a) => a.appointment_type === "consultation" && 
           a.status !== "confirmed" && 
           a.status !== "cancelled"
  ).length;

  // Helper function to determine test type from diagnostic
  const getTestType = (diagnostic: ConfirmedAppointment['diagnostic']): string => {
    if (!diagnostic) return "General Test";
    
    const symptom = diagnostic.symptom?.toLowerCase() || "";
    const summary = diagnostic.ai_summary?.toLowerCase() || "";
    const combined = symptom + " " + summary;
    
    // Check for specific test types based on symptoms/keywords
    if (combined.includes("diabetes") || combined.includes("blood sugar") || combined.includes("glucose")) {
      return "Blood Glucose Test";
    } else if (combined.includes("heart") || combined.includes("cardiovascular") || combined.includes("chest pain") || combined.includes("cardiac")) {
      return "Cardiovascular Assessment";
    } else if (combined.includes("blood pressure") || combined.includes("hypertension")) {
      return "Blood Pressure Test";
    } else if (combined.includes("cholesterol") || combined.includes("lipid")) {
      return "Cholesterol Panel";
    } else if (combined.includes("thyroid")) {
      return "Thyroid Function Test";
    } else if (combined.includes("kidney") || combined.includes("renal")) {
      return "Kidney Function Test";
    } else if (combined.includes("liver")) {
      return "Liver Function Test";
    } else {
      return "Diagnostic Test";
    }
  };

  // Status distribution for pie chart
  const statusDistribution = [
    {
      name: "Scheduled",
      value: stats.scheduled,
      color: RISK_COLORS.scheduled,
    },
    {
      name: "Confirmed",
      value: stats.confirmed,
      color: RISK_COLORS.confirmed,
    },
    {
      name: "Cancelled",
      value: stats.cancelled,
      color: RISK_COLORS.cancelled,
    },
  ];

  const handleStatusUpdate = async (
    appointmentId: string,
    newStatus: string
  ) => {
    setIsUpdating(appointmentId);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId ? { ...apt, status: newStatus } : apt
          )
        );

        const oldStatus = appointments.find(
          (a) => a.id === appointmentId
        )?.status;
        setStats((prev) => {
          const updated = { ...prev };
          if (oldStatus === "scheduled") updated.scheduled--;
          if (oldStatus === "confirmed") updated.confirmed--;
          if (oldStatus === "cancelled") updated.cancelled--;

          if (newStatus === "scheduled") updated.scheduled++;
          if (newStatus === "confirmed") updated.confirmed++;
          if (newStatus === "cancelled") updated.cancelled++;

          return updated;
        });

        // Show success message
        if (newStatus === "confirmed") {
          alert("✅ Appointment confirmed! Confirmation email has been sent to the patient.");
        } else if (newStatus === "cancelled") {
          alert("Appointment cancelled successfully.");
        }

        router.refresh();
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert("Failed to update appointment status");
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "high-risk") {
      return apt.appointment_type === "consultation" && 
             apt.status !== "confirmed" && 
             apt.status !== "cancelled";
    }
    return apt.status === filterStatus;
  });

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

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="mb-2">
            <h1 className="text-4xl font-display font-bold tracking-tight">
              Doctor Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage appointments and monitor patient health
            </p>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mt-4 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("appointments")}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "appointments"
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Appointments
            </button>
            <button
              onClick={() => {
                console.log("🔵 Availability tab clicked!");
                setActiveTab("availability");
              }}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "availability"
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Availability
            </button>
          </div>
        </motion.div>

        {/* Conditional Content Based on Active Tab */}
        {activeTab === "availability" ? (
          /* Availability Tab */
          <div key="availability-tab" className="mt-6">
            <AvailabilityManager />
          </div>
        ) : (
          /* Appointments Tab (existing content) */
          <div key="appointments-tab">
            {/* KPI Cards */}
            <motion.div
              variants={itemVariants}
              className="grid gap-4 md:grid-cols-4"
            >
              {/* Total Appointments */}
              <Card className="glass p-6 border-border/50 hover:shadow-soft transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Appointments
                    </p>
                    <h3 className="text-3xl font-display font-bold mt-2">
                      {stats.total}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      +12% from last week
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </Card>

          {/* Pending Confirmation */}
          <Card className="glass p-6 border-border/50 hover:shadow-soft transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Confirmation
                </p>
                <h3 className="text-3xl font-display font-bold mt-2">
                  {stats.scheduled}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-500" />
                  Requires action
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </Card>

          {/* High-Risk Patients */}
          <Card className="glass p-6 border-border/50 hover:shadow-soft transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  High-Risk Patients
                </p>
                <h3 className="text-3xl font-display font-bold mt-2">
                  {highRiskCount}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Activity className="h-3 w-3 text-red-500" />
                  Priority care needed
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>

          {/* Today's Appointments */}
          <Card className="glass p-6 border-border/50 hover:shadow-soft transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Today&apos;s Schedule
                </p>
                <h3 className="text-3xl font-display font-bold mt-2">
                  {stats.todayAppointments}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <motion.div
          variants={itemVariants}
          className="grid gap-4 md:grid-cols-2"
        >
          {/* Appointments Trend */}
          <Card className="glass p-6 border-border/50">
            <div className="mb-4">
              <h3 className="font-display font-semibold text-lg">
                Appointments Trend
              </h3>
              <p className="text-sm text-muted-foreground">
                Daily appointments over the last 7 days
              </p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient
                    id="colorAppointments"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
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
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="appointments"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAppointments)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Status Distribution */}
          <Card className="glass p-6 border-border/50">
            <div className="mb-4">
              <h3 className="font-display font-semibold text-lg">
                Status Distribution
              </h3>
              <p className="text-sm text-muted-foreground">
                Appointment status breakdown
              </p>
            </div>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {statusDistribution.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
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

        {/* Filter Tabs */}
        <motion.div variants={itemVariants}>
          <Card className="glass p-4 border-border/50">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                All ({appointments.length})
              </Button>
              <Button
                variant={filterStatus === "scheduled" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("scheduled")}
                className={
                  filterStatus === "scheduled"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : ""
                }
              >
                Pending ({stats.scheduled})
              </Button>
              <Button
                variant={filterStatus === "confirmed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("confirmed")}
                className={
                  filterStatus === "confirmed"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                Confirmed ({stats.confirmed})
              </Button>
              <Button
                variant={filterStatus === "high-risk" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("high-risk")}
                className={
                  filterStatus === "high-risk"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
                }
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                High Risk ({highRiskCount})
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Appointments List */}
        <motion.div variants={itemVariants} className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card className="glass p-12 text-center border-border/50">
              <Calendar className="w-20 h-20 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-xl font-medium text-foreground mb-2">
                No appointments found
              </p>
              <p className="text-sm text-muted-foreground">
                {filterStatus === "all"
                  ? "Appointments will appear here when patients book their slots."
                  : `No ${filterStatus === "high-risk" ? "high risk" : filterStatus} appointments at the moment.`}
              </p>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <Card
                key={appointment.id}
                className={`glass p-6 border-border/50 hover:shadow-soft transition-all ${
                  appointment.appointment_type === "consultation"
                    ? "border-l-4 border-l-red-500 bg-red-500/5"
                    : ""
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
                  {/* Patient Info */}
                  <div className="lg:col-span-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {appointment.user?.first_name?.[0]}
                        {appointment.user?.last_name?.[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground flex items-center gap-2 flex-wrap">
                          <span className="truncate">
                            {appointment.user?.first_name}{" "}
                            {appointment.user?.last_name}
                          </span>
                          {appointment.appointment_type === "consultation" && (
                            <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 whitespace-nowrap">
                              HIGH RISK
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {appointment.user?.email}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>📞 {appointment.user?.phone_number}</div>
                      {appointment.user?.city && (
                        <div>
                          📍 {appointment.user.city}, {appointment.user.state}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="lg:col-span-1">
                    <div className="text-xs text-muted-foreground mb-2">
                      Appointment
                    </div>
                    <div className="space-y-2">
                      <div className="font-semibold text-foreground">
                        {new Date(
                          appointment.appointment_date
                        ).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ⏰ {appointment.appointment_time}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        🏥 {appointment.diagnostic?.hospital || "TBD"}
                      </div>
                      {/* Appointment Type Badge */}
                      <div className="pt-1">
                        {appointment.appointment_type === "consultation" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            <Stethoscope className="h-3 w-3" />
                            Consultation
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <FlaskConical className="h-3 w-3" />
                            {getTestType(appointment.diagnostic)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="lg:col-span-1">
                    <div className="text-xs text-muted-foreground mb-2">
                      Status
                    </div>
                    <div className="space-y-2">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          appointment.status === "confirmed"
                            ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                            : appointment.status === "scheduled"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        }`}
                      >
                        {appointment.status.toUpperCase()}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        Booked{" "}
                        {new Date(appointment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Medical Info */}
                  <div className="lg:col-span-1">
                    <div className="text-xs text-muted-foreground mb-2">
                      Symptoms
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-foreground line-clamp-2">
                        {appointment.diagnostic?.symptom || "None reported"}
                      </div>
                      {appointment.diagnostic?.ai_summary && (
                        <div className="text-xs text-muted-foreground line-clamp-3">
                          {appointment.diagnostic.ai_summary}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-1 flex flex-col gap-2 justify-start">
                    {appointment.status === "scheduled" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleStatusUpdate(appointment.id, "confirmed")
                        }
                        disabled={isUpdating === appointment.id}
                        className="bg-green-600 hover:bg-green-700 text-white w-full"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {isUpdating === appointment.id
                          ? "Confirming..."
                          : "Confirm"}
                      </Button>
                    )}
                    {appointment.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          handleStatusUpdate(appointment.id, "cancelled")
                        }
                        disabled={isUpdating === appointment.id}
                        className="w-full"
                      >
                        {isUpdating === appointment.id
                          ? "Cancelling..."
                          : "Cancel"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedPatient(appointment)}
                      className="w-full"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </motion.div>

        {/* Patient Detail Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-border"
            >
              <div className="bg-gradient-to-r from-brand-600 to-accent-600 text-white p-6 sticky top-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Patient Details</h2>
                    {selectedPatient.appointment_type === "consultation" && (
                      <span className="inline-flex mt-2 px-3 py-1 text-sm font-semibold rounded-full bg-red-500 text-white">
                        ⚠️ HIGH RISK PATIENT
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="text-white hover:text-gray-200 text-3xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Name</div>
                      <div className="font-medium">
                        {selectedPatient.user?.first_name}{" "}
                        {selectedPatient.user?.last_name}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Email</div>
                      <div className="font-medium">
                        {selectedPatient.user?.email}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Phone</div>
                      <div className="font-medium">
                        {selectedPatient.user?.phone_number}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Address</div>
                      <div className="font-medium">
                        {selectedPatient.user?.street_address},{" "}
                        {selectedPatient.user?.city}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedPatient.user?.insurance_provider && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Insurance</h3>
                    <Card className="glass p-4 border-border/50">
                      <div className="font-medium mb-2">
                        {selectedPatient.user.insurance_provider}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>ID: {selectedPatient.user.insurance_id}</div>
                        {selectedPatient.user.group_number && (
                          <div>Group: {selectedPatient.user.group_number}</div>
                        )}
                      </div>
                    </Card>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    Appointment Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">
                        {selectedPatient.appointment_type === "consultation" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            <Stethoscope className="h-3 w-3" />
                            Doctor Consultation
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <FlaskConical className="h-3 w-3" />
                            {getTestType(selectedPatient.diagnostic)}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {new Date(
                          selectedPatient.appointment_date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">
                        {selectedPatient.appointment_time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">
                        {selectedPatient.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">
                        {selectedPatient.diagnostic?.hospital}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    Medical Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Reported Symptoms
                      </div>
                      <Card className="glass p-3 border-border/50">
                        <div className="text-sm">
                          {selectedPatient.diagnostic?.symptom}
                        </div>
                      </Card>
                    </div>
                    {selectedPatient.diagnostic?.ai_summary && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          AI Assessment
                        </div>
                        <Card className="glass p-3 border-border/50">
                          <div className="text-sm">
                            {selectedPatient.diagnostic.ai_summary}
                          </div>
                        </Card>
                      </div>
                    )}
                    {selectedPatient.appointment_type === "consultation" && (
                      <Card className="glass p-4 border-l-4 border-l-red-500 bg-red-500/5">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold mb-1">
                          <AlertTriangle className="w-5 h-5" />
                          High Risk Patient
                        </div>
                        <div className="text-sm text-muted-foreground">
                          This patient has been flagged for high-risk conditions
                          requiring priority care and follow-up.
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        </div>
        )}
      </motion.div>
    </div>
  );
}
