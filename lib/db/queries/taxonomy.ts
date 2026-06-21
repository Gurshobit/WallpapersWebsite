import { asc, isNull } from "drizzle-orm";
import { db } from "../index";
import { categories, tags, licenses, resolutionTypes, resolutions } from "../schema";

export async function getUploadCategories() {
  return db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .where(isNull(categories.parentId))
    .orderBy(asc(categories.sortOrder), asc(categories.id));
}

export async function getUploadTags() {
  return db
    .select({ id: tags.id, name: tags.name, slug: tags.slug })
    .from(tags)
    .orderBy(asc(tags.name));
}

export async function getUploadLicenses() {
  return db
    .select({ id: licenses.id, name: licenses.name, url: licenses.url })
    .from(licenses)
    .orderBy(asc(licenses.sortOrder));
}

export async function getUploadResolutionGroups() {
  const [types, res] = await Promise.all([
    db
      .select({ id: resolutionTypes.id, name: resolutionTypes.name, sortOrder: resolutionTypes.sortOrder })
      .from(resolutionTypes)
      .orderBy(asc(resolutionTypes.sortOrder)),
    db
      .select({
        id: resolutions.id,
        typeId: resolutions.typeId,
        name: resolutions.name,
        width: resolutions.width,
        height: resolutions.height,
        sortOrder: resolutions.sortOrder,
      })
      .from(resolutions)
      .orderBy(asc(resolutions.sortOrder)),
  ]);

  return types
    .map((type) => ({
      type: { id: type.id, name: type.name },
      resolutions: res.filter((r) => r.typeId === type.id),
    }))
    .filter((g) => g.resolutions.length > 0);
}
