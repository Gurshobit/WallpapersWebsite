import { listAdminUsersEnhanced } from "@/lib/db/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminUsersTable } from "@/components/admin/admin-users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { rows, stats } = await listAdminUsersEnhanced(undefined, 100);

  return (
    <AdminShell>
      <AdminPageHeader title="Users" subtitle="Manage accounts and roles" />
      <AdminUsersTable rows={rows} stats={stats} />
    </AdminShell>
  );
}
