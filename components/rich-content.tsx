/**
 * Renders rich-text HTML produced by the RichTextEditor.
 *
 * IMPORTANT: `html` must already be sanitized (via `sanitizeHtml` from
 * `lib/sanitize`, on the server). This component is a dumb renderer with no
 * dependencies so it is safe to use in both server and client components.
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
  if (!html || !html.trim()) return null;
  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
