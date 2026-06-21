"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

const THUMB_FORMAT_OPTIONS = ["avif", "webp", "jpeg"] as const;
type ThumbFormat = (typeof THUMB_FORMAT_OPTIONS)[number];

async function apiPatch(path: string, body: unknown) {
  const res = await fetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
}

export function AdminSettingsGeneral({
  configs,
}: {
  configs: { param: string; value: string | null }[];
}) {
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Thumbnail settings state
  const [thumbWidth, setThumbWidth] = useState(
    configs.find((c) => c.param === "thumb_width")?.value ?? "800"
  );
  const [thumbHeight, setThumbHeight] = useState(
    configs.find((c) => c.param === "thumb_height")?.value ?? "450"
  );
  const [thumbFormat, setThumbFormat] = useState<ThumbFormat>(
    (configs.find((c) => c.param === "thumb_format")?.value as ThumbFormat) ?? "avif"
  );

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function saveThumbSettings() {
    setSaving(true);
    try {
      await apiPatch("/api/admin/configs", {
        configs: {
          thumb_width: thumbWidth,
          thumb_height: thumbHeight,
          thumb_format: thumbFormat,
        },
      });
      showToast("Thumbnail settings saved");
    } catch {
      showToast("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-[18px]">
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold"
          style={{ background: "var(--surface2)", border: "1px solid var(--line2)", boxShadow: "0 14px 44px rgba(0,0,0,.55)", animation: "fadeUp .2s ease both", color: "var(--text)" }}
        >
          <span className="w-5 h-5 rounded-full bg-[#30a46c] flex items-center justify-center flex-none">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M20 6 9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
          {toast}
        </div>
      )}

      {/* ── Thumbnail settings ── */}
      <div
        className="rounded-[15px] p-5"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        <div className="font-bold text-base mb-1" style={{ fontFamily: "var(--font-heading)" }}>
          Thumbnail Settings
        </div>
        <p className="text-[12.5px] mb-4" style={{ color: "var(--dim)" }}>
          Dimensions and format used when generating thumbnail variants for newly uploaded wallpapers.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>
              Width (px)
            </label>
            <input
              type="number"
              value={thumbWidth}
              onChange={(e) => setThumbWidth(e.target.value)}
              className="w-full rounded-[9px] px-3 py-[10px] text-[13.5px] outline-none"
              style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>
              Height (px)
            </label>
            <input
              type="number"
              value={thumbHeight}
              onChange={(e) => setThumbHeight(e.target.value)}
              className="w-full rounded-[9px] px-3 py-[10px] text-[13.5px] outline-none"
              style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>
            Format
          </label>
          <div className="flex gap-2">
            {THUMB_FORMAT_OPTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setThumbFormat(f)}
                className="px-4 py-2 rounded-[9px] text-[13px] font-bold uppercase transition-colors"
                style={
                  thumbFormat === f
                    ? { background: "rgba(255,46,99,.15)", color: "#ff6a8a", border: "1.5px solid rgba(255,46,99,.4)" }
                    : { background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--line2)" }
                }
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={saveThumbSettings}
          disabled={saving}
          className="w-full rounded-[10px] px-4 py-[11px] font-bold text-[13.5px] cursor-pointer transition-opacity disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#ff2e63,#ff6a3d)", color: "#fff", border: "none" }}
        >
          {saving ? "Saving…" : "Save Thumbnail Settings"}
        </button>
      </div>

      {/* ── General + Appearance ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="rounded-[15px] p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <div className="font-bold text-base mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            General
          </div>
          <div className="flex flex-col gap-[14px]">
            <ConfigField
              label="Site name"
              defaultValue={configs.find((c) => c.param === "site_name")?.value ?? "HDWallpapers.site"}
            />
            <ConfigField
              label="Max upload size"
              defaultValue={`${configs.find((c) => c.param === "max_upload_size_mb")?.value ?? "50"} MB`}
            />
            <ToggleRow
              title="Require moderation"
              subtitle="Review uploads before publishing"
              defaultOn={configs.find((c) => c.param === "require_moderation")?.value !== "false"}
            />
            <ToggleRow title="Show ads" subtitle="Display ad units on public site" defaultOn />
          </div>
        </div>

        <div
          className="rounded-[15px] p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <div className="font-bold text-base mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Appearance
          </div>
          <p className="text-[13px] mb-[14px] leading-relaxed" style={{ color: "var(--dim)" }}>
            Default theme for new visitors. Users can switch any time.
          </p>
          <div className="flex gap-2.5 mb-[18px]">
            <ThemeCard bg="#101014" previewGradient="linear-gradient(135deg,#1b1b1f,#2a2a30)" label="Dark" labelColor="#fff" />
            <ThemeCard bg="#f1f3f7" previewGradient="linear-gradient(135deg,#fff,#e7eaf0)" label="Light" labelColor="#15161a" border="1px solid #e2e5ec" />
          </div>
          <button
            type="button"
            onClick={() => showToast("Theme preference saved")}
            className="w-full rounded-[10px] px-4 py-[11px] font-bold text-[13.5px] border cursor-pointer"
            style={{ background: "var(--surface3)", border: "1px solid var(--line2)", color: "var(--text)" }}
          >
            Toggle current theme
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfigField({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>
        {label}
      </label>
      <input
        defaultValue={defaultValue}
        className="w-full rounded-[9px] px-3 py-[10px] text-[13.5px] outline-none"
        style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}
      />
    </div>
  );
}

function ToggleRow({
  title,
  subtitle,
  defaultOn = false,
}: {
  title: string;
  subtitle: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[13.5px] font-semibold">{title}</div>
        <div className="text-xs" style={{ color: "var(--dim)" }}>{subtitle}</div>
      </div>
      <Switch checked={on} onCheckedChange={setOn} aria-label={title} />
    </div>
  );
}

function ThemeCard({
  bg,
  previewGradient,
  label,
  labelColor,
  border,
}: {
  bg: string;
  previewGradient: string;
  label: string;
  labelColor: string;
  border?: string;
}) {
  return (
    <div
      className="flex-1 rounded-xl p-[14px] cursor-pointer transition-colors hover:border-[rgba(255,46,99,.5)]"
      style={{ background: bg, border: border ?? "2px solid var(--line2)" }}
    >
      <div className="h-[34px] rounded-[7px] mb-[9px]" style={{ background: previewGradient, border }} />
      <div className="text-[13px] font-bold" style={{ color: labelColor }}>{label}</div>
    </div>
  );
}
