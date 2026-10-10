import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { sendAdminEnquiryNotification, sendVisitorEnquiryConfirmation } from "@/lib/email";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = asText(body.name, 100);
    const phone = asText(body.phone, 40);
    const email = asText(body.email, 160).toLowerCase();
    const service = asText(body.service, 140);
    const subject = asText(body.subject, 140);
    const requirement = asText(body.requirement, 3000);
    const consent = body.consent === "on";

    // Silently accept bots that fill the hidden honeypot field.
    if (asText(body.company, 100)) return NextResponse.json({ ok: true });
    
    if (!name || !phone || !emailPattern.test(email) || !requirement || !consent) {
      return NextResponse.json({ error: "Please complete the required fields and consent checkbox." }, { status: 400 });
    }

    const label = subject ? `Career application: ${subject}` : `Website enquiry${service ? `: ${service}` : ""}`;
    const combinedMessage = `${label}\n\nRequirement:\n${requirement}`;

    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO enquiries (name, email, phone, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, phone, combinedMessage]
    );
    const insertedEnquiry = result.rows[0];

    const emailData = {
      id: insertedEnquiry.id,
      name,
      email,
      phone,
      message: combinedMessage,
      created_at: insertedEnquiry.created_at
    };

    // Send emails via centralized logic that uses environment variables securely
    let adminEmailSuccess = false;
    let visitorEmailSuccess = false;

    try {
      const adminRes = await sendAdminEnquiryNotification(emailData);
      if (adminRes && !adminRes.error) adminEmailSuccess = true;
    } catch (e) { console.error("Admin Email Error:", e); }

    try {
      const visitorRes = await sendVisitorEnquiryConfirmation(emailData);
      if (visitorRes && !visitorRes.error) visitorEmailSuccess = true;
    } catch (e) { console.error("Visitor Email Error:", e); }

    return NextResponse.json({ ok: true, adminEmailSuccess, visitorEmailSuccess });
  } catch (err: any) {
    console.error("Contact Form Error:", err);
    return NextResponse.json({ error: "We could not process your request. Please try again." }, { status: 400 });
  }
}
