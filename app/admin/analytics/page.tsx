import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminShell } from "@/components/admin/admin-shell";
import { getEngagementStats, getRecentActivity } from "@/lib/db/queries/admin";
import { formatCount } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media";

export const dynamic = "force-dynamic";

const TYPE_META = {
  download: { label: "Downloaded", color: "#7fe6f5", bg: "rgba(34,211,238,.12)", icon: "M12 3v13m0 0-4.5-4.5M12 16l4.5-4.5M3 19h18" },
  view:     { label: "Viewed",    color: "#b794f6", bg: "rgba(139,92,246,.12)", icon: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2Z M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0" },
  like:     { label: "Liked",     color: "#ff6a8a", bg: "rgba(255,46,99,.12)",  icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" },
  upload:   { label: "Uploaded",  color: "#6ee7a0", bg: "rgba(48,164,108,.12)", icon: "M12 3v13m0 0 4.5-4.5M12 16l-4.5-4.5M3 19h18" },
} as const;

function timeAgo(date: Date | null) {
  if (!date) return "—";
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function AdminAnalyticsPage() {
  const [stats, activity] = await Promise.all([
    getEngagementStats(),
    getRecentActivity(50),
  ]);

  const kpis = [
    { label: "Downloads (7d)",  value: stats.downloads.last7Days,  sub: `${formatCount(stats.downloads.last30Days)} last 30d`, color: "#7fe6f5", bg: "rgba(34,211,238,.12)" },
    { label: "Views (7d)",      value: stats.views.last7Days,      sub: `${formatCount(stats.views.last30Days)} last 30d`,     color: "#b794f6", bg: "rgba(139,92,246,.12)" },
    { label: "Likes (7d)",      value: stats.likes.last7Days,      sub: "total positive ratings",                              color: "#ff6a8a", bg: "rgba(255,46,99,.12)"  },
    { label: "Top wallpaper downloads", value: stats.topDownloaded[0]?.all ?? 0, sub: stats.topDownloaded[0]?.title ?? "—",   color: "#fbbf24", bg: "rgba(251,191,36,.12)" },
  ];

  return (
    <AdminShell>
      <AdminPageHeader title="Analytics" subtitle="Engagement — downloads, views & likes" />

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-[15px] p-[18px]"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
            <div className="text-[12px] font-semibold mb-2" style={{ color: "var(--dim)" }}>{k.label}</div>
            <div className="font-bold text-[28px] tracking-[-0.5px]"
              style={{ fontFamily: "var(--font-heading)", color: k.color }}>
              {formatCount(k.value)}
            </div>
            <div className="text-[11.5px] mt-1 truncate" style={{ color: "var(--dim2)" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        {/* Top downloaded */}
        <div className="rounded-[15px] p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div className="font-bold text-[15px] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Top Downloaded (30d)
          </div>
          {stats.topDownloaded.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--dim)" }}>No download data yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.topDownloaded.map((w, i) => (
                <div key={w.wallpaperId} className="flex items-center gap-3">
                  <span className="text-[11px] font-bold w-5 flex-none text-center"
                    style={{ color: "var(--dim2)" }}>{i + 1}</span>
                  <div className="w-10 h-7 rounded-[6px] flex-none bg-cover bg-center"
                    style={{ backgroundImage: `url(${resolveMediaUrl(w.thumbUrl)})`, backgroundColor: "var(--surface2)" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold truncate">{w.title}</div>
                    <div className="text-[11px]" style={{ color: "var(--dim)" }}>
                      {formatCount(w.last30Days)} this month · {formatCount(w.all)} all-time
                    </div>
                  </div>
                  {w.slug && (
                    <Link href={`/wallpapers/${w.slug}`} target="_blank"
                      className="text-[11px] font-semibold no-underline hover:underline"
                      style={{ color: "#7fe6f5" }}>View</Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top viewed */}
        <div className="rounded-[15px] p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div className="font-bold text-[15px] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Top Viewed (30d)
          </div>
          {stats.topViewed.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--dim)" }}>No view data yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.topViewed.map((w, i) => (
                <div key={w.wallpaperId} className="flex items-center gap-3">
                  <span className="text-[11px] font-bold w-5 flex-none text-center"
                    style={{ color: "var(--dim2)" }}>{i + 1}</span>
                  <div className="w-10 h-7 rounded-[6px] flex-none bg-cover bg-center"
                    style={{ backgroundImage: `url(${resolveMediaUrl(w.thumbUrl)})`, backgroundColor: "var(--surface2)" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold truncate">{w.title}</div>
                    <div className="text-[11px]" style={{ color: "var(--dim)" }}>
                      {formatCount(w.last30Days)} this month · {formatCount(w.all)} all-time
                    </div>
                  </div>
                  {w.slug && (
                    <Link href={`/wallpapers/${w.slug}`} target="_blank"
                      className="text-[11px] font-semibold no-underline hover:underline"
                      style={{ color: "#b794f6" }}>View</Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity log */}
      <div className="rounded-[15px] overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="font-bold text-[15px]" style={{ fontFamily: "var(--font-heading)" }}>
            Activity Log
          </div>
          <span className="text-[12px]" style={{ color: "var(--dim)" }}>
            Recent {activity.length} events
          </span>
        </div>

        {activity.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--dim)" }}>
            No activity recorded yet.
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--line)" }}>
            {activity.map((event, i) => {
              const meta = TYPE_META[event.type];
              return (
                <div key={i} className="flex items-center gap-3.5 px-5 py-3">
                  {/* type icon */}
                  <span className="w-[34px] h-[34px] rounded-[9px] flex-none flex items-center justify-center"
                    style={{ background: meta.bg, color: meta.color }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={meta.icon} />
                    </svg>
                  </span>

                  {/* thumb */}
                  <div className="w-9 h-6 rounded-[5px] flex-none bg-cover bg-center hidden sm:block"
                    style={{
                      backgroundImage: event.wallpaperThumb ? `url(${resolveMediaUrl(event.wallpaperThumb)})` : undefined,
                      backgroundColor: "var(--surface2)",
                    }} />

                  {/* description */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-semibold" style={{ color: meta.color }}>
                      {meta.label}
                    </span>{" "}
                    <span className="text-[13px]" style={{ color: "var(--text3)" }}>
                      {event.wallpaperSlug ? (
                        <Link href={`/wallpapers/${event.wallpaperSlug}`} target="_blank"
                          className="font-semibold hover:underline no-underline"
                          style={{ color: "var(--text)" }}>
                          {event.wallpaperTitle}
                        </Link>
                      ) : event.wallpaperTitle}
                    </span>
                    {event.format && (
                      <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: "var(--surface2)", color: "var(--dim)" }}>
                        .{event.format}
                      </span>
                    )}
                  </div>

                  {/* user + time */}
                  <div className="flex-none text-right hidden sm:block">
                    <div className="text-[12px] font-semibold" style={{ color: "var(--text3)" }}>
                      {event.username ?? "Guest"}
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--dim2)" }}>
                      {timeAgo(event.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
