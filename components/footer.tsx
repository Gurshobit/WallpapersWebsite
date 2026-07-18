import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SiteLogo } from "./site-logo";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { eq, asc, and } from "drizzle-orm";

export async function Footer() {
  const t = await getTranslations("common");
  const year = new Date().getFullYear();

  // Fetch footer pages dynamically
  const footerPages = await db
    .select({ title: pages.title, slug: pages.slug })
    .from(pages)
    .where(and(eq(pages.showInFooter, true), eq(pages.status, "published")))
    .orderBy(asc(pages.sortOrder));

  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 30, padding: "42px 28px 34px" }}>
      <div className="max-w-[1320px] mx-auto flex justify-between flex-wrap gap-8">
        <div className="max-w-[300px]">
          <div className="flex items-center gap-2.5 mb-3.5">
            <SiteLogo height={30} className="h-[30px] w-auto" />
          </div>
          <p className="text-[13px] leading-[1.6]" style={{ color: "var(--dim)" }}>
            {t("footerTagline")}
          </p>
        </div>

        <div className="hd-footer-links flex gap-14 flex-wrap">
          <FooterCol
            title={t("footerExplore")}
            links={[
              { label: t("popular"), href: "/popular-wallpapers" },
              { label: t("latest"), href: "/latest-wallpapers" },
              { label: t("categories"), href: "/latest-wallpapers" },
            ]}
          />
          <FooterCol
            title={t("footerCommunity")}
            links={[
              { label: t("upload"), href: "/upload" },
              { label: t("topDownloaded"), href: "/top-downloaded-wallpapers" },
            ]}
          />
          {footerPages.length > 0 && (
            <FooterCol
              title={t("footerCompany")}
              links={[
                { label: t("contact"), href: "/contact" },
                ...footerPages.map((p) => ({ label: p.title, href: `/pages/${p.slug}` })),
              ]}
            />
          )}
          {footerPages.length === 0 && (
            <FooterCol
              title={t("footerCompany")}
              links={[{ label: t("contact"), href: "/contact" }]}
            />
          )}
        </div>
      </div>

      <div
        className="max-w-[1320px] mx-auto mt-[30px] pt-[22px] text-xs"
        style={{ borderTop: "1px solid var(--line)", color: "var(--dim3)" }}
      >
        © 2011–{year} hdwallpapers.site — {t("footerCredit")}
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div
        className="text-xs font-bold mb-3 tracking-[0.5px]"
        style={{ color: "var(--text2)" }}
      >
        {title}
      </div>
      <div className="flex flex-col gap-2 text-[13px]" style={{ color: "var(--dim)" }}>
        {links.map((link) => (
          <Link key={link.label} href={link.href} className="hover:text-[var(--text3)]">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
