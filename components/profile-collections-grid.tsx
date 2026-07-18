"use client";

import Link from "next/link";
import type { CollectionListItem } from "@/lib/db/queries/collections";
import { collectionThumbSrc } from "@/lib/collection-ui";
import { formatCount } from "@/lib/format";

export function ProfileCollectionsGrid({
  items,
  prefix,
}: {
  items: CollectionListItem[];
  prefix: string;
}) {
  if (items.length === 0) {
    return (
      <div
        className="px-2 py-16 text-center rounded-[15px]"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          color: "var(--dim)",
        }}
      >
        No collections yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
      {items.map((c) => (
        <Link
          key={c.id}
          href={`${prefix}/collections/${c.slug}`}
          className="rounded-2xl border overflow-hidden no-underline transition-colors hover:border-[var(--line2)]"
          style={{ background: "var(--surface)", borderColor: "var(--line)" }}
        >
          <div className="h-36 grid grid-cols-3 gap-0.5 bg-[var(--surface2)]">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-cover bg-center"
                style={{
                  backgroundImage: c.thumbs[i]
                    ? `url(${collectionThumbSrc(c.thumbs[i])})`
                    : undefined,
                  backgroundColor: "var(--bg2)",
                }}
              />
            ))}
          </div>
          <div className="p-4">
            <div className="font-bold text-[15px]" style={{ color: "var(--text)" }}>
              {c.name}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--dim)" }}>
              {c.wallpaperCount} wallpapers · {formatCount(c.saveCount)} saves
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
