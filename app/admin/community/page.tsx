import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCommunityPanel } from "@/components/admin/admin-community-panel";
import { getCommunityFeed, listChallenges } from "@/lib/db/queries/community";

export const dynamic = "force-dynamic";

export default async function AdminCommunityPage() {
  const [feed, challenges] = await Promise.all([
    getCommunityFeed(30),
    listChallenges(false),
  ]);

  return (
    <AdminShell>
      <AdminPageHeader
        title="Community"
        subtitle="Activity feed & challenges"
      />
      <AdminCommunityPanel
        feed={feed}
        challenges={challenges.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          accentColor: c.accentColor,
          prize: c.prize,
          entryCount: c.entryCount,
          deadline: c.deadline?.toISOString() ?? null,
          active: c.active,
        }))}
      />
    </AdminShell>
  );
}
