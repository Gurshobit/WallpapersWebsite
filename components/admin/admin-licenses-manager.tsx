"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type License = {
  id: number;
  name: string;
  url: string | null;
  sortOrder: number;
};

async function apiPost(path: string, body: object) {
  const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function apiDel(path: string) {
  const r = await fetch(path, { method: "DELETE" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export function AdminLicensesManager({ licenses: initial }: { licenses: License[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [list, setList] = useState(initial);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function add() {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const created = await apiPost("/api/admin/licenses", {
        name: newName.trim(),
        url: newUrl.trim() || undefined,
      });
      setList((prev) => [...prev, created]);
      setNewName("");
      setNewUrl("");
      showToast("License added");
      startTransition(() => router.refresh());
    } catch (e) { setError(String(e)); }
    finally { setAdding(false); }
  }

  async function remove(id: number) {
    if (!confirm("Delete this license?")) return;
    try {
      await apiDel(`/api/admin/licenses/${id}`);
      setList((prev) => prev.filter((l) => l.id !== id));
      showToast("License deleted");
      startTransition(() => router.refresh());
    } catch (e) { setError(String(e)); }
  }

  return (
    <div style={{ animation: "fadeUp .35s ease both" }}>
      {/* toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold"
          style={{ background: "var(--surface2)", border: "1px solid var(--line2)", boxShadow: "0 14px 44px rgba(0,0,0,.55)", animation: "fadeUp .2s ease both", color: "var(--text)" }}
        >
          <span className="w-5 h-5 rounded-full bg-[#30a46c] flex items-center justify-center flex-none">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M20 6 9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
          {toast}
        </div>
      )}

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm mb-4" style={{ background: "rgba(229,72,77,.12)", border: "1px solid rgba(229,72,77,.3)", color: "#ff8a8d" }}>
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-3 font-bold border-none bg-transparent cursor-pointer" style={{ color: "#ff8a8d" }}>✕</button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* license list */}
        <div className="flex-1 min-w-0 w-full">
          {list.length === 0 ? (
            <div
              className="rounded-2xl p-10 text-center text-sm"
              style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--dim)" }}
            >
              No licenses defined yet. Add one →
            </div>
          ) : (
            <div className="flex flex-col gap-[8px]">
              {list.map((lic) => (
                <div
                  key={lic.id}
                  className="flex items-center gap-4 rounded-[13px] px-[16px] py-[14px]"
                  style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
                >
                  {/* icon */}
                  <span
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-none"
                    style={{ background: "rgba(251,191,36,.12)" }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12h6M9 16h4M7 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9l-6-6H7Z" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M13 3v5a1 1 0 0 0 1 1h5" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] font-bold">{lic.name}</div>
                    {lic.url ? (
                      <a
                        href={lic.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] hover:underline"
                        style={{ color: "#7fe6f5" }}
                      >
                        {lic.url}
                      </a>
                    ) : (
                      <span className="text-[12px]" style={{ color: "var(--dim)" }}>No URL</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(lic.id)}
                    className="flex items-center border-none bg-transparent cursor-pointer transition-colors hover:text-[#e5484d] flex-none"
                    style={{ color: "var(--dim2)" }}
                    aria-label="Delete license"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* add sidebar */}
        <aside
          className="w-full lg:w-[300px] flex-none rounded-[15px] p-[18px] lg:sticky lg:top-5"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <div className="font-bold text-base mb-[5px]" style={{ fontFamily: "var(--font-heading)" }}>
            New license
          </div>
          <div className="text-[12px] mb-4 leading-relaxed" style={{ color: "var(--dim)" }}>
            Licenses appear in the upload form and on wallpaper detail pages.
          </div>

          <label className="block text-xs font-semibold mb-[6px]" style={{ color: "var(--muted)" }}>
            License name
          </label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }}
            placeholder="e.g. Creative Commons CC0"
            className="w-full rounded-[10px] px-[13px] py-[10px] text-[13.5px] outline-none mb-3"
            style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}
          />

          <label className="block text-xs font-semibold mb-[6px]" style={{ color: "var(--muted)" }}>
            URL <span style={{ color: "var(--dim3)" }}>(optional)</span>
          </label>
          <input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }}
            placeholder="https://creativecommons.org/…"
            className="w-full rounded-[10px] px-[13px] py-[10px] text-[13.5px] outline-none mb-[14px]"
            style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}
          />

          <button
            type="button"
            onClick={add}
            disabled={adding || !newName.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-[11px] px-4 py-3 font-bold text-[14px] text-white border-none cursor-pointer disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#ff2e63,#ff6a3d)", boxShadow: "0 4px 14px rgba(255,46,99,.28)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            {adding ? "Adding…" : "Add license"}
          </button>
        </aside>
      </div>
    </div>
  );
}
