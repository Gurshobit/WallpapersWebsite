import { db } from "../../lib/db";
import { languages } from "../../lib/db/schema";

const LANGS = [
  { code: "en", name: "English", nativeName: "English", flagEmoji: "🇺🇸", active: true, isDefault: true },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flagEmoji: "🇮🇳", active: true, isDefault: false },
  { code: "es", name: "Spanish", nativeName: "Español", flagEmoji: "🇪🇸", active: true, isDefault: false },
  { code: "pt", name: "Portuguese", nativeName: "Português", flagEmoji: "🇧🇷", active: false, isDefault: false },
  { code: "de", name: "German", nativeName: "Deutsch", flagEmoji: "🇩🇪", active: false, isDefault: false },
  { code: "fr", name: "French", nativeName: "Français", flagEmoji: "🇫🇷", active: false, isDefault: false },
  { code: "ja", name: "Japanese", nativeName: "日本語", flagEmoji: "🇯🇵", active: false, isDefault: false },
  { code: "ar", name: "Arabic", nativeName: "العربية", flagEmoji: "🇸🇦", active: false, isDefault: false },
];

export async function seedLanguages() {
  for (const lang of LANGS) {
    await db.insert(languages).values(lang).onConflictDoNothing();
  }
  console.log(`Seeded ${LANGS.length} languages`);
}
