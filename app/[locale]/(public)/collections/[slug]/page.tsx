import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getCollectionBySlug } from "@/lib/db/queries/collections";
import { getCurrentUser } from "@/lib/session";
import { WallpaperGrid } from "@/components/wallpaper-card";
import { collectionThumbSrc } from "@/lib/collection-ui";
import { formatCount } from "@/lib/format";
import { CollectionSaveButton } from "@/components/collections/collection-save-button";
import { RichContent } from "@/components/rich-content";
import { stripHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const data = await getCollectionBySlug(slug);
  if (!data) return { title: "Not Found" };
  return buildMetadata({
    title: `${data.collection.name} — Collection`,
    description:
      stripHtml(data.collection.description) ||
      `${data.collection.name} — a curated wallpaper collection.`,
    path: `/collections/${slug}`,
    locale: locale as "en",
  });
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const prefix = locale === "en" ? "" : `/${locale}`;
  const user = await getCurrentUser();
  const data = await getCollectionBySlug(slug, user?.id);
  if (!data) notFound();

  const { collection, curatorUsername, curatorAvatar, curatorNickname, wallpapers, savedByUser } = data;

  const gridItems = wallpapers.map((w) => ({
    id: w.id,
    uuid: w.uuid,
    slug: w.slug ?? "",
    title: w.title,
    thumbUrl: w.thumbUrl,
    width: w.width,
    height: w.height,
  }));

  return (
    <div className="max-w-[1320px] mx-auto px-5 sm:px-7 py-8 pb-16" style={{ animation: "fadeUp .4s ease both" }}>
      <Link href={`${prefix}/collections`} className="inline-flex items-center gap-1.5 text-[13px] font-semibold mb-6 no-underline" style={{ color: "var(--muted)" }}>
        ← All collections
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          {collection.category && (
            <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mb-2 inline-block" style={{ background: "rgba(255,46,99,.12)", color: "#ff6a8a" }}>
              {collection.category}
            </span>
          )}
          <h1 className="font-bold text-[clamp(1.75rem,4vw,2.5rem)] tracking-[-0.03em] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            {collection.name}
          </h1>
          {collection.description && (
            <RichContent html={collection.description} className="rte-prose rte-prose-sm max-w-2xl" />
          )}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm" style={{ color: "var(--dim)" }}>
            <Link href={`${prefix}/u/${curatorUsername}`} className="inline-flex items-center gap-2 no-underline font-semibold" style={{ color: "var(--text2)" }}>
              <span className="w-7 h-7 rounded-full bg-cover bg-center border" style={{ borderColor: "var(--line2)", backgroundImage: curatorAvatar ? `url(${collectionThumbSrc(curatorAvatar)})` : undefined, backgroundColor: "var(--surface2)" }} />
              {curatorNickname ?? curatorUsername}
            </Link>
            <span>{collection.wallpaperCount} wallpapers</span>
            <span>{formatCount(collection.saveCount)} saves</span>
            <span>{formatCount(collection.viewCount)} views</span>
          </div>
        </div>
        <CollectionSaveButton collectionId={collection.id} initialSaved={savedByUser} isLoggedIn={Boolean(user)} loginHref={`${prefix}/login`} />
      </div>

      {gridItems.length > 0 ? (
        <WallpaperGrid items={gridItems} />
      ) : (
        <div className="text-center py-16 rounded-2xl border" style={{ borderColor: "var(--line)", color: "var(--dim)" }}>
          This collection is empty.
        </div>
      )}
    </div>
  );
}
