"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import type { CollectionListItem, CollectionSort } from "@/lib/db/queries/collections";
import { collectionThumbSrc } from "@/lib/collection-ui";
import { formatCount } from "@/lib/format";
import { stripHtml } from "@/lib/sanitize";
import { CreateCollectionButton } from "./create-collection-button";

export function CollectionsView({
  prefix,
  featured,
  items: initialItems,
  total: initialTotal,
  initialFilter,
  initialSort,
  initialQ,
  isLoggedIn,
  categories,
}: {
  prefix: string;
  featured: CollectionListItem[];
  items: CollectionListItem[];
  total: number;
  initialFilter: string;
  initialSort: CollectionSort;
  initialQ: string;
  isLoggedIn: boolean;
  categories: string[];
}) {
  const filterOptions = ["All", ...categories];
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [search, setSearch] = useState(initialQ);

  const filter = searchParams.get("filter") ?? initialFilter;
  const sort = (searchParams.get("sort") ?? initialSort) as CollectionSort;

  function refetchFromParams(params: URLSearchParams) {
    startTransition(async () => {
      const res = await fetch(`/api/collections?${params.toString()}`);
      const data = await res.json();
      setItems(data.items);
      setTotal(data.total);
    });
  }

  function updateParams(next: Record<string, string | undefined>) {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (!v || v === "All") p.delete(k);
      else p.set(k, v);
    });
    router.push(`${prefix}/collections?${p.toString()}`, { scroll: false });
    refetchFromParams(p);
  }

  async function toggleSave(id: number) {
    if (!isLoggedIn) {
      router.push(`${prefix}/login`);
      return;
    }
    const res = await fetch(`/api/collections/${id}/save`, { method: "POST" });
    if (!res.ok) return;
    const data = await res.json();
    setItems((list) =>
      list.map((c) =>
        c.id === id
          ? {
              ...c,
              savedByUser: data.saved,
              saveCount: c.saveCount + (data.saved ? 1 : -1),
            }
          : c
      )
    );
  }

  function applySearch() {
    const p = new URLSearchParams(searchParams.toString());
    if (search.trim()) p.set("q", search.trim());
    else p.delete("q");
    router.push(`${prefix}/collections?${p.toString()}`, { scroll: false });
    refetchFromParams(p);
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Hero */}
      <div className="relative h-[220px] overflow-hidden" style={{ background: "var(--surface)" }}>
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg,#0d0d1a 0%,#1a0d2e 40%,#0a1628 100%)" }}
        />
        {featured.slice(0, 3).map((f, i) => (
          <div
            key={f.id}
            className="absolute top-0 bottom-0 w-[34%] bg-cover bg-center opacity-[0.18]"
            style={{
              left: `${i * 33}%`,
              backgroundImage: f.thumbs[0] ? `url(${collectionThumbSrc(f.thumbs[0])})` : undefined,
            }}
          />
        ))}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-center px-6"
          style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(255,46,99,.18) 0%, transparent 60%)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-11 h-11 rounded-[14px] flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#ff2e63,#8b5cf6)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M19 11H5M19 11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2M19 11V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="font-bold text-[32px] tracking-[-0.8px] text-white" style={{ fontFamily: "var(--font-heading)" }}>
              Collections
            </h1>
          </div>
          <p className="text-sm text-white/55 max-w-[480px] leading-relaxed">
            Curated sets of the finest wallpapers — handpicked by creators and community members.
          </p>
          <div className="mt-3">
            <CreateCollectionButton
              isLoggedIn={isLoggedIn}
              loginHref={`${prefix}/login`}
              prefix={prefix}
              categories={categories}
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 sm:px-7 pt-8 pb-16">
        {/* Featured */}
        {featured.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z" stroke="#f5c518" strokeWidth="2" />
              </svg>
              <span className="font-bold text-base" style={{ fontFamily: "var(--font-heading)" }}>Featured Collections</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              {featured.map((cf) => (
                <Link
                  key={cf.id}
                  href={`${prefix}/collections/${cf.slug}`}
                  className="relative rounded-[18px] overflow-hidden border h-[200px] no-underline transition-colors hover:border-[rgba(255,46,99,.5)]"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: cf.thumbs[0] ? `url(${collectionThumbSrc(cf.thumbs[0])})` : undefined, backgroundColor: "var(--surface2)" }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgba(0,0,0,.85) 0%,rgba(0,0,0,.2) 50%,transparent 100%)" }} />
                  {cf.category && (
                    <span className="absolute top-3 right-3 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>
                      {cf.category}
                    </span>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="font-bold text-[17px] text-white mb-1" style={{ fontFamily: "var(--font-heading)" }}>{cf.name}</div>
                    <div className="flex items-center gap-3.5 text-xs text-white/70">
                      <span>{cf.curatorUsername}</span>
                      <span>{cf.wallpaperCount} wallpapers</span>
                      <span>{formatCount(cf.saveCount)} saves</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => updateParams({ filter: f === "All" ? undefined : f })}
                  className="h-8 px-4 rounded-full text-[13px] font-semibold cursor-pointer transition-colors"
                  style={{
                    border: `1px solid ${active ? "#ff2e63" : "var(--line)"}`,
                    color: active ? "#ff2e63" : "var(--muted)",
                    background: active ? "rgba(255,46,99,.1)" : "var(--surface)",
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative w-[220px]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applySearch()}
                placeholder="Search collections…"
                className="w-full h-9 rounded-[11px] pl-9 pr-8 text-[13px] outline-none"
                style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text)" }}
              />
            </div>
            <div className="flex gap-1 p-1 rounded-[11px]" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              {([
                ["saves", "Most Saved"],
                ["views", "Most Viewed"],
                ["count", "Most Wallpapers"],
              ] as const).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => updateParams({ sort: k })}
                  className="h-7 px-3 rounded-lg text-xs font-semibold cursor-pointer"
                  style={{
                    background: sort === k ? "var(--surface2)" : "transparent",
                    color: sort === k ? "var(--text)" : "var(--muted)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-[13px] mb-4" style={{ color: "var(--dim)" }}>
          {pending ? "Loading…" : `${total} collections`}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[18px]">
          {items.map((col) => (
            <CollectionCard key={col.id} col={col} prefix={prefix} onSave={() => void toggleSave(col.id)} />
          ))}
        </div>
        {items.length === 0 && (
          <div className="text-center py-16 rounded-2xl border" style={{ borderColor: "var(--line)", color: "var(--dim)" }}>
            No collections match your filters yet.
          </div>
        )}
      </div>
    </div>
  );
}

function CollectionCard({
  col,
  prefix,
  onSave,
}: {
  col: CollectionListItem;
  prefix: string;
  onSave: () => void;
}) {
  const [t1, t2, t3] = [
    col.thumbs[0],
    col.thumbs[1] ?? col.thumbs[0],
    col.thumbs[2] ?? col.thumbs[1] ?? col.thumbs[0],
  ];

  return (
    <div
      className="rounded-[18px] overflow-hidden border flex flex-col transition-colors hover:border-[rgba(255,46,99,.4)]"
      style={{ background: "var(--surface)", borderColor: "var(--line)" }}
    >
      <Link href={`${prefix}/collections/${col.slug}`} className="grid grid-cols-[2fr_1fr] grid-rows-2 h-[164px] gap-0.5 no-underline">
        <div className="row-span-2 bg-cover bg-center" style={{ backgroundImage: t1 ? `url(${collectionThumbSrc(t1)})` : undefined, backgroundColor: "var(--surface2)" }} />
        <div className="bg-cover bg-center" style={{ backgroundImage: t2 ? `url(${collectionThumbSrc(t2)})` : undefined, backgroundColor: "var(--surface2)" }} />
        <div className="bg-cover bg-center" style={{ backgroundImage: t3 ? `url(${collectionThumbSrc(t3)})` : undefined, backgroundColor: "var(--surface2)" }} />
      </Link>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link href={`${prefix}/collections/${col.slug}`} className="font-bold text-[15px] truncate block no-underline hover:text-[#ff6a8a]" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
              {col.name}
            </Link>
            {col.description && (
              <p className="text-[12.5px] mt-1 line-clamp-2 leading-relaxed" style={{ color: "var(--text3)" }}>{stripHtml(col.description)}</p>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onSave(); }}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-none cursor-pointer transition-colors"
            style={{
              background: col.savedByUser ? "rgba(255,46,99,.15)" : "var(--surface2)",
              border: `1px solid ${col.savedByUser ? "rgba(255,46,99,.35)" : "var(--line)"}`,
              color: col.savedByUser ? "#ff6a8a" : "var(--muted)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={col.savedByUser ? "currentColor" : "none"}>
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--line)" }}>
          <div className="flex items-center gap-2">
            <div className="w-[26px] h-[26px] rounded-full bg-cover bg-center border-2" style={{ borderColor: "var(--line2)", backgroundColor: "var(--surface2)", backgroundImage: col.curatorAvatar ? `url(${collectionThumbSrc(col.curatorAvatar)})` : undefined }} />
            <div>
              <div className="text-xs font-bold">{col.curatorUsername}</div>
              <div className="text-[10.5px]" style={{ color: "var(--dim)" }}>Curator</div>
            </div>
          </div>
          <div className="flex gap-3 text-[11.5px]" style={{ color: "var(--dim)" }}>
            <span>{col.wallpaperCount} wallpapers</span>
            <span>{formatCount(col.saveCount)} saves</span>
          </div>
        </div>
      </div>
    </div>
  );
}
