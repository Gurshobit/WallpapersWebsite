import { AdminMemberSettings } from "@/components/admin/admin-member-settings";
import { AdminShell } from "@/components/admin/admin-shell";
import { getSiteConfigs } from "@/lib/db/queries/admin";
import { guardAdminOnlyPage } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminMemberSettingsPage() {
  await guardAdminOnlyPage();
  const configs = await getSiteConfigs();

  return (
    <AdminShell>
      <AdminMemberSettings configs={configs} />
    </AdminShell>
  );
}
