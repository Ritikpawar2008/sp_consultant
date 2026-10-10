import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import {
  sendAppointmentReceivedEmail,
  sendAppointmentFailureEmail,
  sendAdminAppointmentNotification,
  AppointmentEmailData,
} from "@/lib/email";
import { getSession } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function asText(val: any, maxLength: number): string {
  if (!val) return "";
  return String(val).trim().substring(0, maxLength);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    const pool = getPool();
    if (dateParam && DATE_RE.test(dateParam)) {
      // Allow public checking of booked times (do NOT return customer info!)
      const result = await pool.query(
        "SELECT appointment_time, status FROM appointments WHERE appointment_date = $1 ORDER BY appointment_time ASC",
        [dateParam]
      );
      return NextResponse.json({ success: true, data: result.rows });
    }

    // Require Admin Session for full appointments list
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await pool.query(
      "SELECT * FROM appointments ORDER BY created_at DESC"
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appointments
 * Handles appointment booking requests, availability checks, and email dispatch.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // --- 1. Validate fields ---
    const name = asText(body.name, 100);
    const email = asText(body.email, 160).toLowerCase();
    const phone = asText(body.phone, 40);
    const appointmentDate = asText(body.appointment_date, 20);
    const appointmentTime = asText(body.appointment_time, 30);
    const reason = asText(body.reason || body.message, 2000);

    let serviceId: string | null = null;
    if (body.service_id !== undefined && body.service_id !== null && body.service_id !== "") {
      const rawServiceId = String(body.service_id).trim();
      if (UUID_RE.test(rawServiceId)) {
        serviceId = rawServiceId;
      } else {
        return NextResponse.json(
          { success: false, message: "service_id must be a valid UUID." },
          { status: 400 }
        );
      }
    }

    let serviceName = asText(body.service_name || body.service, 150) || null;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "name is required." },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required." },
        { status: 400 }
      );
    }
    if (!phone) {
      return NextResponse.json(
        { success: false, message: "phone is required." },
        { status: 400 }
      );
    }
    if (!appointmentDate || !DATE_RE.test(appointmentDate)) {
      return NextResponse.json(
        { success: false, message: "A valid appointment_date (YYYY-MM-DD) is required." },
        { status: 400 }
      );
    }
    if (!appointmentTime) {
      return NextResponse.json(
        { success: false, message: "appointment_time is required." },
        { status: 400 }
      );
    }

    const VALID_SLOTS = [
      "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
      "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
      "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
      "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
      "06:00 PM", "06:30 PM"
    ];

    if (!VALID_SLOTS.includes(appointmentTime)) {
      return NextResponse.json(
        { success: false, message: "Invalid appointment time slot. Must be a 30-minute interval between 10:00 AM and 06:30 PM." },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Look up service title if service_id was provided
    if (serviceId && !serviceName) {
      try {
        const svcRes = await pool.query(
          "SELECT title FROM services WHERE id = $1 LIMIT 1",
          [serviceId]
        );
        if (svcRes.rows.length > 0) {
          serviceName = svcRes.rows[0].title;
        }
      } catch (svcErr) {
        console.warn("Could not lookup service title:", svcErr);
      }
    }

    // --- 2. Check availability logic ---
    let finalStatus: string = "pending";
    let rejectionReason: string | null = null;

    // Check if slot on that date & time is already booked
    const conflictCheck = await pool.query(
      `SELECT id FROM appointments
       WHERE appointment_date = $1
         AND LOWER(TRIM(appointment_time)) = LOWER(TRIM($2))
         AND status IN ('booked', 'pending', 'confirmed', 'completed', 'done')
       LIMIT 1`,
      [appointmentDate, appointmentTime]
    );

    if (conflictCheck.rows.length > 0) {
      finalStatus = "not_booked";
      rejectionReason = `The requested time slot (${appointmentTime} on ${appointmentDate}) is already booked.`;
    }

    // Check if date is in the past (using Indian Standard Time)
    const todayIST = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());

    if (appointmentDate < todayIST) {
      finalStatus = "not_booked";
      rejectionReason = "The requested appointment date is in the past.";
    }

    // --- 3. Save appointment record in database ---
    const insertResult = await pool.query(
      `INSERT INTO appointments (name, email, phone, appointment_date, appointment_time, service_id, service_name, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name,
        email,
        phone,
        appointmentDate,
        appointmentTime,
        serviceId,
        serviceName,
        reason,
        finalStatus,
      ]
    );

    const savedAppointment = insertResult.rows[0];

    // Format date string for emails (e.g. YYYY-MM-DD)
    const formattedDate = savedAppointment.appointment_date instanceof Date
      ? savedAppointment.appointment_date.toISOString().split("T")[0]
      : String(savedAppointment.appointment_date);

    const emailData: AppointmentEmailData = {
      id: savedAppointment.id,
      name,
      email,
      phone,
      appointment_date: formattedDate,
      appointment_time: appointmentTime,
      service_id: serviceId,
      service_name: serviceName,
      reason,
      status: finalStatus,
      rejection_reason: rejectionReason,
      created_at: savedAppointment.created_at,
    };

    // --- 4. Send appropriate emails via Resend ---
    let visitorEmailSent = false;
    let adminEmailSent = false;

    // 4a. Visitor Email (Success or Failure based on FINAL status)
    try {
      if (finalStatus === "pending") {
        const res = await sendAppointmentReceivedEmail(emailData);
        if (res.error) {
          console.error("Resend Appointment Success Email Error:", res.error);
        } else {
          visitorEmailSent = true;
        }
      } else {
        const res = await sendAppointmentFailureEmail(emailData);
        if (res.error) {
          console.error("Resend Appointment Failure Email Error:", res.error);
        } else {
          visitorEmailSent = true;
        }
      }
    } catch (visitorErr) {
      console.error("Failed to send visitor appointment email:", visitorErr);
    }

    // 4b. Internal Notification Email for every request
    try {
      const adminRes = await sendAdminAppointmentNotification(emailData);
      if (adminRes.error) {
        console.error("Resend Admin Appointment Notification Error:", adminRes.error);
      } else {
        adminEmailSent = true;
      }
    } catch (adminErr) {
      console.error("Failed to send admin appointment notification:", adminErr);
    }

    // --- 5. Return API response ---
    if (finalStatus === "pending") {
      return NextResponse.json(
        {
          success: true,
          status: "booked",
          message: "Appointment booked successfully.",
          data: savedAppointment,
          visitorEmailSent,
          adminEmailSent,
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          status: "not_booked",
          message:
            rejectionReason ||
            "The requested appointment slot could not be booked. Please choose another slot.",
          data: savedAppointment,
          visitorEmailSent,
          adminEmailSent,
        },
        { status: 409 }
      );
    }
  } catch (error) {
    console.error("Error processing appointment booking:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process appointment request. Please try again." },
      { status: 500 }
    );
  }
}




