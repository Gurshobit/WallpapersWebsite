import { db } from "@/lib/db";
import { adSlots } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface AdSlotProps {
  slug: string;
  className?: string;
  variant?: "banner" | "sidebar";
}

export async function AdSlot({
  slug,
  className = "",
  variant = "banner",
}: AdSlotProps) {
  const [slot] = await db
    .select()
    .from(adSlots)
    .where(eq(adSlots.slug, slug))
    .limit(1);

  if (!slot?.active) {
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
