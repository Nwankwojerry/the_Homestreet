import test from "node:test";
import assert from "node:assert/strict";

import {
  AUTH_ROLES,
  AuthorizationError,
  canAccessAdmin,
  forceReaderRole,
  hasRole,
  requireRole,
} from "../lib/auth-roles";

test("only an Admin can access admin", () => {
  for (const role of [AUTH_ROLES.READER, AUTH_ROLES.AUTHOR, AUTH_ROLES.EDITOR]) {
    assert.equal(canAccessAdmin({ role }), false);
    assert.throws(() => requireRole({ role }, AUTH_ROLES.ADMIN), /Forbidden/);
  }

  assert.equal(canAccessAdmin({ role: AUTH_ROLES.ADMIN }), true);
  assert.doesNotThrow(() => requireRole({ role: AUTH_ROLES.ADMIN }, AUTH_ROLES.ADMIN));
});

test("missing and invalid users cannot satisfy role checks", () => {
  for (const user of [null, undefined]) {
    assert.equal(hasRole(user, AUTH_ROLES.READER, AUTH_ROLES.AUTHOR), false);
    assert.throws(
      () => requireRole(user, AUTH_ROLES.READER),
      (error: unknown) => error instanceof AuthorizationError && error.status === 401,
    );
  }

  assert.throws(
    () => requireRole({ role: "SUPERADMIN" }, AUTH_ROLES.READER),
    (error: unknown) => error instanceof AuthorizationError && error.status === 403,
  );
});

test("role checks allow explicit authorized role sets", () => {
  assert.equal(hasRole({ role: AUTH_ROLES.AUTHOR }, AUTH_ROLES.AUTHOR, AUTH_ROLES.EDITOR), true);
  assert.equal(hasRole({ role: AUTH_ROLES.READER }, AUTH_ROLES.AUTHOR, AUTH_ROLES.EDITOR), false);
});

test("public registration always assigns Reader despite role and signup metadata input", () => {
  const attemptedSignups = [
    { email: "reader@example.com", role: AUTH_ROLES.ADMIN },
    { email: "reader@example.com", role: AUTH_ROLES.EDITOR, metadata: { role: AUTH_ROLES.ADMIN } },
    { email: "reader@example.com", metadata: { role: AUTH_ROLES.AUTHOR } },
  ];

  for (const attemptedSignup of attemptedSignups) {
    const user = forceReaderRole(attemptedSignup);
    assert.equal(user.role, AUTH_ROLES.READER);
    assert.equal(user.email, "reader@example.com");
  }
});
