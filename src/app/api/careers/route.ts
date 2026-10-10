import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM careers ORDER BY id ASC");
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching careers:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch careers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { job_title, department, location, employment_type, description, requirements, is_active } = body;

    if (!job_title) {
      return NextResponse.json({ error: "Job title is required" }, { status: 400 });
    }

    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO careers 
       (job_title, department, location, employment_type, description, requirements, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        job_title,
        department || null,
        location || null,
        employment_type || null,
        description || null,
        requirements || null,
        is_active ?? true
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating career item:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create career item" },
      { status: 500 }
    );
  }
}
