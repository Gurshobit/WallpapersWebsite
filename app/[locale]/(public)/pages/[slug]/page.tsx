import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [page] = await db.select().from(pages).where(and(eq(pages.slug, slug), eq(pages.status, "published"))).limit(1);
  if (!page) return {};
  return buildMetadata({
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? undefined,
  });
}

export default async function PublicPageView({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [page] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.slug, slug), eq(pages.status, "published")))
    .limit(1);

  if (!page) notFound();

  return (
    <div className="max-w-[820px] mx-auto px-4 sm:px-7 py-10 pb-20" style={{ animation: "fadeUp .4s ease both" }}>
      <h1
        className="font-bold text-[32px] sm:text-[38px] tracking-[-0.8px] mb-3 leading-[1.15]"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {page.title}
      </h1>
      {page.updatedAt && (
        <p className="text-[13px] mb-8" style={{ color: "var(--dim)" }}>
          Last updated:{" "}
          {new Date(page.updatedAt).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
          })}
        </p>
      )}
      <div
        className="rte-prose"
        dangerouslySetInnerHTML={{ __html: page.content ?? "" }}
      />
    </div>
  );
}
