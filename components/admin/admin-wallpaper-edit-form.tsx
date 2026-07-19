"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatBytes } from "@/lib/format";
import { RichTextEditor } from "@/components/rich-text-editor";

type Category = { id: number; name: string };

type WallpaperImage = {
  id: number;
  url: string;
  format: string | null;
  width: number;
  height: number;
  fileSize: number | null;
  status: string | null;
  resolutionName: string | null;
  typeName: string | null;
};

export type WallpaperEditDetail = {
  wallpaper: {
    id: number;
    uuid: string;
    title: string;
    description: string | null;
    status: string;
    featured: boolean;
    categoryId: number;
    tags: string | null;
    thumbUrl: string;
    width: number | null;
    height: number | null;
    slug: string | null;
  };
  username: string;
  categoryName: string;
  images: WallpaperImage[];
};

const STATUS_OPTIONS = ["active", "pending", "rejected", "disabled", "draft"] as const;

export function AdminWallpaperEditForm({
  detail,
  categories,
}: {
  detail: WallpaperEditDetail;
  categories: Category[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedNote, setSavedNote] = useState(false);

  const [title, setTitle] = useState(detail.wallpaper.title);
  const [description, setDescription] = useState(detail.wallpaper.description ?? "");
  const [status, setStatus] = useState<string>(detail.wallpaper.status);
  const [featured, setFeatured] = useState(detail.wallpaper.featured);
  const [categoryId, setCategoryId] = useState(detail.wallpaper.categoryId);
  const [tags, setTags] = useState(detail.wallpaper.tags ?? "");

  const [previewId, setPreviewId] = useState<number | null>(
    (detail.images.find((i) => i.status === "active") ?? detail.images[0])?.id ?? null
  );

  const groupedImages = useMemo(() => {
    const map = new Map<
      string,
      { label: string; typeName: string | null; items: WallpaperImage[] }
    >();
    for (const img of detail.images) {
      const key = `${img.width}x${img.height}`;
      const label = img.resolutionName ?? key;
      const existing = map.get(key);
      if (existing) existing.items.push(img);
      else map.set(key, { label, typeName: img.typeName, items: [img] });
    }
    return Array.from(map.values()).sort(
      (a, b) => (b.items[0]?.width ?? 0) - (a.items[0]?.width ?? 0)
    );
  }, [detail.images]);

  const previewImage =
    detail.images.find((i) => i.id === previewId) ??
    detail.images.find((i) => i.status === "active") ??
    detail.images[0];

  const heroUrl = previewImage?.url ?? detail.wallpaper.thumbUrl ?? "";

  async function handleSave() {
    setSaving(true);
    setError("");
    setSavedNote(false);
    try {
      const res = await fetch(`/api/admin/wallpapers/${detail.wallpaper.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          featured,
          categoryId,
          tags: tags.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Save failed");
      }
      setSavedNote(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid md:grid-cols-[1.3fr_1fr] gap-6 items-start">
      {/* Left: preview + variants */}
      <div className="flex flex-col gap-5">
        <div
          className="relative rounded-[14px] overflow-hidden border aspect-video"
          style={{ borderColor: "var(--line)", background: "var(--surface2)" }}
        >
          {heroUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroUrl} alt={title} className="w-full h-full object-cover" />
          )}
          {previewImage && (
            <div
              className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg"
              style={{ background: "rgba(0,0,0,.55)", color: "#fff", backdropFilter: "blur(8px)" }}
            >
              <span>{previewImage.width} × {previewImage.height}</span>
              {previewImage.format && <span className="uppercase">{previewImage.format}</span>}
              {previewImage.fileSize != null && <span>{formatBytes(previewImage.fileSize)}</span>}
              {previewImage.resolutionName && <span>{previewImage.resolutionName}</span>}
            </div>
          )}
        </div>

        <div
          className="rounded-[14px] border p-4"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold">Uploaded resolutions</h3>
            <span className="text-xs" style={{ color: "var(--dim)" }}>
              {detail.images.length} variant{detail.images.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {groupedImages.map((group) => (
              <div key={group.label}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text2)" }}>
                    {group.label}
                  </span>
                  {group.typeName && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--surface2)", color: "var(--dim)" }}>
                      {group.typeName}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {group.items.map((img) => {
                    const active = previewId === img.id;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setPreviewId(img.id)}
                        className="text-left rounded-[11px] overflow-hidden border cursor-pointer p-0"
                        style={{
                          borderColor: active ? "#ff2e63" : "var(--line)",
                          background: "var(--surface2)",
                          boxShadow: active ? "0 0 0 1px rgba(255,46,99,.35)" : undefined,
                        }}
                      >
                        <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${img.url})` }} />
                        <div className="px-2.5 py-2">
                          <div className="text-[11px] font-bold uppercase">{img.format ?? "—"}</div>
                          <div className="text-[10.5px]" style={{ color: "var(--dim)" }}>
                            {img.width}×{img.height} · {formatBytes(img.fileSize)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {groupedImages.length === 0 && (
              <p className="text-sm py-6 text-center rounded-xl border" style={{ borderColor: "var(--line)", color: "var(--dim)" }}>
                No resolution variants found for this wallpaper.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right: edit form (sticky) */}
      <div
        className="rounded-[14px] border p-5 flex flex-col gap-4 md:sticky md:top-6"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="hd-field" required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} className="hd-field" style={{ cursor: "pointer" }}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="hd-field" style={{ cursor: "pointer" }}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Tags">
          <input value={tags} onChange={(e) => setTags(e.target.value)} className="hd-field" placeholder="nature, 4k, night…" />
        </Field>
        <Field label="Description">
          <RichTextEditor
            content={description}
            onChange={setDescription}
            placeholder="Describe the scene, location, mood, camera details…"
            minHeight={140}
          />
        </Field>

        <div
          className="flex items-center justify-between py-2 border-t border-b"
          style={{ borderColor: "var(--line)" }}
        >
          <div>
            <div className="text-sm font-semibold">Featured</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--dim)" }}>
              Show on homepage carousel
            </div>
          </div>
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
        </div>

        {error && (
          <p className="text-sm text-red-400 rounded-xl px-4 py-2.5" style={{ background: "rgba(229,72,77,.1)", border: "1px solid rgba(229,72,77,.25)" }}>
            {error}
          </p>
        )}
        {savedNote && !error && (
          <p className="text-sm rounded-xl px-4 py-2.5" style={{ background: "rgba(48,164,108,.12)", border: "1px solid rgba(48,164,108,.3)", color: "#30a46c" }}>
            Changes saved.
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !title.trim()}
            className="rounded-xl px-6 py-3 font-bold text-[14px] text-white disabled:opacity-60 cursor-pointer border-none"
            style={{ background: "linear-gradient(135deg, #ff2e63, #ff6a3d)" }}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          {detail.wallpaper.slug && (
            <a
              href={`/wallpapers/${detail.wallpaper.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl px-5 py-3 font-semibold text-[14px] no-underline border inline-flex items-center"
              style={{ borderColor: "var(--line)", color: "var(--text2)" }}
            >
              View public page ↗
            </a>
          )}
          <Link
            href="/admin/wallpapers"
            className="rounded-xl px-5 py-3 font-semibold text-[14px] no-underline inline-flex items-center ml-auto"
            style={{ color: "var(--muted)" }}
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
