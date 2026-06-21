"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { resolveMediaUrl } from "@/lib/media";
import { wallpaperVariantUrl } from "@/lib/wallpaper-urls";
import { formatBytes } from "@/lib/format";

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

type WallpaperDetail = {
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

export function AdminWallpaperEditModal({
  wallpaperId,
  categories,
  onClose,
}: {
  wallpaperId: number;
  categories: Category[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<WallpaperDetail | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>("active");
  const [featured, setFeatured] = useState(false);
  const [categoryId, setCategoryId] = useState(0);
  const [tags, setTags] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`/api/admin/wallpapers/${wallpaperId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load wallpaper");
        return res.json() as Promise<WallpaperDetail>;
      })
      .then((detail) => {
        if (cancelled) return;
        setData(detail);
        setTitle(detail.wallpaper.title);
        setDescription(detail.wallpaper.description ?? "");
        setStatus(detail.wallpaper.status);
        setFeatured(detail.wallpaper.featured);
        setCategoryId(detail.wallpaper.categoryId);
        setTags(detail.wallpaper.tags ?? "");
        const first = detail.images.find((i) => i.status === "active") ?? detail.images[0];
        setPreviewId(first?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load wallpaper details.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [wallpaperId]);

  const groupedImages = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, { label: string; typeName: string | null; items: WallpaperImage[] }>();
    for (const img of data.images) {
      const key = `${img.width}x${img.height}`;
      const label = img.resolutionName ?? key;
      const existing = map.get(key);
      if (existing) existing.items.push(img);
      else map.set(key, { label, typeName: img.typeName, items: [img] });
    }
    return Array.from(map.values()).sort(
      (a, b) => (b.items[0]?.width ?? 0) - (a.items[0]?.width ?? 0)
    );
  }, [data]);

  const previewImage =
    data?.images.find((i) => i.id === previewId) ??
    data?.images.find((i) => i.status === "active") ??
    data?.images[0];

  const heroUrl = previewImage?.url
    ? previewImage.url
    : data?.wallpaper.thumbUrl
      ? resolveMediaUrl(data.wallpaper.thumbUrl)
      : data
        ? wallpaperVariantUrl(data.wallpaper.uuid, 1280, 720, "webp")
        : "";

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/wallpapers/${wallpaperId}`, {
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
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-5"
      style={{ background: "rgba(0,0,0,.65)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-[920px] max-h-[94vh] overflow-y-auto rounded-t-[20px] sm:rounded-[20px] border"
        style={{ background: "var(--surface)", borderColor: "var(--line)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b"
          style={{ background: "var(--surface)", borderColor: "var(--line)" }}
        >
          <div>
            <h2 className="font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>
              Edit wallpaper
            </h2>
            {data && (
              <p className="text-xs mt-0.5" style={{ color: "var(--dim)" }}>
                by {data.username} · {data.categoryName}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer border-none"
            style={{ background: "var(--surface2)", color: "var(--muted)" }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm" style={{ color: "var(--dim)" }}>
            Loading…
          </div>
        ) : !data ? (
          <div className="py-20 text-center text-sm text-red-400">{error || "Not found"}</div>
        ) : (
          <div className="p-5 sm:p-6 flex flex-col gap-6">
            {/* Hero preview */}
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

            {/* Resolution variants */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold">Uploaded resolutions</h3>
                <span className="text-xs" style={{ color: "var(--dim)" }}>
                  {data.images.length} variant{data.images.length === 1 ? "" : "s"}
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
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

            {/* Edit fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Title">
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="hd-field" required />
              </Field>
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
              <Field label="Tags">
                <input value={tags} onChange={(e) => setTags(e.target.value)} className="hd-field" placeholder="nature, 4k, night…" />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="hd-field resize-y min-h-[80px]"
              />
            </Field>

            <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm font-semibold">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#ff2e63]"
              />
              Featured on homepage carousel
            </label>

            {error && (
              <p className="text-sm text-red-400 rounded-xl px-4 py-2.5" style={{ background: "rgba(229,72,77,.1)", border: "1px solid rgba(229,72,77,.25)" }}>
                {error}
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
              {data.wallpaper.slug && (
                <a
                  href={`/wallpapers/${data.wallpaper.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl px-5 py-3 font-semibold text-[14px] no-underline border"
                  style={{ borderColor: "var(--line)", color: "var(--text2)" }}
                >
                  View public page ↗
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-5 py-3 font-semibold text-[14px] cursor-pointer border-none ml-auto"
                style={{ color: "var(--muted)", background: "transparent" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
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
