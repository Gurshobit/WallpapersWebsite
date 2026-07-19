"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { resolveMediaUrl } from "@/lib/media";
import { formatCount } from "@/lib/format";

type UserRow = {
  user: {
    id: number;
    username: string;
    email: string | null;
    roleId: number;
    status: string;
    totalUploads: number;
    totalDownloads: number;
    avatarUrl: string | null;
    dateRegistered: Date | null;
  };
  nickname: string | null;
  uploadsActive: number | null;
};

const ROLE_STYLE: Record<number, { bg: string; color: string }> = {
  1: { bg: "rgba(255,46,99,.12)", color: "#ff6a8a" },
  2: { bg: "rgba(34,211,238,.12)", color: "#22d3ee" },
  3: { bg: "rgba(139,92,246,.12)", color: "#b794f6" },
};
const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  active: { bg: "rgba(48,164,108,.12)", color: "#30a46c", dot: "#30a46c" },
  pending: { bg: "rgba(245,197,24,.12)", color: "#f5c518", dot: "#f5c518" },
  suspended: { bg: "rgba(229,72,77,.12)", color: "#e5484d", dot: "#e5484d" },
  closed: { bg: "rgba(148,163,184,.12)", color: "#94a3b8", dot: "#94a3b8" },
};

const STATUS_OPTIONS = ["active", "pending", "suspended", "closed"] as const;
const ROLE_OPTIONS = [
  { id: 1, label: "Admin" },
  { id: 2, label: "Member" },
  { id: 3, label: "Moderator" },
] as const;

export function AdminUsersTable({
  rows,
  stats,
}: {
  rows: UserRow[];
  stats: { total: number; creators: number; suspended: number; newWeek: number };
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.user.username.toLowerCase().includes(q) ||
        (r.user.email ?? "").toLowerCase().includes(q) ||
        (r.nickname ?? "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function patchUser(userId: number, patch: { status?: string; roleId?: number }) {
    setSavingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? "Update failed");
      showToast("User updated");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl px-4 py-3 text-sm font-semibold"
          style={{ background: "var(--surface2)", border: "1px solid var(--line2)", boxShadow: "0 14px 44px rgba(0,0,0,.55)" }}
        >
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-[13px]" style={{ color: "var(--dim)" }}>
          {stats.total} accounts · {stats.creators} creators
        </p>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users…"
          className="w-[240px] rounded-[10px] px-3 py-2.5 text-[13.5px] outline-none"
          style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text)" }}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        {[
          { v: stats.total, l: "Total users", c: "var(--text)" },
          { v: stats.creators, l: "Creators", c: "#22d3ee" },
          { v: stats.newWeek, l: "New this week", c: "#30a46c" },
          { v: stats.suspended, l: "Suspended", c: "#e5484d" },
        ].map((s) => (
          <div key={s.l} className="rounded-[13px] p-4 border" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
            <div className="font-bold text-[22px]" style={{ fontFamily: "var(--font-heading)", color: s.c }}>{formatCount(s.v)}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--dim)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[15px] border overflow-x-auto" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
        <div className="hidden md:grid md:min-w-[720px] grid-cols-[2.4fr_1fr_1fr_1fr_1.2fr_1.2fr] gap-3.5 px-[18px] py-3 text-[11.5px] font-bold uppercase tracking-wide border-b" style={{ borderColor: "var(--line)", color: "var(--dim2)" }}>
          <span>User</span><span>Role</span><span>Uploads</span><span>Downloads</span><span>Status</span><span>Change status</span>
        </div>
        {filtered.map(({ user, nickname }) => {
          const role = ROLE_STYLE[user.roleId] ?? ROLE_STYLE[2];
          const st = STATUS_STYLE[user.status] ?? STATUS_STYLE.pending;
          const busy = savingId === user.id;
          return (
            <div key={user.id} className="grid grid-cols-1 md:grid-cols-[2.4fr_1fr_1fr_1fr_1.2fr_1.2fr] md:min-w-[720px] gap-3.5 px-[18px] py-3 border-b items-center hover:bg-[var(--surface2)]" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-cover bg-center border-2 flex-none" style={{ borderColor: "var(--line)", backgroundColor: "var(--surface2)", backgroundImage: user.avatarUrl ? `url(${resolveMediaUrl(user.avatarUrl)})` : undefined }} />
                <div className="min-w-0">
                  <Link href={`/u/${user.username}`} className="text-[13.5px] font-bold truncate block no-underline hover:text-[#ff6a8a]" style={{ color: "var(--text)" }}>
                    {nickname ?? user.username}
                  </Link>
                  <div className="text-xs truncate" style={{ color: "var(--dim)" }}>@{user.username}{user.email ? ` · ${user.email}` : ""}</div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 md:block">
                <span className="md:hidden text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--dim2)" }}>Role</span>
                <select
                  value={user.roleId}
                  disabled={busy}
                  onChange={(e) => void patchUser(user.id, { roleId: Number(e.target.value) })}
                  className="text-xs font-semibold px-2 py-1 rounded border-none outline-none cursor-pointer"
                  style={{ background: role.bg, color: role.color }}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between gap-2 md:block text-[13.5px] font-semibold">
                <span className="md:hidden text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--dim2)" }}>Uploads</span>
                {user.totalUploads}
              </div>
              <div className="flex items-center justify-between gap-2 md:block text-[13.5px] font-semibold" style={{ color: "var(--text3)" }}>
                <span className="md:hidden text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--dim2)" }}>Downloads</span>
                {formatCount(user.totalDownloads)}
              </div>
              <div className="flex items-center justify-between gap-2 md:block">
                <span className="md:hidden text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--dim2)" }}>Status</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded capitalize" style={{ background: st.bg, color: st.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                  {user.status}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 md:block">
                <span className="md:hidden text-[11px] font-bold uppercase tracking-wide flex-none" style={{ color: "var(--dim2)" }}>Change status</span>
                <select
                  value={user.status}
                  disabled={busy}
                  onChange={(e) => void patchUser(user.id, { status: e.target.value })}
                  className="w-full max-w-[180px] md:max-w-none hd-field py-1.5 text-xs capitalize"
                  style={{ cursor: busy ? "wait" : "pointer", opacity: busy ? 0.6 : 1 }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
