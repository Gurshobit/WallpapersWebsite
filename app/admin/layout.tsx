import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getCurrentUser } from "@/lib/session";
import { getAdminOverview } from "@/lib/db/queries/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.roleId !== 1) {
    redirect("/login");
  }

  const stats = await getAdminOverview();

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <AdminSidebar pendingCount={stats.pendingWallpapers} />
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
}
