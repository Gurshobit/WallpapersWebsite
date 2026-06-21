"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ── types ──────────────────────────────────────────────────────────────────────

export type ResolutionType = {
  id: number;
  name: string;
  sortOrder: number;
};

export type Resolution = {
  id: number;
  typeId: number;
  name: string;
  slug: string | null;
  width: number | null;
  height: number | null;
  showInSidebar: boolean | null;
  sortOrder: number;
};

// ── helpers ──────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function apiPost(path: string, body: object) {
  const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function apiPatch(path: string, body: object) {
  const r = await fetch(path, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function apiDel(path: string) {
  const r = await fetch(path, { method: "DELETE" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ── drag handle ───────────────────────────────────────────────────────────────

function DragHandle({ listeners, attributes }: { listeners?: object; attributes?: object }) {
  return (
    <span
      {...listeners}
      {...attributes}
      suppressHydrationWarning
      className="cursor-grab active:cursor-grabbing flex items-center px-0.5 touch-none flex-none"
      style={{ color: "var(--dim4)" }}
      title="Drag to reorder"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
        <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
      </svg>
    </span>
  );
}

// ── edit resolution modal ─────────────────────────────────────────────────────

function EditResolutionModal({
  resolution,
  types,
  onClose,
  onSave,
}: {
  resolution: Resolution;
  types: ResolutionType[];
  onClose: () => void;
  onSave: (id: number, data: Partial<Resolution>) => Promise<void>;
}) {
  const [name, setName] = useState(resolution.name);
  const [slug, setSlug] = useState(resolution.slug ?? slugify(resolution.name));
  const [width, setWidth] = useState(String(resolution.width ?? ""));
  const [height, setHeight] = useState(String(resolution.height ?? ""));
  const [typeId, setTypeId] = useState(resolution.typeId);
  const [showInSidebar, setShowInSidebar] = useState(!!resolution.showInSidebar);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleNameChange(val: string) {
    setName(val);
    if (!slugTouched) setSlug(slugify(val));
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await onSave(resolution.id, {
      name: name.trim(),
      slug: slug || slugify(name),
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      typeId,
      showInSidebar,
    });
    setSaving(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.65)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[460px] rounded-[18px] p-6 flex flex-col gap-[16px]"
        style={{ background: "var(--surface)", border: "1px solid var(--line2)", boxShadow: "0 24px 64px rgba(0,0,0,.7)", animation: "fadeUp .2s ease both" }}
      >
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-[17px]" style={{ fontFamily: "var(--font-heading)" }}>Edit resolution</div>
            <div className="text-[12px] mt-[2px]" style={{ color: "var(--dim)" }}>ID #{resolution.id}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border-none bg-transparent cursor-pointer transition-colors hover:bg-[var(--surface2)]"
            style={{ color: "var(--dim2)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* label */}
        <div>
          <label className="block text-[11.5px] font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>Label</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full rounded-[10px] px-[13px] py-[11px] text-[14px] outline-none"
            style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}
          />
        </div>

        {/* dimensions */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11.5px] font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>Width (px)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="e.g. 1920"
              className="w-full rounded-[10px] px-[13px] py-[11px] text-[14px] outline-none"
              style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}
            />
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>Height (px)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g. 1080"
              className="w-full rounded-[10px] px-[13px] py-[11px] text-[14px] outline-none"
              style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}
            />
          </div>
        </div>

        {/* slug */}
        <div>
          <label className="block text-[11.5px] font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>
            Slug
            <span className="ml-1 font-normal" style={{ color: "var(--dim3)" }}>(URL path)</span>
          </label>
          <input
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
            className="w-full rounded-[10px] px-[13px] py-[11px] text-[13.5px] font-mono outline-none"
            style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}
          />
        </div>

        {/* resolution type */}
        <div>
          <label className="block text-[11.5px] font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>Resolution type</label>
          <select
            value={typeId}
            onChange={(e) => setTypeId(parseInt(e.target.value))}
            className="w-full rounded-[10px] px-[13px] py-[11px] text-[13.5px] outline-none cursor-pointer"
            style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}
          >
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* sidebar toggle */}
        <div
          className="flex items-center justify-between rounded-[10px] px-[13px] py-[12px]"
          style={{ background: "var(--surface2)", border: "1px solid var(--line)" }}
        >
          <div>
            <div className="text-[13.5px] font-semibold">Show in sidebar</div>
            <div className="text-[11.5px]" style={{ color: "var(--dim)" }}>Visible on browse pages as a filter option</div>
          </div>
          <button
            type="button"
            onClick={() => setShowInSidebar((v) => !v)}
            aria-pressed={showInSidebar}
            className="relative w-[42px] h-6 rounded-full border-none cursor-pointer flex-none transition-colors"
            style={{ background: showInSidebar ? "#30a46c" : "var(--track)" }}
          >
            <span
              className="absolute top-[2px] w-5 h-5 rounded-full bg-white transition-all"
              style={{ left: showInSidebar ? 20 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.3)" }}
            />
          </button>
        </div>

        {/* actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[10px] px-4 py-[11px] font-semibold text-[13.5px] cursor-pointer"
            style={{ background: "transparent", border: "1px solid var(--line2)", color: "var(--muted)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex-1 rounded-[10px] px-4 py-[11px] font-bold text-[13.5px] text-white border-none cursor-pointer disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#ff2e63,#ff6a3d)", boxShadow: "0 4px 14px rgba(255,46,99,.28)" }}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── sortable resolution row ───────────────────────────────────────────────────

function SortableResRow({
  r,
  badgeColor,
  onToggle,
  onDelete,
  onEdit,
  saving,
}: {
  r: Resolution;
  badgeColor: string;
  onToggle: (id: number, current: boolean) => void;
  onDelete: (id: number) => void;
  onEdit: (r: Resolution) => void;
  saving?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: r.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    background: "var(--surface2)",
    border: "1px solid var(--line)",
    borderRadius: 10,
  };

  const on = !!r.showInSidebar;
  const dims = r.width && r.height ? `${r.width} × ${r.height}` : r.slug ?? "—";

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-[10px] px-[12px] py-[10px]">
      <DragHandle listeners={listeners} attributes={attributes} />
      <span className="w-2 h-2 rounded-full flex-none" style={{ background: badgeColor }} />
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-semibold leading-tight">{r.name}</div>
        <div className="text-[11px] mt-[1px]" style={{ color: "var(--dim)" }}>{dims}</div>
      </div>

      {/* sidebar toggle */}
      <button
        type="button"
        onClick={() => onToggle(r.id, on)}
        disabled={saving}
        aria-pressed={on}
        className="relative w-[36px] h-[20px] rounded-full border-none cursor-pointer flex-none transition-colors disabled:opacity-40"
        style={{ background: on ? "#30a46c" : "var(--track)" }}
        title={on ? "In sidebar" : "Hidden from sidebar"}
      >
        <span
          className="absolute top-[2px] w-4 h-4 rounded-full bg-white transition-all"
          style={{ left: on ? 16 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.3)" }}
        />
      </button>

      {/* edit */}
      <button
        type="button"
        onClick={() => onEdit(r)}
        className="flex items-center border-none bg-transparent cursor-pointer transition-colors hover:text-[#a5b4fc] flex-none p-1"
        style={{ color: "var(--dim3)" }}
        aria-label="Edit"
        title="Edit resolution"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {/* delete */}
      <button
        type="button"
        onClick={() => onDelete(r.id)}
        className="flex items-center border-none bg-transparent cursor-pointer transition-colors hover:text-[#e5484d] flex-none p-1"
        style={{ color: "var(--dim3)" }}
        aria-label="Delete"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

// ── sortable type group ───────────────────────────────────────────────────────

const TYPE_COLORS = [
  "#7fe6f5", "#a5b4fc", "#c4b5fd", "#6ee7a0", "#ffb088",
  "#f9a8d4", "#fbbf24", "#34d399", "#60a5fa", "#e879f9",
];

function SortableTypeGroup({
  type,
  allTypes,
  resolutions,
  colorIdx,
  onDeleteType,
  onRenameType,
  onToggleRes,
  onDeleteRes,
  onEditRes,
  onReorderRes,
  onAddRes,
  savingResIds,
}: {
  type: ResolutionType;
  allTypes: ResolutionType[];
  resolutions: Resolution[];
  colorIdx: number;
  onDeleteType: (id: number) => void;
  onRenameType: (id: number, name: string) => void;
  onToggleRes: (id: number, current: boolean) => void;
  onDeleteRes: (id: number) => void;
  onEditRes: (r: Resolution) => void;
  onReorderRes: (typeId: number, reordered: Resolution[]) => void;
  onAddRes: (typeId: number, name: string, width: number, height: number) => void;
  savingResIds: Set<number>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: type.id });

  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newW, setNewW] = useState("");
  const [newH, setNewH] = useState("");
  const [addingRes, setAddingRes] = useState(false);

  const color = TYPE_COLORS[colorIdx % TYPE_COLORS.length];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const outerStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  async function handleRenameType() {
    if (!editName.trim()) return setEditing(false);
    setSaving(true);
    await onRenameType(type.id, editName.trim());
    setSaving(false);
    setEditing(false);
  }

  function handleResDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = resolutions.findIndex((r) => r.id === active.id);
    const newIdx = resolutions.findIndex((r) => r.id === over.id);
    onReorderRes(type.id, arrayMove(resolutions, oldIdx, newIdx));
  }

  async function handleAddRes() {
    if (!newLabel.trim() || !newW || !newH) return;
    setAddingRes(true);
    await onAddRes(type.id, newLabel.trim(), parseInt(newW), parseInt(newH));
    setNewLabel(""); setNewW(""); setNewH("");
    setAddingRes(false);
  }

  const sidebarCount = resolutions.filter((r) => r.showInSidebar).length;

  return (
    <div ref={setNodeRef} style={outerStyle}>
      <div
        className="rounded-[14px] overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        {/* type header */}
        <div className="flex items-center gap-[10px] px-[14px] py-[13px]">
          <DragHandle listeners={listeners} attributes={attributes} />

          <span className="w-3 h-3 rounded-full flex-none" style={{ background: color }} />

          {editing ? (
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameType();
                if (e.key === "Escape") setEditing(false);
              }}
              className="flex-1 rounded-[8px] px-2 py-1 text-[14px] font-bold outline-none"
              style={{ background: "var(--surface2)", border: "1px solid rgba(255,46,99,.5)", color: "var(--text)" }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex-1 min-w-0 text-left border-none bg-transparent cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-[15px]">{type.name}</span>
                <span className="text-xs font-medium" style={{ color: "var(--dim)" }}>
                  {resolutions.length} resolutions · {sidebarCount} in sidebar
                </span>
                <span className="text-xs" style={{ color: "var(--dim3)" }}>{open ? "▾" : "▸"}</span>
              </div>
            </button>
          )}

          {editing ? (
            <button
              type="button"
              onClick={handleRenameType}
              disabled={saving}
              className="text-xs font-bold px-2.5 py-1 rounded-lg border-none cursor-pointer disabled:opacity-50"
              style={{ background: "rgba(48,164,108,.15)", color: "#5fd398" }}
            >
              {saving ? "…" : "Save"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setEditName(type.name); setEditing(true); }}
              className="p-1.5 rounded-lg border-none bg-transparent cursor-pointer transition-colors hover:bg-[var(--surface2)]"
              style={{ color: "var(--dim2)" }}
              title="Rename type"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={() => onDeleteType(type.id)}
            className="p-1.5 rounded-lg border-none bg-transparent cursor-pointer transition-colors hover:text-[#e5484d]"
            style={{ color: "var(--dim3)" }}
            title="Delete type"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* resolutions list */}
        {open && (
          <div
            className="px-[14px] pb-[14px] pt-[4px] border-t"
            style={{ borderColor: "var(--line)", background: "var(--bg2)" }}
          >
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleResDragEnd}>
              <SortableContext items={resolutions.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-[6px] mb-3">
                  {resolutions.length === 0 ? (
                    <div className="text-xs py-3 text-center" style={{ color: "var(--dim)" }}>
                      No resolutions yet.
                    </div>
                  ) : (
                    resolutions.map((r) => (
                      <SortableResRow
                        key={r.id}
                        r={r}
                        badgeColor={color}
                        onToggle={onToggleRes}
                        onDelete={onDeleteRes}
                        onEdit={onEditRes}
                        saving={savingResIds.has(r.id)}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </DndContext>

            {/* add resolution */}
            <div className="flex gap-2 items-end flex-wrap pt-1 border-t" style={{ borderColor: "var(--line)" }}>
              <div className="mt-2 flex-1 min-w-[120px]">
                <label className="block text-[10.5px] font-semibold mb-[5px]" style={{ color: "var(--muted)" }}>Label</label>
                <input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. 1920 × 1080 FHD"
                  className="w-full rounded-[8px] px-2.5 py-[8px] text-[13px] outline-none"
                  style={{ background: "var(--surface)", border: "1px solid var(--line2)", color: "var(--text)" }}
                />
              </div>
              <div className="mt-2" style={{ width: 88 }}>
                <label className="block text-[10.5px] font-semibold mb-[5px]" style={{ color: "var(--muted)" }}>Width</label>
                <input
                  value={newW}
                  onChange={(e) => setNewW(e.target.value)}
                  placeholder="1920"
                  type="number"
                  className="w-full rounded-[8px] px-2.5 py-[8px] text-[13px] outline-none"
                  style={{ background: "var(--surface)", border: "1px solid var(--line2)", color: "var(--text)" }}
                />
              </div>
              <div className="mt-2" style={{ width: 88 }}>
                <label className="block text-[10.5px] font-semibold mb-[5px]" style={{ color: "var(--muted)" }}>Height</label>
                <input
                  value={newH}
                  onChange={(e) => setNewH(e.target.value)}
                  placeholder="1080"
                  type="number"
                  className="w-full rounded-[8px] px-2.5 py-[8px] text-[13px] outline-none"
                  style={{ background: "var(--surface)", border: "1px solid var(--line2)", color: "var(--text)" }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddRes}
                disabled={addingRes || !newLabel.trim() || !newW || !newH}
                className="mt-2 flex items-center gap-1.5 rounded-[8px] px-3 py-[8px] font-bold text-[12.5px] text-white border-none cursor-pointer disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#ff2e63,#ff6a3d)" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                {addingRes ? "…" : "Add"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── main manager ──────────────────────────────────────────────────────────────

export function AdminResolutionsManager({
  resolutionTypes: initialTypes,
  resolutions: initialResolutions,
}: {
  resolutionTypes: ResolutionType[];
  resolutions: Resolution[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [types, setTypes] = useState<ResolutionType[]>(initialTypes);
  const [resMap, setResMap] = useState<Record<number, Resolution[]>>(() => {
    const m: Record<number, Resolution[]> = {};
    for (const t of initialTypes) m[t.id] = [];
    for (const r of initialResolutions) {
      if (!m[r.typeId]) m[r.typeId] = [];
      m[r.typeId].push(r);
    }
    return m;
  });

  const [savingResIds, setSavingResIds] = useState<Set<number>>(new Set());
  const [newTypeName, setNewTypeName] = useState("");
  const [addingType, setAddingType] = useState(false);
  const [editTarget, setEditTarget] = useState<Resolution | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const typeSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  // ── type CRUD ────────────────────────────────────────────────────────────

  async function addType() {
    if (!newTypeName.trim()) return;
    setAddingType(true);
    try {
      const created = await apiPost("/api/admin/resolution-types", { name: newTypeName.trim() });
      setTypes((prev) => [...prev, created]);
      setResMap((prev) => ({ ...prev, [created.id]: [] }));
      setNewTypeName("");
      showToast("Type added");
      startTransition(() => router.refresh());
    } catch (e) { setError(String(e)); }
    finally { setAddingType(false); }
  }

  async function deleteType(id: number) {
    if (!confirm("Delete this resolution type? All its resolutions will also be removed.")) return;
    try {
      await apiDel(`/api/admin/resolution-types/${id}`);
      setTypes((prev) => prev.filter((t) => t.id !== id));
      setResMap((prev) => { const n = { ...prev }; delete n[id]; return n; });
      showToast("Type deleted");
      startTransition(() => router.refresh());
    } catch (e) { setError(String(e)); }
  }

  async function renameType(id: number, name: string) {
    try {
      const updated = await apiPatch(`/api/admin/resolution-types/${id}`, { name });
      setTypes((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
      showToast("Renamed");
    } catch (e) { setError(String(e)); }
  }

  function handleTypeDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = types.findIndex((t) => t.id === active.id);
    const newIdx = types.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(types, oldIdx, newIdx);
    setTypes(reordered);
    apiPost("/api/admin/resolution-types", { action: "reorder", ids: reordered.map((t) => t.id) })
      .catch(() => setError("Reorder failed"));
  }

  // ── resolution CRUD ────────────────────────────────────────────────────────

  async function toggleRes(id: number, current: boolean) {
    setSavingResIds((prev) => new Set(prev).add(id));
    try {
      await apiPatch(`/api/admin/resolutions/${id}`, { showInSidebar: !current });
      setResMap((prev) => {
        const n = { ...prev };
        for (const k of Object.keys(n)) {
          n[Number(k)] = n[Number(k)].map((r) => r.id === id ? { ...r, showInSidebar: !current } : r);
        }
        return n;
      });
    } catch (e) { setError(String(e)); }
    finally {
      setSavingResIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  }

  async function saveResEdit(id: number, data: Partial<Resolution>) {
    try {
      const updated = await apiPatch(`/api/admin/resolutions/${id}`, data);
      const newTypeId = updated.typeId as number;
      setResMap((prev) => {
        const n = { ...prev };
        // remove from old group
        for (const k of Object.keys(n)) {
          n[Number(k)] = n[Number(k)].filter((r) => r.id !== id);
        }
        // add to (possibly new) group with updated data
        if (!n[newTypeId]) n[newTypeId] = [];
        n[newTypeId] = [...n[newTypeId], updated as Resolution];
        return n;
      });
      showToast("Resolution saved");
      startTransition(() => router.refresh());
    } catch (e) { setError(String(e)); throw e; }
  }

  async function deleteRes(id: number) {
    if (!confirm("Delete this resolution?")) return;
    try {
      await apiDel(`/api/admin/resolutions/${id}`);
      setResMap((prev) => {
        const n = { ...prev };
        for (const k of Object.keys(n)) {
          n[Number(k)] = n[Number(k)].filter((r) => r.id !== id);
        }
        return n;
      });
      showToast("Resolution deleted");
      startTransition(() => router.refresh());
    } catch (e) { setError(String(e)); }
  }

  function reorderResInType(typeId: number, reordered: Resolution[]) {
    setResMap((prev) => ({ ...prev, [typeId]: reordered }));
    apiPost("/api/admin/resolutions", { action: "reorder", ids: reordered.map((r) => r.id) })
      .catch(() => setError("Reorder failed"));
  }

  async function addRes(typeId: number, name: string, width: number, height: number) {
    try {
      const created = await apiPost("/api/admin/resolutions", { name, width, height, typeId });
      setResMap((prev) => ({ ...prev, [typeId]: [...(prev[typeId] ?? []), created] }));
      showToast("Resolution added");
      startTransition(() => router.refresh());
    } catch (e) { setError(String(e)); }
  }

  const totalResolutions = Object.values(resMap).reduce((a, b) => a + b.length, 0);
  const totalInSidebar = Object.values(resMap).flat().filter((r) => r.showInSidebar).length;

  return (
    <div className="space-y-[14px]" style={{ animation: "fadeUp .35s ease both" }}>
      {/* edit modal */}
      {editTarget && (
        <EditResolutionModal
          resolution={editTarget}
          types={types}
          onClose={() => setEditTarget(null)}
          onSave={saveResEdit}
        />
      )}

      {/* toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold"
          style={{ background: "var(--surface2)", border: "1px solid var(--line2)", boxShadow: "0 14px 44px rgba(0,0,0,.55)", animation: "fadeUp .2s ease both", color: "var(--text)" }}
        >
          <span className="w-5 h-5 rounded-full bg-[#30a46c] flex items-center justify-center flex-none">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M20 6 9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
          {toast}
        </div>
      )}

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(229,72,77,.12)", border: "1px solid rgba(229,72,77,.3)", color: "#ff8a8d" }}>
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-3 font-bold border-none bg-transparent cursor-pointer" style={{ color: "#ff8a8d" }}>✕</button>
        </div>
      )}

      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-[18px]" style={{ fontFamily: "var(--font-heading)" }}>
            Resolution Types &amp; Presets
          </h2>
          <div className="text-[12.5px] mt-[2px]" style={{ color: "var(--dim)" }}>
            {types.length} types · {totalResolutions} resolutions · {totalInSidebar} in sidebar
          </div>
        </div>
      </div>

      {/* add type bar */}
      <div
        className="flex items-center gap-3 rounded-[13px] px-[14px] py-[12px]"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--dim2)" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        <input
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addType(); }}
          placeholder="New resolution type name (e.g. Ultra-wide 21:9)…"
          className="flex-1 outline-none bg-transparent text-[13.5px]"
          style={{ color: "var(--text)" }}
        />
        <button
          type="button"
          onClick={addType}
          disabled={addingType || !newTypeName.trim()}
          className="flex items-center gap-1.5 rounded-[9px] px-3.5 py-[8px] font-bold text-[13px] text-white border-none cursor-pointer disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#ff2e63,#ff6a3d)", boxShadow: "0 4px 12px rgba(255,46,99,.25)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          {addingType ? "Adding…" : "Add type"}
        </button>
      </div>

      {/* sortable type groups */}
      <DndContext sensors={typeSensors} collisionDetection={closestCenter} onDragEnd={handleTypeDragEnd}>
        <SortableContext items={types.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {types.length === 0 ? (
              <div className="rounded-2xl p-10 text-center text-sm" style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--dim)" }}>
                No resolution types yet. Add one above.
              </div>
            ) : (
              types.map((type, idx) => (
                <SortableTypeGroup
                  key={type.id}
                  type={type}
                  allTypes={types}
                  resolutions={resMap[type.id] ?? []}
                  colorIdx={idx}
                  onDeleteType={deleteType}
                  onRenameType={renameType}
                  onToggleRes={toggleRes}
                  onDeleteRes={deleteRes}
                  onEditRes={setEditTarget}
                  onReorderRes={reorderResInType}
                  onAddRes={addRes}
                  savingResIds={savingResIds}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
