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
    const { job_title, department, location, employment_type, description, requirements, is_active } = body;

    const pool = getPool();
    const result = await pool.query(
      `UPDATE careers 
       SET job_title = COALESCE($1, job_title),
           department = $2,
           location = $3,
           employment_type = $4,
           description = $5,
           requirements = $6,
           is_active = COALESCE($7, is_active),
           updated_at = NOW()
       WHERE id = $8 
       RETURNING *`,
      [job_title, department, location, employment_type, description, requirements, is_active, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Career opening not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Failed to update career opening:", error);
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
        "DELETE FROM careers WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Career opening not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } catch (dbError: any) {
      throw dbError;
    }
  } catch (error) {
    console.error("Failed to delete career opening:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
