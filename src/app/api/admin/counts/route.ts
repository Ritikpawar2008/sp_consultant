import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pool = getPool();
    
    // We define "new" as records where is_read is false.
    const [appointmentsResult, enquiriesResult] = await Promise.all([
      pool.query("SELECT count(*) FROM appointments WHERE is_read = false"),
      pool.query("SELECT count(*) FROM enquiries WHERE is_read = false")
    ]);

    return NextResponse.json({
      success: true,
      data: {
        newAppointments: parseInt(appointmentsResult.rows[0].count, 10),
        newEnquiries: parseInt(enquiriesResult.rows[0].count, 10),
      }
    });
  } catch (error) {
    console.error("Failed to fetch counts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
