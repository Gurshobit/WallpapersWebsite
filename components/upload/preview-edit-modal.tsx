"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CropParams {
  zoom: number; // 1.0 = minimum to cover, higher = more zoomed in
  x: number;   // 0–100 horizontal pan position
  y: number;   // 0–100 vertical pan position
}

interface ResItem {
  id: number;
  name: string;
  width: number | null;
  height: number | null;
}

interface Props {
  file: File;
  resolution: ResItem;
  initialCrop?: CropParams;
  onApply: (params: CropParams) => void;
  onClose: () => void;
}

const DEFAULT_CROP: CropParams = { zoom: 1.0, x: 50, y: 50 };
const CANVAS_MAX_H = 340; // px — max preview height

// ── Component ─────────────────────────────────────────────────────────────────

export function PreviewEditModal({ file, resolution, initialCrop, onApply, onClose }: Props) {
  const resW = resolution.width ?? 1920;
  const resH = resolution.height ?? 1080;
  const targetAR = resW / resH;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [crop, setCrop] = useState<CropParams>(initialCrop ?? DEFAULT_CROP);
  const [isDirty, setIsDirty] = useState(!!initialCrop);

  // Derived canvas dimensions (fit in modal, respect AR)
  const canvasH = CANVAS_MAX_H;
  const canvasW = Math.round(canvasH * targetAR);

  // Max zoom: max that keeps image covering canvas (capped at 4×)
  const getMaxZoom = useCallback(() => {
    const img = imgRef.current;
    if (!img) return 4;
    const srcAR = img.naturalWidth / img.naturalHeight;
    const baseScale = srcAR > targetAR
      ? canvasH / img.naturalHeight
      : canvasW / img.naturalWidth;
    // At zoom=4 the image is 4× over cover — reasonable upper limit
    return 4;
  }, [canvasH, canvasW, targetAR]);

  // Load image once
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { imgRef.current = img; setLoaded(true); };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Draw on canvas whenever crop changes
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !loaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const srcAR = img.naturalWidth / img.naturalHeight;

    // Base scale to cover canvas (zoom=1)
    const baseScale = srcAR > w / h
      ? h / img.naturalHeight
      : w / img.naturalWidth;

    const scale = baseScale * crop.zoom;
    const rendW = img.naturalWidth * scale;
    const rendH = img.naturalHeight * scale;

    // Pan offsets (ensure image always covers canvas)
    const maxOffX = Math.max(0, rendW - w);
    const maxOffY = Math.max(0, rendH - h);
    const offX = -(crop.x / 100) * maxOffX;
    const offY = -(crop.y / 100) * maxOffY;

    // Clear + draw image
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, offX, offY, rendW, rendH);

    // Rule-of-thirds grid
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo((w / 3) * i, 0); ctx.lineTo((w / 3) * i, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, (h / 3) * i); ctx.lineTo(w, (h / 3) * i); ctx.stroke();
    }

    // Border
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0.75, 0.75, w - 1.5, h - 1.5);
  }, [crop, loaded]);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [draw]);

  // Drag-to-pan on canvas
  const dragRef = useRef<{ startX: number; startY: number; startCropX: number; startCropY: number } | null>(null);

  function onCanvasMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, startCropX: crop.x, startCropY: crop.y };
  }

  function onCanvasMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!dragRef.current) return;
    const img = imgRef.current;
    if (!img) return;
    const srcAR = img.naturalWidth / img.naturalHeight;
    const baseScale = srcAR > canvasW / canvasH
      ? canvasH / img.naturalHeight
      : canvasW / img.naturalWidth;
    const scale = baseScale * crop.zoom;
    const rendW = img.naturalWidth * scale;
    const rendH = img.naturalHeight * scale;
    const maxOffX = Math.max(0, rendW - canvasW);
    const maxOffY = Math.max(0, rendH - canvasH);

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    const newX = maxOffX > 0 ? Math.max(0, Math.min(100, dragRef.current.startCropX - (dx / maxOffX) * 100)) : 50;
    const newY = maxOffY > 0 ? Math.max(0, Math.min(100, dragRef.current.startCropY - (dy / maxOffY) * 100)) : 50;

    setCrop((c) => ({ ...c, x: newX, y: newY }));
    setIsDirty(true);
  }

  function onCanvasMouseUp() { dragRef.current = null; }

  // Touch support
  function onTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    const t = e.touches[0];
    if (!t) return;
    dragRef.current = { startX: t.clientX, startY: t.clientY, startCropX: crop.x, startCropY: crop.y };
  }

  function onTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
    const t = e.touches[0];
    if (!t || !dragRef.current) return;
    const img = imgRef.current;
    if (!img) return;
    const srcAR = img.naturalWidth / img.naturalHeight;
    const baseScale = srcAR > canvasW / canvasH
      ? canvasH / img.naturalHeight
      : canvasW / img.naturalWidth;
    const scale = baseScale * crop.zoom;
    const rendW = img.naturalWidth * scale;
    const rendH = img.naturalHeight * scale;
    const maxOffX = Math.max(0, rendW - canvasW);
    const maxOffY = Math.max(0, rendH - canvasH);

    const dx = t.clientX - dragRef.current.startX;
    const dy = t.clientY - dragRef.current.startY;

    const newX = maxOffX > 0 ? Math.max(0, Math.min(100, dragRef.current.startCropX - (dx / maxOffX) * 100)) : 50;
    const newY = maxOffY > 0 ? Math.max(0, Math.min(100, dragRef.current.startCropY - (dy / maxOffY) * 100)) : 50;

    setCrop((c) => ({ ...c, x: newX, y: newY }));
    setIsDirty(true);
  }

  function resetToAuto() {
    setCrop(DEFAULT_CROP);
    setIsDirty(false);
  }

  function handleApply() {
    onApply(crop);
    onClose();
  }

  const maxZoom = getMaxZoom();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.85)", backdropFilter: "blur(6px)" }}>
      <div
        className="relative w-full flex flex-col rounded-[20px] overflow-hidden shadow-2xl"
        style={{
          maxWidth: Math.min(canvasW + 280, 900),
          background: "var(--surface)",
          border: "1px solid var(--line)",
          boxShadow: "0 32px 80px rgba(0,0,0,.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4"
          style={{ borderBottom: "1px solid var(--line)" }}>
          <div>
            <div className="font-bold text-[16px]" style={{ fontFamily: "var(--font-heading)" }}>
              Preview &amp; Edit — {resolution.name}
            </div>
            <div className="text-[12.5px] mt-0.5" style={{ color: "var(--dim)" }}>
              {resW} × {resH} · Drag canvas to pan · Use slider to zoom
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center flex-none cursor-pointer transition-colors"
            style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--muted)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row">
          {/* Canvas area */}
          <div className="flex-1 min-w-0 p-4 flex items-center justify-center"
            style={{ background: "#0a0a0a" }}>
            <div className="relative" style={{ lineHeight: 0 }}>
              {!loaded && (
                <div
                  className="flex items-center justify-center rounded-[8px]"
                  style={{ width: Math.min(canvasW, 520), height: Math.round(Math.min(canvasW, 520) / targetAR), background: "var(--surface2)" }}>
                  <span className="w-6 h-6 border-2 rounded-full"
                    style={{ borderColor: "rgba(34,211,238,.2)", borderTopColor: "#22d3ee", animation: "spin .7s linear infinite" }} />
                </div>
              )}
              <canvas
                ref={canvasRef}
                width={Math.min(canvasW, 520) * 2}
                height={Math.round(Math.min(canvasW, 520) / targetAR) * 2}
                style={{
                  width: Math.min(canvasW, 520),
                  height: Math.round(Math.min(canvasW, 520) / targetAR),
                  borderRadius: 8,
                  cursor: "grab",
                  display: loaded ? "block" : "none",
                  userSelect: "none",
                }}
                onMouseDown={onCanvasMouseDown}
                onMouseMove={onCanvasMouseMove}
                onMouseUp={onCanvasMouseUp}
                onMouseLeave={onCanvasMouseUp}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onCanvasMouseUp}
              />
              {/* Dimension badge */}
              <div className="absolute bottom-2.5 right-2.5 px-2.5 py-[4px] rounded-[7px] text-[11px] font-bold"
                style={{ background: "rgba(0,0,0,.6)", color: "rgba(255,255,255,.7)", backdropFilter: "blur(4px)" }}>
                {resW} × {resH}
              </div>
              {isDirty && (
                <div className="absolute top-2.5 left-2.5 px-2.5 py-[4px] rounded-[7px] text-[11px] font-bold"
                  style={{ background: "rgba(255,46,99,.85)", color: "#fff" }}>
                  Custom crop
                </div>
              )}
            </div>
          </div>

          {/* Controls panel */}
          <div className="flex flex-col gap-5 p-5 md:w-[260px] flex-none"
            style={{ borderLeft: "1px solid var(--line)" }}>

            {/* Zoom */}
            <SliderControl
              label="Zoom"
              value={crop.zoom}
              min={1}
              max={maxZoom}
              step={0.01}
              displayValue={`${crop.zoom.toFixed(2)}×`}
              onChange={(v) => { setCrop((c) => ({ ...c, zoom: v })); setIsDirty(true); }}
            />

            {/* Horizontal */}
            <SliderControl
              label="Horizontal position"
              value={crop.x}
              min={0}
              max={100}
              step={0.5}
              displayValue={`${Math.round(crop.x)}%`}
              onChange={(v) => { setCrop((c) => ({ ...c, x: v })); setIsDirty(true); }}
            />

            {/* Vertical */}
            <SliderControl
              label="Vertical position"
              value={crop.y}
              min={0}
              max={100}
              step={0.5}
              displayValue={`${Math.round(crop.y)}%`}
              onChange={(v) => { setCrop((c) => ({ ...c, y: v })); setIsDirty(true); }}
            />

            {/* Quick presets */}
            <div>
              <div className="text-xs font-semibold mb-2" style={{ color: "var(--dim)" }}>Quick position</div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: "TL", x: 0, y: 0 }, { label: "TC", x: 50, y: 0 }, { label: "TR", x: 100, y: 0 },
                  { label: "ML", x: 0, y: 50 }, { label: "C", x: 50, y: 50 }, { label: "MR", x: 100, y: 50 },
                  { label: "BL", x: 0, y: 100 }, { label: "BC", x: 50, y: 100 }, { label: "BR", x: 100, y: 100 },
                ].map((p) => (
                  <button key={p.label} type="button"
                    onClick={() => { setCrop((c) => ({ ...c, x: p.x, y: p.y })); setIsDirty(p.x !== 50 || p.y !== 50); }}
                    className="h-[28px] rounded-[7px] text-[11px] font-bold transition-colors cursor-pointer"
                    style={{
                      background: Math.round(crop.x) === p.x && Math.round(crop.y) === p.y
                        ? "rgba(255,46,99,.15)"
                        : "var(--surface2)",
                      border: Math.round(crop.x) === p.x && Math.round(crop.y) === p.y
                        ? "1px solid rgba(255,46,99,.4)"
                        : "1px solid var(--line)",
                      color: Math.round(crop.x) === p.x && Math.round(crop.y) === p.y
                        ? "#ff6a8a"
                        : "var(--dim)",
                    }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1" />

            {/* Buttons */}
            <div className="flex flex-col gap-2.5">
              <button type="button" onClick={handleApply}
                className="flex items-center justify-center gap-2 rounded-[11px] py-[11px] font-bold text-[14px] transition-all cursor-pointer"
                style={{ background: "linear-gradient(135deg, #ff2e63, #ff6a3d)", color: "#fff", boxShadow: "0 4px 16px rgba(255,46,99,.35)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6 9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                Apply crop
              </button>
              <button type="button" onClick={resetToAuto}
                className="flex items-center justify-center gap-2 rounded-[11px] py-[11px] font-semibold text-[13.5px] transition-colors cursor-pointer"
                style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--muted)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Reset to auto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Slider sub-component ──────────────────────────────────────────────────────

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12.5px] font-semibold" style={{ color: "var(--text)" }}>{label}</span>
        <span className="text-[12.5px] font-bold tabular-nums" style={{ color: "#ff6a8a" }}>{displayValue}</span>
      </div>
      <div className="relative h-[20px] flex items-center">
        {/* Track */}
        <div className="absolute inset-x-0 h-[5px] rounded-full overflow-hidden" style={{ background: "var(--track)" }}>
          <div className="h-full rounded-full transition-none"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, #ff2e63, #ff6a3d)" }} />
        </div>
        {/* Native input (invisible, layered on top) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ zIndex: 2 }}
        />
        {/* Custom thumb */}
        <div className="absolute w-[18px] h-[18px] rounded-full shadow-md pointer-events-none"
          style={{
            left: `calc(${pct}% - 9px)`,
            background: "#fff",
            border: "2.5px solid #ff2e63",
            boxShadow: "0 2px 8px rgba(255,46,99,.4)",
            zIndex: 1,
          }} />
      </div>
    </div>
  );
}
