import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status || !["scheduled", "confirmed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Get appointment with user info before updating
    const { data: appointmentBeforeUpdate, error: fetchError } = await supabase
      .from("appointments")
      .select(`
        *,
        user:users!user_id (
          email,
          first_name,
          last_name
        )
      `)
      .eq("id", id)
      .single();

    if (fetchError || !appointmentBeforeUpdate) {
      console.error("Error fetching appointment:", fetchError);
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Update the appointment status
    const { data, error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating appointment status:", error);
      return NextResponse.json(
        { error: "Failed to update appointment status" },
        { status: 500 }
      );
    }

    console.log(`✅ Appointment ${id} status updated to: ${status}`);

    // Send confirmation email when doctor confirms the appointment
    if (status === "confirmed" && appointmentBeforeUpdate.user?.email) {
      console.log("📧 Sending confirmation email to:", appointmentBeforeUpdate.user.email);
      
      try {
        const emailResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/api/send-appointment-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              appointmentId: id,
              userEmail: appointmentBeforeUpdate.user.email,
            }),
          }
        );

        if (emailResponse.ok) {
          console.log("✅ Confirmation email sent successfully");
        } else {
          console.error("❌ Failed to send confirmation email");
        }
      } catch (emailError) {
        console.error("❌ Error sending confirmation email:", emailError);
        // Don't fail the status update if email fails
      }
    }

    return NextResponse.json({ success: true, appointment: data });
  } catch (error) {
    console.error("Error in status update route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
