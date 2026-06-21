import { updateUserPassword } from "../../lib/user-password";

const SEED_USERS = [
  {
    email: "brargurshobit2009@gmail.com",
    label: "admin",
    envKey: "ADMIN_PASSWORD" as const,
    defaultPassword: "changeme",
  },
  {
    email: "sam.johnson@hdwallpapers.site",
    label: "sam_johnson",
    envKey: "CREATOR_PASSWORD" as const,
    defaultPassword: "SamJohnson2026!",
  },
];

export async function seedPasswords() {
  console.log("Updating seed user passwords (bcrypt)…");

  for (const entry of SEED_USERS) {
    const password = process.env[entry.envKey] ?? entry.defaultPassword;

    const updated = await updateUserPassword(entry.email, password);
    if (!updated) {
      console.log(`  • ${entry.label} — user not found (${entry.email}), skipped`);
      continue;
    }

    console.log(`  ✓ ${entry.label} — ${entry.email} (users.password_hash + auth_account)`);
  }

  console.log("Done.");
}
