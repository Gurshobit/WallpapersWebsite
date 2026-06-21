"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WallpaperComments({
  wallpaperId,
  canComment,
  isLoggedIn,
  loginHref,
}: {
  wallpaperId: number;
  canComment: boolean;
  isLoggedIn: boolean;
  loginHref: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!canComment) {
    return (
      <p className="text-sm px-4 py-3 rounded-xl" style={{ background: "var(--surface2)", color: "var(--dim)" }}>
        Comments are temporarily disabled.
      </p>
    );
  }

  if (!isLoggedIn) {
    return (
      <p className="text-sm" style={{ color: "var(--dim)" }}>
        <a href={loginHref} className="font-semibold no-underline hover:underline" style={{ color: "#ff6a8a" }}>
          Sign in
        </a>{" "}
        to join the conversation.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFeedback(null);
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallpaperId, message: message.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Failed to post comment");

      setMessage("");
      setFeedback(
        data.pending
          ? "Comment submitted — it will appear after moderation."
          : "Comment posted!"
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mb-6">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="Share your thoughts…"
        maxLength={2000}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-y mb-2"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line2)",
          color: "var(--text)",
        }}
      />
      {error && <p className="text-sm text-red-400 mb-2">{error}</p>}
      {feedback && (
        <p className="text-sm mb-2" style={{ color: "#30a46c" }}>
          {feedback}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || !message.trim()}
        className="rounded-[10px] px-4 py-2 text-[13.5px] font-bold text-white disabled:opacity-50 cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #ff2e63, #ff6a3d)",
          boxShadow: "0 4px 14px rgba(255,46,99,.28)",
        }}
      >
        {loading ? "Posting…" : "Post comment"}
      </button>
    </form>
  );
}
