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

export type Category = {
  id: number;
  parentId: number | null;
  name: string;
  slug: string | null;
  totalWallpapers: number;
  sortOrder: number;
};

type CategoryNode = Category & { children: CategoryNode[] };

const MAX_DEPTH = 5;

// ── helpers ───────────────────────────────────────────────────────────────────

function buildTree(flat: Category[]): CategoryNode[] {
  const map: Record<number, CategoryNode> = {};
  for (const c of flat) map[c.id] = { ...c, children: [] };
  const roots: CategoryNode[] = [];
  for (const node of Object.values(map)) {
    if (node.parentId == null) roots.push(node);
    else if (map[node.parentId]) map[node.parentId].children.push(node);
  }
  function sortNodes(nodes: CategoryNode[]) {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    for (const n of nodes) sortNodes(n.children);
  }
  sortNodes(roots);
  return roots;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getDescendantIds(id: number, flat: Category[]): Set<number> {
  const ids = new Set<number>([id]);
  for (const c of flat) if (c.parentId === id) for (const d of getDescendantIds(c.id, flat)) ids.add(d);
  return ids;
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
      className="cursor-grab active:cursor-grabbing flex items-center px-0.5 touch-none flex-none opacity-40 hover:opacity-100 transition-opacity"
      title="Drag to reorder"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--dim2)" }}>
        <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
        <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
      </svg>
    </span>
  );
}

// ── depth colors ──────────────────────────────────────────────────────────────

const DEPTH_COLORS = [
  "rgba(255,46,99,.18)", "rgba(99,102,241,.18)", "rgba(48,164,108,.16)",
  "rgba(255,166,48,.18)", "rgba(139,92,246,.18)",
];
const DEPTH_STROKES = ["#ff6a8a", "#a5b4fc", "#6ee7a0", "#fbbf24", "#c4b5fd"];

// ── edit category modal ───────────────────────────────────────────────────────

function EditCategoryModal({
  category,
  allCategories,
  onClose,
  onSave,
}: {
  category: Category;
  allCategories: Category[];
  onClose: () => void;
  onSave: (id: number, data: { name: string; slug: string; parentId: number | null }) => Promise<void>;
}) {
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug ?? slugify(category.name));
  const [parentId, setParentId] = useState<number | null>(category.parentId);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const excluded = getDescendantIds(category.id, allCategories);
  const availableParents = allCategories.filter((c) => !excluded.has(c.id));

  function handleNameChange(val: string) {
    setName(val);
    if (!slugTouched) setSlug(slugify(val));
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await onSave(category.id, { name: name.trim(), slug: slug || slugify(name), parentId });
    setSaving(false);
    onClose();
  }

  const depthLabel = (c: Category) => {
    let depth = 0;
    let cur: Category | undefined = c;
    while (cur?.parentId != null) {
      depth++;
      cur = allCategories.find((x) => x.id === cur!.parentId);
    }
    return "  ".repeat(depth) + c.name;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.65)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[440px] rounded-[18px] p-6 flex flex-col gap-[18px]"
        style={{ background: "var(--surface)", border: "1px solid var(--line2)", boxShadow: "0 24px 64px rgba(0,0,0,.7)", animation: "fadeUp .2s ease both" }}
      >
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-[17px]" style={{ fontFamily: "var(--font-heading)" }}>Edit category</div>
            <div className="text-[12px] mt-[2px]" style={{ color: "var(--dim)" }}>ID #{category.id}</div>
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

        {/* name */}
        <div>
          <label className="block text-[11.5px] font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>Name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full rounded-[10px] px-[13px] py-[11px] text-[14px] outline-none"
            style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}
          />
        </div>

        {/* slug */}
        <div>
          <label className="block text-[11.5px] font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>
            Slug
            <span className="ml-1 font-normal" style={{ color: "var(--dim3)" }}>(used in URL)</span>
          </label>
          <input
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
            className="w-full rounded-[10px] px-[13px] py-[11px] text-[13.5px] font-mono outline-none"
            style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}
          />
        </div>

        {/* parent */}
        <div>
          <label className="block text-[11.5px] font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>
            Parent category
            <span className="ml-1 font-normal" style={{ color: "var(--dim3)" }}>(null = root level)</span>
          </label>
          <select
            value={parentId ?? ""}
            onChange={(e) => setParentId(e.target.value === "" ? null : parseInt(e.target.value))}
            className="w-full rounded-[10px] px-[13px] py-[11px] text-[13.5px] outline-none cursor-pointer"
            style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}
          >
            <option value="">— None (root level) —</option>
            {availableParents.map((c) => (
              <option key={c.id} value={c.id}>{depthLabel(c)}</option>
            ))}
          </select>
        </div>

        {/* stats row */}
        <div
          className="flex items-center gap-4 rounded-[10px] px-[13px] py-[10px] text-[12.5px]"
          style={{ background: "var(--surface2)", border: "1px solid var(--line)" }}
        >
          <span style={{ color: "var(--dim)" }}>Wallpapers:</span>
          <span className="font-semibold">{category.totalWallpapers.toLocaleString()}</span>
          <span className="ml-auto" style={{ color: "var(--dim)" }}>Sort order:</span>
          <span className="font-semibold">{category.sortOrder}</span>
        </div>

        {/* actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[10px] px-4 py-[11px] font-semibold text-[13.5px] border cursor-pointer"
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

// ── sortable node ─────────────────────────────────────────────────────────────

function SortableNode({
  node,
  depth,
  allCategories,
  onDelete,
  onEdit,
  onAddChild,
  onDeleteChild,
  onReorderChildren,
}: {
  node: CategoryNode;
  depth: number;
  allCategories: Category[];
  onDelete: (id: number) => void;
  onEdit: (cat: Category) => void;
  onAddChild: (parentId: number, name: string) => void;
  onDeleteChild: (id: number) => void;
  onReorderChildren: (parentId: number, reordered: CategoryNode[]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: node.id });

  const [open, setOpen] = useState(depth === 1);
  const [subDraft, setSubDraft] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const colorBg = DEPTH_COLORS[(depth - 1) % DEPTH_COLORS.length];
  const colorStroke = DEPTH_STROKES[(depth - 1) % DEPTH_STROKES.length];

  const outerStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  async function handleAddChild() {
    if (!subDraft.trim()) return;
    await onAddChild(node.id, subDraft.trim());
    setSubDraft("");
  }

  function handleChildDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = node.children.findIndex((c) => c.id === active.id);
    const newIdx = node.children.findIndex((c) => c.id === over.id);
    onReorderChildren(node.id, arrayMove(node.children, oldIdx, newIdx));
  }

  const hasChildren = node.children.length > 0;
  const canAddChildren = depth < MAX_DEPTH;

  return (
    <div ref={setNodeRef} style={outerStyle}>
      <div
        className="rounded-[12px] overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--line)", marginLeft: depth === 1 ? 0 : 14 }}
      >
        {/* row */}
        <div className="flex items-center gap-2 px-3 py-[11px]">
          <DragHandle listeners={listeners} attributes={attributes} />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-5 h-5 flex items-center justify-center border-none bg-transparent cursor-pointer flex-none"
            style={{ color: "var(--dim2)" }}
          >
            <span className="text-[11px]">{open ? "▾" : "▸"}</span>
          </button>

          <span className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-none" style={{ background: colorBg }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke={colorStroke} strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </span>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex-1 min-w-0 text-left border-none bg-transparent cursor-pointer"
          >
            <span className="font-semibold text-[14px]">{node.name}</span>
            <span className="ml-2 text-[11.5px]" style={{ color: "var(--dim2)" }}>
              {node.totalWallpapers.toLocaleString()} walls
              {node.children.length > 0 && ` · ${node.children.length} sub`}
            </span>
          </button>

          <span
            className="text-[10px] font-bold px-[7px] py-[2px] rounded-full flex-none"
            style={{ background: colorBg, color: colorStroke }}
          >
            L{depth}
          </span>

          {/* edit */}
          <button
            type="button"
            onClick={() => onEdit(node)}
            className="p-1.5 rounded-[7px] border-none bg-transparent cursor-pointer transition-colors hover:bg-[var(--surface2)]"
            style={{ color: "var(--dim2)" }}
            title="Edit"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {/* delete */}
          <button
            type="button"
            onClick={() => onDelete(node.id)}
            className="p-1.5 rounded-[7px] border-none bg-transparent cursor-pointer transition-colors hover:text-[#e5484d]"
            style={{ color: "var(--dim3)" }}
            title="Delete"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* children + add sub */}
        {open && (hasChildren || canAddChildren) && (
          <div className="px-3 pb-3 pt-1 border-t" style={{ borderColor: "var(--line)", background: "var(--bg2)" }}>
            {hasChildren && (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleChildDragEnd}>
                <SortableContext items={node.children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-[6px] mb-2 mt-2">
                    {node.children.map((child) => (
                      <SortableNode
                        key={child.id}
                        node={child}
                        depth={depth + 1}
                        allCategories={allCategories}
                        onDelete={onDeleteChild}
                        onEdit={onEdit}
                        onAddChild={onAddChild}
                        onDeleteChild={onDeleteChild}
                        onReorderChildren={onReorderChildren}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {canAddChildren && (
              <div className="flex gap-2 mt-2">
                <input
                  value={subDraft}
                  onChange={(e) => setSubDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddChild(); }}
                  placeholder={`Add sub-category (level ${depth + 1})…`}
                  className="flex-1 rounded-[8px] px-2.5 py-[7px] text-[12.5px] outline-none"
                  style={{ background: "var(--surface)", border: "1px solid var(--line2)", color: "var(--text)" }}
                />
                <button
                  type="button"
                  onClick={handleAddChild}
                  disabled={!subDraft.trim()}
                  className="px-3 py-[7px] rounded-[8px] text-[12px] font-bold border-none cursor-pointer disabled:opacity-40"
                  style={{ background: "var(--surface3)", border: "1px solid var(--line2)", color: "var(--text)" }}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function AdminCategoriesManager({ categories: initial }: { categories: Category[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [flat, setFlat] = useState<Category[]>(initial);
  const [newCat, setNewCat] = useState("");
  const [adding, setAdding] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const tree = buildTree(flat);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  async function addCategory() {
    if (!newCat.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const created = await apiPost("/api/admin/categories", { name: newCat.trim(), parentId: null });
      setFlat((prev) => [...prev, created]);
      setNewCat("");
      showToast("Category added");
      startTransition(() => router.refresh());
    } catch (e) { setError(String(e)); }
    finally { setAdding(false); }
  }

  async function deleteCategory(id: number) {
    const target = flat.find((c) => c.id === id);
    const hasChildren = flat.some((c) => c.parentId === id);
    const msg = hasChildren
      ? `Delete "${target?.name}" and all its sub-categories?`
      : `Delete "${target?.name}"?`;
    if (!confirm(msg)) return;
    try {
      await apiDel(`/api/admin/categories/${id}`);
      const idsToRemove = new Set<number>();
      function collectIds(parentId: number) {
        idsToRemove.add(parentId);
        for (const c of flat) if (c.parentId === parentId) collectIds(c.id);
      }
      collectIds(id);
      setFlat((prev) => prev.filter((c) => !idsToRemove.has(c.id)));
      showToast("Deleted");
      startTransition(() => router.refresh());
    } catch (e) { setError(String(e)); }
  }

  async function saveEdit(id: number, data: { name: string; slug: string; parentId: number | null }) {
    try {
      const updated = await apiPatch(`/api/admin/categories/${id}`, data);
      setFlat((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
      showToast("Saved");
      startTransition(() => router.refresh());
    } catch (e) { setError(String(e)); throw e; }
  }

  async function addChild(parentId: number, name: string) {
    try {
      const created = await apiPost("/api/admin/categories", { name, parentId });
      setFlat((prev) => [...prev, created]);
      showToast("Sub-category added");
      startTransition(() => router.refresh());
    } catch (e) { setError(String(e)); }
  }

  function reorderChildren(parentId: number, reordered: CategoryNode[]) {
    setFlat((prev) => {
      const updated = new Map(prev.map((c) => [c.id, c]));
      reordered.forEach((node, idx) => {
        const c = updated.get(node.id);
        if (c) updated.set(node.id, { ...c, sortOrder: idx + 1 });
      });
      return Array.from(updated.values());
    });
    apiPost("/api/admin/categories", { action: "reorder", ids: reordered.map((c) => c.id) })
      .catch(() => setError("Reorder failed"));
  }

  function handleRootDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = tree.findIndex((r) => r.id === active.id);
    const newIdx = tree.findIndex((r) => r.id === over.id);
    const reordered = arrayMove(tree, oldIdx, newIdx);
    setFlat((prev) => {
      const updated = new Map(prev.map((c) => [c.id, c]));
      reordered.forEach((node, idx) => {
        const c = updated.get(node.id);
        if (c) updated.set(node.id, { ...c, sortOrder: idx + 1 });
      });
      return Array.from(updated.values());
    });
    apiPost("/api/admin/categories", { action: "reorder", ids: reordered.map((c) => c.id) })
      .catch(() => setError("Reorder failed"));
  }

  const totalCats = flat.filter((c) => c.parentId === null).length;
  const totalSubs = flat.filter((c) => c.parentId !== null).length;

  return (
    <div style={{ animation: "fadeUp .35s ease both" }}>
      {/* edit modal */}
      {editTarget && (
        <EditCategoryModal
          category={editTarget}
          allCategories={flat}
          onClose={() => setEditTarget(null)}
          onSave={saveEdit}
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

      {/* header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-bold text-[26px] tracking-[-0.5px]" style={{ fontFamily: "var(--font-heading)" }}>
            Categories
          </h1>
          <div className="text-[13px] mt-[3px]" style={{ color: "var(--dim)" }}>
            {totalCats} root · {totalSubs} sub-categories · up to {MAX_DEPTH} levels deep
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm mb-4" style={{ background: "rgba(229,72,77,.12)", border: "1px solid rgba(229,72,77,.3)", color: "#ff8a8d" }}>
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-3 font-bold border-none bg-transparent cursor-pointer" style={{ color: "#ff8a8d" }}>✕</button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* tree */}
        <div className="flex-1 min-w-0 w-full">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleRootDragEnd}>
            <SortableContext items={tree.map((n) => n.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-[8px]">
                {tree.length === 0 ? (
                  <div className="rounded-2xl p-10 text-center text-sm" style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--dim)" }}>
                    No categories yet. Add one →
                  </div>
                ) : (
                  tree.map((node) => (
                    <SortableNode
                      key={node.id}
                      node={node}
                      depth={1}
                      allCategories={flat}
                      onDelete={deleteCategory}
                      onEdit={setEditTarget}
                      onAddChild={addChild}
                      onDeleteChild={deleteCategory}
                      onReorderChildren={reorderChildren}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* sidebar: add root */}
        <aside
          className="w-full lg:w-[290px] flex-none rounded-[15px] p-[18px] lg:sticky lg:top-5"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <div className="font-bold text-base mb-[5px]" style={{ fontFamily: "var(--font-heading)" }}>New category</div>
          <div className="text-[12px] mb-4 leading-relaxed" style={{ color: "var(--dim)" }}>
            Root-level categories appear in the public sidebar. Add sub-categories by expanding any row.
          </div>

          <div className="flex items-center gap-1.5 mb-[7px]">
            <span className="w-2 h-2 rounded-full" style={{ background: DEPTH_STROKES[0] }} />
            <label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Name</label>
          </div>
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addCategory(); }}
            placeholder="e.g. Landscapes"
            className="w-full rounded-[10px] px-[13px] py-[11px] text-[14px] outline-none mb-[14px]"
            style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}
          />
          <button
            type="button"
            onClick={addCategory}
            disabled={adding || !newCat.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-[11px] px-4 py-3 font-bold text-[14px] text-white border-none cursor-pointer disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#ff2e63,#ff6a3d)", boxShadow: "0 4px 14px rgba(255,46,99,.28)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            {adding ? "Adding…" : "Add category"}
          </button>

          <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--line)" }}>
            <div className="text-[11px] font-semibold mb-3" style={{ color: "var(--muted)" }}>DEPTH LEVELS</div>
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: MAX_DEPTH }, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-none" style={{ background: DEPTH_STROKES[i] }} />
                  <span className="text-[12px]" style={{ color: "var(--dim)" }}>
                    Level {i + 1}{i === 0 ? " — root (sidebar)" : i === MAX_DEPTH - 1 ? " — deepest" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
