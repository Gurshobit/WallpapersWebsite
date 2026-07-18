import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { wallpapers } from "@/lib/db/schema";
import { listAdminWallpapersEnhanced } from "@/lib/db/queries/admin";
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

  const [items, [totalRow]] = await Promise.all([
    listAdminWallpapersEnhanced({ status, limit: 100 }),
    status
      ? db.select({ n: count() }).from(wallpapers).where(eq(wallpapers.status, status as typeof wallpapers.status.enumValues[number]))
      : db.select({ n: count() }).from(wallpapers),
  ]);

  return (
    <AdminShell>
      <AdminPageHeader title="Wallpapers" subtitle="Manage the wallpaper library" />
      <AdminWallpapersTable
        items={items}
        totalCount={totalRow?.n ?? items.length}
        initialStatus={sp.status ?? ""}
      />
    </AdminShell>
  );
}
