"use client";

interface ModerationCardProps {
  id: number;
  type: "wallpaper" | "comment";
  title: string;
  status: string;
  onApprove: () => void;
  onReject: () => void;
}

export function ModerationCard({
  title,
  type,
  status,
  onApprove,
  onReject,
}: ModerationCardProps) {
  return (
    <div
      className="p-5 rounded-2xl flex items-start justify-between gap-4"
      style={{ background: "var(--surface2)", border: "1px solid var(--line)" }}
    >
      <div>
        <span
          className="text-xs font-bold uppercase px-2 py-0.5 rounded"
          style={{ background: "var(--surface3)", color: "var(--dim)" }}
        >
          {type}
        </span>
        <h3 className="font-semibold mt-2">{title}</h3>
        <p className="text-xs mt-1" style={{ color: "var(--dim)" }}>
          Status: {status}
        </p>
      </div>
      <div className="flex gap-2 flex-none">
        <button
          onClick={onApprove}
          className="text-xs font-semibold px-3 py-2 rounded-lg text-white"
          style={{ background: "#30a46c" }}
        >
          Approve
        </button>
        <button
          onClick={onReject}
          className="text-xs font-semibold px-3 py-2 rounded-lg text-white"
          style={{ background: "#e5484d" }}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
