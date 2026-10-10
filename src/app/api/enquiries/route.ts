import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  sendAdminEnquiryNotification,
  sendVisitorEnquiryConfirmation,
  EnquiryEmailData,
} from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function asText(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // --- 1. Validate incoming fields ---
    const name = asText(body.name, 100);
    const email = asText(body.email, 160).toLowerCase();
    const phone = asText(body.phone, 40);
    const message = asText(body.message, 3000);

    // Optional service_id validation (must be valid UUID if present)
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
    if (!message) {
      return NextResponse.json(
        { success: false, message: "message is required." },
        { status: 400 }
      );
    }

    // --- 2. Insert enquiry into Neon database (Parameterized SQL) ---
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO enquiries (name, email, phone, service_id, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, phone, serviceId, message]
    );

    const insertedEnquiry = result.rows[0];

    // --- 3. Optional service name lookup for email context ---
    let serviceName: string | null = null;
    if (serviceId) {
      try {
        const serviceRes = await pool.query(
          "SELECT title FROM services WHERE id = $1 LIMIT 1",
          [serviceId]
        );
        if (serviceRes.rows.length > 0) {
          serviceName = serviceRes.rows[0].title;
        }
      } catch (svcErr) {
        console.warn("Could not lookup service title:", svcErr);
      }
    }

    // --- 4. Send emails via Resend in the background ---
    const emailData: EnquiryEmailData = {
      id: insertedEnquiry.id,
      name,
      email,
      phone,
      service_id: serviceId,
      service_name: serviceName,
      message,
      created_at: insertedEnquiry.created_at,
    };

    let adminEmailSuccess = false;
    let visitorEmailSuccess = false;

    try {
      // 4a. Send Admin notification
      const adminRes = await sendAdminEnquiryNotification(emailData);
      if (adminRes.error) {
        console.error("Resend Admin Email Error:", adminRes.error);
      } else {
        adminEmailSuccess = true;
      }
    } catch (adminErr) {
      console.error("Failed to send admin enquiry notification:", adminErr);
    }

    try {
      // 4b. Send Visitor confirmation
      const visitorRes = await sendVisitorEnquiryConfirmation(emailData);
      if (visitorRes.error) {
        console.error("Resend Visitor Email Error:", visitorRes.error);
      } else {
        visitorEmailSuccess = true;
      }
    } catch (visitorErr) {
      console.error("Failed to send visitor enquiry confirmation:", visitorErr);
    }

    // --- 5. Return success response with saved enquiry data ---
    return NextResponse.json(
      {
        success: true,
        message: "Enquiry submitted successfully.",
        data: insertedEnquiry,
        notificationSent: adminEmailSuccess,
        confirmationSent: visitorEmailSuccess,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing enquiry submission:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit enquiry. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pool = getPool();
    const result = await pool.query(`
      SELECT e.*, s.title as service_name 
      FROM enquiries e 
      LEFT JOIN services s ON e.service_id = s.id 
      ORDER BY e.created_at DESC
    `);
    
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Failed to fetch enquiries:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
