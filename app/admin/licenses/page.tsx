import { listLicenses } from "@/lib/db/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminLicensesManager } from "@/components/admin/admin-licenses-manager";

export const dynamic = "force-dynamic";

export default async function AdminLicensesPage() {
  const licenses = await listLicenses();

  return (
    <AdminShell>
      <AdminPageHeader
        title="Licenses"
        subtitle={`${licenses.length} license types`}
      />
      <AdminLicensesManager licenses={licenses} />
    </AdminShell>
  );
}
