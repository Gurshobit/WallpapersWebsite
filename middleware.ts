import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing, GEO_MAP } from "./lib/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip admin and API routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
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
