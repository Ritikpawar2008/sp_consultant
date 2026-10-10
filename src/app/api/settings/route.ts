import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query("SELECT key, value FROM site_settings");
    
    // Convert to a key-value object
    const settings = result.rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const pool = getPool();
    
    // We expect a key-value object
    const keys = Object.keys(body);
    
    // Update each key
    for (const key of keys) {
      const value = body[key];
      
      // Upsert
      await pool.query(
        `INSERT INTO site_settings (key, value, updated_at) 
         VALUES ($1, $2, NOW()) 
         ON CONFLICT (key) DO UPDATE 
         SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, value]
      );
    }

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating site settings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
