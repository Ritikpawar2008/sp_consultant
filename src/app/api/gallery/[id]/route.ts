import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
    const { title, description, image_url, category, display_order, is_active } = body;

    const pool = getPool();
    const result = await pool.query(
      `UPDATE gallery 
       SET title = COALESCE($1, title),
           description = $2,
           image_url = COALESCE($3, image_url),
           category = $4,
           display_order = COALESCE($5, display_order),
           is_active = COALESCE($6, is_active),
           updated_at = NOW()
       WHERE id = $7 
       RETURNING *`,
      [title, description, image_url, category, display_order, is_active, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }

    revalidatePath('/gallery');
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Failed to update gallery item:", error);
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
        "DELETE FROM gallery WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
      }

      revalidatePath('/gallery');
      return NextResponse.json({ success: true });
    } catch (dbError: any) {
      throw dbError;
    }
  } catch (error) {
    console.error("Failed to delete gallery item:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
