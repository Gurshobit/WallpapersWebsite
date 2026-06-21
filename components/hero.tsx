import Link from "next/link";
import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { formatCount } from "@/lib/format";
import { wallpaperDownloadPath } from "@/lib/wallpaper-urls";

interface HeroProps {
  wallpaper: {
    id: number;
    uuid: string;
    slug: string | null;
    title: string;
    thumbUrl: string;
    categoryName?: string | null;
    authorName?: string | null;
    username?: string | null;
    views?: number | null;
    downloads?: number | null;
  };
}

export async function Hero({ wallpaper }: HeroProps) {
  const t = await getTranslations("home");
  const locale = await getLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const author = wallpaper.authorName ?? wallpaper.username ?? "Creator";

  return (
    <section className="relative max-w-[1320px] mx-auto mt-6 px-7">
      <div
        className="hd-hero relative rounded-[20px] overflow-hidden border"
        style={{ height: 440, borderColor: "var(--line)" }}
      >
        <Image
          src={wallpaper.thumbUrl}
          alt={wallpaper.title}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(8,8,10,.92) 0%, rgba(8,8,10,.55) 45%, rgba(8,8,10,.05) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(0deg, rgba(8,8,10,.7), transparent 50%)",
          }}
        />

        <div className="relative h-full flex flex-col justify-end p-10 max-w-[620px] text-white">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="inline-flex items-center gap-1.5 px-[11px] py-1 rounded-full text-[11px] font-bold tracking-[0.5px] uppercase"
              style={{
                background: "rgba(255,46,99,.16)",
                color: "#ff6a8a",
                border: "1px solid rgba(255,46,99,.3)",
              }}
            >
              {t("featured")}
            </span>
            {wallpaper.categoryName && (
              <span
                className="px-[11px] py-1 rounded-full text-xs font-semibold"
                style={{
                  background: "rgba(0,0,0,.5)",
                  backdropFilter: "blur(6px)",
                  color: "rgba(255,255,255,.92)",
                }}
              >
                {wallpaper.categoryName}
              </span>
            )}
          </div>

          <h1
            className="font-bold text-[42px] leading-[1.05] tracking-[-1px] mb-3.5 text-balance"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {wallpaper.title}
          </h1>

          <div className="hd-hero-meta flex items-center gap-[18px] mb-6 text-[13px] font-semibold text-white/80">
            <span className="flex items-center gap-1.5">
              <span
                className="w-6 h-6 rounded-full flex-none flex items-center justify-center text-[10px] font-bold"
                style={{ background: "var(--surface2)", color: "var(--muted)" }}
              >
                {author[0]?.toUpperCase()}
              </span>
              {author}
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
              {formatCount(wallpaper.views)}
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3v12m0 0 4-4m-4 4-4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              {formatCount(wallpaper.downloads)}
            </span>
          </div>

          <div className="hd-hero-btns flex gap-3">
            {wallpaper.slug && (
              <>
                <Link
                  href={wallpaperDownloadPath(wallpaper.uuid, { format: "webp" })}
                  className="inline-flex items-center gap-2 rounded-xl px-[22px] py-3.5 font-bold text-[15px] text-white"
                  style={{
                    background: "linear-gradient(135deg, #ff2e63, #ff6a3d)",
                    boxShadow: "0 6px 20px rgba(255,46,99,.35)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3v12m0 0 4-4m-4 4-4-4"
                      stroke="#fff"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                      stroke="#fff"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {t("download4k")}
                </Link>
                <Link
                  href={`${prefix}/wallpapers/${wallpaper.slug}`}
                  className="rounded-xl px-[22px] py-3.5 font-semibold text-[15px] text-white backdrop-blur-sm"
                  style={{
                    background: "var(--line3)",
                    border: "1px solid rgba(255,255,255,.3)",
                  }}
                >
                  {t("preview")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
