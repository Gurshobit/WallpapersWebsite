import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserShortlist } from "@/lib/db/queries/wallpapers";
import { ShortlistGrid } from "@/components/shortlist-grid";

export const dynamic = "force-dynamic";

export default async function ShortlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) {
    redirect(locale === "en" ? "/login" : `/${locale}/login`);
  }

  const prefix = locale === "en" ? "" : `/${locale}`;
  const t = await getTranslations("common");
  const result = await getUserShortlist(user.id);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div
        className="flex items-center gap-4 px-7 py-[18px] border-b"
        style={{ borderColor: "var(--line)" }}
      >
        <Link
          href={prefix || "/"}
          className="flex items-center gap-[7px] text-[13px] font-semibold no-underline transition-colors hover:text-[var(--text)]"
          style={{ color: "var(--muted)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {t("navExplore")}
        </Link>
        <h1
          className="font-bold text-xl flex-1 flex items-center gap-[7px]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-7-4-7 4V4Z"
              stroke="#f5c518"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          {t("shortlist")}{" "}
          <span className="font-semibold text-[15px]" style={{ color: "var(--dim)" }}>
            · {result.total}
          </span>
        </h1>
      </div>

      <div className="max-w-[1320px] mx-auto p-7">
        <ShortlistGrid items={result.items} />
      </div>
    </div>
  );
}
