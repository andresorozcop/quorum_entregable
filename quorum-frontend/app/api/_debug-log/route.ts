import { appendFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const line = JSON.stringify(body) + "\n";
    const logPath = path.resolve(process.cwd(), "..", "debug-7f016b.log");
    await appendFile(logPath, line, "utf8");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
