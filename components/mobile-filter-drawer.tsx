"use client";

import { useEffect, useState } from "react";
import { SidebarFilters } from "./sidebar-filters";

type SidebarProps = React.ComponentProps<typeof SidebarFilters>;

/**
 * Mounts the bottom-slide filter sheet on the page.
 * Trigger button lives in the header and fires the "hd:open-filters" custom event.
 */
export function MobileFilterDrawer(props: SidebarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      // Scroll to top so the footer isn't in the viewport while drawer is open
      window.scrollTo({ top: 0, behavior: "instant" });
      setOpen(true);
    };
    window.addEventListener("hd:open-filters", handler);
    return () => window.removeEventListener("hd:open-filters", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop — only when open */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-[90]"
          style={{ background: "rgba(0,0,0,.8)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom-slide sheet */}
      <div
        className="lg:hidden fixed left-0 right-0 bottom-0 z-[100] rounded-t-[22px] flex flex-col"
        style={{
          background: "var(--bg2)",
          borderTop: "1px solid var(--line2)",
          boxShadow: open ? "0 -24px 64px rgba(0,0,0,.5)" : "none",
          transform: open ? "translateY(0)" : "translateY(105%)",
          transition: "transform 0.28s cubic-bezier(.22,.68,0,1.15), box-shadow 0.28s ease",
          maxHeight: "85dvh",
          visibility: open ? "visible" : "hidden",
        }}
      >
        {/* Drag handle + header */}
        <div className="flex-none">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ background: "var(--line2)" }} />
          </div>
          <div className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: "1px solid var(--line)" }}>
            <span className="font-bold text-[16px]" style={{ fontFamily: "var(--font-heading)" }}>
              Filters
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--surface2)]"
              style={{ color: "var(--dim2)" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/*
          hd-filter-drawer class overrides the media-query rule
          that sets `.hd-sidebar { display: none !important }` on mobile.
        */}
        <div className="hd-filter-drawer flex-1 overflow-y-auto px-4 py-4">
          <SidebarFilters {...props} />
        </div>
      </div>
    </>
  );
}
