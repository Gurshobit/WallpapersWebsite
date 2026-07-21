"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Slot = {
  id: number;
  name: string;
  slug: string;
  placement: string | null;
  width: number | null;
  height: number | null;
  content: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  priority: number | null;
  startsAt: string | Date | null;
  endsAt: string | Date | null;
  active: boolean | null;
};

const KNOWN_PLACEMENTS = [
  "header_728x90",
  "sidebar_300x250",
  "sidebar_160x800",
  "inline_grid",
];

type FormState = {
  name: string;
  slug: string;
  placement: string;
  width: string;
  height: string;
  priority: string;
  imageUrl: string;
  linkUrl: string;
  content: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  placement: "",
  width: "",
  height: "",
  priority: "0",
  imageUrl: "",
  linkUrl: "",
  content: "",
  startsAt: "",
  endsAt: "",
  active: true,
};

function toLocalInput(value: string | Date | null): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function AdminAdsPanel({ initial }: { initial: Slot[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Slot[]>(initial);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | { mode: "new" | "edit"; row?: Slot }>(
    null
  );
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.slug.toLowerCase().includes(q) ||
        (i.placement ?? "").toLowerCase().includes(q)
    );
  }, [items, search]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openNew() {
    setForm(EMPTY_FORM);
    setModal({ mode: "new" });
  }

  function openEdit(row: Slot) {
    setForm({
      name: row.name,
      slug: row.slug,
      placement: row.placement ?? "",
      width: row.width != null ? String(row.width) : "",
      height: row.height != null ? String(row.height) : "",
      priority: row.priority != null ? String(row.priority) : "0",
      imageUrl: row.imageUrl ?? "",
      linkUrl: row.linkUrl ?? "",
      content: row.content ?? "",
      startsAt: toLocalInput(row.startsAt),
      endsAt: toLocalInput(row.endsAt),
      active: row.active ?? true,
    });
    setModal({ mode: "edit", row });
  }

  function buildPayload() {
    return {
      name: form.name.trim(),
      slug: form.slug.trim(),
      placement: form.placement.trim(),
      width: form.width ? Number(form.width) : undefined,
      height: form.height ? Number(form.height) : undefined,
      priority: form.priority ? Number(form.priority) : 0,
      imageUrl: form.imageUrl.trim(),
      linkUrl: form.linkUrl.trim(),
      content: form.content,
      startsAt: form.startsAt,
      endsAt: form.endsAt,
      active: form.active,
    };
  }

  async function save() {
    if (!form.name.trim() || !form.slug.trim()) {
      showToast("Name and slug are required");
      return;
    }
    setSaving(true);
    try {
      if (modal?.mode === "new") {
        const res = await fetch("/api/admin/ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed");
        setItems((list) => [data.slot as Slot, ...list]);
        showToast("Ad slot created");
      } else if (modal?.row) {
        const res = await fetch(`/api/admin/ads/${modal.row.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed");
        setItems((list) =>
          list.map((i) => (i.id === modal.row!.id ? (data.slot as Slot) : i))
        );
        showToast("Ad slot updated");
      }
      setModal(null);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(row: Slot) {
    const next = !row.active;
    setItems((list) =>
      list.map((i) => (i.id === row.id ? { ...i, active: next } : i))
    );
    const res = await fetch(`/api/admin/ads/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    if (!res.ok) {
      setItems((list) =>
        list.map((i) => (i.id === row.id ? { ...i, active: row.active } : i))
      );
      showToast("Failed to update");
    }
  }

  async function remove(row: Slot) {
    if (!confirm(`Delete “${row.name}”?`)) return;
    const res = await fetch(`/api/admin/ads/${row.id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast("Delete failed");
      return;
    }
    setItems((list) => list.filter((i) => i.id !== row.id));
    showToast("Deleted");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ad slots…"
            className="hd-field w-full sm:w-[220px] pl-9"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="11" cy="11" r="7" stroke="var(--dim)" strokeWidth="2" />
            <path d="m20 20-3-3" stroke="var(--dim)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="ml-auto rounded-[10px] px-4 py-2.5 text-[13.5px] font-bold text-white border-none cursor-pointer"
          style={{ background: "linear-gradient(135deg,#ff2e63,#ff6a3d)" }}
        >
          + New ad slot
        </button>
      </div>

      <div className="grid gap-3">
        {filtered.map((row) => (
          <div
            key={row.id}
            className="rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            style={{ background: "var(--surface)", borderColor: "var(--line)" }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[14px]">{row.name}</span>
                <span
                  className="text-[11px] px-1.5 py-0.5 rounded font-semibold"
                  style={{ background: "var(--surface2)", color: "var(--text3)" }}
                >
                  {row.slug}
                </span>
                {row.placement && (
                  <span
                    className="text-[11px] px-1.5 py-0.5 rounded font-semibold"
                    style={{ background: "rgba(127,230,245,.12)", color: "#7fe6f5" }}
                  >
                    {row.placement}
                  </span>
                )}
              </div>
              <div className="text-[11.5px] mt-1" style={{ color: "var(--dim)" }}>
                {row.imageUrl
                  ? "Image ad"
                  : row.content
                    ? "HTML ad"
                    : "Empty"}
                {row.width || row.height
                  ? ` · ${row.width ?? "?"}×${row.height ?? "?"}`
                  : ""}
                {` · priority ${row.priority ?? 0}`}
                {row.startsAt || row.endsAt ? " · scheduled" : ""}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-none">
              <button
                type="button"
                onClick={() => toggleActive(row)}
                aria-pressed={!!row.active}
                title={row.active ? "Active" : "Inactive"}
                className="relative w-[42px] h-6 rounded-full border-none cursor-pointer flex-none transition-colors"
                style={{ background: row.active ? "#30a46c" : "var(--track)" }}
              >
                <span
                  className="absolute top-[2px] w-5 h-5 rounded-full bg-white transition-all"
                  style={{ left: row.active ? 20 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.3)" }}
                />
              </button>
              <button
                type="button"
                onClick={() => openEdit(row)}
                className="text-[12px] font-bold cursor-pointer border-none bg-transparent"
                style={{ color: "#ff6a8a" }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(row)}
                className="text-[12px] font-bold cursor-pointer border-none bg-transparent"
                style={{ color: "#e5484d" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div
            className="py-12 text-center text-sm rounded-2xl border"
            style={{ color: "var(--dim)", background: "var(--surface)", borderColor: "var(--line)" }}
          >
            No ad slots found.
          </div>
        )}
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,.55)" }}
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-lg my-8 rounded-2xl p-6 flex flex-col gap-3.5"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>
              {modal.mode === "new" ? "New ad slot" : "Edit ad slot"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-[12px] font-semibold" style={{ color: "var(--dim)" }}>
                Name
                <input
                  className="hd-field font-normal"
                  placeholder="Homepage leaderboard"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-[12px] font-semibold" style={{ color: "var(--dim)" }}>
                Slug
                <input
                  className="hd-field font-normal"
                  placeholder="home-leaderboard"
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1 text-[12px] font-semibold" style={{ color: "var(--dim)" }}>
              Placement
              <input
                className="hd-field font-normal"
                placeholder="e.g. sidebar_300x250"
                list="ad-placements"
                value={form.placement}
                onChange={(e) => set("placement", e.target.value)}
              />
              <datalist id="ad-placements">
                {KNOWN_PLACEMENTS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </label>

            <div className="grid grid-cols-3 gap-3">
              <label className="flex flex-col gap-1 text-[12px] font-semibold" style={{ color: "var(--dim)" }}>
                Width
                <input
                  className="hd-field font-normal"
                  type="number"
                  value={form.width}
                  onChange={(e) => set("width", e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-[12px] font-semibold" style={{ color: "var(--dim)" }}>
                Height
                <input
                  className="hd-field font-normal"
                  type="number"
                  value={form.height}
                  onChange={(e) => set("height", e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-[12px] font-semibold" style={{ color: "var(--dim)" }}>
                Priority
                <input
                  className="hd-field font-normal"
                  type="number"
                  value={form.priority}
                  onChange={(e) => set("priority", e.target.value)}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1 text-[12px] font-semibold" style={{ color: "var(--dim)" }}>
              Image URL
              <input
                className="hd-field font-normal"
                placeholder="https://…/banner.png"
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-[12px] font-semibold" style={{ color: "var(--dim)" }}>
              Link URL
              <input
                className="hd-field font-normal"
                placeholder="https://advertiser.example"
                value={form.linkUrl}
                onChange={(e) => set("linkUrl", e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 text-[12px] font-semibold" style={{ color: "var(--dim)" }}>
              HTML content (fallback if no image)
              <textarea
                className="hd-field font-normal font-mono text-[12px]"
                rows={4}
                placeholder="<script>…</script> or <div>…</div>"
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-[12px] font-semibold" style={{ color: "var(--dim)" }}>
                Starts at
                <input
                  className="hd-field font-normal"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => set("startsAt", e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-[12px] font-semibold" style={{ color: "var(--dim)" }}>
                Ends at
                <input
                  className="hd-field font-normal"
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => set("endsAt", e.target.value)}
                />
              </label>
            </div>

            <label className="flex items-center gap-2.5 text-[13px] font-semibold cursor-pointer">
              <button
                type="button"
                onClick={() => set("active", !form.active)}
                aria-pressed={form.active}
                className="relative w-[42px] h-6 rounded-full border-none cursor-pointer flex-none transition-colors"
                style={{ background: form.active ? "#30a46c" : "var(--track)" }}
              >
                <span
                  className="absolute top-[2px] w-5 h-5 rounded-full bg-white transition-all"
                  style={{ left: form.active ? 20 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.3)" }}
                />
              </button>
              Active
            </label>

            <div className="flex gap-3 justify-end mt-1">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-[10px] px-4 py-2.5 text-[13.5px] font-bold cursor-pointer"
                style={{ background: "var(--surface2)", color: "var(--text2)", border: "1px solid var(--line)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-[10px] px-4 py-2.5 text-[13.5px] font-bold text-white border-none cursor-pointer disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#ff2e63,#ff6a3d)" }}
              >
                {saving ? "Saving…" : modal.mode === "new" ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-[10px] text-[13px] font-semibold text-white"
          style={{ background: "var(--text)", color: "var(--bg)" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
