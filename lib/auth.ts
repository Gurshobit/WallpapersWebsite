import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import {
  authUser,
  authSession,
  authAccount,
  authVerification,
} from "./db/schema";
import { hashPassword, verifyPassword } from "./password";
import { sendPasswordResetEmail } from "./email";
import { syncUserHashFromAuthAccount } from "./user-password";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: authUser,
      session: authSession,
      account: authAccount,
      verification: authVerification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    password: {
      hash: hashPassword,
      verify: async ({ hash, password }) => verifyPassword(hash, password),
    },
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        url,
      });
    },
    onPasswordReset: async ({ user }) => {
      await syncUserHashFromAuthAccount(user.id);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID),
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      enabled: Boolean(process.env.GITHUB_CLIENT_ID),
    },
  },
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-me",
});

export type Session = typeof auth.$Infer.Session;
