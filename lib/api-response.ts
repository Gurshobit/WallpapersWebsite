import { NextResponse } from "next/server";

/**
 * Additive JSON helpers for API routes. These DO NOT change existing success
 * payload shapes elsewhere — use them only in new/edited handlers.
 */

export function jsonOk<T>(data: T, init?: number | ResponseInit) {
  const opts = typeof init === "number" ? { status: init } : init;
  return NextResponse.json(data as unknown as Record<string, unknown>, opts);
}

/**
 * Consistent error response. Preserves the existing `{ error: string }` shape
 * that web callers already expect, maps thrown auth errors to 401/403, and
 * never leaks stack traces or raw objects (no `String(err)`).
 */
export function jsonError(error: unknown, fallbackStatus = 400) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Request failed";
  const status =
    message === "Unauthorized"
      ? 401
      : message === "Forbidden"
        ? 403
        : fallbackStatus;
  return NextResponse.json({ error: message }, { status });
}
