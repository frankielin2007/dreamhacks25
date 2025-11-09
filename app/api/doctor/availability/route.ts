import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

// Generate default time slots (9 AM - 5 PM, 30-minute intervals)
function generateDefaultSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 9; hour < 17; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
}

// GET: Fetch doctor's availability for all weekdays
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get("doctorId"); // For patients viewing doctor availability

    const supabase = createSupabaseServerClient();

    // Query availability for all weekdays
    let query = supabase
      .from("doctor_availability")
      .select("*")
      .order("day_of_week", { ascending: true });

    // If doctorId provided (patient viewing), filter by that doctor
    // Otherwise, show current user's availability (doctor viewing own)
    if (doctorId) {
      query = query.eq("doctor_id", doctorId);
    } else {
      query = query.eq("doctor_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching availability:", error);
      return NextResponse.json(
        { error: "Failed to fetch availability" },
        { status: 500 }
      );
    }

    return NextResponse.json({ availability: data || [] });
  } catch (error) {
    console.error("Error in availability GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Set availability for a specific weekday
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { dayOfWeek, slots } = body;

    if (dayOfWeek === undefined || dayOfWeek === null) {
      return NextResponse.json(
        { error: "dayOfWeek is required (0-6)" },
        { status: 400 }
      );
    }

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { error: "dayOfWeek must be between 0 (Sunday) and 6 (Saturday)" },
        { status: 400 }
      );
    }

    // If no slots provided, use default 9-5 schedule
    const availableSlots = slots && slots.length > 0 
      ? slots 
      : generateDefaultSlots();

    const supabase = createSupabaseServerClient();

    // Upsert availability (update if exists, insert if not)
    const { data, error } = await supabase
      .from("doctor_availability")
      .upsert({
        doctor_id: userId,
        day_of_week: dayOfWeek,
        available_slots: availableSlots,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "doctor_id,day_of_week",
      })
      .select()
      .single();

    if (error) {
      console.error("Error setting availability:", error);
      return NextResponse.json(
        { error: "Failed to set availability", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Availability updated successfully",
      availability: data,
    });
  } catch (error) {
    console.error("Error in availability POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Remove availability for a weekday (clear all slots)
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const dayOfWeek = searchParams.get("dayOfWeek");

    if (dayOfWeek === null) {
      return NextResponse.json(
        { error: "dayOfWeek is required (0-6)" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { error } = await supabase
      .from("doctor_availability")
      .delete()
      .eq("doctor_id", userId)
      .eq("day_of_week", parseInt(dayOfWeek));

    if (error) {
      console.error("Error deleting availability:", error);
      return NextResponse.json(
        { error: "Failed to delete availability" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Availability removed successfully",
    });
  } catch (error) {
    console.error("Error in availability DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
