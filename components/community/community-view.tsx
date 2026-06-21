"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FeedItem } from "@/lib/db/queries/community";
import type { Challenge } from "@/lib/db/schema";
import { collectionThumbSrc, formatRelativeTime } from "@/lib/collection-ui";
import { formatCount } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media";

type Creator = {
  id: number;
  username: string;
  avatarUrl: string | null;
  nickname: string | null;
  totalUploads: number;
  totalDownloads: number;
  uploadsActive: number | null;
};

type CommunityCollection = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  wallpaperCount: number;
  curatorUsername: string;
  curatorAvatar: string | null;
  thumbs: string[];
};

type Tab = "feed" | "creators" | "challenges" | "collections";

export function CommunityView({
  prefix,
  stats,
  feed,
  creators,
  challenges,
  featuredCollections,
  isLoggedIn,
  canSubmit,
  initialTab,
}: {
  prefix: string;
  stats: {
    membersFormatted: string;
    wallpapersFormatted: string;
    downloadsFormatted: string;
    countries: number;
  };
  feed: FeedItem[];
  creators: Creator[];
  challenges: Challenge[];
  featuredCollections: CommunityCollection[];
  isLoggedIn: boolean;
  canSubmit: boolean;
  initialTab: Tab;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as Tab) ?? initialTab;

  function setTab(t: Tab) {
    const p = new URLSearchParams(searchParams.toString());
    if (t === "feed") p.delete("tab");
    else p.set("tab", t);
    router.push(`${prefix}/community?${p.toString()}`, { scroll: false });
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "feed", label: "Activity Feed", icon: "M4 6h16M4 12h8M4 18h12" },
    { id: "creators", label: "Top Creators", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
    { id: "challenges", label: "Challenges", icon: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M8 4h8M8 20h8M10 4v16M14 4v16M4 9v6a8 8 0 0 0 16 0V9" },
    { id: "collections", label: "Collections", icon: "M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-7-4-7 4V4z" },
  ];

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--bg)", animation: "fadeUp .4s ease both" }}>
      {/* Hero */}
      <div className="relative overflow-hidden border-b" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(255,46,99,.12) 0%,rgba(139,92,246,.1) 40%,rgba(34,211,238,.08) 100%)" }} />
        <div className="relative max-w-[1320px] mx-auto px-5 sm:px-7 py-10 sm:py-12">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3.5 text-[11px] font-extrabold uppercase tracking-wide" style={{ background: "rgba(255,46,99,.15)", border: "1px solid rgba(255,46,99,.28)", color: "#ff6a8a" }}>
                Community
              </div>
              <h1 className="font-extrabold text-[clamp(2rem,5vw,2.625rem)] leading-[1.05] tracking-[-0.03em] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                Where creators<br />share & inspire.
              </h1>
              <p className="text-[15px] leading-relaxed max-w-[480px]" style={{ color: "var(--text3)" }}>
                Browse the latest uploads, discover collections, join monthly challenges and connect with talented creators from around the world.
              </p>
              <div className="flex flex-wrap gap-2.5 mt-5">
                {canSubmit ? (
                  <Link href={`${prefix}/upload`} className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white no-underline" style={{ background: "linear-gradient(135deg,#ff2e63,#ff6a3d)", boxShadow: "0 4px 16px rgba(255,46,99,.32)" }}>
                    Upload wallpaper
                  </Link>
                ) : null}
                <Link href={prefix || "/"} className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold no-underline" style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}>
                  Browse gallery
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-none">
              {[
                { v: stats.membersFormatted, l: "Members", c: "var(--text)" },
                { v: stats.wallpapersFormatted, l: "Wallpapers", c: "#ff6a8a" },
                { v: stats.downloadsFormatted, l: "Downloads", c: "#22d3ee" },
                { v: String(stats.countries), l: "Countries", c: "#30a46c" },
              ].map((s) => (
                <div key={s.l} className="rounded-[14px] px-5 py-4 min-w-[120px] border" style={{ background: "var(--surface2)", borderColor: "var(--line)" }}>
                  <div className="font-extrabold text-[26px] tracking-[-0.5px]" style={{ fontFamily: "var(--font-heading)", color: s.c }}>{s.v}</div>
                  <div className="text-xs font-semibold mt-0.5" style={{ color: "var(--dim)" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[var(--header-offset,0)] z-40 border-b" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
        <div className="max-w-[1320px] mx-auto px-5 sm:px-7 flex gap-1.5 overflow-x-auto py-2.5">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-bold whitespace-nowrap cursor-pointer border-none transition-all"
                style={
                  active
                    ? { background: "linear-gradient(135deg,#ff2e63,#ff6a3d)", color: "#fff", boxShadow: "0 4px 14px rgba(255,46,99,.3)" }
                    : { background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--line)" }
                }
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={t.icon} />
                </svg>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-5 sm:px-7 pt-7">
        {tab === "feed" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
            <div className="flex flex-col gap-3">
              {feed.map((item) => (
                <FeedCard key={item.id} item={item} prefix={prefix} />
              ))}
              {feed.length === 0 && <EmptyState message="No activity yet. Be the first to upload!" />}
            </div>
            <aside className="flex flex-col gap-4">
              <LeaderboardSidebar creators={creators.slice(0, 5)} prefix={prefix} />
              <ChallengesSidebar challenges={challenges.slice(0, 2)} onSeeAll={() => setTab("challenges")} />
            </aside>
          </div>
        )}

        {tab === "creators" && (
          <div>
            <SectionHeader title="Top Creators" subtitle="Ranked by total downloads" />
            <div className="flex flex-col gap-2">
              {creators.map((c, i) => (
                <CreatorRow key={c.id} creator={c} rank={i + 1} prefix={prefix} large />
              ))}
            </div>
          </div>
        )}

        {tab === "challenges" && (
          <div>
            <SectionHeader title="Monthly Challenges" subtitle="Upload wallpapers matching the theme to enter" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {challenges.map((ch) => (
                <ChallengeCard key={ch.id} challenge={ch} prefix={prefix} canSubmit={canSubmit} />
              ))}
            </div>
          </div>
        )}

        {tab === "collections" && (
          <div>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <SectionHeader title="Featured Collections" subtitle="Curated sets by the community's top creators" inline />
              <Link href={`${prefix}/collections`} className="text-sm font-bold no-underline" style={{ color: "#ff6a8a" }}>View all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {featuredCollections.map((co) => (
                <Link key={co.id} href={`${prefix}/collections/${co.slug}`} className="rounded-[18px] overflow-hidden border no-underline transition-transform hover:-translate-y-1" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
                  <div className="grid grid-cols-[2fr_1fr] grid-rows-2 h-40 gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className={`bg-cover bg-center ${i === 0 ? "row-span-2" : ""}`} style={{ backgroundImage: co.thumbs[i] ? `url(${collectionThumbSrc(co.thumbs[i])})` : undefined, backgroundColor: "var(--surface2)" }} />
                    ))}
                  </div>
                  <div className="p-4">
                    <div className="font-bold text-[15px] mb-1" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>{co.name}</div>
                    <p className="text-xs line-clamp-2" style={{ color: "var(--text3)" }}>{co.description}</p>
                    <div className="text-[11px] mt-2" style={{ color: "var(--dim)" }}>{co.wallpaperCount} wallpapers · {co.curatorUsername}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!isLoggedIn && (
          <div className="mt-10 rounded-2xl p-8 text-center border" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
            <h3 className="font-extrabold text-[22px] mb-2" style={{ fontFamily: "var(--font-heading)" }}>Join the community</h3>
            <p className="text-sm mb-5 max-w-md mx-auto" style={{ color: "var(--text3)" }}>
              Create an account to upload wallpapers, join challenges, curate collections and get credits for your work.
            </p>
            <Link href={`${prefix}/signup`} className="inline-flex rounded-xl px-6 py-3 text-sm font-bold text-white no-underline" style={{ background: "linear-gradient(135deg,#ff2e63,#ff6a3d)" }}>
              Sign up free
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, inline }: { title: string; subtitle: string; inline?: boolean }) {
  return (
    <div className={inline ? "" : "mb-5"}>
      <h2 className="font-bold text-[22px] tracking-[-0.4px]" style={{ fontFamily: "var(--font-heading)" }}>{title}</h2>
      <p className="text-[13px] mt-1" style={{ color: "var(--dim)" }}>{subtitle}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="text-center py-12 rounded-2xl border" style={{ borderColor: "var(--line)", color: "var(--dim)" }}>{message}</div>;
}

function avatarStyle(url: string | null) {
  return {
    backgroundColor: "var(--surface2)",
    backgroundImage: url ? `url(${resolveMediaUrl(url)})` : undefined,
  };
}

function FeedCard({ item, prefix }: { item: FeedItem; prefix: string }) {
  const typeMeta = {
    upload: { label: "Upload", bg: "rgba(255,46,99,.15)", color: "#ff6a8a" },
    comment: { label: "Comment", bg: "rgba(34,211,238,.15)", color: "#22d3ee" },
    milestone: { label: "Milestone", bg: "rgba(245,197,24,.15)", color: "#f5c518" },
  }[item.type];

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-2.5">
        <div className="w-10 h-10 rounded-full bg-cover bg-center border-2 flex-none" style={{ ...avatarStyle(item.avatarUrl), borderColor: "var(--line)" }} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13.5px] font-bold">{item.username}</span>
            <span className="text-xs" style={{ color: "var(--dim)" }}>@{item.handle}</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: typeMeta.bg, color: typeMeta.color }}>{typeMeta.label}</span>
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--dim3)" }}>{formatRelativeTime(item.timestamp)}</div>
        </div>
      </div>
      {item.type === "upload" && (
        <Link href={item.wallpaperSlug ? `${prefix}/wallpapers/${item.wallpaperSlug}` : "#"} className="block mx-3.5 mb-3.5 rounded-xl overflow-hidden relative h-40 no-underline">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: item.thumbUrl ? `url(${collectionThumbSrc(item.thumbUrl)})` : undefined, backgroundColor: "var(--surface2)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgba(0,0,0,.65) 0%,transparent 50%)" }} />
          <div className="absolute bottom-0 left-0 right-0 p-3.5 flex justify-between items-end">
            <div>
              <div className="font-bold text-white text-[15px]">{item.title}</div>
              <div className="text-xs text-white/65 mt-0.5">{item.category}</div>
            </div>
            <div className="text-xs text-white/75 font-semibold">{formatCount(item.likes)} likes</div>
          </div>
        </Link>
      )}
      {item.type === "comment" && (
        <div className="mx-3.5 mb-3.5 rounded-[11px] p-3.5 border" style={{ background: "var(--surface2)", borderColor: "var(--line)" }}>
          <p className="text-[13.5px] italic leading-relaxed" style={{ color: "var(--text3)" }}>&ldquo;{item.text}&rdquo;</p>
          <p className="text-[11.5px] mt-2" style={{ color: "var(--dim)" }}>on <span className="font-bold" style={{ color: "var(--text3)" }}>{item.wallTitle}</span></p>
        </div>
      )}
      {item.type === "milestone" && (
        <div className="mx-3.5 mb-3.5 flex items-center gap-3 rounded-[11px] p-3.5 border" style={{ background: "rgba(245,197,24,.09)", borderColor: "rgba(245,197,24,.25)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-none" style={{ background: "rgba(245,197,24,.2)" }}>⭐</div>
          <div className="text-[13.5px] font-semibold">{item.milestone}</div>
        </div>
      )}
    </div>
  );
}

function LeaderboardSidebar({ creators, prefix }: { creators: Creator[]; prefix: string }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
      <div className="px-4 py-3.5 border-b font-bold text-[15px]" style={{ borderColor: "var(--line)", fontFamily: "var(--font-heading)" }}>This week</div>
      {creators.map((c, i) => (
        <Link key={c.id} href={`${prefix}/u/${c.username}`} className="flex items-center gap-2.5 px-3.5 py-2.5 border-b no-underline hover:bg-[var(--surface2)]" style={{ borderColor: "var(--line)" }}>
          <span className="w-6 text-center text-xs font-bold" style={{ color: i < 3 ? "#f5c518" : "var(--dim)" }}>{i + 1}</span>
          <div className="w-[34px] h-[34px] rounded-full bg-cover bg-center border-2 flex-none" style={{ ...avatarStyle(c.avatarUrl), borderColor: "var(--line)" }} />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold truncate" style={{ color: "var(--text)" }}>{c.nickname ?? c.username}</div>
            <div className="text-[11.5px]" style={{ color: "var(--dim)" }}>{formatCount(c.totalDownloads)} downloads</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ChallengesSidebar({ challenges, onSeeAll }: { challenges: Challenge[]; onSeeAll: () => void }) {
  return (
    <div className="rounded-2xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
      <div className="flex justify-between items-center mb-3">
        <span className="font-bold text-[15px]" style={{ fontFamily: "var(--font-heading)" }}>Challenges</span>
        <button type="button" onClick={onSeeAll} className="text-xs font-bold cursor-pointer border-none bg-transparent" style={{ color: "#ff6a8a" }}>See all →</button>
      </div>
      {challenges.map((ch) => (
        <div key={ch.id} className="flex items-center gap-2.5 py-2.5 border-b last:border-0" style={{ borderColor: "var(--line)" }}>
          <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ background: ch.accentColor ?? "#ff2e63" }} />
          <div className="min-w-0">
            <div className="text-[13px] font-bold truncate">{ch.title}</div>
            <div className="text-[11.5px]" style={{ color: "var(--dim)" }}>{ch.entryCount} entries</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CreatorRow({ creator, rank, prefix, large }: { creator: Creator; rank: number; prefix: string; large?: boolean }) {
  return (
    <Link href={`${prefix}/u/${creator.username}`} className="flex items-center gap-4 rounded-2xl border px-5 py-4 no-underline transition-colors hover:border-[var(--line2)]" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
      <span className="w-9 text-center font-bold text-base" style={{ color: rank <= 3 ? "#f5c518" : "var(--dim)" }}>{rank}</span>
      <div className={`rounded-full bg-cover bg-center border-[3px] flex-none ${large ? "w-[52px] h-[52px]" : "w-9 h-9"}`} style={{ ...avatarStyle(creator.avatarUrl), borderColor: "var(--line)" }} />
      <div className="flex-1 min-w-0">
        <div className={`font-bold ${large ? "text-base" : "text-sm"}`} style={{ color: "var(--text)" }}>{creator.nickname ?? creator.username}</div>
        <div className="text-[13px]" style={{ color: "var(--dim)" }}>@{creator.username}</div>
      </div>
      <div className="hidden sm:flex gap-6 text-center flex-none">
        <div><div className="font-bold text-[17px]" style={{ fontFamily: "var(--font-heading)" }}>{creator.totalUploads}</div><div className="text-[11px]" style={{ color: "var(--dim)" }}>Uploads</div></div>
        <div><div className="font-bold text-[17px]" style={{ fontFamily: "var(--font-heading)", color: "#22d3ee" }}>{formatCount(creator.totalDownloads)}</div><div className="text-[11px]" style={{ color: "var(--dim)" }}>Downloads</div></div>
      </div>
    </Link>
  );
}

function ChallengeCard({ challenge, prefix, canSubmit }: { challenge: Challenge; prefix: string; canSubmit: boolean }) {
  const active = challenge.active;
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: active ? "rgba(255,46,99,.25)" : "var(--line)" }}>
      <div className="p-5" style={{ background: active ? "linear-gradient(135deg,rgba(255,46,99,.08),transparent)" : undefined }}>
        <div className="flex justify-between gap-2 mb-3">
          <h3 className="font-bold text-xl" style={{ fontFamily: "var(--font-heading)" }}>{challenge.title}</h3>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full h-fit" style={{ background: active ? "rgba(48,164,108,.15)" : "var(--surface2)", color: active ? "#30a46c" : "var(--dim)" }}>
            {active ? "Active" : "Ended"}
          </span>
        </div>
        <p className="text-[13.5px] leading-relaxed mb-4" style={{ color: "var(--text3)" }}>{challenge.description}</p>
      </div>
      <div className="px-5 py-4 border-t flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: "var(--line)" }}>
        <div className="text-xs" style={{ color: "var(--dim)" }}>
          <div>{challenge.entryCount} entries</div>
          {challenge.deadline && <div>Ends {challenge.deadline.toLocaleDateString()}</div>}
          {challenge.prize && <div className="mt-1 font-semibold" style={{ color: "var(--text3)" }}>🏆 {challenge.prize}</div>}
        </div>
        {canSubmit && active && (
          <Link href={`${prefix}/upload`} className="rounded-[10px] px-4 py-2.5 text-[13px] font-bold text-white no-underline whitespace-nowrap" style={{ background: "linear-gradient(135deg,#ff2e63,#ff6a3d)" }}>
            Enter now →
          </Link>
        )}
      </div>
    </div>
  );
}
