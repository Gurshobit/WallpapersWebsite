"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CollectionSaveButton({
  collectionId,
  initialSaved,
  isLoggedIn,
  loginHref,
}: {
  collectionId: number;
  initialSaved: boolean;
  isLoggedIn: boolean;
  loginHref: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!isLoggedIn) {
      router.push(loginHref);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/collections/${collectionId}/save`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.saved);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold cursor-pointer disabled:opacity-60"
      style={{
        background: saved ? "rgba(255,46,99,.15)" : "var(--surface2)",
        border: `1px solid ${saved ? "rgba(255,46,99,.35)" : "var(--line2)"}`,
        color: saved ? "#ff6a8a" : "var(--text)",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"}>
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {saved ? "Saved" : "Save collection"}
    </button>
  );
}
