"use client";

import { useId } from "react";

type SwitchSize = "sm" | "md";

const SIZE: Record<
  SwitchSize,
  { track: string; thumb: string; translate: string }
> = {
  sm: { track: "w-10 h-[22px]", thumb: "w-[18px] h-[18px]", translate: "18px" },
  md: { track: "w-[46px] h-[26px]", thumb: "w-[22px] h-[22px]", translate: "20px" },
};

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  size = "md",
  id,
  className = "",
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
  size?: SwitchSize;
  id?: string;
  className?: string;
  "aria-label"?: string;
}) {
  const autoId = useId();
  const switchId = id ?? autoId;
  const dims = SIZE[size];

  return (
    <button
      id={switchId}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`relative flex-none rounded-full border-none cursor-pointer transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,46,99,.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:opacity-45 disabled:cursor-not-allowed ${dims.track} ${className}`}
      style={{
        background: checked
          ? "linear-gradient(135deg, #2ecc71, #30a46c)"
          : "var(--track)",
        boxShadow: checked
          ? "0 0 0 1px rgba(48,164,108,.35), 0 4px 14px rgba(48,164,108,.28)"
          : "inset 0 1px 2px rgba(0,0,0,.18)",
      }}
    >
      <span
        aria-hidden
        className={`absolute top-[2px] left-[2px] rounded-full bg-white transition-transform duration-220 ease-[cubic-bezier(.34,1.45,.64,1)] ${dims.thumb}`}
        style={{
          transform: checked ? `translateX(${dims.translate})` : "translateX(0)",
          boxShadow: checked
            ? "0 2px 8px rgba(0,0,0,.28)"
            : "0 1px 4px rgba(0,0,0,.22)",
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-between px-1.5 text-[9px] font-bold uppercase tracking-wide pointer-events-none select-none"
        style={{ color: checked ? "rgba(255,255,255,.85)" : "var(--dim3)" }}
      >
        <span style={{ opacity: checked ? 1 : 0, transition: "opacity .15s" }}>
          On
        </span>
        <span style={{ opacity: checked ? 0 : 1, transition: "opacity .15s" }}>
          Off
        </span>
      </span>
    </button>
  );
}

export function SwitchField({
  checked,
  onCheckedChange,
  label,
  hint,
  disabled = false,
  border = true,
  size = "md",
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  label: string;
  hint: string;
  disabled?: boolean;
  border?: boolean;
  size?: SwitchSize;
}) {
  const labelId = useId();

  return (
    <div
      className={`flex items-center justify-between gap-4 py-3.5 ${border ? "border-b" : ""}`}
      style={{ borderColor: "var(--line)" }}
    >
      <div className="min-w-0">
        <div id={labelId} className="text-[14px] font-semibold leading-snug">
          {label}
        </div>
        <div className="text-[12.5px] mt-0.5 leading-relaxed" style={{ color: "var(--dim)" }}>
          {hint}
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        size={size}
        aria-label={label}
        className="shrink-0"
      />
    </div>
  );
}
