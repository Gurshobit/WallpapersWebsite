"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

type SettingsTab = "profile" | "privacy" | "notifications" | "password";

export function AccountSettingsForm({
  username,
  handle,
}: {
  username: string;
  handle: string;
}) {
  const t = useTranslations("settings");
  const locale = useLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const [tab, setTab] = useState<SettingsTab>("profile");

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: "profile", label: t("tabProfile") },
    { key: "privacy", label: t("tabPrivacy") },
    { key: "notifications", label: t("tabNotifications") },
    { key: "password", label: t("tabPassword") },
  ];

  const tabBtn = (key: SettingsTab) =>
    tab === key
      ? {
          background: "rgba(255,46,99,.12)",
          color: "#ff2e63",
          fontWeight: 700,
        }
      : { color: "var(--muted)", fontWeight: 600, background: "transparent" };

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--bg)" }}>
      <div className="max-w-[860px] mx-auto px-7 pt-7">
        <Link
          href={`${prefix}/u/${handle}`}
          className="inline-flex items-center gap-[7px] text-[13px] font-semibold mb-[18px] no-underline transition-colors hover:text-[var(--text)]"
          style={{ color: "var(--muted)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {t("backToProfile")}
        </Link>

        <h1
          className="font-bold text-[26px] tracking-[-0.5px] mb-[22px]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {t("title")}
        </h1>

        <div
          className="flex gap-0.5 rounded-xl p-1 mb-6 overflow-x-auto"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className="flex-none px-4 py-2.5 rounded-[10px] text-sm border-none cursor-pointer whitespace-nowrap"
              style={tabBtn(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div
            className="rounded-2xl p-6 flex flex-col gap-[18px]"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label={t("firstName")} />
              <Field label={t("lastName")} />
            </div>
            <Field label={t("nickname")} defaultValue={username} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label="Twitter / X" placeholder="@handle" />
              <Field label="Facebook" placeholder="Profile URL" />
              <Field label={t("homepage")} placeholder="https://…" />
              <Field label="LinkedIn" placeholder="Profile URL" />
              <Field label={t("location")} placeholder="City, Country" />
              <Field label={t("interests")} placeholder="Photography, Travel…" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>
                {t("aboutMe")}
              </label>
              <textarea rows={4} className="hd-field resize-y" />
            </div>
            <button type="button" className="hd-btn-primary self-start px-6 py-3 text-sm">
              {t("updateProfile")}
            </button>
          </div>
        )}

        {tab === "privacy" && (
          <div
            className="rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <ToggleRow title={t("showAuthor")} subtitle={t("showAuthorHint")} defaultOn />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[t("viewProfile"), t("viewContact"), t("viewBio"), t("viewDownloads"), t("viewFavourites"), t("viewWallpapers")].map(
                (label) => (
                  <PrivacySelect key={label} label={label} />
                )
              )}
            </div>
            <button type="button" className="hd-btn-primary self-start px-6 py-3 text-sm">
              {t("updatePrivacy")}
            </button>
          </div>
        )}

        {tab === "notifications" && (
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <ToggleRow title={t("commentNotif")} subtitle={t("commentNotifHint")} defaultOn />
            <ToggleRow title={t("statusNotif")} subtitle={t("statusNotifHint")} defaultOn border />
            <ToggleRow title={t("followerNotif")} subtitle={t("followerNotifHint")} border={false} />
            <button type="button" className="hd-btn-primary mt-4 px-6 py-3 text-sm">
              {t("updateNotifications")}
            </button>
          </div>
        )}

        {tab === "password" && (
          <div className="flex flex-col gap-3.5">
            <Card title={t("changeEmail")}>
              <Field label={t("newEmail")} type="email" placeholder="new@example.com" />
              <Field label={t("currentPassword")} type="password" />
              <button type="button" className="hd-btn-secondary self-start px-[18px] py-2.5 text-[13.5px]">
                {t("updateEmail")}
              </button>
            </Card>
            <Card title={t("changePassword")}>
              <Field label={t("currentPassword")} type="password" />
              <Field label={t("newPassword")} type="password" placeholder={t("minPassword")} />
              <Field label={t("confirmPassword")} type="password" />
              <button type="button" className="hd-btn-primary self-start px-6 py-3 text-sm">
                {t("changePasswordBtn")}
              </button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  defaultValue,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>
        {label}
      </label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="hd-field"
      />
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-3.5"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      <div className="font-bold text-base mb-0.5" style={{ fontFamily: "var(--font-heading)" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  title,
  subtitle,
  defaultOn = false,
  border = true,
}: {
  title: string;
  subtitle: string;
  defaultOn?: boolean;
  border?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div
      className={`flex items-center justify-between py-4 ${border ? "border-b" : ""}`}
      style={{ borderColor: "var(--line)" }}
    >
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs mt-0.5" style={{ color: "var(--dim)" }}>
          {subtitle}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOn(!on)}
        className="w-[42px] h-6 rounded-full border-none cursor-pointer relative transition-colors flex-none"
        style={{ background: on ? "#30a46c" : "var(--track)" }}
        aria-pressed={on}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
          style={{ left: on ? 20 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.3)" }}
        />
      </button>
    </div>
  );
}

function PrivacySelect({ label }: { label: string }) {
  return (
    <div
      className="rounded-xl p-3.5"
      style={{ background: "var(--surface2)", border: "1px solid var(--line)" }}
    >
      <div className="text-[13.5px] font-semibold mb-2">{label}</div>
      <select className="w-full rounded-lg px-2.5 py-2 text-[13px] outline-none hd-field">
        <option>Everyone</option>
        <option>Followers</option>
        <option>Only me</option>
      </select>
    </div>
  );
}
