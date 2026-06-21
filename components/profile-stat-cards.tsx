import { getTranslations } from "next-intl/server";

interface ProfileStatCardsProps {
  uploads: number;
  downloads: number;
  followers: number;
  likes: number;
}

export async function ProfileStatCards({
  uploads,
  downloads,
  followers,
  likes,
}: ProfileStatCardsProps) {
  const t = await getTranslations("profile");

  const stats = [
    {
      label: t("uploads"),
      value: uploads,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      ),
      bg: "rgba(255,46,99,.12)",
    },
    {
      label: t("downloads"),
      value: downloads,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b794f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
      ),
      bg: "rgba(139,92,246,.12)",
    },
    {
      label: t("followers"),
      value: followers,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      bg: "rgba(34,211,238,.1)",
    },
    {
      label: t("likes"),
      value: likes,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      bg: "rgba(229,72,77,.1)",
    },
  ];

  return (
    <div className="hd-profile-stats flex gap-7 mt-[22px] mx-2 flex-wrap">
      {stats.map(({ label, value, icon, bg }) => (
        <div
          key={label}
          className="flex items-center gap-[9px] rounded-xl px-4 py-2.5"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <div
            className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center flex-none"
            style={{ background: bg }}
          >
            {icon}
          </div>
          <div>
            <div
              className="font-bold text-lg leading-none"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {value.toLocaleString()}
            </div>
            <div className="text-[11.5px] mt-0.5" style={{ color: "var(--dim)" }}>
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
