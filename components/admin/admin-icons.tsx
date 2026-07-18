import type { SVGProps, ReactNode } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 18, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconDashboard(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
    </Icon>
  );
}

export function IconModeration(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function IconWallpapers(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="8.5" cy="8.5" r="1.8" fill="currentColor" />
      <path d="m21 15-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 11a3 3 0 0 0 0-6m4 15c0-2.5-1.5-4-4-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  );
}

export function IconResolutions(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7V4h3M20 7V4h-3M4 17v3h3M20 17v3h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="7" y="7" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </Icon>
  );
}

export function IconLicenses(props: IconProps) {
  // Open-source / creative license: open padlock
  return (
    <Icon {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.5" fill="currentColor" />
    </Icon>
  );
}

export function IconLanguages(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M3 12h18M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9Z" stroke="currentColor" strokeWidth="2" />
    </Icon>
  );
}

export function IconAds(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 10v4M8 8v8M12 6v12M16 9v6M20 11v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Icon>
  );
}

export function IconMembers(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  );
}

export function IconCategories(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </Icon>
  );
}

export function IconAnalytics(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 16l4-4 4 4 4-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function IconWallDefaults(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </Icon>
  );
}

export function IconDownload(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  );
}

export function IconComments(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </Icon>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <Icon size={props.size ?? 14} {...props}>
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function IconArrowLeft(props: IconProps) {
  return (
    <Icon size={props.size ?? 16} {...props}>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <Icon size={props.size ?? 16} {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </Icon>
  );
}

export function IconSun(props: IconProps) {
  return (
    <Icon size={props.size ?? 16} {...props}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2v2m0 16v2M4 12H2m20 0h-2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  );
}

export function IconPages(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </Icon>
  );
}

export function IconCollections(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-7-4-7 4V4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function IconCommunity(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 3.5a3 3 0 0 1 0 6M21 20c0-2.5-1.5-4-4-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  );
}

export type AdminNavIconKey =
  | "dashboard"
  | "moderation"
  | "wallpapers"
  | "collections"
  | "community"
  | "users"
  | "members"
  | "categories"
  | "analytics"
  | "wallDefaults"
  | "resolutions"
  | "licenses"
  | "pages"
  | "ads"
  | "languages"
  | "settings";

const NAV_ICON_MAP = {
  dashboard: IconDashboard,
  moderation: IconModeration,
  wallpapers: IconWallpapers,
  collections: IconCollections,
  community: IconCommunity,
  users: IconUsers,
  members: IconMembers,
  categories: IconCategories,
  analytics: IconAnalytics,
  wallDefaults: IconWallDefaults,
  resolutions: IconResolutions,
  licenses: IconLicenses,
  pages: IconPages,
  ads: IconAds,
  languages: IconLanguages,
  settings: IconSettings,
} as const;

export function AdminNavIcon({
  name,
  ...props
}: IconProps & { name: AdminNavIconKey }) {
  const Component = NAV_ICON_MAP[name];
  return <Component {...props} />;
}
