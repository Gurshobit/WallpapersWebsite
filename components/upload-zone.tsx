"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CategoryChipPicker } from "./upload/category-chip-picker";
import { TagInput } from "./upload/tag-input";
import { LicensePicker } from "./upload/license-picker";
import { PreviewEditModal, type CropParams } from "./upload/preview-edit-modal";

// ── Types ────────────────────────────────────────────────────────────────────

interface ResItem {
  id: number;
  typeId: number;
  name: string;
  width: number | null;
  height: number | null;
  sortOrder: number;
}

interface ResGroup {
  type: { id: number; name: string };
  resolutions: ResItem[];
}

interface VariantRow {
  id: number;
  name: string;
  width: number | null;
  height: number | null;
  progress: number;
  done: boolean;
}

type UploadStage = "empty" | "active" | "processing" | "ready" | "error";

interface UploadZoneProps {
  categories: { id: number; name: string }[];
  tags: { id: number; name: string }[];
  licenses: { id: number; name: string }[];
  resolutionGroups: ResGroup[];
  username: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve({ width: img.naturalWidth, height: img.naturalHeight }); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read image")); };
    img.src = url;
  });
}

/** Returns resolution IDs whose aspect ratio is within `tolerance` of the image ratio. */
function detectMatchingResolutions(
  imgW: number,
  imgH: number,
  groups: ResGroup[],
  tolerance = 0.12
): Set<number> {
  const imgRatio = imgW / imgH;
  const matched = new Set<number>();
  for (const g of groups) {
    for (const r of g.resolutions) {
      if (!r.width || !r.height) continue;
      const rRatio = r.width / r.height;
      const diff = Math.abs(imgRatio - rRatio) / Math.max(imgRatio, rRatio);
      if (diff <= tolerance) matched.add(r.id);
    }
  }
  return matched;
}

function allResIds(groups: ResGroup[]): Set<number> {
  const s = new Set<number>();
  for (const g of groups) for (const r of g.resolutions) s.add(r.id);
  return s;
}

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }
function aspectLabel(w: number, h: number) {
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function UploadZone({
  categories,
  tags,
  licenses,
  resolutionGroups,
  username,
}: UploadZoneProps) {
  const t = useTranslations("upload");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<UploadStage>("empty");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  // Details form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [licenseId, setLicenseId] = useState(licenses[0]?.id ?? 0);
  const [isOriginalOwner, setIsOriginalOwner] = useState(true);
  const [originalOwner, setOriginalOwner] = useState("");
  const [originalOwnerUrl, setOriginalOwnerUrl] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  // Resolution selection — null means "all", Set means explicit selection
  const [selectedResIds, setSelectedResIds] = useState<Set<number> | null>(null);
  const [aspectRatioLabel, setAspectRatioLabel] = useState<string | null>(null);
  const [autoDetected, setAutoDetected] = useState(false);

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedTypeIds, setExpandedTypeIds] = useState<Set<number>>(
    new Set(resolutionGroups.map((g) => g.type.id))
  );

  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [error, setError] = useState("");

  // Preview & Edit modal
  const [previewVariant, setPreviewVariant] = useState<VariantRow | null>(null);
  const [cropParams, setCropParams] = useState<Record<number, CropParams>>({});

  const totalResCount = useMemo(() => allResIds(resolutionGroups).size, [resolutionGroups]);
  const selectedCount = selectedResIds === null ? totalResCount : selectedResIds.size;

  const overallProgress = useMemo(() => {
    if (variants.length === 0) return 0;
    const sum = variants.reduce((acc, v) => acc + v.progress, 0);
    return Math.round(sum / variants.length);
  }, [variants]);

  const canSubmit =
    stage === "active" &&
    !!file &&
    categoryIds.length > 0 &&
    licenseId > 0 &&
    (isOriginalOwner || originalOwner.trim().length > 0);

  const isReady = stage === "ready";

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  async function handleFile(next: File) {
    if (!next.type.startsWith("image/")) { setError(t("errorImage")); return; }
    if (next.size > 50 * 1024 * 1024) { setError(t("errorSize")); return; }

    setError("");
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(next);
    setPreview(url);
    setFile(next);
    setTitle(next.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    setStage("active");

    try {
      const size = await readImageSize(next);
      setImageSize(size);

      // Auto-detect matching resolutions by aspect ratio
      const matched = detectMatchingResolutions(size.width, size.height, resolutionGroups);
      if (matched.size > 0 && matched.size < totalResCount) {
        setSelectedResIds(matched);
        setAutoDetected(true);
        setAspectRatioLabel(aspectLabel(size.width, size.height));
      } else {
        // All match or none match — keep all selected
        setSelectedResIds(null);
        setAutoDetected(false);
        setAspectRatioLabel(aspectLabel(size.width, size.height));
      }
    } catch {
      setImageSize(null);
    }
  }

  function resetUpload() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null); setPreview(null); setImageSize(null);
    setStage("empty"); setVariants([]); setError("");
    setTitle(""); setDescription(""); setCategoryIds([]); setTagNames([]);
    setIsOriginalOwner(true); setOriginalOwner(""); setOriginalOwnerUrl("");
    setSelectedResIds(null); setAutoDetected(false); setAspectRatioLabel(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function toggleType(typeId: number) {
    setExpandedTypeIds((prev) => {
      const next = new Set(prev);
      if (next.has(typeId)) next.delete(typeId);
      else next.add(typeId);
      return next;
    });
  }

  function isResSelected(id: number) {
    return selectedResIds === null || selectedResIds.has(id);
  }

  function toggleRes(id: number) {
    setSelectedResIds((prev) => {
      const current = prev ?? allResIds(resolutionGroups);
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (next.size === totalResCount) return null; // back to "all"
      return next;
    });
    setAutoDetected(false);
  }

  function selectAllInGroup(group: ResGroup) {
    setSelectedResIds((prev) => {
      const current = prev ?? allResIds(resolutionGroups);
      const next = new Set(current);
      for (const r of group.resolutions) next.add(r.id);
      if (next.size === totalResCount) return null;
      return next;
    });
  }

  function deselectAllInGroup(group: ResGroup) {
    setSelectedResIds((prev) => {
      const current = prev ?? allResIds(resolutionGroups);
      const next = new Set(current);
      for (const r of group.resolutions) next.delete(r.id);
      return next;
    });
  }

  function groupSelectionState(group: ResGroup): "all" | "none" | "partial" {
    const total = group.resolutions.length;
    const sel = group.resolutions.filter((r) => isResSelected(r.id)).length;
    if (sel === total) return "all";
    if (sel === 0) return "none";
    return "partial";
  }

  const getSelectedResolutions = useCallback((): ResItem[] => {
    const result: ResItem[] = [];
    for (const g of resolutionGroups) {
      for (const r of g.resolutions) {
        if (isResSelected(r.id)) result.push(r);
      }
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolutionGroups, selectedResIds]);

  const publish = useCallback(async () => {
    if (!file || !canSubmit) return;
    setError("");
    const chosenResolutions = getSelectedResolutions();
    const base: VariantRow[] = chosenResolutions.map((r) => ({
      id: r.id, name: r.name, width: r.width, height: r.height, progress: 0, done: false,
    }));
    setVariants(base);
    setStage("processing");

    const intervals = base.map((_, index) =>
      window.setInterval(() => {
        setVariants((current) => {
          const next = current.slice();
          const item = next[index];
          if (!item || item.done) return current;
          let progress = item.progress + Math.random() * 16 + 7;
          if (progress >= 100) progress = 99;
          next[index] = { ...item, progress: Math.round(progress) };
          return next;
        });
      }, 240 + index * 90)
    );

    try {
      const initRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
          title: title.trim() || file.name.replace(/\.[^.]+$/, ""),
          description: description.trim() || undefined,
          categoryIds,
          tagNames,
          licenseId,
          selectedResolutionIds: selectedResIds ? [...selectedResIds] : null,
        }),
      });

      if (!initRes.ok) {
        const data = await initRes.json().catch(() => null);
        throw new Error(data?.error ?? (await initRes.text()));
      }

      const { key, wallpaperId } = await initRes.json();

      // Upload the file through our own API to avoid R2 CORS restrictions
      const fileForm = new FormData();
      fileForm.append("file", file);
      fileForm.append("key", key);
      const putRes = await fetch("/api/upload-file", { method: "POST", body: fileForm });
      if (!putRes.ok) {
        const d = await putRes.json().catch(() => null);
        throw new Error(d?.error ?? "Failed to upload to storage");
      }

      const processRes = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallpaperId }),
      });
      if (!processRes.ok) throw new Error(await processRes.text());

      intervals.forEach((id) => window.clearInterval(id));
      setVariants((current) => current.map((v) => ({ ...v, progress: 100, done: true })));
      setStage("ready");
      router.refresh();
    } catch (err) {
      intervals.forEach((id) => window.clearInterval(id));
      setStage("active");
      setVariants([]);
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    }
  }, [canSubmit, categoryIds, description, file, getSelectedResolutions, licenseId, router, selectedResIds, t, tagNames, title]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const next = e.dataTransfer.files[0];
    if (next) void handleFile(next);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
    {/* Preview & Edit modal */}
    {previewVariant && file && (
      <PreviewEditModal
        file={file}
        resolution={previewVariant}
        initialCrop={cropParams[previewVariant.id]}
        onApply={(params) => setCropParams((prev) => ({ ...prev, [previewVariant.id]: params }))}
        onClose={() => setPreviewVariant(null)}
      />
    )}
    <div className="max-w-[1120px] mx-auto px-4 sm:px-7 py-8 pb-[60px]" style={{ animation: "fadeUp .4s ease both" }}>
      {/* Page header */}
      <div className="mb-7">
        <h1 className="font-bold text-[28px] sm:text-[32px] tracking-[-0.7px] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          {t("pageTitle")}
        </h1>
        <p className="text-[15px] max-w-[600px] leading-[1.6]" style={{ color: "var(--muted)" }}>
          {t("pageSubtitle")}
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── LEFT COLUMN ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Drop zone */}
          {stage === "empty" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-[18px] px-8 py-14 text-center cursor-pointer transition-all"
              style={{
                border: `2px dashed ${dragOver ? "rgba(255,46,99,.6)" : "var(--line3)"}`,
                background: dragOver
                  ? "radial-gradient(120% 120% at 50% 0%, rgba(255,46,99,.1), transparent 60%)"
                  : "radial-gradient(120% 120% at 50% 0%, rgba(255,46,99,.05), transparent 60%)",
              }}
            >
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const n = e.target.files?.[0]; if (n) void handleFile(n); }} />
              <div className="w-[72px] h-[72px] rounded-[20px] mx-auto mb-5 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #ff2e63, #ff6a3d)", boxShadow: "0 8px 30px rgba(255,46,99,.4)", animation: "pulseGlow 2.4s infinite" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M12 16V4m0 0 5 5m-5-5L7 9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="font-bold text-[19px] mb-1.5" style={{ fontFamily: "var(--font-heading)" }}>
                {t("dropzoneTitle")}
              </div>
              <div className="text-sm mb-5" style={{ color: "var(--muted)" }}>
                {t("dropzoneHint")}
              </div>
              <span className="inline-flex items-center gap-2 rounded-[11px] px-5 py-[11px] font-bold text-sm cursor-pointer"
                style={{ background: "var(--line)", border: "1px solid var(--line2)", color: "var(--text)" }}>
                {t("selectImage")}
              </span>
              <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
                {["JPG", "PNG", "WEBP", "AVIF"].map((fmt) => (
                  <span key={fmt} className="text-[11.5px] px-2.5 py-1 rounded-[7px] font-bold"
                    style={{ background: "var(--surface2)", color: "var(--dim)", border: "1px solid var(--line)" }}>{fmt}</span>
                ))}
                <span className="text-[11.5px]" style={{ color: "var(--dim2)" }}>· Max 50 MB</span>
              </div>
            </div>
          )}

          {/* File preview card */}
          {stage !== "empty" && (
            <div className="flex gap-4 rounded-[15px] p-4 items-start"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <div className="w-[120px] h-[76px] rounded-[9px] overflow-hidden flex-none">
                {preview
                  ? <img src={preview} alt="" className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                  : <div className="w-full h-full" style={{ background: "linear-gradient(135deg, var(--surface2), var(--track))" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold mb-0.5 truncate">{file?.name}</div>
                <div className="text-[12px] flex items-center gap-2 flex-wrap" style={{ color: "var(--dim)" }}>
                  {t("originalLabel")}
                  {imageSize && <>{imageSize.width} × {imageSize.height}</>}
                  {file && <>{formatBytes(file.size)}</>}
                  {aspectRatioLabel && (
                    <span className="px-[7px] py-[2px] rounded-[6px] text-[11px] font-bold"
                      style={{ background: "rgba(34,211,238,.1)", color: "#22d3ee", border: "1px solid rgba(34,211,238,.25)" }}>
                      {aspectRatioLabel}
                    </span>
                  )}
                </div>
                {stage !== "active" && stage !== "error" && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold" style={{ color: "#30a46c" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6 9 17l-5-5" stroke="#30a46c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t("sourceUploaded")}
                  </div>
                )}
              </div>
              <button type="button" onClick={resetUpload}
                className="self-start rounded-[9px] px-[13px] py-[7px] text-[12.5px] font-semibold cursor-pointer flex-none"
                style={{ background: "transparent", border: "1px solid var(--line2)", color: "var(--muted)" }}>
                {t("replace")}
              </button>
            </div>
          )}

          {/* Auto-detected aspect ratio notice */}
          {autoDetected && stage === "active" && (
            <div className="flex items-start gap-2.5 rounded-[12px] px-4 py-3 text-[13px]"
              style={{ background: "rgba(34,211,238,.07)", border: "1px solid rgba(34,211,238,.2)", color: "var(--text)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-none mt-[1px]">
                <path d="M12 2L2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <span className="font-semibold" style={{ color: "#22d3ee" }}>Aspect ratio detected: {aspectRatioLabel}</span>
                <span style={{ color: "var(--muted)" }}> — {selectedCount} matching resolution{selectedCount !== 1 ? "s" : ""} auto-selected.{" "}</span>
                <button type="button" onClick={() => { setSelectedResIds(null); setAutoDetected(false); setShowAdvanced(true); }}
                  className="font-semibold underline cursor-pointer" style={{ color: "#22d3ee" }}>
                  Show all
                </button>
              </div>
            </div>
          )}

          {/* Variant generation progress */}
          {(stage === "processing" || stage === "ready") && variants.length > 0 && (
            <div className="rounded-[15px] p-5" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="font-bold text-[15px]" style={{ fontFamily: "var(--font-heading)" }}>{t("generatingTitle")}</div>
                  <div className="text-[12px] mt-0.5" style={{ color: "var(--dim)" }}>{t("generatingSubtitle")}</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-[18px]" style={{ fontFamily: "var(--font-heading)", color: "#22d3ee" }}>{overallProgress}%</span>
                  {stage === "processing"
                    ? <span className="w-[18px] h-[18px] border-2 rounded-full inline-block"
                        style={{ borderColor: "rgba(34,211,238,.25)", borderTopColor: "#22d3ee", animation: "spin .7s linear infinite" }} />
                    : <span className="w-5 h-5 rounded-full inline-flex items-center justify-center" style={{ background: "#30a46c" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>
                      </span>}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {variants.map((v) => (
                  <div key={v.id}>
                    <div className="flex items-center gap-3 mb-[7px]">
                      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-bold">{v.name}</span>
                        {v.width && v.height && (
                          <span className="text-[11.5px]" style={{ color: "var(--dim)" }}>{v.width} × {v.height}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-none">
                        <span className="text-[12px] font-semibold min-w-[30px] text-right"
                          style={{ color: v.done ? "#30a46c" : "var(--muted)" }}>
                          {v.done ? "✓" : `${v.progress}%`}
                        </span>
                        {v.done && (
                          <button type="button"
                            onClick={() => setPreviewVariant(v)}
                            className="flex items-center gap-1.5 rounded-[8px] px-[10px] py-[5px] text-[11.5px] font-semibold transition-colors cursor-pointer"
                            style={cropParams[v.id]
                              ? { background: "rgba(255,46,99,.1)", border: "1px solid rgba(255,46,99,.4)", color: "#ff6a8a" }
                              : { background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--muted)" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {cropParams[v.id] ? "Cropped ✓" : "Preview & Edit"}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="h-[6px] rounded-full overflow-hidden" style={{ background: "var(--track)" }}>
                      <div className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${v.progress}%`, background: v.done ? "#30a46c" : "linear-gradient(90deg, #22d3ee, #8b5cf6)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Advanced Options ─────────────────────────────────────────────── */}
          {stage === "active" && (
            <div>
              <button type="button" onClick={() => setShowAdvanced((v) => !v)}
                className="flex items-center gap-2 text-[13px] font-semibold cursor-pointer transition-colors"
                style={{ color: showAdvanced ? "#ff6a8a" : "var(--muted)" }}>
                <span
                  className="w-5 h-5 rounded-[6px] flex items-center justify-center transition-transform"
                  style={{ background: showAdvanced ? "rgba(255,46,99,.12)" : "var(--surface2)", border: "1px solid var(--line2)", transform: showAdvanced ? "rotate(45deg)" : "none" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </span>
                Advanced Options
                {!showAdvanced && selectedResIds !== null && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                    style={{ background: "rgba(34,211,238,.12)", color: "#22d3ee", border: "1px solid rgba(34,211,238,.25)" }}>
                    {selectedCount} resolutions selected
                  </span>
                )}
              </button>

              {showAdvanced && (
                <div className="mt-4 flex flex-col gap-4">
                  {/* Description */}
                  <div className="rounded-[15px] p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>Description</div>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                      rows={3} placeholder="Describe the scene, location, mood, camera details…"
                      className="w-full rounded-[10px] px-[13px] py-[11px] text-sm outline-none resize-none transition-colors focus:border-[rgba(255,46,99,.5)]"
                      style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)", lineHeight: "1.55" }} />
                  </div>

                  {/* Visibility */}
                  <div className="rounded-[15px] p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                    <div className="text-xs font-semibold mb-2.5" style={{ color: "var(--muted)" }}>Visibility</div>
                    <div className="flex gap-2">
                      {(["public", "private"] as const).map((v) => (
                        <button key={v} type="button" onClick={() => setVisibility(v)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-[10px] py-[9px] text-[13px] font-semibold transition-all cursor-pointer"
                          style={visibility === v
                            ? { background: "rgba(255,46,99,.12)", color: "#ff6a8a", border: "1px solid rgba(255,46,99,.35)" }
                            : { background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--line)" }}>
                          {v === "public"
                            ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 3c2 3 3 5.5 3 9s-1 6-3 9M12 3c-2 3-3 5.5-3 9s1 6 3 9M3 12h18" stroke="currentColor" strokeWidth="2"/></svg>
                            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2"/></svg>}
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resolution Groups */}
                  <div className="rounded-[15px] overflow-hidden" style={{ border: "1px solid var(--line)" }}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3"
                      style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
                      <div>
                        <div className="font-bold text-[13.5px]" style={{ fontFamily: "var(--font-heading)" }}>
                          Resolutions to generate
                        </div>
                        <div className="text-[11.5px] mt-0.5" style={{ color: "var(--dim)" }}>
                          {selectedCount} of {totalResCount} selected
                          {autoDetected && <span style={{ color: "#22d3ee" }}> · auto-detected</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setSelectedResIds(null)}
                          className="text-[12px] font-semibold cursor-pointer" style={{ color: "#ff6a8a" }}>
                          Select all
                        </button>
                        <button type="button" onClick={() => setSelectedResIds(new Set())}
                          className="text-[12px] font-semibold cursor-pointer" style={{ color: "var(--dim)" }}>
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Groups */}
                    {resolutionGroups.map((group, gi) => {
                      const open = expandedTypeIds.has(group.type.id);
                      const state = groupSelectionState(group);

                      return (
                        <div key={group.type.id}
                          style={{ borderBottom: gi < resolutionGroups.length - 1 ? "1px solid var(--line)" : "none" }}>
                          {/* Group header */}
                          <button type="button"
                            onClick={() => toggleType(group.type.id)}
                            className="w-full flex items-center gap-3 px-4 py-[10px] transition-colors hover:bg-[var(--surface2)] cursor-pointer"
                            style={{ background: "var(--surface)" }}>
                            {/* Group checkbox */}
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                state === "all" ? deselectAllInGroup(group) : selectAllInGroup(group);
                              }}
                              className="w-[17px] h-[17px] rounded-[4px] flex items-center justify-center flex-none cursor-pointer"
                              style={{
                                border: `2px solid ${state === "none" ? "var(--line2)" : "#ff2e63"}`,
                                background: state === "all" ? "#ff2e63" : state === "partial" ? "rgba(255,46,99,.25)" : "transparent",
                              }}>
                              {state !== "none" && (
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                                  <path d={state === "all" ? "M20 6 9 17l-5-5" : "M5 12h14"}
                                    stroke={state === "all" ? "#fff" : "#ff2e63"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                            <span className="flex-1 text-[13px] font-bold text-left">{group.type.name}</span>
                            <span className="text-[11.5px] mr-1" style={{ color: "var(--dim)" }}>
                              {group.resolutions.filter((r) => isResSelected(r.id)).length}/{group.resolutions.length}
                            </span>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                              className="transition-transform" style={{ transform: open ? "rotate(180deg)" : "none", color: "var(--dim2)" }}>
                              <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>

                          {/* Resolution rows */}
                          {open && (
                            <div style={{ background: "var(--surface2)" }}>
                              {group.resolutions.map((res, ri) => {
                                const sel = isResSelected(res.id);
                                return (
                                  <button key={res.id} type="button" onClick={() => toggleRes(res.id)}
                                    className="w-full flex items-center gap-3 px-4 py-[9px] transition-colors hover:bg-[var(--surface)] cursor-pointer"
                                    style={{ borderTop: ri > 0 ? "1px solid var(--line)" : "none" }}>
                                    <div className="w-[16px] h-[16px] rounded-[4px] flex items-center justify-center flex-none"
                                      style={{ border: `2px solid ${sel ? "#ff2e63" : "var(--line2)"}`, background: sel ? "#ff2e63" : "transparent" }}>
                                      {sel && (
                                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                                          <path d="M20 6 9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      )}
                                    </div>
                                    <span className="flex-1 text-[12.5px] font-semibold text-left" style={{ color: sel ? "var(--text)" : "var(--muted)" }}>
                                      {res.name}
                                    </span>
                                    {res.width && res.height && (
                                      <span className="text-[11.5px] flex-none" style={{ color: "var(--dim2)" }}>
                                        {res.width} × {res.height}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN — Details form ── */}
        <aside className="w-full lg:w-[380px] flex-none rounded-[15px] p-[18px] flex flex-col gap-[15px] lg:sticky lg:top-[84px]"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div className="font-bold text-[15.5px]" style={{ fontFamily: "var(--font-heading)" }}>
            {t("detailsTitle")}
          </div>

          <Field label={t("titleLabel")}>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Aurora Fjord at Midnight" className="upload-field" />
          </Field>

          <Field label={`${t("categoryLabel")} · pick all that apply`}>
            <CategoryChipPicker categories={categories} value={categoryIds} onChange={setCategoryIds}
              searchPlaceholder={t("searchCategories")} />
          </Field>

          <Field label={t("tagsLabel")}>
            <TagInput tags={tags} value={tagNames} onChange={setTagNames} placeholder={t("tagsPlaceholder")} />
          </Field>

          <Field label={t("licenseLabel")}>
            <LicensePicker licenses={licenses} value={licenseId} onChange={setLicenseId} />
          </Field>

          {/* Creator attribution */}
          <div className="rounded-xl p-[13px] flex flex-col gap-[11px]"
            style={{ background: "var(--surface2)", border: "1px solid var(--line)" }}>
            <div className="text-xs font-bold mb-0.5">{t("attributionTitle")}</div>
            <ToggleRow checked={isOriginalOwner} onClick={() => setIsOriginalOwner(true)} label={t("originalCreator")} />
            <ToggleRow checked={!isOriginalOwner} onClick={() => setIsOriginalOwner(false)} label={t("onBehalf")} />

            {!isOriginalOwner && (
              <div className="pt-[11px] flex flex-col gap-2" style={{ borderTop: "1px solid var(--line)" }}>
                <Field label={t("creatorNameLabel")} required>
                  <input value={originalOwner} onChange={(e) => setOriginalOwner(e.target.value)}
                    placeholder={t("creatorNamePlaceholder")} className="upload-field-sm" />
                </Field>
                <Field label={t("creatorUrlLabel")}>
                  <input value={originalOwnerUrl} onChange={(e) => setOriginalOwnerUrl(e.target.value)}
                    placeholder={t("creatorUrlPlaceholder")} className="upload-field-sm" />
                </Field>
                <div className="flex items-start gap-[7px] text-[11.5px] leading-[1.5] rounded-lg px-2.5 py-2"
                  style={{ color: "var(--dim)", background: "rgba(245,197,24,.08)", border: "1px solid rgba(245,197,24,.2)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-none mt-px">
                    <circle cx="12" cy="12" r="9" stroke="#f5c518" strokeWidth="2"/>
                    <path d="M12 8v4m0 4v.01" stroke="#f5c518" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  {t("attributionWarning")}
                </div>
              </div>
            )}

            {isOriginalOwner && (
              <div className="flex items-center gap-2 pt-1.5">
                <div className="w-7 h-7 rounded-full flex-none flex items-center justify-center text-[11px] font-bold"
                  style={{ background: "linear-gradient(135deg, #ff2e63, #ff6a3d)", color: "#fff" }}>
                  {username.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-[12.5px]" style={{ color: "var(--muted)" }}>
                  {t("creditedAs")}{" "}
                  <span className="font-semibold" style={{ color: "var(--text)" }}>{username}</span>
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-[10px] px-3 py-2.5 text-sm"
              style={{ background: "rgba(255,46,99,.08)", border: "1px solid rgba(255,46,99,.25)", color: "#ff6a8a" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-none mt-[2px]">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4m0 4v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <button type="button" onClick={() => void publish()}
            disabled={stage === "processing" || (!canSubmit && !isReady)}
            className="flex items-center justify-center gap-2 rounded-xl py-[13px] font-bold text-[15px] transition-all disabled:cursor-not-allowed"
            style={
              isReady
                ? { background: "#30a46c", color: "#fff", boxShadow: "0 4px 16px rgba(48,164,108,.3)" }
                : canSubmit
                  ? { background: "linear-gradient(135deg, #ff2e63, #ff6a3d)", color: "#fff", boxShadow: "0 4px 16px rgba(255,46,99,.3)" }
                  : { background: "var(--track)", color: "var(--muted)", opacity: 0.55 }
            }>
            {stage === "processing" ? (
              <>
                <span className="w-[16px] h-[16px] border-2 rounded-full"
                  style={{ borderColor: "rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "spin .7s linear infinite" }} />
                Processing…
              </>
            ) : isReady ? (
              <>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6 9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t("success")}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 16V4m0 0 5 5m-5-5L7 9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
                {t("publish")}
              </>
            )}
          </button>

          <div className="text-[11.5px] text-center leading-[1.5]" style={{ color: "var(--dim2)" }}>
            {t("moderationNote")}
          </div>
        </aside>
      </div>
    </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-[7px]" style={{ color: "var(--muted)" }}>
        {label}{required && <span style={{ color: "#ff2e63" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2.5 text-left cursor-pointer">
      <div className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center flex-none"
        style={{ border: `2px solid ${checked ? "#ff2e63" : "var(--line2)"}`, background: checked ? "#ff2e63" : "transparent" }}>
        {checked && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M20 6 9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{label}</span>
    </button>
  );
}
