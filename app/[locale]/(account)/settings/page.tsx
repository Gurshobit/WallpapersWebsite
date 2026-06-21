import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AccountSettingsForm } from "@/components/account-settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) {
    redirect(locale === "en" ? "/login" : `/${locale}/login`);
  }

  return <AccountSettingsForm username={user.username} handle={user.username} />;
}
