"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { SiteLogo } from "./site-logo";
import { requestPasswordReset } from "@/lib/auth-client";
import { Turnstile } from "@marsidev/react-turnstile";
import { getTurnstileSiteKey, isTurnstileEnabled } from "@/lib/turnstile";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const siteKey = getTurnstileSiteKey();
  const turnstileEnabled = isTurnstileEnabled();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (turnstileEnabled && !turnstileToken) {
      setError("Please complete the security check.");
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email, locale);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 relative">
      <div className="w-full max-w-[440px] relative">
        <Link href={prefix || "/"} className="flex justify-center mb-[30px]">
          <SiteLogo height={44} className="h-11 w-auto" priority />
        </Link>

        <div className="rounded-[20px] p-8" style={{ background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "0 24px 64px rgba(0,0,0,.28)" }}>
          <h1 className="font-bold text-[22px] tracking-[-0.4px] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            {t("forgotPasswordTitle")}
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--dim)" }}>{t("forgotPasswordHint")}</p>

          {success ? (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(48,164,108,.1)", border: "1px solid rgba(48,164,108,.25)", color: "#6ee7a0" }}>
              {t("forgotPasswordSent")}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>{t("email")}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="hd-field" />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              {turnstileEnabled && siteKey && (
                <div className="flex justify-center">
                  <Turnstile siteKey={siteKey} onSuccess={setTurnstileToken} onExpire={() => setTurnstileToken(null)} options={{ theme: "auto" }} />
                </div>
              )}

              <button type="submit" disabled={loading || (turnstileEnabled && !turnstileToken)}
                className="w-full rounded-xl py-3.5 font-bold text-[15px] text-white disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #ff2e63, #ff6a3d)", boxShadow: "0 6px 20px rgba(255,46,99,.35)" }}>
                {loading ? "..." : t("sendResetLink")}
              </button>
            </form>
          )}

          <Link href={`${prefix}/login`} className="block text-center mt-5 text-[13px] no-underline" style={{ color: "var(--dim)" }}>
            ← {t("backToSignIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
