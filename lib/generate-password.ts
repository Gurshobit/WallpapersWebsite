import { nanoid } from "nanoid";

const MIN_LENGTH = 8;

/** Random password for admin-created accounts (nanoid, min 8 chars). */
export function generatePassword(length = 12): string {
  const size = Math.max(MIN_LENGTH, length);
  return nanoid(size);
}
