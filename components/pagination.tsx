import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PAGE_SIZE, PAGE_SIZES } from "@/lib/routing";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export async function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize = PAGE_SIZE,
  basePath,
  searchParams = {},
}: PaginationProps) {
  const t = await getTranslations("common");

  if (totalPages <= 1 && totalItems <= pageSize) return null;

  function buildHref(p: number, size = pageSize) {
    const params = new URLSearchParams({ ...searchParams, page: String(p), size: String(size) });
    return `${basePath}?${params.toString()}`;
  }

  const pageStart = (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, totalItems);

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <nav
      className="hd-pagination mt-7 flex items-center justify-between gap-3 flex-wrap"
      aria-label="Pagination"
    >
      <div className="text-[13px] whitespace-nowrap" style={{ color: "var(--dim)" }}>
        <span className="font-bold" style={{ color: "var(--text)" }}>
          {pageStart}–{pageEnd}
        </span>{" "}
        of{" "}
        <span className="font-bold" style={{ color: "var(--text)" }}>
          {totalItems.toLocaleString()}
        </span>
      </div>

      <div
        className="flex items-center gap-0.5 rounded-xl p-1"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        {page > 1 ? (
          <Link
            href={buildHref(page - 1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--surface2)]"
            style={{ color: "var(--text2)" }}
            aria-label={t("prev")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ) : (
          <span
            className="w-9 h-9 flex items-center justify-center rounded-lg opacity-40"
            style={{ color: "var(--dim)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}

        <div className="w-px h-4 mx-0.5" style={{ background: "var(--line)" }} />

        {pages.map((p) => (
          <Link
            key={p}
            href={buildHref(p)}
            className="min-w-9 h-9 px-2 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors hover:bg-[var(--surface2)]"
            style={
              p === page
                ? {
                    background: "linear-gradient(135deg, #ff2e63, #ff6a3d)",
                    color: "#fff",
                  }
                : { color: "var(--text2)" }
            }
          >
            {p}
          </Link>
        ))}

        <div className="w-px h-4 mx-0.5" style={{ background: "var(--line)" }} />

        {page < totalPages ? (
          <Link
            href={buildHref(page + 1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--surface2)]"
            style={{ color: "var(--text2)" }}
            aria-label={t("next")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ) : (
          <span
            className="w-9 h-9 flex items-center justify-center rounded-lg opacity-40"
            style={{ color: "var(--dim)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>

      <div
        className="flex items-center gap-1.5 rounded-xl px-1 py-1 text-xs"
        style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--dim)" }}
      >
        <span className="px-2 whitespace-nowrap">{t("show")}</span>
        {PAGE_SIZES.map((n) => (
          <Link
            key={n}
            href={buildHref(1, n)}
            className="min-w-8 h-8 flex items-center justify-center rounded-lg font-bold no-underline"
            style={
              n === pageSize
                ? {
                    background: "rgba(255,46,99,.12)",
                    color: "#ff2e63",
                    border: "1px solid rgba(255,46,99,.35)",
                  }
                : { color: "var(--muted)" }
            }
          >
            {n}
          </Link>
        ))}
      </div>
    </nav>
  );
}
