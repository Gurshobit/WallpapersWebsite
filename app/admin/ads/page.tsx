import { listAdSlots } from "@/lib/db/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminAdsPanel } from "@/components/admin/admin-ads-panel";
import { guardAdminOnlyPage } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  await guardAdminOnlyPage();
  const slots = await listAdSlots();

  return (
    <AdminShell>
      <AdminPageHeader
        title="Ad slots"
        subtitle={`${slots.length} placements configured`}
      />
      <AdminAdsPanel initial={slots} />
    </AdminShell>
  );
}
