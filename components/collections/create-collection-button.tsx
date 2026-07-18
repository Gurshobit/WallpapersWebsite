"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RichTextEditor } from "@/components/rich-text-editor";

export function CreateCollectionButton({
  isLoggedIn,
  loginHref,
  prefix,
  categories,
}: {
  isLoggedIn: boolean;
  loginHref: string;
  prefix: string;
  categories: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openModal() {
    if (!isLoggedIn) {
      router.push(loginHref);
      return;
    }
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, category }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Failed to create");
      setOpen(false);
      router.push(`${prefix}/collections/${data.collection.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="rounded-[11px] px-4 py-2.5 text-[13px] font-bold text-white border-none cursor-pointer"
        style={{
          background: "linear-gradient(135deg,#ff2e63,#ff6a3d)",
          boxShadow: "0 4px 14px rgba(255,46,99,.28)",
        }}
      >
        + New collection
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.55)" }}
          onClick={() => setOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-3.5"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <h3 className="font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>
              New collection
            </h3>
            <label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
              Name
              <input
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="hd-field mt-1.5"
              />
            </label>
            <label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="hd-field mt-1.5"
              >
                {categories.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <div className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
              Description
              <div className="mt-1.5">
                <RichTextEditor
                  content={description}
                  onChange={setDescription}
                  placeholder="What is this collection about?"
                  minHeight={140}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-2 justify-end mt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-[10px] px-4 py-2.5 text-[13px] font-semibold cursor-pointer"
                style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-[10px] px-4 py-2.5 text-[13px] font-bold text-white border-none cursor-pointer disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#ff2e63,#ff6a3d)" }}
              >
                Create collection
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
