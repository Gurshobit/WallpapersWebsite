"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

export function ShortlistBadge() {
  const { data: session } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!session?.user) {
      setCount(0);
      return;
    }
    fetch("/api/shortlist")
      .then((r) => r.json())
      .then((d) => setCount(d.count ?? 0))
      .catch(() => setCount(0));
  }, [session?.user]);

  if (!count) return null;

  return (
    <span
      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
      style={{ background: "#ff2e63" }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
