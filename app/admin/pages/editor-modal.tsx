"use client";

import { useState, useCallback } from "react";
import { RichTextEditor } from "@/components/rich-text-editor";

type Page = {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  status: string;
  showInFooter: boolean;
  sortOrder: number;
};

interface Props {
  page?: Page;
  onSaved: (page: Page) => void;
  onClose: () => void;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 200);
}

export function PageEditorModal({ page, onSaved, onClose }: Props) {
  const isNew = !page;

  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [content, setContent] = useState(page?.content ?? "");
  const [metaTitle, setMetaTitle] = useState(page?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(page?.metaDescription ?? "");
  const [status, setStatus] = useState<"published" | "draft">(
    (page?.status as "published" | "draft") ?? "published"
  );
  const [showInFooter, setShowInFooter] = useState(page?.showInFooter ?? true);
  const [sortOrder, setSortOrder] = useState(page?.sortOrder ?? 0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSeo, setShowSeo] = useState(false);

  function onTitleChange(v: string) {
    setTitle(v);
    if (isNew) setSlug(slugify(v));
  }

  const onContentChange = useCallback((html: string) => setContent(html), []);

  async function save() {
    if (!title.trim() || !slug.trim()) { setError("Title and slug are required."); return; }
    setSaving(true);
    setError("");
    try {
      const body = { title, slug, content, metaTitle: metaTitle || null, metaDescription: metaDescription || null, status, showInFooter, sortOrder };
      const res = isNew
        ? await fetch("/api/pages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch(`/api/pages/${page.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? "Save failed");
      }
      const saved = await res.json();
      onSaved(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-8 overflow-y-auto"
      style={{ background: "rgba(0,0,0,.7)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-[900px] rounded-[20px] overflow-hidden shadow-2xl mb-8"
        style={{ background: "var(--bg)", border: "1px solid var(--line)" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid var(--line)" }}>
          <div>
            <div className="font-bold text-[17px]" style={{ fontFamily: "var(--font-heading)" }}>
              {isNew ? "New Page" : `Edit — ${page.title}`}
            </div>
            <div className="text-[12.5px] mt-0.5" style={{ color: "var(--dim)" }}>
              Rich text · SEO settings · Publish status
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center cursor-pointer"
            style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--muted)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col lg:flex-row">
          {/* Main editor area */}
          <div className="flex-1 min-w-0 p-6 flex flex-col gap-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>Page Title *</label>
              <input value={title} onChange={(e) => onTitleChange(e.target.value)}
                placeholder="e.g. Privacy Policy"
                className="w-full rounded-[10px] px-4 py-[11px] text-[15px] font-semibold outline-none transition-colors focus:border-[rgba(255,46,99,.5)]"
                style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }} />
            </div>

            {/* Rich text editor */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>Content</label>
              <RichTextEditor content={content} onChange={onContentChange} minHeight={420} placeholder="Write page content here…" />
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:w-[280px] flex-none flex flex-col gap-0"
            style={{ borderLeft: "1px solid var(--line)" }}>

            <div className="p-5 flex flex-col gap-4">
              {/* Slug */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>URL Slug *</label>
                <div className="flex items-center gap-1.5 rounded-[10px] px-3 py-[10px] text-sm"
                  style={{ background: "var(--surface2)", border: "1px solid var(--line2)" }}>
                  <span style={{ color: "var(--dim2)" }}>/pages/</span>
                  <input value={slug} onChange={(e) => setSlug(slugify(e.target.value))}
                    className="flex-1 min-w-0 outline-none bg-transparent text-[13.5px] font-semibold"
                    style={{ color: "var(--text)" }} />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>Status</label>
                <div className="flex gap-2">
                  {(["published", "draft"] as const).map((s) => (
                    <button key={s} type="button" onClick={() => setStatus(s)}
                      className="flex-1 rounded-[9px] py-[8px] text-[12.5px] font-semibold cursor-pointer"
                      style={status === s
                        ? { background: s === "published" ? "rgba(48,164,108,.15)" : "rgba(245,158,11,.12)", color: s === "published" ? "#30a46c" : "#f59e0b", border: `1px solid ${s === "published" ? "rgba(48,164,108,.3)" : "rgba(245,158,11,.3)"}` }
                        : { background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--line)" }}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show in footer */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div className="relative w-9 h-5 flex-none">
                  <input type="checkbox" checked={showInFooter} onChange={(e) => setShowInFooter(e.target.checked)} className="sr-only" />
                  <div className="absolute inset-0 rounded-full transition-colors" style={{ background: showInFooter ? "#ff2e63" : "var(--track)" }} />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                    style={{ transform: showInFooter ? "translateX(16px)" : "translateX(0)" }} />
                </div>
                <span className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>Show in footer</span>
              </label>

              {/* Sort order */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>Sort order</label>
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  className="w-full rounded-[10px] px-3 py-[9px] text-sm outline-none"
                  style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }} />
              </div>
            </div>

            {/* SEO section (collapsible) */}
            <div style={{ borderTop: "1px solid var(--line)" }}>
              <button type="button" onClick={() => setShowSeo((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors"
                style={{ color: "var(--muted)" }}>
                <span className="text-[12.5px] font-bold">SEO Settings</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  style={{ transform: showSeo ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {showSeo && (
                <div className="px-5 pb-4 flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>Meta title</label>
                    <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder={title}
                      className="w-full rounded-[9px] px-3 py-[9px] text-sm outline-none"
                      style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>Meta description</label>
                    <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
                      rows={3} placeholder="Brief description for search engines…"
                      className="w-full rounded-[9px] px-3 py-[9px] text-sm outline-none resize-none"
                      style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)", lineHeight: "1.5" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Error + Save button */}
            <div className="p-5 flex flex-col gap-3 mt-auto" style={{ borderTop: "1px solid var(--line)" }}>
              {error && (
                <p className="text-[12.5px] px-3 py-2 rounded-[9px]"
                  style={{ background: "rgba(255,46,99,.08)", color: "#ff6a8a", border: "1px solid rgba(255,46,99,.2)" }}>
                  {error}
                </p>
              )}
              <button type="button" onClick={() => void save()} disabled={saving}
                className="flex items-center justify-center gap-2 rounded-[11px] py-[11px] font-bold text-[14px] cursor-pointer disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #ff2e63, #ff6a3d)", color: "#fff", boxShadow: "0 4px 14px rgba(255,46,99,.3)" }}>
                {saving ? (
                  <><span className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />Saving…</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" stroke="#fff" strokeWidth="2"/><path d="M17 21v-8H7v8M7 3v5h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>Save Page</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
