import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  downloads,
  topDownloads,
  views,
  topPopular,
  favourites,
  topFavourites,
  ratings,
  topRatings,
  wallpapers,
} from "@/lib/db/schema";

function verifyCron(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed when no secret is configured
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.execute(sql`
      INSERT INTO ${topDownloads} (wallpaper_id, "all", today, last_7_days, last_30_days, this_month, last_month)
      SELECT
        wallpaper_id,
        COUNT(*) as "all",
        COUNT(*) FILTER (WHERE date_downloaded >= CURRENT_DATE) as today,
        COUNT(*) FILTER (WHERE date_downloaded >= CURRENT_DATE - INTERVAL '7 days') as last_7_days,
        COUNT(*) FILTER (WHERE date_downloaded >= CURRENT_DATE - INTERVAL '30 days') as last_30_days,
        COUNT(*) FILTER (WHERE date_trunc('month', date_downloaded) = date_trunc('month', CURRENT_DATE)) as this_month,
        COUNT(*) FILTER (WHERE date_trunc('month', date_downloaded) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month')) as last_month
      FROM ${downloads}
      GROUP BY wallpaper_id
      ON CONFLICT (wallpaper_id) DO UPDATE SET
        "all" = EXCLUDED."all",
        today = EXCLUDED.today,
        last_7_days = EXCLUDED.last_7_days,
        last_30_days = EXCLUDED.last_30_days,
        this_month = EXCLUDED.this_month,
        last_month = EXCLUDED.last_month
    `);

    await db.execute(sql`
      INSERT INTO ${topPopular} (wallpaper_id, "all", today, last_7_days, last_30_days)
      SELECT
        wallpaper_id,
        COUNT(*) as "all",
        COUNT(*) FILTER (WHERE date_viewed >= CURRENT_DATE) as today,
        COUNT(*) FILTER (WHERE date_viewed >= CURRENT_DATE - INTERVAL '7 days') as last_7_days,
        COUNT(*) FILTER (WHERE date_viewed >= CURRENT_DATE - INTERVAL '30 days') as last_30_days
      FROM ${views}
      GROUP BY wallpaper_id
      ON CONFLICT (wallpaper_id) DO UPDATE SET
        "all" = EXCLUDED."all",
        today = EXCLUDED.today,
        last_7_days = EXCLUDED.last_7_days,
        last_30_days = EXCLUDED.last_30_days
    `);

    await db.execute(sql`
      INSERT INTO ${topFavourites} (wallpaper_id, "all", today, last_7_days, last_30_days)
      SELECT
        wallpaper_id,
        COUNT(*) as "all",
        COUNT(*) FILTER (WHERE date_added >= CURRENT_DATE) as today,
        COUNT(*) FILTER (WHERE date_added >= CURRENT_DATE - INTERVAL '7 days') as last_7_days,
        COUNT(*) FILTER (WHERE date_added >= CURRENT_DATE - INTERVAL '30 days') as last_30_days
      FROM ${favourites}
      GROUP BY wallpaper_id
      ON CONFLICT (wallpaper_id) DO UPDATE SET
        "all" = EXCLUDED."all",
        today = EXCLUDED.today,
        last_7_days = EXCLUDED.last_7_days,
        last_30_days = EXCLUDED.last_30_days
    `);

    await db.execute(sql`
      INSERT INTO ${topRatings} (wallpaper_id, "all", today, last_7_days, last_30_days)
      SELECT
        wallpaper_id,
        COUNT(*) FILTER (WHERE i_like = true) as "all",
        COUNT(*) FILTER (WHERE i_like = true AND date_voted >= CURRENT_DATE) as today,
        COUNT(*) FILTER (WHERE i_like = true AND date_voted >= CURRENT_DATE - INTERVAL '7 days') as last_7_days,
        COUNT(*) FILTER (WHERE i_like = true AND date_voted >= CURRENT_DATE - INTERVAL '30 days') as last_30_days
      FROM ${ratings}
      GROUP BY wallpaper_id
      ON CONFLICT (wallpaper_id) DO UPDATE SET
        "all" = EXCLUDED."all",
        today = EXCLUDED.today,
        last_7_days = EXCLUDED.last_7_days,
        last_30_days = EXCLUDED.last_30_days
    `);

    await db.execute(sql`
      UPDATE ${wallpapers} w SET rating_value = COALESCE(
        (SELECT COUNT(*) FROM ${ratings} r WHERE r.wallpaper_id = w.id AND r.i_like = true) -
        (SELECT COUNT(*) FROM ${ratings} r WHERE r.wallpaper_id = w.id AND r.i_like = false),
        0
      )
    `);

    return NextResponse.json({ success: true, rolledUpAt: new Date().toISOString() });
  } catch (err) {
    console.error("Stats rollup error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Rollup failed" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
