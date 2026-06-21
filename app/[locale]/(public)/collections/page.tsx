import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { CollectionsView } from "@/components/collections/collections-view";
import {
  listCollections,
  countCollections,
  type CollectionSort,
} from "@/lib/db/queries/collections";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return buildMetadata({
    title: "Wallpaper Collections",
    description: "Curated wallpaper collections handpicked by creators and community members.",
    path: "/collections",
    locale: locale as "en",
  });
}

export default async function CollectionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string; sort?: string; q?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const prefix = locale === "en" ? "" : `/${locale}`;

  const filter = sp.filter ?? "All";
  const sort = (sp.sort ?? "saves") as CollectionSort;
  const q = sp.q ?? "";
  const user = await getCurrentUser();

  const [featured, items, total] = await Promise.all([
    listCollections({ featuredOnly: true, limit: 3, userId: user?.id }),
    listCollections({ filter, sort, q: q || undefined, userId: user?.id }),
    countCollections(filter, q || undefined),
  ]);

  return (
    <Suspense>
      <CollectionsView
        prefix={prefix}
        featured={featured}
        items={items}
        total={total}
        initialFilter={filter}
        initialSort={sort}
        initialQ={q}
        isLoggedIn={Boolean(user)}
      />
    </Suspense>
  );
}
