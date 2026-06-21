import { cache } from "react";
import { getSiteConfigs } from "@/lib/db/queries/admin";

export const MEMBER_CONFIG_KEYS = {
  canRegister: "users_can_register",
  requireConfirmation: "users_register_confirmation",
  canSubmit: "users_can_submit_walls",
  canComment: "users_can_post_wall_comm",
  moderateComments: "users_moderated_comments",
  profilesPerPage: "users_members_per_page",
  restrictedUsernames: "users_restricted_usernames",
} as const;

const DEFAULTS: Record<string, string> = {
  [MEMBER_CONFIG_KEYS.canRegister]: "1",
  [MEMBER_CONFIG_KEYS.requireConfirmation]: "1",
  [MEMBER_CONFIG_KEYS.canSubmit]: "1",
  [MEMBER_CONFIG_KEYS.canComment]: "1",
  [MEMBER_CONFIG_KEYS.moderateComments]: "1",
  [MEMBER_CONFIG_KEYS.profilesPerPage]: "16",
  [MEMBER_CONFIG_KEYS.restrictedUsernames]:
    "admin,administration,adm,wallpaper,wallpapers,hdwalls,hdwallpapers",
};

export type MemberSettings = {
  canRegister: boolean;
  requireConfirmation: boolean;
  canSubmit: boolean;
  canComment: boolean;
  moderateComments: boolean;
  profilesPerPage: number;
  restrictedUsernames: string[];
};

function cfgValue(
  configs: { param: string; value: string | null }[],
  key: string
): string {
  return configs.find((c) => c.param === key)?.value ?? DEFAULTS[key] ?? "";
}

function parseRestricted(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export const getMemberSettings = cache(async (): Promise<MemberSettings> => {
  const configs = await getSiteConfigs();
  const profilesRaw = parseInt(
    cfgValue(configs, MEMBER_CONFIG_KEYS.profilesPerPage),
    10
  );

  return {
    canRegister: cfgValue(configs, MEMBER_CONFIG_KEYS.canRegister) === "1",
    requireConfirmation:
      cfgValue(configs, MEMBER_CONFIG_KEYS.requireConfirmation) === "1",
    canSubmit: cfgValue(configs, MEMBER_CONFIG_KEYS.canSubmit) === "1",
    canComment: cfgValue(configs, MEMBER_CONFIG_KEYS.canComment) === "1",
    moderateComments:
      cfgValue(configs, MEMBER_CONFIG_KEYS.moderateComments) === "1",
    profilesPerPage:
      Number.isFinite(profilesRaw) && profilesRaw >= 1 && profilesRaw <= 100
        ? profilesRaw
        : 16,
    restrictedUsernames: parseRestricted(
      cfgValue(configs, MEMBER_CONFIG_KEYS.restrictedUsernames)
    ),
  };
});

export function isUsernameRestricted(
  username: string,
  restricted: string[]
): boolean {
  return restricted.includes(username.trim().toLowerCase());
}

export async function assertCanRegister(): Promise<void> {
  const s = await getMemberSettings();
  if (!s.canRegister) {
    throw new Error("Registration is currently closed");
  }
}

export async function assertCanSubmit(): Promise<void> {
  const s = await getMemberSettings();
  if (!s.canSubmit) {
    throw new Error("Wallpaper submissions are currently disabled");
  }
}

export async function assertCanComment(): Promise<void> {
  const s = await getMemberSettings();
  if (!s.canComment) {
    throw new Error("Commenting is currently disabled");
  }
}

export async function assertUsernameAllowed(username: string): Promise<void> {
  const s = await getMemberSettings();
  if (isUsernameRestricted(username, s.restrictedUsernames)) {
    throw new Error("This username is not available");
  }
}
