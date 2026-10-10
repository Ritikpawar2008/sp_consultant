import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, id } = await request.json();
    
    if (!id || (type !== 'appointment' && type !== 'enquiry')) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const pool = getPool();
    const table = type === 'appointment' ? 'appointments' : 'enquiries';

    // Mark the record as read
    await pool.query(`
      UPDATE ${table} 
      SET is_read = true, updated_at = NOW() 
      WHERE id = $1 AND is_read = false
    `, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to mark as read:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
