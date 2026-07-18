"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/rich-text-editor";

type Row = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  featured: boolean;
  status: string;
  saveCount: number;
  viewCount: number;
  wallpaperCount: number;
  curatorUsername: string;
  createdAt: Date | string | null;
};

export function AdminCollectionsPanel({
  items: initial,
  categories,
}: {
  items: Row[];
  categories: string[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | { mode: "new" | "edit"; row?: Row }>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "");
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.curatorUsername.toLowerCase().includes(q) ||
        (i.category ?? "").toLowerCase().includes(q)
    );
  }, [items, search]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function openNew() {
    setName("");
    setDescription("");
    setCategory(categories[0] ?? "");
    setFeatured(false);
    setModal({ mode: "new" });
  }

  function openEdit(row: Row) {
    setName(row.name);
    setDescription(row.description ?? "");
    setCategory(row.category ?? categories[0] ?? "");
    setFeatured(row.featured);
    setModal({ mode: "edit", row });
  }

  async function save() {
    setSaving(true);
    try {
      if (modal?.mode === "new") {
        const res = await fetch("/api/admin/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, category, featured }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed");
        showToast("Collection created");
      } else if (modal?.row) {
        const res = await fetch(`/api/admin/collections/${modal.row.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, category, featured }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed");
        setItems((list) =>
          list.map((i) =>
            i.id === modal.row!.id
              ? { ...i, name, description, category, featured }
              : i
          )
        );
        showToast("Collection updated");
      }
      setModal(null);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleFeatured(row: Row) {
    const next = !row.featured;
    setItems((list) =>
      list.map((i) => (i.id === row.id ? { ...i, featured: next } : i))
    );
    const res = await fetch(`/api/admin/collections/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: next }),
    });
    if (!res.ok) {
      setItems((list) =>
        list.map((i) => (i.id === row.id ? { ...i, featured: row.featured } : i))
      );
      showToast("Failed to update");
    }
  }

  async function remove(row: Row) {
    if (!confirm(`Delete “${row.name}”?`)) return;
    const res = await fetch(`/api/admin/collections/${row.id}`, { method: "DELETE" });
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
            placeholder="Search collections…"
            className="hd-field w-[220px] pl-9"
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
          + New collection
        </button>
      </div>

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--line)" }}
      >
        <div
          className="grid grid-cols-[1fr_100px_80px_80px_90px_120px] gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-wide border-b"
          style={{ borderColor: "var(--line)", color: "var(--dim)" }}
        >
          <span>Collection</span>
          <span>Category</span>
          <span>Items</span>
          <span>Saves</span>
          <span>Featured</span>
          <span />
        </div>
        {filtered.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-[1fr_100px_80px_80px_90px_120px] gap-3 px-4 py-3.5 items-center border-b last:border-0"
            style={{ borderColor: "var(--line)" }}
          >
            <div>
              <div className="font-bold text-[13.5px]">{row.name}</div>
              <div className="text-[11.5px]" style={{ color: "var(--dim)" }}>
                by @{row.curatorUsername} · {row.status}
              </div>
            </div>
            <span className="text-[12.5px]" style={{ color: "var(--text3)" }}>
              {row.category ?? "—"}
            </span>
            <span className="text-[13px] font-semibold">{row.wallpaperCount}</span>
            <span className="text-[13px] font-semibold">{row.saveCount}</span>
            <button
              type="button"
              onClick={() => toggleFeatured(row)}
              aria-pressed={row.featured}
              className="relative w-[42px] h-6 rounded-full border-none cursor-pointer flex-none transition-colors"
              style={{ background: row.featured ? "#30a46c" : "var(--track)" }}
            >
              <span
                className="absolute top-[2px] w-5 h-5 rounded-full bg-white transition-all"
                style={{ left: row.featured ? 20 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.3)" }}
              />
            </button>
            <div className="flex gap-2 justify-end">
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
          <div className="py-12 text-center text-sm" style={{ color: "var(--dim)" }}>
            No collections found.
          </div>
        )}
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.55)" }}
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-3.5"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>
              {modal.mode === "new" ? "New collection" : "Edit collection"}
            </h3>
            <input
              className="hd-field"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <select
              className="hd-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {(categories.includes(category) || !category
                ? categories
                : [category, ...categories]
              ).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Description"
              minHeight={140}
            />
            <label className="flex items-center justify-between text-sm font-semibold">
              Featured
              <button
                type="button"
                onClick={() => setFeatured((v) => !v)}
                aria-pressed={featured}
                className="relative w-[42px] h-6 rounded-full border-none cursor-pointer flex-none transition-colors"
                style={{ background: featured ? "#30a46c" : "var(--track)" }}
              >
                <span
                  className="absolute top-[2px] w-5 h-5 rounded-full bg-white transition-all"
                  style={{ left: featured ? 20 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.3)" }}
                />
              </button>
            </label>
            <button
              type="button"
              disabled={saving || name.trim().length < 2}
              onClick={save}
              className="rounded-[11px] py-3 font-bold text-sm text-white border-none cursor-pointer disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#ff2e63,#ff6a3d)" }}
            >
              {modal.mode === "new" ? "Create collection" : "Save changes"}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-semibold text-white"
          style={{ background: "#1a1a22", boxShadow: "0 8px 24px rgba(0,0,0,.4)" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
