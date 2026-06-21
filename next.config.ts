import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n.ts");

/** Derive the CDN hostname from env vars — no hardcoded domains */
function cdnHostname(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_CDN_URL ?? process.env.R2_PUBLIC_URL ?? "";
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

const cdnHost = cdnHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Presigned R2 direct URLs (used for secure downloads)
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      // CDN hostname read from NEXT_PUBLIC_CDN_URL / R2_PUBLIC_URL env var
      ...(cdnHost
        ? [{ protocol: "https" as const, hostname: cdnHost }]
        : []),
    ],
  },
};

export default withNextIntl(nextConfig);
