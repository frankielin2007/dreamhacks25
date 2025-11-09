import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

// GET available time slots for a specific date
// Maps date to weekday and fetches recurring availability
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const doctorId = searchParams.get("doctorId") || "default_doctor"; // TODO: Support multiple doctors

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    // Convert date to day of week (0 = Sunday, 1 = Monday, etc.)
    const dateObj = new Date(date + "T00:00:00"); // Ensure correct parsing
    const dayOfWeek = dateObj.getDay();

    console.log("📅 Available slots request:", { date, dayOfWeek, doctorId });

    const supabase = createSupabaseServerClient();

    // 1. Get doctor's available slots for this weekday
    // If using default_doctor, fetch ANY doctor's availability for this weekday
    let query = supabase
      .from("doctor_availability")
      .select("available_slots")
      .eq("day_of_week", dayOfWeek);
    
    if (doctorId !== "default_doctor") {
      query = query.eq("doctor_id", doctorId);
    }
    
    const { data: availability, error: availError } = await query.maybeSingle();

    console.log("🔍 Availability query result:", { availability, availError });

    if (availError || !availability) {
      // No availability set for this weekday
      const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return NextResponse.json({
        date,
        dayOfWeek: weekdays[dayOfWeek],
        availableSlots: [],
        message: `No availability set for ${weekdays[dayOfWeek]}s`,
      });
    }

    const allSlots = availability.available_slots as string[];

    // 2. Get already booked appointments for this specific date
    const { data: bookedAppointments, error: bookedError } = await supabase
      .from("appointments")
      .select("time_slot")
      .eq("appointment_date", date)
      .in("status", ["scheduled", "confirmed"]) // Don't block cancelled appointments
      .not("time_slot", "is", null);

    if (bookedError) {
      console.error("Error fetching booked appointments:", bookedError);
      // Continue anyway - better to show all slots than error out
    }

    // 3. Filter out booked slots
    const bookedSlots = bookedAppointments?.map((apt) => apt.time_slot) || [];
    const availableSlots = allSlots.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    return NextResponse.json({
      date,
      dayOfWeek,
      availableSlots,
      totalSlots: allSlots.length,
      bookedSlots: bookedSlots.length,
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
