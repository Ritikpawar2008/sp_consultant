import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM reviews ORDER BY id ASC");
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
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
    const { client_name, client_role, review_text, rating, image_url, is_featured, is_active, status } = body;

    if (!client_name || !review_text) {
      return NextResponse.json({ error: "Client name and review text are required" }, { status: 400 });
    }

    const pool = getPool();
    // Maintain backwards compatibility with is_active if status is not explicitly provided.
    // If is_active is true, status is 'approved'. If false, 'rejected' or 'pending'.
    let actualStatus = status;
    if (!actualStatus) {
      actualStatus = is_active ? 'approved' : 'rejected';
    }

    const result = await pool.query(
      `INSERT INTO reviews 
       (client_name, client_role, review_text, rating, image_url, is_featured, is_active, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        client_name,
        client_role || null,
        review_text,
        rating || 5,
        image_url || null,
        is_featured ?? false,
        actualStatus === 'approved', // is_active
        actualStatus // status
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}
