import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getContactEmail } from "@/lib/contact";
import { sendContactEmail } from "@/lib/email";
import { sanitizeHtml } from "@/lib/sanitize";
import { getCurrentUser } from "@/lib/session";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(1).max(200),
  website: z.string().trim().max(255).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(5000),
  turnstileToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "";

    // Authenticated clients (e.g. the mobile app sending a Bearer token) are
    // already trusted, so they may skip the Turnstile captcha. Anonymous web
    // visitors still require a valid token in production.
    const authedUser = await getCurrentUser().catch(() => null);
    if (!authedUser) {
      const turnstile = await verifyTurnstileToken(
        parsed.data.turnstileToken,
        ip
      );
      if (!turnstile.ok) {
        return NextResponse.json({ error: turnstile.error }, { status: 403 });
      }
    }

    const to = await getContactEmail();
    await sendContactEmail({
      to,
      subject: parsed.data.subject,
      name: parsed.data.name,
      email: parsed.data.email,
      website: parsed.data.website || undefined,
      message: sanitizeHtml(parsed.data.message),
      ip: ip || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
