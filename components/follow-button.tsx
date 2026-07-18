"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function FollowButton({
  handle,
  initialFollowing,
  isLoggedIn,
  isOwnProfile,
  loginHref,
  onCountChange,
}: {
  handle: string;
  initialFollowing: boolean;
  isLoggedIn: boolean;
  isOwnProfile: boolean;
  loginHref: string;
  onCountChange?: (delta: number) => void;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  if (isOwnProfile) return null;

  async function toggle() {
    if (!isLoggedIn) {
      router.push(loginHref);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(handle)}/follow`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Failed");
      setFollowing(data.following);
      onCountChange?.(data.following ? 1 : -1);
      router.refresh();
    } catch {
      // keep previous state
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={toggle}
      className="rounded-[11px] px-[18px] py-[11px] text-sm font-bold border-none cursor-pointer disabled:opacity-60"
      style={
        following
          ? {
              background: "var(--surface2)",
              border: "1px solid var(--line2)",
              color: "var(--text)",
            }
          : {
              background: "linear-gradient(135deg,#ff2e63,#ff6a3d)",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(255,46,99,.28)",
            }
      }
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
