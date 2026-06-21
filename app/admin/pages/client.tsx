"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PageEditorModal, type Page } from "./editor-modal";

interface Props { initialPages: Page[] }

export function AdminPagesClient({ initialPages }: Props) {
  const [pageList, setPageList] = useState<Page[]>(initialPages);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function deletePage(id: number) {
    if (!confirm("Delete this page? This cannot be undone.")) return;
    setDeleting(id);
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    setPageList((p) => p.filter((x) => x.id !== id));
    setDeleting(null);
  }

  function onSaved(page: Page) {
    setPageList((prev) => {
      const idx = prev.findIndex((p) => p.id === page.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = page; return next; }
      return [...prev, page];
    });
    setEditingPage(null);
    setCreating(false);
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-7" style={{ animation: "fadeUp .35s ease both" }}>
      <AdminPageHeader
        title="Pages"
        subtitle="Manage static content pages (Terms, Privacy, DMCA, etc.)"
        actions={
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-xl px-4 py-2.5 text-[13.5px] font-bold text-white cursor-pointer border-none"
            style={{ background: "linear-gradient(135deg, #ff2e63, #ff6a3d)" }}
          >
            New Page
          </button>
        }
      />

      {(creating || editingPage) && (
        <PageEditorModal
          page={editingPage ?? undefined}
          onSaved={onSaved}
          onClose={() => { setCreating(false); setEditingPage(null); }}
        />
      )}

      {pageList.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--dim)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto mb-4 opacity-40">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="text-sm">No pages yet. Create your first page.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-6">
          {pageList.map((page) => (
            <div key={page.id}
              className="flex items-center gap-4 rounded-[14px] px-5 py-4"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              {/* Status dot */}
              <div className="w-2.5 h-2.5 rounded-full flex-none"
                style={{ background: page.status === "published" ? "#30a46c" : "#f59e0b" }} />

              <div className="flex-1 min-w-0">
                <div className="font-bold text-[14.5px] truncate">{page.title}</div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[12px]" style={{ color: "var(--dim)" }}>
                    /{page.slug}
                  </span>
                  {page.showInFooter && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: "rgba(34,211,238,.1)", color: "#22d3ee", border: "1px solid rgba(34,211,238,.2)" }}>
                      Footer
                    </span>
                  )}
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${page.status === "published" ? "" : ""}`}
                    style={page.status === "published"
                      ? { background: "rgba(48,164,108,.1)", color: "#30a46c", border: "1px solid rgba(48,164,108,.25)" }
                      : { background: "rgba(245,158,11,.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,.25)" }}>
                    {page.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-none">
                <a href={`/pages/${page.slug}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-[9px] px-3 py-[7px] text-[12.5px] font-semibold transition-colors cursor-pointer"
                  style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--muted)" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M15 3h6v6M10 14 21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  View
                </a>
                <button type="button" onClick={() => setEditingPage(page)}
                  className="flex items-center gap-1.5 rounded-[9px] px-3 py-[7px] text-[12.5px] font-semibold transition-colors cursor-pointer"
                  style={{ background: "rgba(255,46,99,.1)", border: "1px solid rgba(255,46,99,.25)", color: "#ff6a8a" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Edit
                </button>
                <button type="button" onClick={() => deletePage(page.id)}
                  disabled={deleting === page.id}
                  className="flex items-center justify-center w-[34px] h-[34px] rounded-[9px] transition-colors cursor-pointer disabled:opacity-50"
                  style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--dim)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
