import { NextResponse } from "next/server";

/**
 * Forwards Better Auth `asResponse: true` results into a Next.js route response
 * with all Set-Cookie headers preserved (App Router can drop them on raw Response).
 */
export async function forwardAuthResponse(res: Response): Promise<NextResponse> {
  const bodyText = await res.text();
  let body: unknown = null;
  if (bodyText) {
    try {
      body = JSON.parse(bodyText);
    } catch {
      body = { raw: bodyText };
    }
  }

  const nextRes = NextResponse.json(body, { status: res.status });

  const setCookies =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : res.headers.get("set-cookie")
        ? [res.headers.get("set-cookie")!]
        : [];

  for (const cookie of setCookies) {
    if (cookie) nextRes.headers.append("set-cookie", cookie);
  }

  return nextRes;
}
