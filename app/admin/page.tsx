import Link from "next/link";
import Image from "next/image";
import {
  getDashboardKpis,
  getWeeklyDownloadChart,
  getTopCategoriesByDownloads,
  getStorageStats,
  getRecentActivity,
} from "@/lib/db/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { formatCount, formatBytes, formatPercentChange } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media";
import { getCurrentUser } from "@/lib/session";
import {
  IconWallpapers,
  IconUsers,
  IconDownload,
  IconModeration,
  IconChevronDown,
} from "@/components/admin/admin-icons";

export const dynamic = "force-dynamic";

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function timeAgo(date: Date | null) {
  if (!date) return "—";
  const m = Math.floor((Date.now() - date.getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const ACTIVITY_META = {
  upload: { verb: "uploaded", color: "#22d3ee" },
  download: { verb: "downloaded", color: "#30a46c" },
  view: { verb: "viewed", color: "#8b5cf6" },
  like: { verb: "liked", color: "#ff6a8a" },
} as const;

export default async function AdminOverviewPage() {
  const [stats, weekly, topCategories, storage, activity, user] = await Promise.all([
    getDashboardKpis(),
    getWeeklyDownloadChart(),
    getTopCategoriesByDownloads(6),
    getStorageStats(),
    getRecentActivity(20),
    getCurrentUser(),
  ]);

  const maxCategoryTotal = Math.max(...topCategories.map((c) => Number(c.total) || 0), 1);
  const displayName = user?.username ?? "Admin";
  const initials = displayName.slice(0, 2).toUpperCase();

  const kpis = [
    {
      label: "Total wallpapers",
      value: stats.activeWallpapers,
      delta: `+${formatCount(stats.wallpapersAdded7d)}`,
      icon: IconWallpapers,
      iconBg: "rgba(255,46,99,.13)",
      iconColor: "#ff6a8a",
    },
    {
      label: "Registered users",
      value: stats.totalUsers,
      delta: `+${formatCount(stats.usersAdded7d)}`,
      icon: IconUsers,
      iconBg: "rgba(34,211,238,.12)",
      iconColor: "#7fe6f5",
    },
    {
      label: "Downloads today",
      value: stats.downloadsToday,
      delta: formatPercentChange(stats.downloadsToday, stats.downloadsYesterday),
      icon: IconDownload,
      iconBg: "rgba(139,92,246,.13)",
      iconColor: "#b794f6",
    },
    {
      label: "Pending moderation",
      value: stats.pendingWallpapers,
      delta: "review",
      href: "/admin/moderation",
      highlight: true,
      icon: IconModeration,
      iconBg: "rgba(245,197,24,.13)",
      iconColor: "#f5c518",
    },
  ];

  const storageUsedTb = storage.usedBytes / 1_099_511_627_776;
  const storageQuotaTb = storage.quotaBytes / 1_099_511_627_776;

  return (
    <div
      className="px-[30px] py-[26px] pb-[50px]"
      style={{ animation: "fadeUp .35s ease both" }}
    >
      <AdminPageHeader
        title="Dashboard"
        subtitle={`Overview · ${formatDate()}`}
        actions={
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 rounded-[10px] px-[13px] py-2 text-[13px]"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                color: "var(--muted)",
              }}
            >
              Last 7 days
              <IconChevronDown />
            </div>
            {user?.avatarUrl ? (
              <Image
                src={resolveMediaUrl(user.avatarUrl)}
                alt={displayName}
                width={38}
                height={38}
                className="w-[38px] h-[38px] rounded-full object-cover"
                style={{ border: "2px solid var(--line2)" }}
              />
            ) : (
              <div
                className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: "var(--surface2)",
                  border: "2px solid var(--line2)",
                  color: "var(--text2)",
                }}
              >
                {initials}
              </div>
            )}
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-[18px]">
        {kpis.map(({ label, value, delta, href, highlight, icon: Icon, iconBg, iconColor }) => {
          const card = (
            <div
              className="rounded-[15px] p-[18px]"
              style={{
                background: "var(--surface)",
                border: highlight
                  ? "1px solid rgba(245,197,24,.25)"
                  : "1px solid var(--line)",
              }}
            >
              <div className="flex items-center justify-between mb-3.5">
                <div
                  className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center"
                  style={{ background: iconBg, color: iconColor }}
                >
                  <Icon size={19} />
                </div>
                <span
                  className="text-[11.5px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    color: highlight ? "#f5c518" : "#30a46c",
                    background: highlight
                      ? "rgba(245,197,24,.12)"
                      : "rgba(48,164,108,.12)",
                  }}
                >
                  {delta}
                </span>
              </div>
              <div
                className="font-bold text-[26px] tracking-[-0.5px]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {value.toLocaleString()}
              </div>
              <div className="text-[12.5px] mt-0.5" style={{ color: "var(--dim)" }}>
                {label}
              </div>
            </div>
          );

          return href ? (
            <Link key={label} href={href} className="no-underline block">
              {card}
            </Link>
          ) : (
            <div key={label}>{card}</div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4 mb-[18px]">
        <div
          className="rounded-[15px] p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="font-bold text-base" style={{ fontFamily: "var(--font-heading)" }}>
              Downloads this week
            </div>
            <div className="text-[13px]" style={{ color: "var(--dim)" }}>
              Total{" "}
              <span className="font-bold" style={{ color: "var(--text)" }}>
                {formatCount(weekly.total)}
              </span>
            </div>
          </div>
          <div className="flex items-end gap-3.5 h-40">
            {weekly.days.map((day) => (
              <div
                key={day.label + day.count}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
              >
                <div className="w-full flex items-end h-full min-h-[24px]">
                  <div
                    className="w-full rounded-t-[6px] transition-all"
                    style={{
                      height: `${Math.max(day.heightPct, day.count > 0 ? 8 : 4)}%`,
                      background: day.isToday
                        ? "linear-gradient(180deg, #ff2e63, #ff6a3d)"
                        : "var(--track)",
                      boxShadow: day.isToday
                        ? "0 4px 16px rgba(255,46,99,.25)"
                        : undefined,
                    }}
                  />
                </div>
                <span className="text-[11px] font-semibold" style={{ color: "var(--dim)" }}>
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-[15px] p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <div
            className="font-bold text-base mb-[18px]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Top categories
          </div>
          <div className="flex flex-col gap-3.5">
            {topCategories.map((cat) => {
              const total = Number(cat.total) || 0;
              const pct = Math.round((total / maxCategoryTotal) * 100);
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-semibold">{cat.name}</span>
                    <span className="text-xs" style={{ color: "var(--dim)" }}>
                      {formatCount(total)}
                    </span>
                  </div>
                  <div
                    className="rounded-full overflow-hidden h-1.5"
                    style={{ background: "var(--track)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg,#ff2e63,#ff6a3d)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {topCategories.length === 0 && (
              <p className="text-sm" style={{ color: "var(--dim)" }}>
                No category data yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Activity + storage */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4">
        <div
          className="rounded-[15px] p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <div
            className="font-bold text-base mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Recent activity
          </div>
          {activity.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--dim)" }}>
              No activity yet.
            </p>
          ) : (
            <div className="flex flex-col">
              {activity.slice(0, 8).map((event, i) => {
                const meta = ACTIVITY_META[event.type];
                const who = event.username ?? "Guest";
                return (
                  <div
                    key={`${event.type}-${event.wallpaperSlug}-${i}`}
                    className="flex items-center gap-3 py-[11px]"
                    style={{
                      borderBottom:
                        i < Math.min(activity.length, 8) - 1
                          ? "1px solid var(--line)"
                          : undefined,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-none"
                      style={{ background: meta.color }}
                    />
                    <div
                      className="w-[30px] h-[30px] rounded-full flex-none flex items-center justify-center text-[10px] font-bold bg-cover bg-center"
                      style={{
                        backgroundColor: "var(--surface2)",
                        backgroundImage: event.wallpaperThumb
                          ? `url(${resolveMediaUrl(event.wallpaperThumb)})`
                          : undefined,
                        color: "var(--text3)",
                      }}
                    >
                      {!event.wallpaperThumb && who.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 text-[13.5px]">
                      <span className="font-bold">{who}</span>{" "}
                      <span style={{ color: "var(--muted)" }}>{meta.verb}</span>{" "}
                      <span className="font-semibold truncate">{event.wallpaperTitle}</span>
                    </div>
                    <span className="text-[12px] flex-none" style={{ color: "var(--dim2)" }}>
                      {timeAgo(event.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          className="rounded-[15px] p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <div
            className="font-bold text-base mb-1.5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Storage & CDN
          </div>
          <p className="text-[13px] mb-[18px]" style={{ color: "var(--dim)" }}>
            Image variants across all resolutions
          </p>
          <div className="flex items-end gap-1.5 mb-2">
            <span
              className="font-bold text-[30px] tracking-[-0.5px]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {storageUsedTb >= 1
                ? storageUsedTb.toFixed(1).replace(/\.0$/, "")
                : formatBytes(storage.usedBytes)}
            </span>
            {storageUsedTb >= 1 && (
              <span className="text-sm mb-1" style={{ color: "var(--dim)" }}>
                TB of {storageQuotaTb.toFixed(0)} TB
              </span>
            )}
            {storageUsedTb < 1 && (
              <span className="text-sm mb-1" style={{ color: "var(--dim)" }}>
                of {formatBytes(storage.quotaBytes)}
              </span>
            )}
          </div>
          <div
            className="h-2.5 rounded-full overflow-hidden mb-4"
            style={{ background: "var(--track)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${storage.usedPct}%`,
                background: "linear-gradient(90deg,#ff2e63,#ff6a3d)",
              }}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              { label: "Originals", bytes: storage.originalsBytes, color: "#22d3ee" },
              { label: "Generated variants", bytes: storage.variantsBytes, color: "#8b5cf6" },
              { label: "Thumbnails", bytes: storage.thumbnailsBytes, color: "#30a46c" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between text-[13px]"
              >
                <span
                  className="flex items-center gap-2"
                  style={{ color: "var(--muted)" }}
                >
                  <span
                    className="w-[9px] h-[9px] rounded-[2px] flex-none"
                    style={{ background: row.color }}
                  />
                  {row.label}
                </span>
                <span className="font-semibold">{formatBytes(row.bytes)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
