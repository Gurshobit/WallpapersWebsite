import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getUserByUsername } from "@/lib/db/queries/users";
import { listWallpapers } from "@/lib/db/queries/wallpapers";
import { WallpaperGrid } from "@/components/wallpaper-card";
import { Pagination } from "@/components/pagination";
import { ProfileTabs, type ProfileTab } from "@/components/profile-tabs";
import { ProfileStatCards } from "@/components/profile-stat-cards";
import { buildMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/session";
import { getMemberSettings } from "@/lib/member-settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}) {
  const { locale, handle } = await params;
  return buildMetadata({
    title: `${handle}'s Profile — HDWallpapers.site`,
    description: `View wallpapers uploaded by ${handle}.`,
    path: `/u/${handle}`,
    locale: locale as "en",
  });
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; handle: string }>;
  searchParams: Promise<{ page?: string; tab?: string }>;
}) {
  const { locale, handle } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const data = await getUserByUsername(handle);
  if (!data) notFound();

  const { user, profile, stats, privacy } = data;
  const page = parseInt(sp.page ?? "1", 10);
  const tab = (sp.tab as ProfileTab) ?? "uploads";
  const t = await getTranslations("profile");
  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.id === user.id;
  const prefix = locale === "en" ? "" : `/${locale}`;
  const { profilesPerPage } = await getMemberSettings();

  if (privacy?.viewWallpapers === "only_me" && !isOwner) {
    return (
      <div className="px-7 py-16 text-center" style={{ color: "var(--dim)" }}>
        This profile is private.
      </div>
    );
  }

  const result =
    tab === "uploads"
      ? await listWallpapers({ userId: user.id, page, pageSize: profilesPerPage })
      : { items: [], page: 1, totalPages: 0, total: 0 };

  const displayName = profile?.nickname ?? user.username;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div className="relative h-[240px] max-w-[1320px] mx-auto px-7">
        <div
          className="relative h-full rounded-b-[20px] overflow-hidden border border-t-0"
          style={{ borderColor: "var(--line)" }}
        >
          {user.coverUrl ? (
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${user.coverUrl})` }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg,#1a1030 0%,#2d1f4d 40%,#0b1d3a 100%)",
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="3"
                  stroke="rgba(255,255,255,.2)"
                  strokeWidth="1.5"
                />
                <circle cx="8.5" cy="8.5" r="1.8" fill="rgba(255,255,255,.2)" />
                <path
                  d="m21 15-5-5L5 21"
                  stroke="rgba(255,255,255,.2)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(0deg,var(--bg),rgba(10,10,12,.1) 60%)",
            }}
          />
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-7 pb-[50px]">
        <div className="flex items-end gap-5 -mt-[54px] relative px-2 flex-wrap">
          {user.avatarUrl ? (
            <div
              className="w-[118px] h-[118px] rounded-full flex-none bg-cover bg-center border-4"
              style={{
                borderColor: "var(--bg)",
                backgroundImage: `url(${user.avatarUrl})`,
              }}
            />
          ) : (
            <div
              className="w-[118px] h-[118px] rounded-full flex-none gradient-accent flex items-center justify-center text-[36px] font-bold text-white border-4"
              style={{ borderColor: "var(--bg)", fontFamily: "var(--font-heading)" }}
            >
              {initials}
            </div>
          )}

          <div className="flex-1 pb-2 min-w-0">
            <h1
              className="font-bold text-[28px] tracking-[-0.5px] truncate"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {displayName}
            </h1>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              @{user.username}
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-2.5 pb-2">
              <Link
                href={`${prefix}/settings`}
                className="rounded-[11px] px-[18px] py-[11px] text-sm font-bold no-underline"
                style={{
                  background: "var(--line)",
                  border: "1px solid var(--line2)",
                  color: "var(--text)",
                }}
              >
                {t("accountSettings")}
              </Link>
              <Link
                href={`${prefix}/upload`}
                className="hd-btn-primary flex items-center gap-[7px] rounded-[11px] px-[18px] py-[11px] text-sm font-bold text-white no-underline"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 16V4m0 0 5 5m-5-5L7 9"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                {t("uploadWallpaper")}
              </Link>
            </div>
          )}
        </div>

        {privacy?.viewBio !== "only_me" && profile?.biography && (
          <p
            className="text-[14.5px] leading-relaxed max-w-[560px] mt-[18px] mx-2"
            style={{ color: "var(--text3)" }}
          >
            {profile.biography}
          </p>
        )}

        <ProfileStatCards
          uploads={stats?.uploadsActive ?? user.totalUploads}
          downloads={user.totalDownloads}
          followers={stats?.followerCount ?? 0}
          likes={stats?.totalLikes ?? 0}
        />

        <ProfileTabs handle={handle} active={tab} />

        {tab === "uploads" ? (
          <>
            <div className="px-2">
              <WallpaperGrid items={result.items} />
            </div>
            {result.totalPages > 1 && (
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                totalItems={result.total}
                basePath={`${prefix}/u/${handle}`}
                searchParams={{ tab }}
              />
            )}
          </>
        ) : (
          <div
            className="px-2 py-16 text-center rounded-[15px]"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              color: "var(--dim)",
            }}
          >
            {t("comingSoon")}
          </div>
        )}
      </div>
    </div>
  );
}
