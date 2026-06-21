import { getPendingModerationItems, getAdminOverview } from "@/lib/db/queries/admin";
import { ModerationQueuePanel } from "@/components/admin/moderation-queue-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const [items, stats] = await Promise.all([
    getPendingModerationItems(),
    getAdminOverview(),
  ]);

  return (
    <AdminShell>
      <AdminPageHeader
        title="Moderation"
        subtitle={`${stats.pendingWallpapers} wallpaper${stats.pendingWallpapers === 1 ? "" : "s"} awaiting review`}
      />
      <ModerationQueuePanel items={items} />
    </AdminShell>
  );
}
