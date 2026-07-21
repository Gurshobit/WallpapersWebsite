"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type RatingSeed = { wallpaperId: number; iLike: boolean };

interface UserInteractionsValue {
  /** Returns true (liked), false (disliked), or null (no rating). */
  getRating: (wallpaperId: number) => boolean | null;
  setRating: (wallpaperId: number, value: boolean | null) => void;
  isShortlisted: (wallpaperId: number) => boolean;
  setShortlisted: (wallpaperId: number, value: boolean) => void;
}

const noop = () => {};

// Neutral defaults so components work even without a provider (e.g. guests
// or cards rendered outside the public/account shells).
const UserInteractionsContext = createContext<UserInteractionsValue>({
  getRating: () => null,
  setRating: noop,
  isShortlisted: () => false,
  setShortlisted: noop,
});

export function UserInteractionsProvider({
  initialRatings = [],
  initialShortlisted = [],
  children,
}: {
  initialRatings?: RatingSeed[];
  initialShortlisted?: number[];
  children: React.ReactNode;
}) {
  const [ratings, setRatings] = useState<Map<number, boolean>>(
    () => new Map(initialRatings.map((r) => [r.wallpaperId, r.iLike]))
  );
  const [shortlisted, setShortlistedSet] = useState<Set<number>>(
    () => new Set(initialShortlisted)
  );

  const getRating = useCallback(
    (id: number) => (ratings.has(id) ? ratings.get(id)! : null),
    [ratings]
  );

  const setRating = useCallback((id: number, value: boolean | null) => {
    setRatings((prev) => {
      const next = new Map(prev);
      if (value === null) next.delete(id);
      else next.set(id, value);
      return next;
    });
  }, []);

  const isShortlisted = useCallback(
    (id: number) => shortlisted.has(id),
    [shortlisted]
  );

  const setShortlisted = useCallback((id: number, value: boolean) => {
    setShortlistedSet((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ getRating, setRating, isShortlisted, setShortlisted }),
    [getRating, setRating, isShortlisted, setShortlisted]
  );

  return (
    <UserInteractionsContext.Provider value={value}>
      {children}
    </UserInteractionsContext.Provider>
  );
}

export function useWallpaperInteractions() {
  return useContext(UserInteractionsContext);
}
