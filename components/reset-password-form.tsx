"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { resetPassword } from "@/lib/auth-client";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefix = locale === "en" ? "" : `/${locale}`;

  const token = searchParams.get("token") ?? "";
  const errorParam = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(errorParam === "INVALID_TOKEN" ? t("resetTokenInvalid") : "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError(t("resetTokenInvalid"));
      return;
    }
    if (password.length < 8) {
      setError(t("passwordMinLength"));
      return;
    }
    if (password !== confirm) {
      setError(t("passwordsNoMatch"));
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(password, token) as { error?: { message?: string } };
      if (res?.error) throw new Error(res.error.message ?? "Reset failed");
      router.push(`${prefix}/login?reset=1`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 relative">
      <div className="w-full max-w-[440px] relative">
        <Link href={prefix || "/"} className="flex justify-center mb-[30px]">
          <Image src="/assets/logo.png" alt="HD Wallpapers" width={176} height={44} className="site-logo h-11 w-auto" priority />
        </Link>

        <div className="rounded-[20px] p-8" style={{ background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "0 24px 64px rgba(0,0,0,.28)" }}>
          <h1 className="font-bold text-[22px] tracking-[-0.4px] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            {t("resetPasswordTitle")}
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--dim)" }}>{t("resetPasswordHint")}</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>{t("newPassword")}</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="hd-field pr-11" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: "var(--dim)" }}>
                  {showPassword ? t("hidePassword") : t("showPassword")}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>{t("confirmPassword")}</label>
              <input type={showPassword ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} className="hd-field" />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button type="submit" disabled={loading || !token}
              className="w-full rounded-xl py-3.5 font-bold text-[15px] text-white disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #ff2e63, #ff6a3d)", boxShadow: "0 6px 20px rgba(255,46,99,.35)" }}>
              {loading ? "..." : t("resetPasswordAction")}
            </button>
          </form>

          <Link href={`${prefix}/login`} className="block text-center mt-5 text-[13px] no-underline" style={{ color: "var(--dim)" }}>
            ← {t("backToSignIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
