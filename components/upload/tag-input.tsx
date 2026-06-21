"use client";

import { useMemo, useRef, useState } from "react";

interface TagInputProps {
  tags: { id: number; name: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  tags,
  value,
  onChange,
  placeholder = "e.g. aurora, night, 4k…",
}: TagInputProps) {
  const [inputVal, setInputVal] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const q = inputVal.trim().toLowerCase();
    if (q.length < 1) return [];
    return tags
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) &&
          !value.some((v) => v.toLowerCase() === t.name.toLowerCase())
      )
      .slice(0, 8);
  }, [tags, inputVal, value]);

  function addTag(name: string) {
    const trimmed = name.trim().replace(/^#+/, "").trim();
    if (!trimmed) return;
    if (!value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...value, trimmed]);
    }
    setInputVal("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function removeTag(name: string) {
    onChange(value.filter((v) => v !== name));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputVal);
    } else if (e.key === "Backspace" && inputVal === "" && value.length > 0) {
      removeTag(value[value.length - 1]!);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      {/* Pill chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-[7px] mb-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-[10px] py-[5px] rounded-full text-[12.5px] font-semibold"
              style={{
                background: "rgba(139,92,246,.14)",
                color: "#a78bfa",
                border: "1px solid rgba(139,92,246,.3)",
              }}
            >
              <span style={{ color: "rgba(139,92,246,.6)" }}>#</span>
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
                aria-label={`Remove ${tag}`}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative flex items-center">
        <span className="absolute left-[13px] text-sm" style={{ color: "var(--dim2)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M20 7H4M20 12H4M13 17H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
        <input
          ref={inputRef}
          value={inputVal}
          onChange={(e) => { setInputVal(e.target.value); setShowSuggestions(true); }}
          onKeyDown={onKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={placeholder}
          className="w-full rounded-[10px] pl-[34px] pr-[13px] py-[11px] text-sm outline-none transition-colors focus:border-[rgba(139,92,246,.5)]"
          style={{
            background: "var(--surface2)",
            border: "1px solid var(--line2)",
            color: "var(--text)",
          }}
        />
        {inputVal && (
          <div className="absolute right-[10px] text-[11px] pointer-events-none"
            style={{ color: "var(--dim2)" }}>
            ↵ to add
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul
          className="absolute z-30 mt-1 w-full max-h-44 overflow-y-auto rounded-[11px] border py-1 shadow-xl"
          style={{
            background: "var(--surface)",
            borderColor: "var(--line)",
            boxShadow: "0 8px 28px rgba(0,0,0,.28)",
          }}
        >
          {suggestions.map((tag) => (
            <li key={tag.id}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addTag(tag.name); }}
                className="w-full text-left px-3 py-2 text-[13px] hover:bg-[var(--surface2)] transition-colors flex items-center gap-2"
                style={{ color: "var(--text2)" }}
              >
                <span style={{ color: "var(--dim2)" }}>#</span>
                {tag.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-1.5 text-[11px]" style={{ color: "var(--dim3)" }}>
        Press Enter or , to add · Backspace to remove last
      </div>
    </div>
  );
}
