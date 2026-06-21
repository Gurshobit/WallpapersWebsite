import { listResolutionTypes, listResolutions } from "@/lib/db/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminResolutionsManager } from "@/components/admin/admin-resolutions-manager";

export const dynamic = "force-dynamic";

export default async function AdminResolutionsPage() {
  const [resolutionTypes, resolutions] = await Promise.all([
    listResolutionTypes(),
    listResolutions(),
  ]);

  return (
    <AdminShell>
      <AdminPageHeader
        title="Resolutions"
        subtitle={`${resolutionTypes.length} types · ${resolutions.length} presets`}
      />
      <AdminResolutionsManager
        resolutionTypes={resolutionTypes}
        resolutions={resolutions}
      />
    </AdminShell>
  );
}
