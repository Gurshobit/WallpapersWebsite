"use client";

import { useRouter } from "next/navigation";
import { ModerationCard } from "./moderation-card";

interface Item {
  queue: { id: number; status: string | null };
  wallpaper: { id: number; title: string } | null;
  comment: { id: number; message: string } | null;
}

export function ModerationQueue({ items }: { items: Item[] }) {
  const router = useRouter();

  async function moderate(wallpaperId: number, action: "approve" | "reject") {
    await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallpaperId, action }),
    });
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <p className="text-sm py-8 text-center" style={{ color: "var(--dim)" }}>
        Queue is empty — all caught up!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <ModerationCard
          key={item.queue.id}
          id={item.queue.id}
          type={item.wallpaper ? "wallpaper" : "comment"}
          title={item.wallpaper?.title ?? item.comment?.message?.slice(0, 80) ?? "Unknown"}
          status={item.queue.status ?? "pending"}
          onApprove={() => item.wallpaper && moderate(item.wallpaper.id, "approve")}
          onReject={() => item.wallpaper && moderate(item.wallpaper.id, "reject")}
        />
      ))}
    </div>
  );
}
