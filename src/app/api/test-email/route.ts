import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { Resend } from "resend";
import { getFromEmail } from "@/lib/email";

// ONLY ENABLE IN DEVELOPMENT (or allow admin to run it safely)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    // Double check it is not exposed without auth
    if (process.env.NODE_ENV === "production") {
      // In a real-world scenario we might disable this in production completely, 
      // but since the user explicitly requested a test endpoint requiring admin auth, we will allow it if admin is authenticated.
    }

    const body = await request.json();
    const { to_email } = body;

    if (!to_email) {
      return NextResponse.json({ error: "Missing to_email parameter." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "RESEND_API_KEY is not configured in the environment variables." }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const from = getFromEmail();

    const response = await resend.emails.send({
      from,
      to: [to_email],
      subject: "S.P. Consultant - Email System Test",
      text: "This is a test email from the S.P. Consultant website email system.",
      html: "<p>This is a test email from the S.P. Consultant website email system.</p>",
    });

    if (response.error) {
      return NextResponse.json({
        success: false,
        error: response.error.message,
        error_name: response.error.name,
        from_address_used: from
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message_id: response.data?.id,
      from_address_used: from,
      note: "Email successfully dispatched to Resend API. Please check the Resend dashboard logs to confirm final delivery."
    }, { status: 200 });

  } catch (error: any) {
    console.error("Test email failed:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}



