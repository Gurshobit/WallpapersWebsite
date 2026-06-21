import { NextRequest, NextResponse } from "next/server";
import { SITE_URL } from "@/lib/routing";

function verifyCron(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) return false;
  return true;
}

export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sitemapUrl = `${SITE_URL}/sitemap.xml`;

  try {
    await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
  } catch {
    // non-fatal
  }

  return NextResponse.json({ success: true, sitemapUrl, pingedAt: new Date().toISOString() });
}

export const dynamic = "force-dynamic";
