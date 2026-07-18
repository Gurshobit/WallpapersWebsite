import { sanitizeHtml } from "@/lib/sanitize";

/**
 * Renders sanitized rich-text HTML produced by the RichTextEditor.
 * Safe to use in both server and client components.
 */
export function RichContent({
  html,
  className = "rte-prose",
  style,
}: {
  html: string | null | undefined;
  className?: string;
  style?: React.CSSProperties;
}) {
  const clean = sanitizeHtml(html);
  if (!clean.trim()) return null;
  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
