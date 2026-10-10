import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query(
      "SELECT id, client_name, rating, review_text, created_at, status FROM reviews WHERE status = 'approved' ORDER BY created_at DESC"
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching public reviews:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client_name, review_text, rating } = body;

    if (!client_name || !review_text || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid data. Name, review text, and valid rating are required." }, { status: 400 });
    }

    const pool = getPool();
    // Default status to 'pending' and is_active to false.
    const result = await pool.query(
      `INSERT INTO reviews 
       (client_name, review_text, rating, is_active, status) 
       VALUES ($1, $2, $3, false, 'pending') 
       RETURNING id, client_name`,
      [
        client_name,
        review_text,
        rating
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating public review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
