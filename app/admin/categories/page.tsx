import { listCategories } from "@/lib/db/queries/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCategoriesManager } from "@/components/admin/admin-categories-manager";
import { guardAdminOnlyPage } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await guardAdminOnlyPage();
  const cats = await listCategories();
  return (
    <AdminShell>
      <AdminCategoriesManager categories={cats} />
    </AdminShell>
  );
}
