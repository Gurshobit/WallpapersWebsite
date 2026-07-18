import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCollectionsPanel } from "@/components/admin/admin-collections-panel";
import { adminListCollections } from "@/lib/db/queries/collections";
import { listCategories } from "@/lib/db/queries/admin";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const [items, categories] = await Promise.all([
    adminListCollections(),
    listCategories(),
  ]);

  return (
    <AdminShell>
      <AdminPageHeader
        title="Collections"
        subtitle={`${items.length} total · curated & user-submitted`}
      />
      <AdminCollectionsPanel
        items={items.map((i) => ({
          ...i,
          createdAt: i.createdAt?.toISOString() ?? null,
        }))}
        categories={categories.map((c) => c.name)}
      />
    </AdminShell>
  );
}
