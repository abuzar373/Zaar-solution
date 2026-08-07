import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadToSupabase } from "@/lib/supabase";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};
export const runtime = "nodejs";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WEBP, GIF and SVG images are allowed" },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File must be smaller than 5MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${EXT[file.type]}`;

  if (
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    try {
      const publicUrl = await uploadToSupabase(file, name);
      if (publicUrl) return NextResponse.json({ url: publicUrl }, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Supabase Storage upload failed" },
        { status: 502 }
      );
    }
  }

  try {
    // Try primary uploads folder first
    const primaryDir = path.join(process.cwd(), "uploads");
    await mkdir(primaryDir, { recursive: true });
    await writeFile(path.join(primaryDir, name), buffer);
    return NextResponse.json({ url: `/api/uploads/${name}` }, { status: 201 });
  } catch {
    try {
      // Fallback to /tmp for Vercel / serverless environments
      const tmpDir = path.join("/tmp", "uploads");
      await mkdir(tmpDir, { recursive: true });
      await writeFile(path.join(tmpDir, name), buffer);
      return NextResponse.json({ url: `/api/uploads/${name}` }, { status: 201 });
    } catch {
      // Fallback to inline Data URI if disk write is completely disabled
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;
      return NextResponse.json({ url: dataUrl }, { status: 201 });
    }
  }
}
