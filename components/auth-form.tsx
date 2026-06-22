"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { authClient, signIn } from "@/lib/auth-client";
import Link from "next/link";
import Image from "next/image";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { getTurnstileSiteKey, isTurnstileEnabled } from "@/lib/turnstile";

type Tab = "login" | "signup";

export function AuthForm({
  defaultTab = "login",
  canRegister = true,
}: {
  defaultTab?: Tab;
  canRegister?: boolean;
}) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const prefix = locale === "en" ? "" : `/${locale}`;

  const [tab, setTab] = useState<Tab>(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const siteKey = getTurnstileSiteKey();
  const turnstileEnabled = isTurnstileEnabled();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Verify Turnstile if enabled (production only)
    if (turnstileEnabled) {
      if (!turnstileToken) { setError("Please complete the security check."); return; }
      const verifyRes = await fetch("/api/turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: turnstileToken }),
      });
      if (!verifyRes.ok) {
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        setError("Security check failed. Please try again.");
        return;
      }
    }

    setLoading(true);
    try {
      if (tab === "login") {
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!loginRes.ok) {
          const d = await loginRes.json().catch(() => null);
          throw new Error(d?.error ?? "Invalid email or password");
        }
      } else {
        if (!canRegister) throw new Error("Registration is currently closed");
        if (password !== confirm) throw new Error("Passwords do not match");
        if (!agree) throw new Error("Please agree to the terms");
        const registerRes = await fetch("/api/auth/register", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, username }),
        });
        const data = await registerRes.json().catch(() => null);
        if (!registerRes.ok) throw new Error(data?.error ?? "Registration failed");
        if (data?.needsVerification) {
          setSuccess(data.message ?? "Check your email to verify your account.");
          setLoading(false);
          return;
        }
      }
      await authClient.getSession();
      router.push(prefix || "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 relative overflow-y-auto">
      <div
        className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255,46,99,.18) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-[440px] relative">
        <Link href={prefix || "/"} className="flex justify-center mb-[30px]">
          <Image
            src="/assets/logo.png"
            alt="HD Wallpapers"
            width={176}
            height={44}
            className="site-logo h-11 w-auto"
            priority
          />
        </Link>

        <div
          className="rounded-[20px] p-8"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            boxShadow: "0 24px 64px rgba(0,0,0,.28)",
          }}
        >
          <div
            className="flex gap-1 rounded-xl p-1 mb-7"
            style={{ background: "var(--bg2)", border: "1px solid var(--line)" }}
          >
            {(["login", "signup"] as Tab[]).filter((t_) => t_ === "login" || canRegister).map((t_) => (
              <button
                key={t_}
                type="button"
                onClick={() => setTab(t_)}
                className={`${canRegister ? "w-1/2" : "w-full"} py-[11px] rounded-[10px] text-sm font-bold transition-all`}
                style={
                  tab === t_
                    ? {
                        background: "linear-gradient(135deg, #ff2e63, #ff6a3d)",
                        color: "#fff",
                      }
                    : { color: "var(--muted)", background: "transparent" }
                }
              >
                {t_ === "login" ? t("signIn") : t("createAccount")}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <h2
              className="font-bold text-[22px] tracking-[-0.4px]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {tab === "login" ? t("signIn") : t("createAccount")}
            </h2>

            {tab === "signup" && (
              <Field label={t("username")}>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="hd-field"
                />
              </Field>
            )}

            <Field label={t("email")}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="hd-field"
              />
            </Field>

            <div>
              <div className="flex justify-between mb-[7px]">
                <label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                  {t("password")}
                </label>
                {tab === "login" && (
                  <Link href={`${prefix}/forgot-password`} className="text-xs font-semibold no-underline hover:underline" style={{ color: "#ff6a8a" }}>
                    {t("forgotPassword")}
                  </Link>
                )}
              </div>
              <PasswordInput
                value={password}
                onChange={setPassword}
                show={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                showLabel={t("showPassword")}
                hideLabel={t("hidePassword")}
                required
                minLength={8}
              />
            </div>

            {tab === "signup" && (
              <>
                <Field label={t("confirmPassword")}>
                  <PasswordInput
                    value={confirm}
                    onChange={setConfirm}
                    show={showConfirm}
                    onToggle={() => setShowConfirm((v) => !v)}
                    showLabel={t("showPassword")}
                    hideLabel={t("hidePassword")}
                    required
                  />
                </Field>
                <label className="flex items-start gap-2.5 cursor-pointer text-[13px] leading-[1.5]" style={{ color: "var(--text3)" }}>
                  <span className="relative mt-0.5 flex-none">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span
                      className="flex w-[18px] h-[18px] items-center justify-center rounded-[5px] border transition-colors peer-checked:border-[rgba(255,46,99,.5)] peer-checked:bg-[rgba(255,46,99,.15)]"
                      style={{ borderColor: "var(--line2)", background: "var(--surface2)" }}
                    >
                      {agree && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6 9 17l-5-5" stroke="#ff2e63" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </span>
                  {t("agreeTerms")}
                </label>
              </>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}
            {success && <p className="text-sm" style={{ color: "#30a46c" }}>{success}</p>}

            {/* Cloudflare Turnstile — production only */}
            {turnstileEnabled && siteKey && (
              <div className="flex justify-center">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={siteKey}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  options={{ theme: "auto", size: "normal" }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (turnstileEnabled && !turnstileToken)}
              className="w-full rounded-xl py-3.5 font-bold text-[15px] text-white disabled:opacity-60 mt-1"
              style={{
                background: "linear-gradient(135deg, #ff2e63, #ff6a3d)",
                boxShadow: "0 6px 20px rgba(255,46,99,.35)",
              }}
            >
              {loading ? "..." : tab === "login" ? t("signIn") : t("createAccount")}
            </button>

            <div className="flex items-center gap-2.5 my-1">
              <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
              <span className="text-xs" style={{ color: "var(--dim2)" }}>
                {t("orContinueWith")}
              </span>
              <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
            </div>

            <div className="flex gap-2.5">
              <SocialBtn
                label="Google"
                onClick={() => canRegister && signIn.social({ provider: "google", callbackURL: prefix || "/" })}
                disabled={!canRegister && tab === "signup"}
              />
              <SocialBtn
                label="GitHub"
                onClick={() => canRegister && signIn.social({ provider: "github", callbackURL: prefix || "/" })}
                disabled={!canRegister && tab === "signup"}
              />
            </div>
          </form>
        </div>

        <Link
          href={prefix || "/"}
          className="block text-center mt-5 text-[13px] no-underline transition-colors hover:text-[var(--text)]"
          style={{ color: "var(--dim)" }}
        >
          ← {t("backToBrowsing")}
        </Link>
      </div>
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  show,
  onToggle,
  showLabel,
  hideLabel,
  required,
  minLength,
}: {
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  showLabel: string;
  hideLabel: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="hd-field pr-11"
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? hideLabel : showLabel}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer hover:bg-[var(--surface2)]"
        style={{ color: "var(--dim)" }}
      >
        {show ? <IconEyeOff /> : <IconEye />}
      </button>
    </div>
  );
}

function IconEye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.72 6.72A18.5 18.5 0 0 0 2 12s3.5 7 10 7a10.94 10.94 0 0 0 5.76-1.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SocialBtn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex-1 rounded-[11px] py-[11px] text-[13.5px] font-semibold disabled:opacity-45 disabled:cursor-not-allowed"
      style={{
        background: "var(--surface2)",
        border: "1px solid var(--line2)",
        color: "var(--text)",
      }}
    >
      {label}
    </button>
  );
}
