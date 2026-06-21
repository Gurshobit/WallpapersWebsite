"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "./admin-icons";

export function AdminAppearanceToggle() {
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
      className="flex items-center gap-[11px] w-full px-[13px] py-2.5 rounded-[10px] text-[13.5px] font-semibold transition-colors hover:text-[var(--text)]"
      style={{ color: "var(--muted)" }}
    >
      <span className="flex-none" style={{ color: "var(--text)" }}>
        {theme === "dark" ? <IconMoon /> : <IconSun />}
      </span>
      <span className="flex-1 text-left">Appearance</span>
    </button>
  );
}
