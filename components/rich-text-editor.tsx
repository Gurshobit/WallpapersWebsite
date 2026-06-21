"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

// ── Toolbar button ─────────────────────────────────────────────────────────

function Btn({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      disabled={disabled}
      className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center text-[12.5px] font-bold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
      style={
        active
          ? { background: "rgba(255,46,99,.15)", color: "#ff6a8a", border: "1px solid rgba(255,46,99,.3)" }
          : { background: "var(--surface2)", color: "var(--muted)", border: "1px solid transparent" }
      }
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 self-center mx-1" style={{ background: "var(--line2)" }} />;
}

// ── Component ──────────────────────────────────────────────────────────────

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing…",
  minHeight = 320,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "rte-link" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync external content resets (e.g. switching pages in admin)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const { isFocused } = editor;

  return (
    <div
      className="rounded-[12px] overflow-hidden flex flex-col transition-colors"
      style={{
        border: `1px solid ${isFocused ? "rgba(255,46,99,.45)" : "var(--line2)"}`,
        background: "var(--surface2)",
      }}
    >
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-0.5 px-2.5 py-2"
        style={{ borderBottom: "1px solid var(--line2)", background: "var(--surface)" }}
      >
        {/* Text style */}
        <Btn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (⌘B)">
          <strong>B</strong>
        </Btn>
        <Btn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (⌘I)">
          <em>I</em>
        </Btn>
        <Btn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <span style={{ textDecoration: "underline" }}>U</span>
        </Btn>
        <Btn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <span style={{ textDecoration: "line-through" }}>S</span>
        </Btn>
        <Btn active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code">
          {"</>"}
        </Btn>

        <Sep />

        {/* Headings */}
        {([1, 2, 3] as const).map((l) => (
          <Btn key={l} active={editor.isActive("heading", { level: l })}
            onClick={() => editor.chain().focus().toggleHeading({ level: l }).run()} title={`Heading ${l}`}>
            H{l}
          </Btn>
        ))}

        <Sep />

        {/* Lists */}
        <Btn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M9 6h11M9 12h11M9 18h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="4" cy="6" r="1.5" fill="currentColor"/>
            <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
            <circle cx="4" cy="18" r="1.5" fill="currentColor"/>
          </svg>
        </Btn>
        <Btn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M10 6h11M10 12h11M10 18h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <text x="1" y="8" fontSize="6" fill="currentColor">1.</text>
            <text x="1" y="14" fontSize="6" fill="currentColor">2.</text>
            <text x="1" y="20" fontSize="6" fill="currentColor">3.</text>
          </svg>
        </Btn>
        <Btn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </Btn>
        <Btn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </Btn>

        <Sep />

        {/* Alignment */}
        {(["left", "center", "right"] as const).map((align) => (
          <Btn key={align} active={editor.isActive({ textAlign: align })}
            onClick={() => editor.chain().focus().setTextAlign(align).run()} title={`Align ${align}`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              {align === "left" && <><path d="M3 6h18M3 12h12M3 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>}
              {align === "center" && <><path d="M3 6h18M6 12h12M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>}
              {align === "right" && <><path d="M3 6h18M9 12h12M5 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>}
            </svg>
          </Btn>
        ))}

        <Sep />

        {/* Link */}
        <Btn active={editor.isActive("link")} onClick={setLink} title="Link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </Btn>

        <Sep />

        {/* Code block */}
        <Btn active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Btn>

        <div className="flex-1" />

        {/* Undo/redo */}
        <Btn disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M3 7v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </Btn>
        <Btn disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M21 7v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </Btn>
      </div>

      {/* Content area */}
      <EditorContent
        editor={editor}
        className="rte-content px-4 py-4 outline-none"
        style={{ minHeight }}
      />
    </div>
  );
}
