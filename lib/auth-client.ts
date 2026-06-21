"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
});

export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
export const useSession = authClient.useSession;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function requestPasswordReset(email: string, locale: string) {
  const prefix = locale === "en" ? "" : `/${locale}`;
  const redirectTo = `${siteUrl}${prefix}/reset-password`;
  return authClient.$fetch("/request-password-reset", {
    method: "POST",
    body: { email, redirectTo },
  });
}

export async function resetPassword(newPassword: string, token: string) {
  return authClient.$fetch("/reset-password", {
    method: "POST",
    body: { newPassword, token },
  });
}
