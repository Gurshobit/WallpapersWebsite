import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { AdminPagesClient } from "./client";
import { guardAdminOnlyPage } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  await guardAdminOnlyPage();
  const rows = await db.select().from(pages).orderBy(asc(pages.sortOrder), asc(pages.id));
  return <AdminPagesClient initialPages={rows} />;
}
