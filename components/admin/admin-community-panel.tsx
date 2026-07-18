"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FeedItem } from "@/lib/db/queries/community";
import { formatRelativeTime } from "@/lib/collection-ui";
import { RichTextEditor } from "@/components/rich-text-editor";
import { RichContent } from "@/components/rich-content";

type ChallengeRow = {
  id: number;
  title: string;
  description: string;
  accentColor: string | null;
  prize: string | null;
  entryCount: number;
  deadline: string | null;
  active: boolean;
};

export function AdminCommunityPanel({
  feed,
  challenges: initialChallenges,
}: {
  feed: FeedItem[];
  challenges: ChallengeRow[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"feed" | "challenges">("feed");
  const [challenges, setChallenges] = useState(initialChallenges);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prize, setPrize] = useState("");
  const [deadline, setDeadline] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function openNew() {
    setEditId(null);
    setTitle("");
    setDescription("");
    setPrize("");
    setDeadline("");
    setActive(true);
    setModalOpen(true);
  }

  function openEdit(c: ChallengeRow) {
    setEditId(c.id);
    setTitle(c.title);
    setDescription(c.description);
    setPrize(c.prize ?? "");
    setDeadline(c.deadline ? c.deadline.slice(0, 10) : "");
    setActive(c.active);
    setModalOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        title,
        description,
        prize: prize || null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        active,
      };
      const res = await fetch(
        editId ? `/api/admin/challenges/${editId}` : "/api/admin/challenges",
        {
          method: editId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setModalOpen(false);
      showToast(editId ? "Challenge updated" : "Challenge created");
      router.refresh();
      if (!editId && data.challenge) {
        setChallenges((list) => [
          {
            id: data.challenge.id,
            title: data.challenge.title,
            description: data.challenge.description,
            accentColor: data.challenge.accentColor,
            prize: data.challenge.prize,
            entryCount: data.challenge.entryCount ?? 0,
            deadline: data.challenge.deadline
              ? new Date(data.challenge.deadline).toISOString()
              : null,
            active: data.challenge.active,
          },
          ...list,
        ]);
      } else if (editId) {
        setChallenges((list) =>
          list.map((c) =>
            c.id === editId
              ? {
                  ...c,
                  title,
                  description,
                  prize: prize || null,
                  deadline: deadline ? new Date(deadline).toISOString() : null,
                  active,
                }
              : c
          )
        );
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this challenge?")) return;
    const res = await fetch(`/api/admin/challenges/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast("Delete failed");
      return;
    }
    setChallenges((list) => list.filter((c) => c.id !== id));
    showToast("Deleted");
  }

  return (
    <div>
      <div
        className="flex gap-1 rounded-xl p-1 mb-6 w-fit"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        {(["feed", "challenges"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-[10px] text-sm font-bold border-none cursor-pointer capitalize"
            style={
              tab === t
                ? { background: "rgba(255,46,99,.12)", color: "#ff2e63" }
                : { background: "transparent", color: "var(--muted)" }
            }
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "feed" && (
        <div className="flex flex-col gap-3">
          {feed.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border px-4 py-3.5"
              style={{ background: "var(--surface)", borderColor: "var(--line)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-[13.5px]">{item.username}</span>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full capitalize"
                  style={{ background: "rgba(255,46,99,.12)", color: "#ff6a8a" }}
                >
                  {item.type}
                </span>
                <span className="text-[11px] ml-auto" style={{ color: "var(--dim)" }}>
                  {formatRelativeTime(item.timestamp)}
                </span>
              </div>
              <div className="text-[13px]" style={{ color: "var(--text3)" }}>
                {item.type === "upload" && `Uploaded “${item.title}”`}
                {item.type === "comment" && `“${item.text}” on ${item.wallTitle}`}
                {item.type === "milestone" && item.milestone}
              </div>
            </div>
          ))}
          {feed.length === 0 && (
            <div className="text-center py-12 text-sm" style={{ color: "var(--dim)" }}>
              No recent activity.
            </div>
          )}
        </div>
      )}

      {tab === "challenges" && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={openNew}
              className="rounded-[10px] px-4 py-2.5 text-[13.5px] font-bold text-white border-none cursor-pointer"
              style={{ background: "linear-gradient(135deg,#ff2e63,#ff6a3d)" }}
            >
              + New challenge
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {challenges.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border p-4 flex flex-wrap gap-4 items-start justify-between"
                style={{ background: "var(--surface)", borderColor: "var(--line)" }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: c.accentColor ?? "#ff2e63" }}
                    />
                    <h3 className="font-bold text-[15px]">{c.title}</h3>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: c.active ? "rgba(48,164,108,.15)" : "var(--surface2)",
                        color: c.active ? "#30a46c" : "var(--dim)",
                      }}
                    >
                      {c.active ? "Active" : "Ended"}
                    </span>
                  </div>
                  <RichContent
                    html={c.description}
                    className="rte-prose rte-prose-sm max-w-xl"
                  />
                  <div className="text-[12px] mt-2" style={{ color: "var(--dim)" }}>
                    {c.entryCount} entries
                    {c.deadline ? ` · ends ${new Date(c.deadline).toLocaleDateString()}` : ""}
                    {c.prize ? ` · 🏆 ${c.prize}` : ""}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="text-[12px] font-bold cursor-pointer border-none bg-transparent"
                    style={{ color: "#ff6a8a" }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c.id)}
                    className="text-[12px] font-bold cursor-pointer border-none bg-transparent"
                    style={{ color: "#e5484d" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.55)" }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-3"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>
              {editId ? "Edit challenge" : "New challenge"}
            </h3>
            <input
              className="hd-field"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>
                Description
              </label>
              <RichTextEditor
                content={description}
                onChange={setDescription}
                placeholder="Describe the challenge…"
                minHeight={140}
              />
            </div>
            <input
              className="hd-field"
              placeholder="Prize (optional)"
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
            />
            <input
              type="date"
              className="hd-field"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <label className="flex items-center justify-between text-sm font-semibold">
              Active
              <button
                type="button"
                onClick={() => setActive((v) => !v)}
                aria-pressed={active}
                className="relative w-[42px] h-6 rounded-full border-none cursor-pointer flex-none transition-colors"
                style={{ background: active ? "#30a46c" : "var(--track)" }}
              >
                <span
                  className="absolute top-[2px] w-5 h-5 rounded-full bg-white transition-all"
                  style={{ left: active ? 20 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.3)" }}
                />
              </button>
            </label>
            <button
              type="button"
              disabled={saving || title.trim().length < 2 || !description.trim()}
              onClick={save}
              className="rounded-[11px] py-3 font-bold text-sm text-white border-none cursor-pointer disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#ff2e63,#ff6a3d)" }}
            >
              {editId ? "Save changes" : "Create challenge"}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-semibold text-white"
          style={{ background: "#1a1a22" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
