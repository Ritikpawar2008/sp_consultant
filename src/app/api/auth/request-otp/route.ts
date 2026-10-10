import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { sendAdminLoginOtp } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const pool = getPool();

    // 1. Check if email exists in admin_users and is active
    const result = await pool.query(
      "SELECT id, email FROM admin_users WHERE email = $1 AND is_active = true LIMIT 1",
      [normalizedEmail]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "This email is not authorized to access the admin panel. Please contact the administrator." },
        { status: 403 }
      );
    }

    // Rate limiting: check if an OTP was generated within the last 60 seconds
    const rateCheck = await pool.query(
      "SELECT created_at FROM admin_otps WHERE email = $1 ORDER BY created_at DESC LIMIT 1",
      [normalizedEmail]
    );
    
    if (rateCheck.rows.length > 0) {
      const lastCreated = new Date(rateCheck.rows[0].created_at).getTime();
      if (Date.now() - lastCreated < 60000) {
        // If less than 60 seconds ago, return 429
        return NextResponse.json(
          { error: "Please wait 60 seconds before requesting another code." },
          { status: 429 }
        );
      }
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 3. Hash OTP securely before storing
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    
    // 4. Expiry time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 5. Rate limiting / Cleanup: Remove old OTPs for this email to prevent spam
    await pool.query("DELETE FROM admin_otps WHERE email = $1", [normalizedEmail]);

    // 6. Store in database
    await pool.query(
      "INSERT INTO admin_otps (email, otp_hash, expires_at) VALUES ($1, $2, $3)",
      [normalizedEmail, otpHash, expiresAt]
    );

    // 7. Send the email via Resend
    await sendAdminLoginOtp(normalizedEmail, otp);

    return NextResponse.json({
      success: true,
      message: "A login code has been sent to your email."
    });

  } catch (error) {
    console.error("Request OTP Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
