import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const pool = getPool();

    // 1. Hash the incoming code to compare
    const inputHash = crypto.createHash("sha256").update(code).digest("hex");

    // 2. Lookup the OTP in database
    const otpResult = await pool.query(
      "SELECT id, expires_at FROM admin_otps WHERE email = $1 AND otp_hash = $2 LIMIT 1",
      [normalizedEmail, inputHash]
    );

    const otpRecord = otpResult.rows[0];

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired login code." }, { status: 401 });
    }

    // 3. Verify it's not expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      // Delete expired record
      await pool.query("DELETE FROM admin_otps WHERE id = $1", [otpRecord.id]);
      return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 401 });
    }

    // 4. Validate the user is still active in admin_users
    const userResult = await pool.query(
      "SELECT id, email FROM admin_users WHERE email = $1 AND is_active = true LIMIT 1",
      [normalizedEmail]
    );

    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // 5. Delete the OTP to ensure single-use
    await pool.query("DELETE FROM admin_otps WHERE email = $1", [normalizedEmail]);

    // 6. Create secure admin session
    const sessionToken = await encrypt({ id: user.id, email: user.email });
    const cookieStore = await cookies();
    
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
