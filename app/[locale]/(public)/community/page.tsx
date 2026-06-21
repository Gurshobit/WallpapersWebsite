import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { CommunityView } from "@/components/community/community-view";
import {
  getCommunityStats,
  getCommunityFeed,
  getTopCreators,
  listChallenges,
  getFeaturedCommunityCollections,
} from "@/lib/db/queries/community";
import { getCurrentUser } from "@/lib/session";
import { getMemberSettings } from "@/lib/member-settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return buildMetadata({
    title: "Community",
    description: "Connect with creators, join challenges, and explore curated collections.",
    path: "/community",
    locale: locale as "en",
  });
}

type Tab = "feed" | "creators" | "challenges" | "collections";

export default async function CommunityPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const prefix = locale === "en" ? "" : `/${locale}`;

  const tab = (sp.tab as Tab) ?? "feed";
  const user = await getCurrentUser();
  const { canSubmit } = await getMemberSettings();

  const [stats, feed, creators, challenges, featuredCollections] = await Promise.all([
    getCommunityStats(),
    getCommunityFeed(12),
    getTopCreators(10),
    listChallenges(),
    getFeaturedCommunityCollections(4),
  ]);

  return (
    <Suspense>
      <CommunityView
        prefix={prefix}
        stats={stats}
        feed={feed}
        creators={creators}
        challenges={challenges}
        featuredCollections={featuredCollections}
        isLoggedIn={Boolean(user)}
        canSubmit={canSubmit}
        initialTab={tab}
      />
    </Suspense>
  );
}
