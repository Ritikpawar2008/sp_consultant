import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM expertise ORDER BY id ASC");
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching expertise:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch expertise" },
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
    const { title, description, icon, display_order, is_active } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO expertise 
       (title, description, icon, display_order, is_active) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        title,
        description || null,
        icon || null,
        display_order || 0,
        is_active ?? true
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating expertise:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create expertise" },
      { status: 500 }
    );
  }
}
