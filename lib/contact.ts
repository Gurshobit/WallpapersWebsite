import { eq } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { siteConfigs } from "@/lib/db/schema";

export async function getContactEmail(): Promise<string> {
  if (process.env.CONTACT_EMAIL) return process.env.CONTACT_EMAIL;

  const [row] = await db
    .select({ value: siteConfigs.value })
    .from(siteConfigs)
    .where(eq(siteConfigs.param, "email_contact"))
    .limit(1);

  return row?.value ?? "legal@hdwallpapers.site";
}
