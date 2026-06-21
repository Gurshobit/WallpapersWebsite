"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const SECTIONS: { key: string; label: string; href?: string }[] = [
  { key: "general", label: "General" },
  { key: "emails", label: "Email Templates" },
  { key: "crons", label: "Crons" },
  { key: "caching", label: "Caching" },
  { key: "ads", label: "Ad Manager", href: "/admin/ads" },
  { key: "links", label: "Link Manager" },
];

export function AdminSettingsNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const section = searchParams.get("section") ?? "general";

  if (pathname !== "/admin/settings") return null;

  return (
    <div
      className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      {SECTIONS.map(({ key, label, href }) => {
        const active = href ? pathname === href : section === key;
        const linkHref = href ?? `/admin/settings?section=${key}`;
        return (
          <Link
            key={key}
            href={linkHref}
            className="flex-none px-3.5 py-2 rounded-[10px] text-[13px] font-semibold no-underline whitespace-nowrap transition-colors"
            style={
              active
                ? { background: "rgba(255,46,99,.12)", color: "#ff2e63", fontWeight: 700 }
                : { color: "var(--muted)" }
            }
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
