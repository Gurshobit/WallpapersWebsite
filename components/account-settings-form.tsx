"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import type { AccountSettings, PrivacyLevel } from "@/lib/db/queries/account";
import { RichTextEditor } from "@/components/rich-text-editor";

type SettingsTab = "profile" | "privacy" | "notifications" | "password";

const PRIVACY_OPTIONS: { value: PrivacyLevel; label: string }[] = [
  { value: "everyone", label: "Everyone" },
  { value: "logged_members", label: "Members" },
  { value: "only_me", label: "Only me" },
];

export function AccountSettingsForm({
  username,
  handle,
  initial,
}: {
  username: string;
  handle: string;
  initial: AccountSettings;
}) {
  const t = useTranslations("settings");
  const locale = useLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const [tab, setTab] = useState<SettingsTab>("profile");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState(initial.profile);
  const [privacy, setPrivacy] = useState(initial.privacy);
  const [notifications, setNotifications] = useState(initial.notifications);

  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/account/settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Update failed");
      setMessage({ type: "ok", text: t("saved") });
    } catch (err) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Update failed",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--bg)" }}>
      <div className="max-w-[860px] mx-auto px-4 sm:px-7 pt-7">
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

        {message && (
          <p
            className="text-sm mb-4"
            style={{ color: message.type === "ok" ? "#30a46c" : "#e5484d" }}
          >
            {message.text}
          </p>
        )}

        <div
          className="flex gap-0.5 rounded-xl p-1 mb-6 overflow-x-auto"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setTab(key);
                setMessage(null);
              }}
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
              <Field
                label={t("firstName")}
                value={profile.firstName}
                onChange={(v) => setProfile((p) => ({ ...p, firstName: v }))}
              />
              <Field
                label={t("lastName")}
                value={profile.lastName}
                onChange={(v) => setProfile((p) => ({ ...p, lastName: v }))}
              />
            </div>
            <Field
              label={t("nickname")}
              value={profile.nickname || username}
              onChange={(v) => setProfile((p) => ({ ...p, nickname: v }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field
                label="Twitter / X"
                placeholder="@handle"
                value={profile.urlTwitter}
                onChange={(v) => setProfile((p) => ({ ...p, urlTwitter: v }))}
              />
              <Field
                label="Facebook"
                placeholder="Profile URL"
                value={profile.urlFacebook}
                onChange={(v) => setProfile((p) => ({ ...p, urlFacebook: v }))}
              />
              <Field
                label={t("homepage")}
                placeholder="https://…"
                value={profile.urlHomepage}
                onChange={(v) => setProfile((p) => ({ ...p, urlHomepage: v }))}
              />
              <Field
                label="LinkedIn"
                placeholder="Profile URL"
                value={profile.urlLinkedin}
                onChange={(v) => setProfile((p) => ({ ...p, urlLinkedin: v }))}
              />
              <Field
                label={t("location")}
                placeholder="City, Country"
                value={profile.location}
                onChange={(v) => setProfile((p) => ({ ...p, location: v }))}
              />
              <Field
                label={t("interests")}
                placeholder="Photography, Travel…"
                value={profile.interests}
                onChange={(v) => setProfile((p) => ({ ...p, interests: v }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>
                {t("aboutMe")}
              </label>
              <RichTextEditor
                content={profile.biography}
                onChange={(html) => setProfile((p) => ({ ...p, biography: html }))}
                placeholder={t("aboutMe")}
                minHeight={160}
              />
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() => patch({ section: "profile", ...profile })}
              className="hd-btn-primary self-start px-6 py-3 text-sm disabled:opacity-60"
            >
              {t("updateProfile")}
            </button>
          </div>
        )}

        {tab === "privacy" && (
          <div
            className="rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <ToggleRow
              title={t("showAuthor")}
              subtitle={t("showAuthorHint")}
              on={privacy.showAuthor}
              onChange={(v) => setPrivacy((p) => ({ ...p, showAuthor: v }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  ["viewProfile", "viewProfile"],
                  ["viewContactInfo", "viewContact"],
                  ["viewBio", "viewBio"],
                  ["viewDownloads", "viewDownloads"],
                  ["viewFavourites", "viewFavourites"],
                  ["viewWallpapers", "viewWallpapers"],
                ] as const
              ).map(([key, labelKey]) => (
                <PrivacySelect
                  key={key}
                  label={t(labelKey)}
                  value={privacy[key]}
                  onChange={(v) => setPrivacy((p) => ({ ...p, [key]: v }))}
                />
              ))}
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() => patch({ section: "privacy", ...privacy })}
              className="hd-btn-primary self-start px-6 py-3 text-sm disabled:opacity-60"
            >
              {t("updatePrivacy")}
            </button>
          </div>
        )}

        {tab === "notifications" && (
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <ToggleRow
              title={t("commentNotif")}
              subtitle={t("commentNotifHint")}
              on={notifications.emailOnComment}
              onChange={(v) => setNotifications((n) => ({ ...n, emailOnComment: v }))}
            />
            <ToggleRow
              title={t("statusNotif")}
              subtitle={t("statusNotifHint")}
              on={notifications.emailOnLike}
              onChange={(v) => setNotifications((n) => ({ ...n, emailOnLike: v }))}
              border
            />
            <ToggleRow
              title={t("followerNotif")}
              subtitle={t("followerNotifHint")}
              on={notifications.emailOnFollow}
              onChange={(v) => setNotifications((n) => ({ ...n, emailOnFollow: v }))}
              border={false}
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => patch({ section: "notifications", ...notifications })}
              className="hd-btn-primary mt-4 px-6 py-3 text-sm disabled:opacity-60"
            >
              {t("updateNotifications")}
            </button>
          </div>
        )}

        {tab === "password" && (
          <div className="flex flex-col gap-3.5">
            <Card title={t("changeEmail")}>
              <p className="text-xs -mt-1 mb-1" style={{ color: "var(--dim)" }}>
                {t("currentEmail")}: {initial.email}
              </p>
              <Field
                label={t("newEmail")}
                type="email"
                placeholder="new@example.com"
                value={newEmail}
                onChange={setNewEmail}
              />
              <Field
                label={t("currentPassword")}
                type="password"
                value={emailPassword}
                onChange={setEmailPassword}
              />
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  patch({
                    section: "email",
                    newEmail,
                    currentPassword: emailPassword,
                  })
                }
                className="hd-btn-secondary self-start px-[18px] py-2.5 text-[13.5px] disabled:opacity-60"
              >
                {t("updateEmail")}
              </button>
            </Card>
            <Card title={t("changePassword")}>
              <Field
                label={t("currentPassword")}
                type="password"
                value={currentPassword}
                onChange={setCurrentPassword}
              />
              <Field
                label={t("newPassword")}
                type="password"
                placeholder={t("minPassword")}
                value={newPassword}
                onChange={setNewPassword}
              />
              <Field
                label={t("confirmPassword")}
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  if (newPassword !== confirmPassword) {
                    setMessage({ type: "err", text: t("passwordMismatch") });
                    return;
                  }
                  patch({
                    section: "password",
                    currentPassword,
                    newPassword,
                  });
                }}
                className="hd-btn-primary self-start px-6 py-3 text-sm disabled:opacity-60"
              >
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
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  on,
  onChange,
  border = true,
}: {
  title: string;
  subtitle: string;
  on: boolean;
  onChange: (value: boolean) => void;
  border?: boolean;
}) {
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
        onClick={() => onChange(!on)}
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

function PrivacySelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PrivacyLevel;
  onChange: (value: PrivacyLevel) => void;
}) {
  return (
    <div
      className="rounded-xl p-3.5"
      style={{ background: "var(--surface2)", border: "1px solid var(--line)" }}
    >
      <div className="text-[13.5px] font-semibold mb-2">{label}</div>
      <select
        className="w-full rounded-lg px-2.5 py-2 text-[13px] outline-none hd-field"
        value={value}
        onChange={(e) => onChange(e.target.value as PrivacyLevel)}
      >
        {PRIVACY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
