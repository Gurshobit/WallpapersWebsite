import "server-only";
import sanitizeHtmlLib from "sanitize-html";

/**
 * Server-side rich-text sanitizer for HTML produced by the RichTextEditor.
 * Uses sanitize-html (htmlparser2-based, no jsdom) so it runs reliably in
 * serverless/edge Node runtimes. Do NOT import this from client components —
 * use `stripHtml` from `lib/html-text` for plain-text needs on the client.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtmlLib(html, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s", "code", "pre",
      "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "hr", "a", "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["class"],
      "*": ["style"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: sanitizeHtmlLib.simpleTransform("a", {
        rel: "noopener noreferrer nofollow",
        target: "_blank",
      }),
    },
  });
}

export { stripHtml } from "./html-text";
