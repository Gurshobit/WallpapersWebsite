import { NextRequest, NextResponse } from "next/server";
import { signDownload } from "@/lib/download-token";

/**
 * GET /api/sign-download?uuid=...&w=1920&h=1080&f=jpeg
 *
 * Returns a signed, time-limited download URL.
 * Clients MUST use this to obtain a download link — the token is required by
 * the download route, so raw CDN paths cannot be scraped.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const uuid = searchParams.get("uuid");
  const wStr = searchParams.get("w");
  const hStr = searchParams.get("h");
  const f = searchParams.get("f") ?? "jpeg";

  if (!uuid) {
    return NextResponse.json({ error: "Missing uuid" }, { status: 400 });
  }

  const width = wStr ? parseInt(wStr, 10) || null : null;
  const height = hStr ? parseInt(hStr, 10) || null : null;
  const token = signDownload(uuid, width, f);

  let slug: string;
  if (width && height) {
    slug = `${uuid}-${width}x${height}.${f}`;
  } else {
    slug = `${uuid}.${f}`;
  }

  return NextResponse.json({ url: `/api/download/${slug}?t=${token}` });
}
