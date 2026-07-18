import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminWallpaperDetail, listCategories } from "@/lib/db/queries/admin";
import { resolveMediaUrl } from "@/lib/media";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminWallpaperEditForm } from "@/components/admin/admin-wallpaper-edit-form";

export const dynamic = "force-dynamic";

export default async function AdminWallpaperEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const wallpaperId = parseInt(id, 10);
  if (Number.isNaN(wallpaperId)) notFound();

  const [detail, categories] = await Promise.all([
    getAdminWallpaperDetail(wallpaperId),
    listCategories(),
  ]);

  if (!detail) notFound();

  const resolved = {
    wallpaper: {
      ...detail.wallpaper,
      thumbUrl: detail.wallpaper.thumbUrl
        ? resolveMediaUrl(detail.wallpaper.thumbUrl)
        : "",
    },
    username: detail.username,
    categoryName: detail.categoryName,
    images: detail.images.map((img) => ({
      ...img,
      url: resolveMediaUrl(img.url),
    })),
  };

  return (
    <AdminShell>
      <Link
        href="/admin/wallpapers"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold mb-4 no-underline"
        style={{ color: "var(--muted)" }}
      >
        ← Back to wallpapers
      </Link>
      <AdminPageHeader
        title="Edit wallpaper"
        subtitle={`by ${detail.username} · ${detail.categoryName}`}
      />
      <AdminWallpaperEditForm
        detail={resolved}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </AdminShell>
  );
}
