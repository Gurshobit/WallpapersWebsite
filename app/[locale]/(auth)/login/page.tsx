import { setRequestLocale } from "next-intl/server";
import { AuthForm } from "@/components/auth-form";
import { getMemberSettings } from "@/lib/member-settings";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { canRegister } = await getMemberSettings();
  return <AuthForm defaultTab="login" canRegister={canRegister} />;
}
