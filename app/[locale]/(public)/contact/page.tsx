import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/session";
import { ContactForm } from "@/components/contact-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/contact",
    locale: locale as "en",
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const user = await getCurrentUser();

  return (
    <div
      className="max-w-[960px] mx-auto px-5 sm:px-7 py-10 pb-20"
      style={{ animation: "fadeUp .4s ease both" }}
    >
      <div className="mb-10">
        <h1
          className="font-bold text-[clamp(1.75rem,4vw,2.5rem)] tracking-[-0.03em] mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {t("title")}
        </h1>
        <p className="text-[15px] leading-relaxed max-w-xl" style={{ color: "var(--text3)" }}>
          {t("subtitle")}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 items-start">
        <aside
          className="rounded-2xl p-6 flex flex-col gap-5"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <InfoBlock
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" />
                <path d="m22 6-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
            title={t("infoEmailTitle")}
            body={t("infoEmailBody")}
          />
          <InfoBlock
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
            title={t("infoResponseTitle")}
            body={t("infoResponseBody")}
          />
          <InfoBlock
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title={t("infoPrivacyTitle")}
            body={t("infoPrivacyBody")}
          />
        </aside>

        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <ContactForm
            defaultName={user?.username ?? ""}
            defaultEmail={user?.email ?? ""}
          />
        </div>
      </div>
    </div>
  );
}

function InfoBlock({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3.5">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-none"
        style={{ background: "rgba(255,46,99,.1)", color: "#ff6a8a" }}
      >
        {icon}
      </div>
      <div>
        <div className="text-[13.5px] font-bold mb-1">{title}</div>
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--dim)" }}>
          {body}
        </p>
      </div>
    </div>
  );
}
