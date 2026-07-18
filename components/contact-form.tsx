"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Turnstile } from "@marsidev/react-turnstile";
import { getTurnstileSiteKey, isTurnstileEnabled } from "@/lib/turnstile";
import { RichTextEditor } from "@/components/rich-text-editor";

const SUBJECT_KEYS = [
  "subjectGeneral",
  "subjectDmca",
  "subjectBug",
  "subjectPartnership",
  "subjectOther",
] as const;

type SubjectKey = (typeof SUBJECT_KEYS)[number];

export function ContactForm({
  defaultName = "",
  defaultEmail = "",
}: {
  defaultName?: string;
  defaultEmail?: string;
}) {
  const t = useTranslations("contact");
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [subject, setSubject] = useState<SubjectKey>(SUBJECT_KEYS[0]);
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
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
      setError(t("turnstileRequired"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject: t(subject),
          website: website.trim() || undefined,
          message,
          turnstileToken: turnstileToken ?? undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t("sendError"));
      }

      setSuccess(true);
      setMessage("");
      setWebsite("");
      setTurnstileToken(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("sendError"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: "rgba(48,164,108,.08)",
          border: "1px solid rgba(48,164,108,.25)",
        }}
      >
        <div
          className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: "rgba(48,164,108,.15)" }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6 9 17l-5-5"
              stroke="#30a46c"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2
          className="font-bold text-xl mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {t("successTitle")}
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--dim)" }}>
          {t("successMessage")}
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-5 text-[13px] font-semibold cursor-pointer border-none bg-transparent"
          style={{ color: "#ff6a8a" }}
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t("name")}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
            className="hd-field"
            placeholder={t("namePlaceholder")}
          />
        </Field>
        <Field label={t("email")}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
            className="hd-field"
            placeholder="you@example.com"
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t("subject")}>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value as SubjectKey)}
            className="hd-field"
            style={{ cursor: "pointer" }}
          >
            {SUBJECT_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(key)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`${t("website")} (${t("optional")})`}>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            maxLength={255}
            className="hd-field"
            placeholder="https://"
          />
        </Field>
      </div>

      <Field label={t("message")}>
        <RichTextEditor
          content={message}
          onChange={setMessage}
          placeholder={t("messagePlaceholder")}
          minHeight={160}
        />
      </Field>

      {error && (
        <p className="text-sm text-red-400 rounded-xl px-4 py-2.5" style={{ background: "rgba(229,72,77,.1)", border: "1px solid rgba(229,72,77,.25)" }}>
          {error}
        </p>
      )}

      {turnstileEnabled && siteKey && (
        <div className="flex justify-center pt-1">
          <Turnstile
            siteKey={siteKey}
            onSuccess={setTurnstileToken}
            onExpire={() => setTurnstileToken(null)}
            options={{ theme: "auto" }}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading || (turnstileEnabled && !turnstileToken)}
        className="w-full sm:w-auto sm:self-start rounded-xl px-8 py-3.5 font-bold text-[15px] text-white disabled:opacity-60 cursor-pointer border-none"
        style={{
          background: "linear-gradient(135deg, #ff2e63, #ff6a3d)",
          boxShadow: "0 6px 20px rgba(255,46,99,.35)",
        }}
      >
        {loading ? t("sending") : t("send")}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block text-xs font-semibold mb-[7px]"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
