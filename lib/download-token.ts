import { createHmac, timingSafeEqual } from "crypto";

const SECRET =
  process.env.DOWNLOAD_SECRET ?? "dev-dl-secret-replace-in-production";
const TTL = 3600; // 1 hour

/**
 * Creates a short-lived HMAC token for a download.
 * Encodes: uuid + width (0 = original) + format + expiry timestamp.
 */
export function signDownload(
  uuid: string,
  width: number | null,
  format: string
): string {
  const exp = Math.floor(Date.now() / 1000) + TTL;
  const w = width ?? 0;
  const msg = `${uuid}:${w}:${format}:${exp}`;
  const sig = createHmac("sha256", SECRET).update(msg).digest("hex").slice(0, 32);
  return `${exp}.${sig}`;
}

/**
 * Returns true iff the token is valid and not expired.
 */
export function verifyDownload(
  uuid: string,
  width: number | null,
  format: string,
  token: string
): boolean {
  try {
    const dot = token.indexOf(".");
    if (dot < 0) return false;
    const exp = parseInt(token.slice(0, dot), 10);
    const sig = token.slice(dot + 1);
    if (isNaN(exp) || Math.floor(Date.now() / 1000) > exp) return false;
    const w = width ?? 0;
    const msg = `${uuid}:${w}:${format}:${exp}`;
    const expected = createHmac("sha256", SECRET)
      .update(msg)
      .digest("hex")
      .slice(0, 32);
    const sigBuf = Buffer.from(sig.padEnd(32, "0"), "hex");
    const expBuf = Buffer.from(expected, "hex");
    return sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}
