import { listAdSlots } from "@/lib/db/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  const slots = await listAdSlots();

  return (
    <AdminShell>
      <AdminPageHeader title="Ad slots" subtitle={`${slots.length} placements configured`} />
      <div className="grid gap-4">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className="p-5 rounded-[15px]"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{slot.name}</h3>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  background: slot.active ? "rgba(48,164,108,.15)" : "var(--surface3)",
                  color: slot.active ? "#30a46c" : "var(--dim)",
                }}
              >
                {slot.active ? "active" : "inactive"}
              </span>
            </div>
            <p className="text-xs mb-2" style={{ color: "var(--dim)" }}>
              {slot.slug} · {slot.width}×{slot.height} · {slot.placement}
            </p>
            <pre
              className="text-xs p-3 rounded-lg overflow-x-auto"
              style={{ background: "var(--surface2)", color: "var(--text3)" }}
            >
              {slot.content}
            </pre>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
