import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { wallpapers } from "@/lib/db/schema";
import { listAdminWallpapersEnhanced, listCategories } from "@/lib/db/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminWallpapersTable } from "@/components/admin/admin-wallpapers-table";

export const dynamic = "force-dynamic";

export default async function AdminWallpapersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status || undefined;

  const [items, [totalRow], categories] = await Promise.all([
    listAdminWallpapersEnhanced({ status, limit: 100 }),
    status
      ? db.select({ n: count() }).from(wallpapers).where(eq(wallpapers.status, status as typeof wallpapers.status.enumValues[number]))
      : db.select({ n: count() }).from(wallpapers),
    listCategories(),
  ]);

  return (
    <AdminShell>
      <AdminPageHeader title="Wallpapers" subtitle="Manage the wallpaper library" />
      <AdminWallpapersTable
        items={items}
        totalCount={totalRow?.n ?? items.length}
        initialStatus={sp.status ?? ""}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </AdminShell>
  );
}
