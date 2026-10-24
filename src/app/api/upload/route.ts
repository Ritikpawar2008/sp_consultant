import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Clean filename and generate a unique path under the gallery folder
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniquePath = `gallery/${Date.now()}-${sanitizedFileName}`;

    // Upload directly to Vercel Blob (server-side only)
    const blob = await put(uniquePath, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error: any) {
    console.error("Upload error:", error);

    // Provide helpful user-facing errors without leaking token secrets
    const isTokenMissing =
      error?.message?.includes("BLOB_READ_WRITE_TOKEN") ||
      error?.name === "BlobAccessError";

    const errorMessage = isTokenMissing
      ? "Image storage is not configured yet. Please configure the Vercel Blob store token."
      : error?.message || "Failed to upload file";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
