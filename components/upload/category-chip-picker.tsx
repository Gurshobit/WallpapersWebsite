"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface CategoryChipPickerProps {
  categories: { id: number; name: string }[];
  value: number[];
  onChange: (value: number[]) => void;
  searchPlaceholder?: string;
}

const VISIBLE_COUNT = 12;

export function CategoryChipPicker({
  categories,
  value,
  onChange,
  searchPlaceholder = "Search categories...",
}: CategoryChipPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const visibleCats = expanded ? categories : categories.slice(0, VISIBLE_COUNT);
  const hasMore = categories.length > VISIBLE_COUNT;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setSearchOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function toggle(id: number) {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    );
  }

  return (
    <div ref={rootRef}>
      {/* Header row: label + selected count badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {value.length > 0 && (
            <span
              className="inline-flex items-center justify-center h-[20px] min-w-[20px] px-[6px] rounded-full text-[11px] font-bold"
              style={{ background: "rgba(255,46,99,.15)", color: "#ff6a8a" }}
            >
              {value.length} selected
            </span>
          )}
        </div>
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[11.5px] cursor-pointer transition-opacity hover:opacity-70"
            style={{ color: "var(--dim)" }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Chips grid */}
      <div className="flex flex-wrap gap-[7px]">
        {visibleCats.map((cat) => {
          const active = value.includes(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggle(cat.id)}
              className="px-3 py-1.5 rounded-[9px] text-[13px] font-semibold transition-all cursor-pointer"
              style={
                active
                  ? {
                      background: "rgba(255,46,99,.14)",
                      color: "#ff6a8a",
                      border: "1px solid rgba(255,46,99,.4)",
                    }
                  : {
                      background: "var(--surface2)",
                      color: "var(--muted)",
                      border: "1px solid var(--line)",
                    }
              }
            >
              {cat.name}
            </button>
          );
        })}

        {/* Expand / Search button */}
        {hasMore && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="px-3 py-1.5 rounded-[9px] text-[13px] font-medium cursor-pointer transition-colors"
            style={{
              background: "var(--surface2)",
              color: "var(--dim)",
              border: "1px dashed var(--line2)",
            }}
          >
            +{categories.length - VISIBLE_COUNT} more
          </button>
        )}

        {/* Search icon button */}
        <button
          type="button"
          onClick={() => setSearchOpen((v) => !v)}
          className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center cursor-pointer transition-colors"
          style={{
            background: "var(--surface2)",
            color: "var(--dim)",
            border: "1px solid var(--line)",
          }}
          title="Search categories"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Search dropdown */}
      {searchOpen && (
        <div
          className="relative z-30 mt-2 w-full rounded-xl border overflow-hidden shadow-xl"
          style={{
            background: "var(--surface)",
            borderColor: "var(--line)",
            boxShadow: "0 8px 28px rgba(0,0,0,.28)",
          }}
        >
          <div className="p-2 border-b" style={{ borderColor: "var(--line)" }}>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: "var(--surface2)",
                color: "var(--text)",
                border: "1px solid var(--line2)",
              }}
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm" style={{ color: "var(--dim)" }}>
                No matches
              </li>
            ) : (
              filtered.map((cat) => {
                const active = value.includes(cat.id);
                return (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => toggle(cat.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors hover:bg-[var(--surface2)]"
                      style={{
                        color: active ? "#ff2e63" : "var(--text)",
                        fontWeight: active ? 700 : 500,
                        background: active ? "rgba(255,46,99,.08)" : "transparent",
                      }}
                    >
                      <span>{cat.name}</span>
                      {active && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6 9 17l-5-5" stroke="#ff2e63" strokeWidth="2.4" strokeLinecap="round"/>
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
