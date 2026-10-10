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
    const { title, slug, icon, short_description, description, display_order, is_active } = body;

    const pool = getPool();
    const result = await pool.query(
      `UPDATE services 
       SET title = COALESCE($1, title),
           slug = COALESCE($2, slug),
           icon = $3,
           short_description = $4,
           description = $5,
           display_order = COALESCE($6, display_order),
           is_active = COALESCE($7, is_active),
           updated_at = NOW()
       WHERE id = $8 
       RETURNING *`,
      [title, slug, icon, short_description, description, display_order, is_active, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Failed to update service:", error);
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
    
    // Attempt to delete. 
    // If it's referenced by enquiries or appointments, Postgres will throw a foreign key violation (error code '23503').
    try {
      const result = await pool.query(
        "DELETE FROM services WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Service not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } catch (dbError: any) {
      if (dbError.code === '23503') {
        return NextResponse.json({ 
          error: "Cannot delete this service because it is already referenced by existing enquiries or appointments. Please edit it or set it to 'Inactive' instead." 
        }, { status: 409 });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Failed to delete service:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
