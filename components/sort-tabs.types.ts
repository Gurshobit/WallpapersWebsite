export const SORTS = ["latest", "popular", "downloads"] as const;
export type SortTab = (typeof SORTS)[number];
