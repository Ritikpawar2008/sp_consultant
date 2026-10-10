import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM services ORDER BY id ASC");
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch services" },
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
    const { title, slug, icon, short_description, description, display_order, is_active } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO services 
       (title, slug, icon, short_description, description, display_order, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        title,
        slug,
        icon || null,
        short_description || null,
        description || null,
        display_order || 0,
        is_active ?? true
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create service" },
      { status: 500 }
    );
  }
}
