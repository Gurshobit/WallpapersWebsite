import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getMemberSettings } from "@/lib/member-settings";

export const dynamic = "force-dynamic";

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { canRegister } = await getMemberSettings();
  if (!canRegister) {
    redirect(locale === "en" ? "/login" : `/${locale}/login`);
  }

  return <AuthForm defaultTab="signup" canRegister={canRegister} />;
}
