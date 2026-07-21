import { db } from "@/lib/db";
import { adSlots, type AdSlot as AdSlotRow } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getActiveAdSlotByPlacement } from "@/lib/db/queries/admin";

interface AdSlotProps {
  /** Fetch a specific slot by its unique slug. */
  slug?: string;
  /** Fetch the winning (highest-priority, in-window) active slot for a placement. */
  placement?: string;
  className?: string;
  variant?: "banner" | "sidebar";
}

function Placeholder({
  variant,
  className,
}: {
  variant: "banner" | "sidebar";
  className: string;
}) {
  if (variant === "sidebar") {
    return (
      <div className={`hd-ad-placeholder py-[18px] px-3.5 ${className}`}>
        <div
          className="text-[10px] tracking-[1px] uppercase mb-2"
          style={{ color: "var(--dim3)" }}
        >
          Advertisement
        </div>
        <div className="text-[13px] leading-[1.5]" style={{ color: "var(--dim2)" }}>
          300 × 250
          <br />
          Display unit
        </div>
      </div>
    );
  }
  return (
    <div className={`hd-ad-placeholder ${className}`}>
      <div
        className="text-[10px] tracking-[1px] uppercase mb-1.5"
        style={{ color: "var(--dim3)" }}
      >
        Advertisement
      </div>
      <div className="text-sm" style={{ color: "var(--dim2)" }}>
        728 × 90 — Leaderboard display unit
      </div>
    </div>
  );
}

export async function AdSlot({
  slug,
  placement,
  className = "",
  variant = "banner",
}: AdSlotProps) {
  let slot: AdSlotRow | null = null;

  if (placement) {
    slot = await getActiveAdSlotByPlacement(placement);
  } else if (slug) {
    const [row] = await db
      .select()
      .from(adSlots)
      .where(eq(adSlots.slug, slug))
      .limit(1);
    slot = row ?? null;
  }

  if (!slot?.active) {
    // For placement-driven in-grid/custom spots, render nothing when unfilled.
    if (placement && !slug) return null;
    return <Placeholder variant={variant} className={className} />;
  }

  // Image/link ad takes precedence over raw HTML content.
  if (slot.imageUrl) {
    const img = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={slot.imageUrl}
        alt={slot.name}
        width={slot.width ?? undefined}
        height={slot.height ?? undefined}
        style={{ display: "block", width: "100%", height: "auto" }}
      />
    );
    return (
      <div
        className={`rounded-[14px] overflow-hidden ${className}`}
        style={{
          width: slot.width ? `${slot.width}px` : "100%",
          maxWidth: "100%",
        }}
      >
        {slot.linkUrl ? (
          <a href={slot.linkUrl} rel="sponsored nofollow noopener" target="_blank">
            {img}
          </a>
        ) : (
          img
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-[14px] overflow-hidden ${className}`}
      style={{
        border: "1px dashed var(--line2)",
        minHeight: slot.height ?? 90,
        width: slot.width ? `${slot.width}px` : "100%",
        maxWidth: "100%",
      }}
      dangerouslySetInnerHTML={{
        __html: slot.content ?? `<!-- ${slot.name} -->`,
      }}
    />
  );
}
