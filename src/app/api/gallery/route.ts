import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM gallery ORDER BY id ASC");
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch gallery" },
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
    const { title, description, image_url, category, display_order, is_active } = body;

    if (!title || !image_url) {
      return NextResponse.json({ error: "Title and image URL are required" }, { status: 400 });
    }

    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO gallery 
       (title, description, image_url, category, display_order, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        title,
        description || null,
        image_url,
        category || null,
        display_order || 0,
        is_active ?? true
      ]
    );

    revalidatePath('/gallery');
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating gallery item:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create gallery item" },
      { status: 500 }
    );
  }
}
