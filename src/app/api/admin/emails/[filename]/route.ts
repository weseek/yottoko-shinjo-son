import { env } from "@/env";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  if (env.APP_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { filename } = await params;

  // パストラバーサル防止
  if (filename.includes("..") || filename.includes("/")) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const fs = await import("node:fs/promises");
  const path = await import("node:path");

  const filepath = path.join(process.cwd(), "tmp", "emails", filename);

  try {
    const raw = await fs.readFile(filepath, "utf-8");
    const data = JSON.parse(raw);

    return new Response(data.html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
