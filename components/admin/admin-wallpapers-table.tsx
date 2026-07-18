"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { resolveMediaUrl } from "@/lib/media";
import { wallpaperVariantUrl } from "@/lib/wallpaper-urls";
import { formatCount } from "@/lib/format";

type Row = {
  wallpaper: {
    id: number;
    title: string;
    status: string;
    thumbUrl: string;
    uuid: string;
    slug: string | null;
    dateAdded: Date | null;
    width: number | null;
    height: number | null;
  };
  username: string;
  avatarUrl: string | null;
  categoryName: string;
  downloadCount: number | null;
};

function thumb(w: Row["wallpaper"]) {
  if (w.thumbUrl) return resolveMediaUrl(w.thumbUrl);
  return wallpaperVariantUrl(w.uuid, 240, 135, "webp");
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  active: { bg: "rgba(48,164,108,.15)", color: "#30a46c" },
  pending: { bg: "rgba(255,106,61,.15)", color: "#ff6a3d" },
  rejected: { bg: "rgba(229,72,77,.15)", color: "#e5484d" },
  disabled: { bg: "rgba(148,163,184,.15)", color: "#94a3b8" },
  draft: { bg: "rgba(148,163,184,.15)", color: "#94a3b8" },
};

export function AdminWallpapersTable({
  items,
  totalCount,
  initialStatus = "",
}: {
  items: Row[];
  totalCount: number;
  initialStatus?: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sort, setSort] = useState("latest");

  const filtered = useMemo(() => {
    let list = items;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.wallpaper.title.toLowerCase().includes(q) ||
          r.username.toLowerCase().includes(q) ||
          r.categoryName.toLowerCase().includes(q)
      );
    }
    if (sort === "title") list = [...list].sort((a, b) => a.wallpaper.title.localeCompare(b.wallpaper.title));
    if (sort === "downloads") list = [...list].sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0));
    return list;
  }, [items, search, sort]);

  function navigateStatus(s: string) {
    setStatusFilter(s);
    router.push(s ? `/admin/wallpapers?status=${s}` : "/admin/wallpapers");
  }

  async function bulkAction(action: "approve" | "reject") {
    for (const id of selected) {
      await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallpaperId: id, action }),
      });
    }
    setSelected([]);
    router.refresh();
  }

  const allSelected = filtered.length > 0 && selected.length === filtered.length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-[13px]" style={{ color: "var(--dim)" }}>{totalCount} total · manage library</p>
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search wallpapers…"
            className="w-[230px] rounded-[10px] pl-9 pr-3 py-2 text-[13.5px] outline-none"
            style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text)" }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
        <div className="flex gap-1 p-1 rounded-[11px]" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          {["", "pending", "active", "rejected"].map((s) => {
            const active = statusFilter === s;
            return (
              <button
                key={s || "all"}
                type="button"
                onClick={() => navigateStatus(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer border-none"
                style={active ? { background: "rgba(255,46,99,.12)", color: "#ff2e63" } : { color: "var(--muted)", background: "transparent" }}
              >
                {s || "all"}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1 p-1 rounded-[11px]" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          {[
            ["latest", "Latest"],
            ["downloads", "Downloads"],
            ["title", "Title"],
          ].map(([k, label]) => (
            <button key={k} type="button" onClick={() => setSort(k)} className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border-none" style={{ background: sort === k ? "var(--surface2)" : "transparent", color: sort === k ? "var(--text)" : "var(--muted)" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-2.5 mb-3.5" style={{ background: "rgba(255,46,99,.1)", border: "1px solid rgba(255,46,99,.25)" }}>
          <span className="text-[13.5px] font-bold" style={{ color: "#ff6a8a" }}>{selected.length} selected</span>
          <div className="flex-1" />
          <button type="button" onClick={() => void bulkAction("approve")} className="rounded-lg px-3.5 py-1.5 text-[13px] font-bold cursor-pointer border" style={{ background: "rgba(48,164,108,.15)", borderColor: "rgba(48,164,108,.4)", color: "#5fd398" }}>Approve</button>
          <button type="button" onClick={() => void bulkAction("reject")} className="rounded-lg px-3.5 py-1.5 text-[13px] font-bold cursor-pointer border" style={{ background: "rgba(229,72,77,.12)", borderColor: "rgba(229,72,77,.35)", color: "#ff8a8d" }}>Reject</button>
          <button type="button" onClick={() => setSelected([])} className="text-[13px] font-semibold cursor-pointer border-none bg-transparent" style={{ color: "var(--muted)" }}>Clear</button>
        </div>
      )}

      <div className="rounded-[15px] border overflow-hidden" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
        <div className="hidden md:grid grid-cols-[28px_56px_1.8fr_1fr_1fr_1fr_80px_40px] gap-3 px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide border-b" style={{ borderColor: "var(--line)", color: "var(--dim2)" }}>
          <button type="button" onClick={() => setSelected(allSelected ? [] : filtered.map((r) => r.wallpaper.id))} className="cursor-pointer border-none bg-transparent p-0">☐</button>
          <span />
          <span>Title</span>
          <span>Category</span>
          <span>Creator</span>
          <span>Downloads</span>
          <span>Status</span>
          <span />
        </div>
        {filtered.map((row) => {
          const st = STATUS_STYLE[row.wallpaper.status] ?? STATUS_STYLE.draft;
          const isSelected = selected.includes(row.wallpaper.id);
          return (
            <div key={row.wallpaper.id} className="grid grid-cols-1 md:grid-cols-[28px_56px_1.8fr_1fr_1fr_1fr_80px_40px] gap-3 px-4 py-3 border-b items-center hover:bg-[var(--surface2)]" style={{ borderColor: "var(--line)" }}>
              <button type="button" onClick={() => setSelected((s) => isSelected ? s.filter((id) => id !== row.wallpaper.id) : [...s, row.wallpaper.id])} className="w-5 h-5 rounded border flex items-center justify-center cursor-pointer" style={{ borderColor: isSelected ? "#ff2e63" : "var(--line2)", background: isSelected ? "#ff2e63" : "transparent", color: "#fff" }}>
                {isSelected ? "✓" : ""}
              </button>
              <div className="w-14 h-[34px] rounded-md bg-cover bg-center flex-none" style={{ backgroundImage: `url(${thumb(row.wallpaper)})`, backgroundColor: "var(--surface2)" }} />
              <div className="min-w-0">
                <Link href={row.wallpaper.slug ? `/wallpapers/${row.wallpaper.slug}` : "#"} className="text-[13.5px] font-bold truncate block no-underline hover:text-[#ff6a8a]" style={{ color: "var(--text)" }}>
                  {row.wallpaper.title}
                </Link>
                <div className="text-[11px] md:hidden" style={{ color: "var(--dim)" }}>{row.categoryName} · {row.username}</div>
              </div>
              <div className="hidden md:block text-[13px]" style={{ color: "var(--text3)" }}>{row.categoryName}</div>
              <div className="hidden md:flex items-center gap-1.5 min-w-0">
                <div className="w-[22px] h-[22px] rounded-full bg-cover bg-center flex-none" style={{ backgroundImage: row.avatarUrl ? `url(${resolveMediaUrl(row.avatarUrl)})` : undefined, backgroundColor: "var(--surface2)" }} />
                <span className="text-[12.5px] truncate" style={{ color: "var(--text3)" }}>{row.username}</span>
              </div>
              <div className="hidden md:block text-[13px] font-semibold" style={{ color: "var(--text3)" }}>{formatCount(row.downloadCount ?? 0)}</div>
              <div><span className="text-xs px-2 py-0.5 rounded capitalize font-semibold" style={{ background: st.bg, color: st.color }}>{row.wallpaper.status}</span></div>
              <div className="flex justify-center">
                <Link
                  href={`/admin/wallpapers/${row.wallpaper.id}/edit`}
                  title="Edit wallpaper"
                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none text-[13px] no-underline"
                  style={{ background: "var(--surface2)", color: "var(--muted)" }}
                >
                  ✎
                </Link>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: "var(--dim)" }}>No wallpapers found.</div>
        )}
      </div>
    </div>
  );
}
