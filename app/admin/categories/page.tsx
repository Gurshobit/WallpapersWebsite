import { listCategories } from "@/lib/db/queries/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCategoriesManager } from "@/components/admin/admin-categories-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const cats = await listCategories();
  return (
    <AdminShell>
      <AdminCategoriesManager categories={cats} />
    </AdminShell>
  );
}
