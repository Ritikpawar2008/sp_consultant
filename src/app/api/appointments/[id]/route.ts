import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendAppointmentStatusEmail, AppointmentEmailData } from "@/lib/email";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const pool = getPool();
    
    // First, get the current status to prevent duplicate emails
    const currentRes = await pool.query("SELECT * FROM appointments WHERE id = $1", [id]);
    if (currentRes.rows.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    
    const currentAppointment = currentRes.rows[0];
    const currentStatus = currentAppointment.status;

    // Update the database
    const result = await pool.query(
      "UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    
    const savedAppointment = result.rows[0];
    
    // Format date string for emails (e.g. YYYY-MM-DD)
    const formattedDate = savedAppointment.appointment_date instanceof Date
      ? savedAppointment.appointment_date.toISOString().split("T")[0]
      : String(savedAppointment.appointment_date);
      
    let emailSent = false;
    let emailError = null;

    // Send email ONLY if status has actually changed
    if (currentStatus !== status) {
      const emailData: AppointmentEmailData = {
        id: savedAppointment.id,
        name: savedAppointment.name,
        email: savedAppointment.email,
        phone: savedAppointment.phone,
        appointment_date: formattedDate,
        appointment_time: savedAppointment.appointment_time,
        service_id: savedAppointment.service_id,
        service_name: savedAppointment.service_name,
        reason: savedAppointment.reason,
        status: status as any,
        created_at: savedAppointment.created_at,
      };

      try {
        const res = await sendAppointmentStatusEmail(emailData, status);
        if (res && res.error) {
          console.error("Resend status email error:", res.error);
          emailError = "Resend API error";
        } else if (res) {
          emailSent = true;
        }
      } catch (err: any) {
        console.error("Failed to send status update email:", err);
        emailError = err.message;
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: savedAppointment,
      emailSent,
      emailError,
      message: emailError ? "Appointment status updated, but notification email could not be sent." : undefined
    });
  } catch (error) {
    console.error("Failed to update appointment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const pool = getPool();
    
    const result = await pool.query(
      "DELETE FROM appointments WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete appointment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}



