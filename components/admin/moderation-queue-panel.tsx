"use client";

import { useRouter } from "next/navigation";
import { resolveMediaUrl } from "@/lib/media";
import { wallpaperVariantUrl } from "@/lib/wallpaper-urls";

export type ModerationItem = {
  wallpaper: {
    id: number;
    title: string;
    thumbUrl: string;
    uuid: string;
    width: number | null;
    height: number | null;
    dateAdded: Date | null;
  };
  username: string;
  avatarUrl: string | null;
  categoryName: string;
};

function thumb(w: ModerationItem["wallpaper"]) {
  if (w.thumbUrl) return resolveMediaUrl(w.thumbUrl);
  return wallpaperVariantUrl(w.uuid, 400, 225, "webp");
}

function timeAgo(date: Date | null) {
  if (!date) return "—";
  const m = Math.floor((Date.now() - date.getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function ModerationQueuePanel({ items }: { items: ModerationItem[] }) {
  const router = useRouter();

  async function moderate(wallpaperId: number, action: "approve" | "reject") {
    await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallpaperId, action }),
    });
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 px-5 rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
        <div className="w-[60px] h-[60px] rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(48,164,108,.14)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M20 6 9 17l-5-5" stroke="#30a46c" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="font-bold text-[19px] mb-1.5" style={{ fontFamily: "var(--font-heading)" }}>Queue cleared</div>
        <div className="text-sm" style={{ color: "var(--dim)" }}>All submissions reviewed. Nice work.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {items.map((item) => {
        const lowRes = item.wallpaper.width && item.wallpaper.width < 1920;
        return (
          <div key={item.wallpaper.id} className="flex flex-col sm:flex-row gap-4 rounded-[15px] border p-3.5" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
            <div className="w-full sm:w-[200px] h-[113px] rounded-[11px] bg-cover bg-center flex-none" style={{ backgroundImage: `url(${thumb(item.wallpaper)})`, backgroundColor: "var(--surface2)" }} />
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="font-bold text-[17px]" style={{ fontFamily: "var(--font-heading)" }}>{item.wallpaper.title}</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ background: "var(--line)", color: "var(--muted)" }}>{item.categoryName}</span>
                {lowRes && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ background: "rgba(229,72,77,.13)", color: "#ff8a8d", border: "1px solid rgba(229,72,77,.3)" }}>
                    ⚠ Low resolution
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[13px]" style={{ color: "var(--dim)" }}>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-[22px] h-[22px] rounded-full bg-cover bg-center flex-none" style={{ backgroundImage: item.avatarUrl ? `url(${resolveMediaUrl(item.avatarUrl)})` : undefined, backgroundColor: "var(--surface2)" }} />
                  {item.username}
                </span>
                {item.wallpaper.width && item.wallpaper.height && (
                  <span>{item.wallpaper.width} × {item.wallpaper.height}</span>
                )}
                <span>{timeAgo(item.wallpaper.dateAdded)}</span>
              </div>
            </div>
            <div className="flex sm:flex-col gap-2 justify-center flex-none">
              <button type="button" onClick={() => void moderate(item.wallpaper.id, "approve")} className="flex items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-[13.5px] font-bold cursor-pointer border" style={{ background: "rgba(48,164,108,.15)", borderColor: "rgba(48,164,108,.4)", color: "#5fd398" }}>
                Approve
              </button>
              <button type="button" onClick={() => void moderate(item.wallpaper.id, "reject")} className="flex items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-[13.5px] font-bold cursor-pointer border" style={{ background: "rgba(229,72,77,.12)", borderColor: "rgba(229,72,77,.35)", color: "#ff8a8d" }}>
                Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
