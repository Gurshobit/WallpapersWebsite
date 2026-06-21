import { Suspense } from "react";
import { getSiteConfigs } from "@/lib/db/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminSettingsNav } from "@/components/admin/admin-settings-nav";
import { AdminSettingsGeneral } from "@/components/admin/admin-settings-general";
import {
  AdminSettingsCrons,
  AdminSettingsCaching,
  AdminSettingsEmails,
  AdminSettingsLinks,
} from "@/components/admin/admin-settings-section";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const sp = await searchParams;
  const section = sp.section ?? "general";

  const configs = await getSiteConfigs();

  return (
    <AdminShell>
      <AdminPageHeader title="Settings" subtitle="Site configuration & administration" />
      <Suspense fallback={null}>
        <AdminSettingsNav />
      </Suspense>

      {section === "general" && <AdminSettingsGeneral configs={configs} />}
      {section === "emails" && <AdminSettingsEmails />}
      {section === "crons" && <AdminSettingsCrons />}
      {section === "caching" && <AdminSettingsCaching />}
      {section === "links" && <AdminSettingsLinks />}
    </AdminShell>
  );
}
