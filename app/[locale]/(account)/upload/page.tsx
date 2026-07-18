import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getMemberSettings } from "@/lib/member-settings";
import {
  getUploadCategories,
  getUploadLicenses,
  getUploadTags,
  getUploadResolutionGroups,
} from "@/lib/db/queries/taxonomy";
import { UploadZone } from "@/components/upload-zone";
import { UploadBlocked } from "@/components/upload-blocked";

export const dynamic = "force-dynamic";

export default async function UploadPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ challenge?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const prefix = locale === "en" ? "" : `/${locale}`;

  const user = await getCurrentUser();
  if (!user) {
    redirect(locale === "en" ? "/login" : `/${locale}/login`);
  }

  const { canSubmit } = await getMemberSettings();
  if (!canSubmit) {
    return <UploadBlocked prefix={prefix} />;
  }

  const [categories, tags, licenses, resolutionGroups] = await Promise.all([
    getUploadCategories(),
    getUploadTags(),
    getUploadLicenses(),
    getUploadResolutionGroups(),
  ]);

  const challengeId = sp.challenge ? parseInt(sp.challenge, 10) : undefined;

  return (
    <UploadZone
      categories={categories}
      tags={tags}
      licenses={licenses}
      resolutionGroups={resolutionGroups}
      username={user.username}
      challengeId={Number.isFinite(challengeId) ? challengeId : undefined}
    />
  );
}
