import { createSupabaseServerClient } from "@/utils/supabase/server";
import DoctorDashboardClient from "@/components/doctor/DoctorDashboardClient";

interface ConfirmedAppointment {
  id: string;
  user_id: string;
  diagnostic_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
  appointment_type?: string; // 'test' or 'consultation'
  // User information
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
  // Diagnostic information
  diagnostic: {
    symptom: string;
    ai_summary: string;
    hospital: string;
    created_at: string;
  } | null;
}

async function getConfirmedAppointments(): Promise<ConfirmedAppointment[]> {
  try {
    const supabase = createSupabaseServerClient();

    // Get all appointments with user and diagnostic details
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        user:users!user_id (
          first_name,
          last_name,
          email,
          phone_number,
          street_address,
          city,
          state,
          zip_code,
          insurance_provider,
          insurance_id,
          group_number
        ),
        diagnostic:diagnostics!diagnostic_id (
          symptom,
          ai_summary,
          hospital,
          created_at
        )
      `
      )
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (error) {
      console.error("Supabase error fetching confirmed appointments:", error);
      return [];
    }

    console.log("🔍 Doctor Dashboard: Fetched appointments with joins:", {
      total: data?.length || 0,
      appointments: data?.map((apt) => ({
        id: apt.id,
        status: apt.status,
        appointment_type: apt.appointment_type, // Check if this field exists
        user_id: apt.user_id,
        diagnostic_id: apt.diagnostic_id,
        user_name: apt.user
          ? `${apt.user.first_name} ${apt.user.last_name}`
          : "No user data",
        has_user_data: !!apt.user,
        has_diagnostic_data: !!apt.diagnostic,
      })),
    });

    return data || [];
  } catch (error) {
    console.error("Error fetching confirmed appointments:", error);
    return [];
  }
}

async function getAppointmentStats() {
  try {
    const supabase = createSupabaseServerClient();

    const { data: allAppointments, error } = await supabase
      .from("appointments")
      .select("status, appointment_date");

    if (error) {
      console.error("Error fetching appointment stats:", error);
      return {
        total: 0,
        confirmed: 0,
        scheduled: 0,
        cancelled: 0,
        todayAppointments: 0,
      };
    }

    console.log("📊 Doctor Dashboard: All appointments by status:", {
      total: allAppointments.length,
      statusBreakdown: allAppointments.reduce(
        (acc, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    });

    const today = new Date().toISOString().split("T")[0];
    const stats = {
      total: allAppointments.length,
      confirmed: allAppointments.filter((a) => a.status === "confirmed").length,
      scheduled: allAppointments.filter((a) => a.status === "scheduled").length,
      cancelled: allAppointments.filter((a) => a.status === "cancelled").length,
      todayAppointments: allAppointments.filter(
        (a) => a.appointment_date.startsWith(today) && a.status === "confirmed"
      ).length,
    };

    return stats;
  } catch (error) {
    console.error("Error calculating appointment stats:", error);
    return {
      total: 0,
      confirmed: 0,
      scheduled: 0,
      cancelled: 0,
      todayAppointments: 0,
    };
  }
}

export default async function DoctorDashboard() {
  const appointments = await getConfirmedAppointments();
  const stats = await getAppointmentStats();

  return (
    <DoctorDashboardClient 
      initialAppointments={appointments} 
      initialStats={stats} 
    />
  );
}
