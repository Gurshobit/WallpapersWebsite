import Link from "next/link";

export function UploadBlocked({ prefix }: { prefix: string }) {
  return (
    <div className="max-w-lg mx-auto px-5 py-20 text-center cs-fade-up">
      <div
        className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
        style={{
          background: "rgba(255,46,99,.1)",
          border: "1px solid rgba(255,46,99,.25)",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 16V4m0 0 5 5m-5-5L7 9M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
            stroke="#ff6a8a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1
        className="font-bold text-2xl mb-3"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Uploads paused
      </h1>
      <p className="text-[15px] leading-relaxed mb-6" style={{ color: "var(--text3)" }}>
        Member uploads are temporarily disabled. You can still browse and download wallpapers.
      </p>
      <Link
        href={prefix || "/"}
        className="inline-flex rounded-xl px-5 py-3 text-sm font-bold text-white no-underline"
        style={{
          background: "linear-gradient(135deg, #ff2e63, #ff6a3d)",
          boxShadow: "0 4px 14px rgba(255,46,99,.28)",
        }}
      >
        Back to browsing
      </Link>
    </div>
  );
}
