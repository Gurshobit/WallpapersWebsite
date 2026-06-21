/** Turnstile is enabled only in production when a site key is configured. */
export function isTurnstileEnabled(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
  );
}

export function getTurnstileSiteKey(): string | undefined {
  return isTurnstileEnabled()
    ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    : undefined;
}

export async function verifyTurnstileToken(
  token: string | undefined,
  ip?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!isTurnstileEnabled() || !secret) return { ok: true };
  if (!token) return { ok: false, error: "Missing token" };

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, response: token, remoteip: ip ?? "" }),
      }
    );
    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };
    if (!data.success) return { ok: false, error: "Verification failed" };
    return { ok: true };
  } catch {
    return { ok: false, error: "Verification error" };
  }
}
