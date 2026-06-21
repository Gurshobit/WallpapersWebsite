"use client";

export function AdminSettingsCrons() {
  return (
    <div
      className="rounded-[15px] p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      <div className="font-bold text-[17px] mb-[6px]" style={{ fontFamily: "var(--font-heading)" }}>
        Crons
      </div>
      <p className="text-[13px] mb-[18px] leading-relaxed" style={{ color: "var(--dim)" }}>
        Used to calculate popular, top downloaded wallpapers etc. Choose between JS/AJAX (no server access needed) or Server Crons (via cPanel / plesk).
      </p>
      <div className="flex gap-3 mb-5">
        <CronOption title="Server Crons" subtitle="Via cPanel or plesk — recommended" active />
        <CronOption title="JS / AJAX Crons" subtitle="Runs via browser traffic — no server access needed" />
      </div>
      <div
        className="rounded-xl p-[14px] mb-[14px]"
        style={{ background: "var(--surface2)", border: "1px solid var(--line)" }}
      >
        <div className="text-xs font-bold mb-2" style={{ color: "var(--muted)" }}>
          Cron password
        </div>
        <div className="flex gap-2.5 items-center">
          <input
            type="password"
            placeholder="••••••••"
            className="flex-1 rounded-[9px] px-[13px] py-[10px] text-[13.5px] outline-none"
            style={{ background: "var(--surface)", border: "1px solid var(--line2)", color: "var(--text)" }}
          />
          <button
            type="button"
            className="px-[14px] py-[10px] rounded-[9px] text-[13px] font-bold border-none cursor-pointer"
            style={{ background: "var(--surface3)", border: "1px solid var(--line2)", color: "var(--text)" }}
          >
            Regenerate
          </button>
        </div>
      </div>
      <button
        type="button"
        className="self-start px-5 py-[11px] rounded-[11px] font-bold text-[14px] text-white border-none cursor-pointer"
        style={{ background: "linear-gradient(135deg, #ff2e63, #ff6a3d)", boxShadow: "0 4px 14px rgba(255,46,99,.28)" }}
      >
        Save cron settings
      </button>
    </div>
  );
}

function CronOption({ title, subtitle, active = false }: { title: string; subtitle: string; active?: boolean }) {
  return (
    <div
      className="flex-1 flex items-start gap-3 rounded-xl p-[14px] cursor-pointer transition-colors"
      style={{
        border: active ? "1.5px solid rgba(255,46,99,.5)" : "1px solid var(--line)",
        background: active ? "rgba(255,46,99,.06)" : "var(--surface2)",
      }}
    >
      <span
        className="w-4 h-4 rounded-full border-2 flex-none mt-0.5"
        style={{
          borderColor: active ? "#ff2e63" : "var(--dim2)",
          background: active ? "#ff2e63" : "transparent",
        }}
      />
      <div>
        <div className="text-[14px] font-bold">{title}</div>
        <div className="text-xs mt-0.5" style={{ color: "var(--dim)" }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

export function AdminSettingsCaching() {
  return (
    <div className="space-y-4">
      {[
        {
          title: "CDN cache TTL",
          subtitle: "How long (seconds) the CDN caches image variants",
          defaultValue: "86400",
        },
        {
          title: "Sitemap cache TTL",
          subtitle: "Revalidation interval in seconds",
          defaultValue: "3600",
        },
      ].map(({ title, subtitle, defaultValue }) => (
        <div
          key={title}
          className="rounded-[15px] p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <div className="font-bold text-[15px] mb-1">{title}</div>
          <div className="text-xs mb-3" style={{ color: "var(--dim)" }}>
            {subtitle}
          </div>
          <input
            defaultValue={defaultValue}
            className="w-full max-w-xs rounded-[9px] px-3 py-[10px] text-[13.5px] outline-none"
            style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}
          />
        </div>
      ))}
      <button
        type="button"
        className="self-start px-5 py-[11px] rounded-[11px] font-bold text-[14px] text-white border-none cursor-pointer"
        style={{ background: "linear-gradient(135deg, #ff2e63, #ff6a3d)", boxShadow: "0 4px 14px rgba(255,46,99,.28)" }}
      >
        Save caching settings
      </button>
    </div>
  );
}

export function AdminSettingsEmails() {
  const templates = [
    { id: 1, name: "Wallpaper approved", type: "Transactional" },
    { id: 2, name: "Wallpaper rejected", type: "Transactional" },
    { id: 3, name: "New follower", type: "Notification" },
    { id: 4, name: "Comment on your wallpaper", type: "Notification" },
    { id: 5, name: "Welcome email", type: "Transactional" },
  ];
  return (
    <div
      className="rounded-[15px] overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      <div className="px-5 py-[18px] border-b" style={{ borderColor: "var(--line)" }}>
        <div className="font-bold text-[17px] mb-1" style={{ fontFamily: "var(--font-heading)" }}>
          Email Templates
        </div>
        <div className="text-[12.5px]" style={{ color: "var(--dim)" }}>
          Edit system email subjects and body content. Use {"{variable}"} placeholders.
        </div>
      </div>
      <div
        className="grid gap-[14px] px-[18px] py-3 border-b text-[11.5px] font-bold tracking-wide uppercase"
        style={{
          gridTemplateColumns: "24px 1.4fr 1fr 80px",
          borderColor: "var(--line)",
          color: "var(--dim2)",
        }}
      >
        <span>#</span>
        <span>Name</span>
        <span>Type</span>
        <span>Action</span>
      </div>
      {templates.map((t) => (
        <div
          key={t.id}
          className="grid gap-[14px] px-[18px] py-3 border-b items-center hover:bg-[var(--surface2)] transition-colors"
          style={{ gridTemplateColumns: "24px 1.4fr 1fr 80px", borderColor: "var(--line)" }}
        >
          <span className="text-xs" style={{ color: "var(--dim2)" }}>
            {t.id}
          </span>
          <span className="text-[13.5px] font-semibold cursor-pointer hover:underline" style={{ color: "#22d3ee" }}>
            {t.name}
          </span>
          <span className="text-[12.5px]" style={{ color: "var(--dim)" }}>
            {t.type}
          </span>
          <button
            type="button"
            className="flex items-center gap-[5px] rounded-lg px-[11px] py-[6px] text-xs font-bold border cursor-pointer"
            style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Edit
          </button>
        </div>
      ))}
    </div>
  );
}

export function AdminSettingsLinks() {
  const sections = [{ id: 1, name: "Footer", links: 6 }];
  return (
    <div
      className="rounded-[15px] p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      <div className="font-bold text-[17px] mb-[5px]" style={{ fontFamily: "var(--font-heading)" }}>
        Link Manager
      </div>
      <p className="text-[12.5px] mb-4 leading-relaxed" style={{ color: "var(--dim)" }}>
        Add link sections (e.g. Footer) and populate them with URLs for the frontend.
      </p>
      <div className="flex gap-2.5 items-end mb-[18px]">
        <div className="flex-1">
          <label className="block text-xs font-semibold mb-[6px]" style={{ color: "var(--muted)" }}>
            Section name
          </label>
          <input
            placeholder="e.g. Footer"
            className="w-full rounded-[9px] px-3 py-[10px] text-[13.5px] outline-none"
            style={{ background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)" }}
          />
        </div>
        <button
          type="button"
          className="px-4 py-[10px] rounded-[9px] font-bold text-[13.5px] text-white border-none cursor-pointer"
          style={{ background: "linear-gradient(135deg, #ff2e63, #ff6a3d)" }}
        >
          Create
        </button>
      </div>
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface2)", border: "1px solid var(--line)" }}
      >
        <div
          className="grid gap-3 px-[14px] py-[10px] border-b text-[11px] font-bold tracking-wide uppercase"
          style={{ gridTemplateColumns: "40px 1fr 80px 100px", borderColor: "var(--line)", color: "var(--dim2)" }}
        >
          <span>ID</span>
          <span>Section</span>
          <span>Links</span>
          <span>Actions</span>
        </div>
        {sections.map((s) => (
          <div
            key={s.id}
            className="grid gap-3 px-[14px] py-[11px] border-b items-center hover:bg-[var(--surface3)] transition-colors"
            style={{ gridTemplateColumns: "40px 1fr 80px 100px", borderColor: "var(--line)" }}
          >
            <span className="text-[13px]" style={{ color: "var(--dim2)" }}>
              {s.id}
            </span>
            <span className="text-[13.5px] font-semibold">{s.name}</span>
            <span className="text-[13px]" style={{ color: "var(--dim)" }}>
              {s.links}
            </span>
            <div className="flex gap-[7px]">
              <button
                type="button"
                className="rounded-[7px] px-[10px] py-[5px] text-xs font-bold border cursor-pointer"
                style={{ background: "var(--surface)", border: "1px solid var(--line2)", color: "var(--text)" }}
              >
                Edit
              </button>
              <button
                type="button"
                className="rounded-[7px] px-[10px] py-[5px] text-xs font-bold border cursor-pointer"
                style={{ background: "rgba(229,72,77,.1)", border: "1px solid rgba(229,72,77,.25)", color: "#ff8a8d" }}
              >
                Del
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
