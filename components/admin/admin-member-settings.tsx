"use client";

import { useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SwitchField } from "@/components/ui/switch";
import { generatePassword } from "@/lib/generate-password";

type ConfigRow = { param: string; value: string | null };

const CONFIG_KEYS = {
  canRegister: "users_can_register",
  requireConfirmation: "users_register_confirmation",
  canSubmit: "users_can_submit_walls",
  canComment: "users_can_post_wall_comm",
  moderateComments: "users_moderated_comments",
  profilesPerPage: "users_members_per_page",
  restrictedUsernames: "users_restricted_usernames",
} as const;

const DEFAULTS: Record<string, string> = {
  users_can_register: "1",
  users_register_confirmation: "1",
  users_can_submit_walls: "1",
  users_can_post_wall_comm: "1",
  users_moderated_comments: "1",
  users_members_per_page: "16",
  users_restricted_usernames:
    "admin,administration,adm,wallpaper,wallpapers,hdwalls,hdwallpapers",
};

function cfgValue(configs: ConfigRow[], key: string): string {
  return configs.find((c) => c.param === key)?.value ?? DEFAULTS[key] ?? "";
}

export function AdminMemberSettings({ configs }: { configs: ConfigRow[] }) {
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const initial = useMemo(() => ({
    canRegister: cfgValue(configs, CONFIG_KEYS.canRegister) === "1",
    requireConfirmation: cfgValue(configs, CONFIG_KEYS.requireConfirmation) === "1",
    canSubmit: cfgValue(configs, CONFIG_KEYS.canSubmit) === "1",
    canComment: cfgValue(configs, CONFIG_KEYS.canComment) === "1",
    moderateComments: cfgValue(configs, CONFIG_KEYS.moderateComments) === "1",
    profilesPerPage: cfgValue(configs, CONFIG_KEYS.profilesPerPage),
    restrictedUsernames: cfgValue(configs, CONFIG_KEYS.restrictedUsernames),
  }), [configs]);

  const [settings, setSettings] = useState(initial);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    status: "active" as "active" | "pending" | "suspended",
    roleId: 2,
  });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [showPw, setShowPw] = useState(false);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/configs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          configs: {
            [CONFIG_KEYS.canRegister]: settings.canRegister ? "1" : "0",
            [CONFIG_KEYS.requireConfirmation]: settings.requireConfirmation ? "1" : "0",
            [CONFIG_KEYS.canSubmit]: settings.canSubmit ? "1" : "0",
            [CONFIG_KEYS.canComment]: settings.canComment ? "1" : "0",
            [CONFIG_KEYS.moderateComments]: settings.moderateComments ? "1" : "0",
            [CONFIG_KEYS.profilesPerPage]: settings.profilesPerPage,
            [CONFIG_KEYS.restrictedUsernames]: settings.restrictedUsernames,
          },
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      flash("Member settings updated");
    } catch {
      flash("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function addMember() {
    setAddError("");
    if (!form.username || !form.email || !form.password) {
      setAddError("Fill all required fields");
      return;
    }
    if (form.password.length < 8) {
      setAddError("Password must be at least 8 characters");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Failed to add member");
      flash(`Member "${form.username}" added`);
      setShowAdd(false);
      setForm({ username: "", email: "", password: "", status: "active", roleId: 2 });
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Failed to add member");
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] rounded-xl px-4 py-3 text-sm font-semibold"
          style={{ background: "var(--surface2)", border: "1px solid var(--line2)", boxShadow: "0 14px 44px rgba(0,0,0,.55)", color: "var(--text)" }}>
          {toast}
        </div>
      )}

      <AdminPageHeader
        title="Member Settings"
        subtitle="Registration, permissions & new accounts"
        actions={
          <div className="flex items-center gap-2.5">
            <button type="button"
              className="rounded-[10px] px-4 py-2.5 text-[13.5px] font-bold cursor-pointer"
              style={{ background: "rgba(255,46,99,.14)", color: "#ff2e63", border: "1px solid rgba(255,46,99,.25)" }}>
              Registration
            </button>
            <button type="button" onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13.5px] font-bold text-white cursor-pointer"
              style={{ background: "linear-gradient(135deg, #ff2e63, #ff6a3d)", boxShadow: "0 4px 14px rgba(255,46,99,.28)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
              Add member
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-[15px] p-5" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div className="font-bold text-base mb-1" style={{ fontFamily: "var(--font-heading)" }}>Registration & permissions</div>
          <SwitchField checked={settings.canRegister} onCheckedChange={(v) => setSettings((s) => ({ ...s, canRegister: v }))}
            label="Users can register" hint="Allow new user registrations" />
          <SwitchField checked={settings.requireConfirmation} onCheckedChange={(v) => setSettings((s) => ({ ...s, requireConfirmation: v }))}
            label="Require email confirmation" hint="Send verification link on signup" />
          <SwitchField checked={settings.canSubmit} onCheckedChange={(v) => setSettings((s) => ({ ...s, canSubmit: v }))}
            label="Users can submit wallpapers" hint="Allow uploads from registered users" />
          <SwitchField checked={settings.canComment} onCheckedChange={(v) => setSettings((s) => ({ ...s, canComment: v }))}
            label="Users can post comments" hint="Allow comments on wallpapers" />
          <SwitchField checked={settings.moderateComments} onCheckedChange={(v) => setSettings((s) => ({ ...s, moderateComments: v }))}
            label="Moderate wallpaper comments" hint="Admin approval before comments appear" border={false} />
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-[15px] p-5" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
            <div className="font-bold text-base mb-3" style={{ fontFamily: "var(--font-heading)" }}>Profiles per page</div>
            <input type="number" min={1} max={100} value={settings.profilesPerPage}
              onChange={(e) => setSettings((s) => ({ ...s, profilesPerPage: e.target.value }))}
              className="w-full rounded-[9px] px-3 py-[10px] text-sm outline-none"
              style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }} />
            <p className="text-[12px] mt-2" style={{ color: "var(--dim)" }}>Number of user profiles shown per page (numeric)</p>
          </div>

          <div className="rounded-[15px] p-5 flex-1" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
            <div className="font-bold text-base mb-3" style={{ fontFamily: "var(--font-heading)" }}>Restricted usernames</div>
            <textarea rows={4} value={settings.restrictedUsernames}
              onChange={(e) => setSettings((s) => ({ ...s, restrictedUsernames: e.target.value }))}
              className="w-full rounded-[9px] px-3 py-[10px] text-[13px] outline-none resize-y leading-relaxed"
              style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }} />
            <p className="text-[12px] mt-2 font-semibold" style={{ color: "#f59e0b" }}>IMPORTANT: separated by comma (,)</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button type="button" onClick={() => void saveSettings()} disabled={saving}
          className="rounded-[11px] px-6 py-3 font-bold text-[14px] text-white cursor-pointer disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #ff2e63, #ff6a3d)", boxShadow: "0 4px 14px rgba(255,46,99,.28)" }}>
          {saving ? "Saving…" : "Update settings"}
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.72)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-[520px] rounded-[18px] p-6"
            style={{ background: "var(--bg)", border: "1px solid var(--line)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="font-bold text-[18px] mb-5" style={{ fontFamily: "var(--font-heading)" }}>Add new member</div>

            <div className="flex flex-col gap-4">
              <Field label="Username *">
                <input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  placeholder="username"
                  className="w-full rounded-[9px] px-[13px] py-[10px] text-sm outline-none focus:border-[rgba(255,46,99,.5)]"
                  style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }} />
              </Field>

              <Field label="Email address *">
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="user@example.com"
                  className="w-full rounded-[9px] px-[13px] py-[10px] text-sm outline-none focus:border-[rgba(255,46,99,.5)]"
                  style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }} />
              </Field>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Password *</label>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, password: generatePassword() }))}
                    className="text-[12px] font-semibold cursor-pointer border-none bg-transparent"
                    style={{ color: "#ff6a8a" }}>
                    generate password
                  </button>
                </div>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    minLength={8}
                    className="w-full rounded-[9px] px-[13px] py-[10px] pr-20 text-sm outline-none focus:border-[rgba(255,46,99,.5)]"
                    style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }} />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold cursor-pointer"
                    style={{ color: "var(--dim)" }}>
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Status *">
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as typeof form.status }))}
                    className="w-full rounded-[9px] px-[13px] py-[10px] text-sm outline-none"
                    style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </Field>
                <Field label="Role *">
                  <select value={form.roleId} onChange={(e) => setForm((f) => ({ ...f, roleId: Number(e.target.value) }))}
                    className="w-full rounded-[9px] px-[13px] py-[10px] text-sm outline-none"
                    style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}>
                    <option value={2}>Member</option>
                    <option value={3}>Moderator</option>
                    <option value={1}>Admin</option>
                  </select>
                </Field>
              </div>

              {addError && (
                <p className="text-[13px] px-3 py-2 rounded-[9px]"
                  style={{ background: "rgba(255,46,99,.08)", color: "#ff6a8a", border: "1px solid rgba(255,46,99,.2)" }}>
                  {addError}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => void addMember()} disabled={adding}
                  className="rounded-[11px] px-5 py-3 font-bold text-[14px] text-white cursor-pointer disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #ff2e63, #ff6a3d)", boxShadow: "0 4px 14px rgba(255,46,99,.28)" }}>
                  {adding ? "Adding…" : "Add member"}
                </button>
                <button type="button" onClick={() => setShowAdd(false)}
                  className="rounded-[11px] px-5 py-3 font-bold text-[14px] cursor-pointer"
                  style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--muted)" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{label}</label>
      {children}
    </div>
  );
}
