/**
 * Strip all HTML tags down to plain text. Pure-regex and dependency-free, so
 * it is safe to use in both server and client components (e.g. for card
 * previews, line-clamped text, and SEO meta descriptions).
 *
 * NOTE: This is for producing safe *plain text*, not for sanitizing HTML that
 * will be rendered with dangerouslySetInnerHTML. For that, use `sanitizeHtml`
 * from `lib/sanitize` (server only).
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
