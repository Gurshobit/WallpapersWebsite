"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    const initial = saved ?? "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title="Toggle theme"
      className="w-[38px] h-[38px] flex items-center justify-center rounded-[11px] cursor-pointer transition-colors hover:bg-[var(--surface2)]"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        color: "var(--text)",
      }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 2v2m0 16v2M4 12H2m20 0h-2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
