import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { AUTH_ROLES, forceReaderRole } from "@/lib/auth-roles";
import { sendAuthEmail } from "@/lib/auth-email";
import { getPrismaClient } from "@/lib/prisma";

const prisma = getPrismaClient();

if (!prisma) {
  throw new Error("DATABASE_URL is required for Better Auth configuration.");
}

const rawBaseURL = process.env.BETTER_AUTH_URL?.trim();
const rawSecret = process.env.BETTER_AUTH_SECRET?.trim();

if (!rawBaseURL) {
  throw new Error(
    "BETTER_AUTH_URL is required. Set it to your canonical application origin, such as http://localhost:3000.",
  );
}

let baseURL: string;
try {
  const parsedBaseURL = new URL(rawBaseURL);
  if (!parsedBaseURL.origin) {
    throw new Error("BETTER_AUTH_URL must be an absolute URL.");
  }
  baseURL = parsedBaseURL.origin;
} catch {
  throw new Error(
    "BETTER_AUTH_URL must be a valid absolute URL like http://localhost:3000.",
  );
}

if (!rawSecret) {
  throw new Error(
    "BETTER_AUTH_SECRET is required. Generate one with `openssl rand -base64 32` and store it in .env.local.",
  );
}

const trustedOrigins = Array.from(
  new Set([
    baseURL,
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]),
);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL,
  secret: rawSecret,
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail(user.email, "Reset your Homestreet password", url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail(user.email, "Verify your Homestreet email", url);
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        input: false,
        defaultValue: AUTH_ROLES.READER,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({ data: forceReaderRole(user) }),
      },
    },
  },
  advanced: {
    database: {
      generateId: "serial",
    },
  },
});
