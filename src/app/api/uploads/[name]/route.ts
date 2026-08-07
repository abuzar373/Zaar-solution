import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

type Params = { params: Promise<{ name: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { name } = await params;
  const safe = path.basename(name); // prevent path traversal

  const primaryPath = path.join(process.cwd(), "uploads", safe);
  const tmpPath = path.join("/tmp", "uploads", safe);

  try {
    let data: Buffer;
    let filePath = primaryPath;

    try {
      data = await readFile(primaryPath);
    } catch {
      data = await readFile(tmpPath);
      filePath = tmpPath;
    }

    const ext = path.extname(filePath).toLowerCase();
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
