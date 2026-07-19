import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing, GEO_MAP } from "./lib/routing";
import { getTrustedOrigins } from "./lib/auth-url";

const intlMiddleware = createMiddleware(routing);

const CORS_METHODS = "GET,POST,PATCH,DELETE,OPTIONS";
const CORS_ALLOW_HEADERS = "Content-Type, Authorization";
const CORS_EXPOSE_HEADERS = "set-auth-token";

/**
 * Resolve the Access-Control-Allow-Origin for an API request.
 * - Allowlisted origins (API_CORS_ORIGINS + the site's trusted origins) are
 *   echoed back and permitted to send credentials.
 * - If no allowlist is configured, fall back to a permissive `*` WITHOUT
 *   credentials (valid CORS; native HTTP clients ignore CORS entirely).
 * - Otherwise return null (unknown browser origins are blocked).
 */
function resolveAllowedOrigin(
  origin: string | null
): { origin: string; credentials: boolean } | null {
  const configured = (process.env.API_CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const allowlist = new Set([...configured, ...getTrustedOrigins()]);

  if (origin && allowlist.has(origin)) return { origin, credentials: true };
  if (configured.length === 0) return { origin: "*", credentials: false };
  return null;
}

function applyCors(res: NextResponse, origin: string | null): NextResponse {
  const allowed = resolveAllowedOrigin(origin);
  if (!allowed) return res;
  res.headers.set("Access-Control-Allow-Origin", allowed.origin);
  res.headers.append("Vary", "Origin");
  if (allowed.credentials) {
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }
  res.headers.set("Access-Control-Allow-Methods", CORS_METHODS);
  res.headers.set("Access-Control-Allow-Headers", CORS_ALLOW_HEADERS);
  res.headers.set("Access-Control-Expose-Headers", CORS_EXPOSE_HEADERS);
  return res;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes: attach CORS (for mobile / WebView clients) and answer preflight.
  // Locale routing is intentionally not applied to /api.
  if (pathname.startsWith("/api")) {
    const origin = request.headers.get("origin");
    if (request.method === "OPTIONS") {
      return applyCors(new NextResponse(null, { status: 204 }), origin);
    }
    return applyCors(NextResponse.next(), origin);
  }

  // Skip admin routes (locale routing does not apply there)
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // GEO locale suggestion on first visit (cookie override)
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (!localeCookie && pathname === "/") {
    const country =
      request.headers.get("cf-ipcountry") ??
      request.headers.get("x-vercel-ip-country") ??
      "US";
    const detectedLocale = GEO_MAP[country];
    if (detectedLocale && detectedLocale !== "en") {
      const url = request.nextUrl.clone();
      url.pathname = `/${detectedLocale}`;
      const response = NextResponse.redirect(url);
      response.cookies.set("NEXT_LOCALE", detectedLocale, {
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
      return response;
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
