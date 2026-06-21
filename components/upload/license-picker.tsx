"use client";

import { useEffect, useRef, useState } from "react";

interface LicensePickerProps {
  licenses: { id: number; name: string }[];
  value: number;
  onChange: (value: number) => void;
}

export function LicensePicker({ licenses, value, onChange }: LicensePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = licenses.find((l) => l.id === value) ?? licenses[0];

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between rounded-[10px] px-[13px] py-[11px] cursor-pointer transition-colors hover:border-[rgba(255,46,99,.4)]"
        style={{
          background: "var(--surface2)",
          border: "1px solid var(--line2)",
        }}
      >
        <span className="text-[13.5px] font-semibold" style={{ color: "#ff6a8a" }}>
          {selected?.name ?? "Select license"}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="m6 9 6 6 6-6"
            stroke="var(--muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-30 mt-1 w-full rounded-[11px] border overflow-hidden shadow-xl"
          style={{
            background: "var(--surface)",
            borderColor: "var(--line)",
            boxShadow: "0 8px 28px rgba(0,0,0,.28)",
          }}
        >
          {licenses.map((lic) => {
            const active = lic.id === value;
            return (
              <button
                key={lic.id}
                type="button"
                onClick={() => {
                  onChange(lic.id);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-[13px] py-2.5 text-[13.5px] transition-colors hover:bg-[var(--surface2)]"
                style={{
                  fontWeight: active ? 700 : 500,
                  color: active ? "#ff2e63" : "var(--text)",
                  background: active ? "rgba(255,46,99,.08)" : "transparent",
                }}
              >
                <span>{lic.name}</span>
                {active && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6 9 17l-5-5"
                      stroke="#ff2e63"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
