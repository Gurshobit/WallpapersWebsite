export function formatCount(value: number | null | undefined): string {
  const n = value ?? 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString();
}

export function formatBytes(bytes: number | null | undefined): string {
  const n = bytes ?? 0;
  if (n >= 1_099_511_627_776) {
    return `${(n / 1_099_511_627_776).toFixed(1).replace(/\.0$/, "")} TB`;
  }
  if (n >= 1_073_741_824) {
    return `${(n / 1_073_741_824).toFixed(1).replace(/\.0$/, "")} GB`;
  }
  if (n >= 1_048_576) {
    return `${(n / 1_048_576).toFixed(1).replace(/\.0$/, "")} MB`;
  }
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} B`;
}

export function formatPercentChange(current: number, previous: number): string {
  if (previous <= 0) {
    return current > 0 ? "+100%" : "0%";
  }
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1).replace(/\.0$/, "")}%`;
}
