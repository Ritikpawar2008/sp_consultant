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
    const { title, description, icon, display_order, is_active } = body;

    const pool = getPool();
    const result = await pool.query(
      `UPDATE expertise 
       SET title = COALESCE($1, title),
           description = $2,
           icon = $3,
           display_order = COALESCE($4, display_order),
           is_active = COALESCE($5, is_active),
           updated_at = NOW()
       WHERE id = $6 
       RETURNING *`,
      [title, description, icon, display_order, is_active, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Expertise not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Failed to update expertise:", error);
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
        "DELETE FROM expertise WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Expertise not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } catch (dbError: any) {
      if (dbError.code === '23503') {
        return NextResponse.json({ 
          error: "Cannot delete this expertise because it is referenced by other records. Please edit it or set it to 'Inactive' instead." 
        }, { status: 409 });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Failed to delete expertise:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
