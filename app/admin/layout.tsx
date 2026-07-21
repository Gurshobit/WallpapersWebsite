import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { guardAdminPage } from "@/lib/session";
import { getAdminOverview } from "@/lib/db/queries/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await guardAdminPage();

  const stats = await getAdminOverview();

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <AdminSidebar pendingCount={stats.pendingWallpapers} role={user.roleId} />
      <main className="flex-1 min-w-0 overflow-auto pt-14 md:pt-0">{children}</main>
    </div>
  );
}
