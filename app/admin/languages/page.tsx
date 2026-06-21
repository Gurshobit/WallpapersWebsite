import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { listLanguages } from "@/lib/db/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

function countKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null) {
      return countKeys(v as Record<string, unknown>, path);
    }
    return [path];
  });
}

function getTranslationPct(code: string, enKeys: string[]): number {
  const file = join(process.cwd(), "messages", `${code}.json`);
  if (!existsSync(file)) return 0;
  const messages = JSON.parse(readFileSync(file, "utf-8"));
  const keys = countKeys(messages);
  const matched = enKeys.filter((k) => keys.includes(k)).length;
  return Math.round((matched / enKeys.length) * 100);
}

export default async function AdminLanguagesPage() {
  const langs = await listLanguages();
  const enMessages = JSON.parse(
    readFileSync(join(process.cwd(), "messages/en.json"), "utf-8")
  );
  const enKeys = countKeys(enMessages);

  return (
    <AdminShell>
      <AdminPageHeader title="Languages" subtitle={`${langs.length} configured locales`} />
      <div className="space-y-3">
        {langs.map((lang) => {
          const pct = getTranslationPct(lang.code, enKeys);
          return (
            <div
              key={lang.id}
              className="flex items-center gap-4 px-5 py-4 rounded-[15px]"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
            >
              <span className="text-2xl">{lang.flagEmoji}</span>
              <div className="flex-1">
                <p className="font-semibold">{lang.name}</p>
                <p className="text-xs" style={{ color: "var(--dim)" }}>{lang.nativeName} · {lang.code}</p>
              </div>
              <div className="w-32">
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--track)" }}>
                  <div
                    className="h-full gradient-accent rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-right mt-1" style={{ color: "var(--dim)" }}>{pct}%</p>
              </div>
              <span
                className="text-xs px-2 py-1 rounded capitalize"
                style={{
                  background: lang.active ? "rgba(48,164,108,.15)" : "var(--surface3)",
                  color: lang.active ? "#30a46c" : "var(--dim)",
                }}
              >
                {lang.active ? "active" : "inactive"}
                {lang.isDefault ? " · default" : ""}
              </span>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
