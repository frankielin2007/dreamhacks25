"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import PageContainer from "@/components/app/PageContainer";
import { Calendar, Clock, MapPin, User, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Appointment {
  id: string;
  user_id: string;
  diagnostic_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
}

interface DiagnosticWithAppointments extends Appointment {
  diagnostic: {
    symptom: string;
    ai_summary: string;
    hospital: string;
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function AppointmentsPage() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState<
    DiagnosticWithAppointments[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("appointments")
          .select(
            `
            *,
            diagnostic:diagnostics(symptom, ai_summary, hospital)
          `
          )
          .eq("user_id", user.id)
          .order("appointment_date", { ascending: true });

        if (error) {
          console.error("Error fetching appointments:", error);
        } else {
          setAppointments(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user?.id]);

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentId);

      if (error) {
        console.error("Error cancelling appointment:", error);
        alert("Failed to cancel appointment. Please try again.");
      } else {
        // Update local state
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId ? { ...apt, status: "cancelled" } : apt
          )
        );
        alert("Appointment cancelled successfully.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    if (!user?.emailAddresses[0]?.emailAddress) {
      alert(
        "Email address not found. Please ensure your account has a valid email."
      );
      return;
    }

    setConfirmingId(appointmentId);

    try {
      const response = await fetch("/api/appointments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          status: "confirmed",
          userEmail: user.emailAddresses[0].emailAddress,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to confirm appointment");
      }

      // Update local state
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: "confirmed" } : apt
        )
      );

      // Show success message with better UX
      const successMessage =
        "✅ Appointment confirmed! A confirmation email has been sent to your email address.";

      // Create a temporary toast-like notification
      const notification = document.createElement("div");
      notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 1000;
        background: #10b981; color: white; padding: 16px 24px;
        border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px; font-weight: 500; max-width: 400px;
      `;
      notification.textContent = successMessage;
      document.body.appendChild(notification);

      // Remove notification after 5 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    } catch (error) {
      console.error("Error confirming appointment:", error);

      // Show error message with better UX
      const errorMessage =
        "❌ Failed to confirm appointment. Please try again.";

      const notification = document.createElement("div");
      notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 1000;
        background: #ef4444; color: white; padding: 16px 24px;
        border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px; font-weight: 500; max-width: 400px;
      `;
      notification.textContent = errorMessage;
      document.body.appendChild(notification);

      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading appointments...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-2">
          <span className="text-gradient">My Appointments</span>
        </h1>
        <p className="text-muted-foreground">
          Manage your scheduled medical appointments
        </p>
      </motion.div>

      {/* Appointments List */}
      {appointments.length === 0 ? (
          <Card className="glass p-12 text-center border-border/50">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-950 mb-6">
              <Calendar className="h-10 w-10 text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="text-2xl font-display font-semibold mb-3">
              No Appointments Scheduled
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You don&apos;t have any appointments scheduled yet. Complete a
              diagnostic test with high-risk results to schedule an appointment
              with a doctor.
            </p>
            <Button
              onClick={() => (window.location.href = "/start")}
              className="bg-brand-600 hover:bg-brand-700"
            >
              Start Diagnostic
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Appointments Grid */}
            <div className="grid gap-6">
              {appointments.map((appointment, index) => {
                const appointmentDate = new Date(appointment.appointment_date);
                const isUpcoming = appointmentDate > new Date();

                return (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass border-border/50 hover:shadow-soft transition-shadow">
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                          {/* Left Section - Main Info */}
                          <div className="flex-1 space-y-4">
                            {/* Header with Status */}
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                                  <User className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-lg font-display font-semibold">
                                  Dr. Sarah Johnson
                                </h3>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
                                  appointment.status === "scheduled"
                                    ? "bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300"
                                    : appointment.status === "confirmed"
                                    ? "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300"
                                    : appointment.status === "completed"
                                    ? "bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300"
                                    : "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300"
                                }`}
                              >
                                {appointment.status === "scheduled" && <AlertCircle className="h-3 w-3" />}
                                {appointment.status === "confirmed" && <CheckCircle className="h-3 w-3" />}
                                {appointment.status === "cancelled" && <XCircle className="h-3 w-3" />}
                                {appointment.status.charAt(0).toUpperCase() +
                                  appointment.status.slice(1)}
                              </span>
                            </div>

                            {/* Date & Time */}
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/30">
                                  <Calendar className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Date
                                  </p>
                                  <p className="font-semibold">
                                    {appointmentDate.toLocaleDateString("en-US", {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/30">
                                  <Clock className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Time
                                  </p>
                                  <p className="font-semibold">
                                    {appointment.appointment_time}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Related Condition */}
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/30">
                                <FileText className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Related Condition
                                </p>
                                <p className="font-semibold">
                                  {appointment.diagnostic?.symptom ||
                                    "General checkup"}
                                </p>
                              </div>
                            </div>

                            {/* Hospital/Location */}
                            {appointment.diagnostic?.hospital && (
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/30">
                                  <MapPin className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Location
                                  </p>
                                  <p className="font-semibold">
                                    {appointment.diagnostic.hospital}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Diagnostic Summary */}
                            {appointment.diagnostic?.ai_summary && (
                              <div className="pt-4 border-t border-border/50">
                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                  Diagnostic Summary
                                </p>
                                <p className="text-sm leading-relaxed">
                                  {appointment.diagnostic.ai_summary}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Right Section - Actions */}
                          <div className="flex lg:flex-col gap-2 lg:min-w-[140px]">
                            {isUpcoming && appointment.status === "scheduled" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 flex-1 lg:w-full"
                                  onClick={() =>
                                    handleConfirmAppointment(appointment.id)
                                  }
                                  disabled={confirmingId === appointment.id}
                                >
                                  {confirmingId === appointment.id
                                    ? "Confirming..."
                                    : "Confirm"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleCancelAppointment(appointment.id)
                                  }
                                  className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 flex-1 lg:w-full"
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass border-border/50 p-6 text-center">
                <div className="text-3xl font-display font-bold text-amber-600 dark:text-amber-400 mb-2">
                  {appointments.filter((a) => a.status === "scheduled").length}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Scheduled</div>
              </Card>

              <Card className="glass border-border/50 p-6 text-center">
                <div className="text-3xl font-display font-bold text-green-600 dark:text-green-400 mb-2">
                  {appointments.filter((a) => a.status === "confirmed").length}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Confirmed</div>
              </Card>

              <Card className="glass border-border/50 p-6 text-center">
                <div className="text-3xl font-display font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {appointments.filter((a) => a.status === "completed").length}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Completed</div>
              </Card>

              <Card className="glass border-border/50 p-6 text-center">
                <div className="text-3xl font-display font-bold text-red-600 dark:text-red-400 mb-2">
                  {appointments.filter((a) => a.status === "cancelled").length}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Cancelled</div>
              </Card>
            </div>
          </div>
        )}
    </PageContainer>
  );
}
