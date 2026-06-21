"use client";

import { useEffect } from "react";

export function ViewTracker({ wallpaperSlug }: { wallpaperSlug: string }) {
  useEffect(() => {
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallpaperSlug }),
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
