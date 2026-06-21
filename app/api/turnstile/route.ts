import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    const ip =
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "";

    const result = await verifyTurnstileToken(token, ip);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Verification error" }, { status: 500 });
  }
}
