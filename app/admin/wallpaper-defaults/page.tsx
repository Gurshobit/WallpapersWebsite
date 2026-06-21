import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminWallpaperDefaultsPage() {
  return (
    <AdminShell>
      <AdminPageHeader
        title="Wallpaper Defaults"
        subtitle="Per-page counts, thumbnail sizes and homepage settings"
      />
      <div className="grid gap-3 sm:grid-cols-2 max-w-2xl">
        {[
          { href: "/admin/resolutions", label: "Resolutions", desc: "Preset sizes and crop rules" },
          { href: "/admin/licenses", label: "Licenses", desc: "Default license options for uploads" },
        ].map(({ href, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl p-4 no-underline transition-colors hover:border-[rgba(255,46,99,.35)]"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <div className="font-bold text-sm mb-1" style={{ color: "var(--text)" }}>
              {label}
            </div>
            <div className="text-xs" style={{ color: "var(--dim)" }}>
              {desc}
            </div>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
