/**
 * Canonical site URL for Better Auth and the browser client.
 * In production, set BETTER_AUTH_URL and NEXT_PUBLIC_SITE_URL to your live domain.
 */
export function getAuthBaseUrl(): string {
  return (
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
}

export function getTrustedOrigins(): string[] {
  const origins = new Set<string>();
  for (const value of [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ]) {
    if (value) origins.add(value.replace(/\/$/, ""));
  }
  return [...origins];
}

export function shouldUseSecureCookies(): boolean {
  const base = getAuthBaseUrl();
  if (base.startsWith("https://")) return true;
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}
