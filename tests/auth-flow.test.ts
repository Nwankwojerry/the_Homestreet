import test from "node:test";
import assert from "node:assert/strict";
import { betterAuth } from "better-auth";
import { memoryAdapter, type MemoryDB } from "better-auth/adapters/memory";
import { AUTH_ROLES, forceReaderRole } from "../lib/auth-roles";

const baseURL = "http://localhost:3000";
const secret = "isolated-test-secret-at-least-32-characters-long";
const email = "reader@example.test";
const initialPassword = "initial-test-password";

function createTestAuth(requireEmailVerification = false) {
  const db: MemoryDB = { user: [], session: [], account: [], verification: [] };
  let verificationURL = "";
  let resetURL = "";
  const auth = betterAuth({
    database: memoryAdapter(db),
    baseURL,
    secret,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification,
      sendResetPassword: async ({ url }) => {
        resetURL = url;
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async ({ url }) => {
        verificationURL = url;
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
    advanced: { database: { generateId: "serial" } },
  });

  return {
    auth,
    db,
    getVerificationURL: () => verificationURL,
    getResetURL: () => resetURL,
  };
}

async function request(
  auth: ReturnType<typeof createTestAuth>["auth"],
  path: string,
  options: { method?: string; body?: object; cookie?: string } = {},
) {
  const headers = new Headers();
  if (options.body) headers.set("content-type", "application/json");
  if (options.method === "POST" || options.body) headers.set("origin", baseURL);
  if (options.cookie) headers.set("cookie", options.cookie);
  return auth.handler(
    new Request(`${baseURL}/api/auth/${path}`, {
      method: options.method ?? (options.body ? "POST" : "GET"),
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    }),
  );
}

function sessionCookie(response: Response) {
  const cookie = response.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie, "expected Better Auth to set a session cookie");
  return cookie;
}

test("registration forces Reader and invalid credentials are rejected", async () => {
  const { auth, db } = createTestAuth();
  const signUp = await request(auth, "sign-up/email", {
    body: {
      name: "Test Reader",
      email,
      password: initialPassword,
      role: AUTH_ROLES.ADMIN,
      metadata: { role: AUTH_ROLES.EDITOR },
    },
  });

  assert.equal(signUp.status, 200);
  const created = (await signUp.json()) as { user: { role: string } };
  assert.equal(created.user.role, AUTH_ROLES.READER);
  assert.equal(db.user[0].role, AUTH_ROLES.READER);

  const invalidSignIn = await request(auth, "sign-in/email", {
    body: { email, password: "wrong-test-password" },
  });
  assert.ok(invalidSignIn.status >= 400);
});

test("sessions reject invalid and expired cookies and logout invalidates the session", async () => {
  const { auth, db } = createTestAuth();
  await request(auth, "sign-up/email", {
    body: { name: "Test Reader", email, password: initialPassword },
  });

  const signIn = await request(auth, "sign-in/email", {
    body: { email, password: initialPassword },
  });
  assert.equal(signIn.status, 200);
  const cookie = sessionCookie(signIn);

  const activeSession = await request(auth, "get-session", { cookie });
  assert.ok((await activeSession.json()).session);

  const invalidSession = await request(auth, "get-session", {
    cookie: "better-auth.session_token=invalid-session-token",
  });
  assert.equal(await invalidSession.json(), null);

  for (const session of db.session) {
    session.expiresAt = new Date(Date.now() - 60_000);
  }
  const expiredSession = await request(auth, "get-session", { cookie });
  assert.equal(await expiredSession.json(), null);

  const secondSignIn = await request(auth, "sign-in/email", {
    body: { email, password: initialPassword },
  });
  const secondCookie = sessionCookie(secondSignIn);
  const signOut = await request(auth, "sign-out", { method: "POST", cookie: secondCookie });
  assert.equal(signOut.status, 200);

  const afterSignOut = await request(auth, "get-session", { cookie: secondCookie });
  assert.equal(await afterSignOut.json(), null);
});

test("verification gates sign-in and reset links update the password", async () => {
  const { auth, getVerificationURL, getResetURL } = createTestAuth(true);
  const signUp = await request(auth, "sign-up/email", {
    body: {
      name: "Test Reader",
      email,
      password: initialPassword,
      role: AUTH_ROLES.ADMIN,
    },
  });
  assert.equal(signUp.status, 200);
  assert.ok(getVerificationURL());

  const beforeVerification = await request(auth, "sign-in/email", {
    body: { email, password: initialPassword },
  });
  assert.ok(beforeVerification.status >= 400);

  const verification = await auth.handler(
    new Request(getVerificationURL(), { redirect: "manual" }),
  );
  assert.ok(verification.status >= 300 && verification.status < 400);

  const afterVerification = await request(auth, "sign-in/email", {
    body: { email, password: initialPassword },
  });
  assert.equal(afterVerification.status, 200);

  const resetRequest = await request(auth, "request-password-reset", {
    body: { email, redirectTo: "/reset-password" },
  });
  assert.equal(resetRequest.status, 200);
  assert.ok(getResetURL());

  const resetLink = await auth.handler(new Request(getResetURL(), { redirect: "manual" }));
  assert.ok(resetLink.status >= 300 && resetLink.status < 400);
  const resetPage = new URL(resetLink.headers.get("location") ?? "");
  const token = resetPage.searchParams.get("token");
  assert.ok(token);
  const newPassword = "updated-test-password";
  const reset = await request(auth, "reset-password", {
    body: { token, newPassword },
  });
  assert.equal(reset.status, 200);

  const oldPasswordSignIn = await request(auth, "sign-in/email", {
    body: { email, password: initialPassword },
  });
  assert.ok(oldPasswordSignIn.status >= 400);
  const newPasswordSignIn = await request(auth, "sign-in/email", {
    body: { email, password: newPassword },
  });
  assert.equal(newPasswordSignIn.status, 200);
});