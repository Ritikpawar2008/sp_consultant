import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { client_name, client_role, review_text, rating, image_url, is_featured, is_active, status } = body;

    const pool = getPool();
    let queryArgs = [client_name, client_role, review_text, rating, image_url, is_featured, is_active, status, id];
    let setClauses = `
           client_name = COALESCE($1, client_name),
           client_role = COALESCE($2, client_role),
           review_text = COALESCE($3, review_text),
           rating = COALESCE($4, rating),
           image_url = COALESCE($5, image_url),
           is_featured = COALESCE($6, is_featured),
           is_active = COALESCE($7, is_active),
           status = COALESCE($8, status),
           updated_at = NOW()
    `;

    // Special logic to sync is_active with status
    if (status !== undefined) {
       // if we update status explicitly
       queryArgs = [client_name, client_role, review_text, rating, image_url, is_featured, status === 'approved', status, id];
    } else if (is_active !== undefined) {
       queryArgs = [client_name, client_role, review_text, rating, image_url, is_featured, is_active, is_active ? 'approved' : 'rejected', id];
    }

    const result = await pool.query(
      `UPDATE reviews SET ${setClauses} WHERE id = $9 RETURNING *`,
      queryArgs
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Failed to update review:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const pool = getPool();
    
    try {
      const result = await pool.query(
        "DELETE FROM reviews WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Review not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } catch (dbError: any) {
      throw dbError;
    }
  } catch (error) {
    console.error("Failed to delete review:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
