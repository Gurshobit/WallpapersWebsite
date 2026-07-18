import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { buildMetadata, wallpaperJsonLd } from "@/lib/seo";
import { wallpaperVariantUrl } from "@/lib/wallpaper-urls";
import { WallpaperGrid } from "@/components/wallpaper-card";
import { WallpaperDetailPanel } from "@/components/wallpaper-detail-panel";
import { ViewTracker } from "@/components/view-tracker";
import { WallpaperComments } from "@/components/wallpaper-comments";
import {
  getWallpaperBySlug,
  getRelatedWallpapers,
} from "@/lib/db/queries/wallpapers";
import { getMemberSettings } from "@/lib/member-settings";
import { getCurrentUser } from "@/lib/session";
import { RichContent } from "@/components/rich-content";
import { stripHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const data = await getWallpaperBySlug(slug);
  if (!data) return { title: "Not Found" };

  const { wallpaper, category } = data;
  return buildMetadata({
    title: `${wallpaper.title} — Free ${category.name} Wallpaper`,
    description:
      stripHtml(wallpaper.description) ||
      `Download ${wallpaper.title} wallpaper in HD and 4K resolutions.`,
    path: `/wallpapers/${slug}`,
    locale: locale as "en",
    ogImage: wallpaperVariantUrl(wallpaper.uuid, 1280, 720, "webp"),
  });
}

export default async function WallpaperDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const data = await getWallpaperBySlug(slug);
  if (!data) notFound();

  const { wallpaper, category, license, uploader, profile, images, comments, views, downloads } =
    data;
  const related = await getRelatedWallpapers(
    wallpaper.id,
    wallpaper.categoryId
  );
  const prefix = locale === "en" ? "" : `/${locale}`;
  const [{ canComment }, currentUser] = await Promise.all([
    getMemberSettings(),
    getCurrentUser(),
  ]);

  const jsonLd = wallpaperJsonLd({
    title: wallpaper.title,
    description: stripHtml(wallpaper.description) || null,
    contentUrl: wallpaperVariantUrl(wallpaper.uuid, 1920, 1080, "jpeg"),
    width: wallpaper.width,
    height: wallpaper.height,
    authorName: wallpaper.authorName,
    licenseUrl: license.url,
    tags: wallpaper.tags,
  });

  const palette = (wallpaper.dominantColors as string[] | null) ?? [];

  return (
    <>
      <ViewTracker wallpaperSlug={slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div
        className="max-w-[1320px] mx-auto px-4 sm:px-7 py-4 sm:py-[22px] pb-10"
        style={{ animation: "fadeUp .4s ease both" }}
      >
        <Link
          href={prefix || "/"}
          className="inline-flex items-center gap-[7px] text-[13px] font-semibold mb-[18px] hover:text-[var(--text)] transition-colors"
          style={{ color: "var(--muted)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to explore
        </Link>

        {/*
          Mobile order:  title → image+palette → panel → tags → comments → more
          Desktop order: [image+palette / panel(sticky)]
                         [tags+comments+more / (panel continues)]

          Achieved with CSS Grid on lg+ (panel spans 2 rows) and
          flex-col + CSS order on mobile.
        */}
        <div className="hd-detail-layout flex flex-col lg:grid lg:items-start gap-[26px]"
          style={{ gridTemplateColumns: "1fr 380px" }}>

          {/* ── Mobile-only title (above image) ── */}
          <h1
            className="lg:hidden font-bold text-[22px] tracking-[-0.5px] leading-[1.15]"
            style={{ fontFamily: "var(--font-heading)", order: 1 }}
          >
            {wallpaper.title}
          </h1>

          {/* ── Top-left: image + color palette ── */}
          <div className="min-w-0" style={{ order: 2, gridColumn: 1, gridRow: 1 }}>
            <div
              className="relative rounded-[18px] overflow-hidden border mb-5"
              style={{ background: "var(--bg2)", borderColor: "var(--line)" }}
            >
              <div className="relative aspect-video">
                <Image
                  src={images[0]?.url ?? wallpaper.thumbUrl ?? "/placeholder.webp"}
                  alt={wallpaper.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
                <span
                  className="absolute top-3.5 left-3.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(6px)", color: "#e6e6ea" }}
                >
                  {category.name}
                </span>
              </div>
            </div>

            {palette.length > 0 && (
              <div className="mb-5">
                <div className="hd-section-label mb-2.5">Color palette</div>
                <div className="flex rounded-[11px] overflow-hidden border" style={{ borderColor: "var(--line)" }}>
                  {palette.map((color) => (
                    <div key={color} className="flex-1 h-10" style={{ background: color }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Detail panel — col 2 on desktop (spans both rows), order 3 on mobile ── */}
          <WallpaperDetailPanel
            wallpaperUuid={wallpaper.uuid}
            slug={slug}
            title={wallpaper.title}
            description={wallpaper.description}
            categoryName={category.name}
            licenseName={license.name}
            licenseUrl={license.url}
            authorName={profile?.nickname ?? wallpaper.authorName ?? uploader.username}
            authorHandle={uploader.username}
            views={views ?? 0}
            downloads={downloads ?? 0}
            likes={wallpaper.ratingValue ?? 0}
            dateAdded={wallpaper.dateAdded}
            tags={wallpaper.tags}
            images={images}
            dominantColors={palette}
            prefix={prefix}
            width={wallpaper.width}
            height={wallpaper.height}
            thumbUrl={wallpaper.thumbUrl}
            hideTitle
            style={{ order: 3, gridColumn: 2, gridRow: "1 / 3" } as React.CSSProperties}
          />

          {/* ── Bottom-left: tags, comments, more like this ── */}
          <div className="min-w-0" style={{ order: 4, gridColumn: 1, gridRow: 2 }}>
            {wallpaper.tags && (
              <div className="mb-8">
                <div className="hd-section-label mb-2.5">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {wallpaper.tags.split(",").map((tag) => (
                    <Link
                      key={tag}
                      href={`${prefix}/tag/${tag.trim().toLowerCase().replace(/\s+/g, "-")}`}
                      className="px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors hover:border-[var(--line3)] hover:text-[var(--text)]"
                      style={{ background: "var(--surface)", borderColor: "var(--line)", color: "var(--text3)" }}
                    >
                      #{tag.trim()}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <section className="mb-10">
              <h2 className="font-bold text-xl mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Comments
              </h2>
              <WallpaperComments
                wallpaperId={wallpaper.id}
                canComment={canComment}
                isLoggedIn={Boolean(currentUser)}
                loginHref={`${prefix}/login`}
              />
              {comments.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--dim)" }}>No comments yet.</p>
              ) : (
                <ul className="space-y-4">
                  {comments.map((c) => (
                    <li key={c.id} className="p-4 rounded-[15px]"
                      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm">{c.username}</span>
                        <span className="text-xs" style={{ color: "var(--dim)" }}>
                          {c.dateAdded?.toLocaleDateString()}
                        </span>
                      </div>
                      <RichContent html={c.message} className="rte-prose rte-prose-sm" />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="font-bold text-xl mb-[18px]" style={{ fontFamily: "var(--font-heading)" }}>
                More like this
              </h2>
              <WallpaperGrid items={related} />
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
