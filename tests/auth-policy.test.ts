import test from "node:test";
import assert from "node:assert/strict";

import {
  AUTH_ROLES,
  AuthorizationError,
  STAFF_CAPABILITIES,
  canAccessAdmin,
  forceReaderRole,
  hasRole,
  hasStaffCapability,
  requireRole,
  requireStaffCapability,
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

test("staff capabilities authorize only the explicitly assigned roles", () => {
  const expectations: Record<
    (typeof STAFF_CAPABILITIES)[keyof typeof STAFF_CAPABILITIES],
    readonly (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES][]
  > = {
    [STAFF_CAPABILITIES.ACCESS_ADMIN_AREA]: [AUTH_ROLES.ADMIN],
    [STAFF_CAPABILITIES.MANAGE_USERS]: [AUTH_ROLES.ADMIN],
    [STAFF_CAPABILITIES.MANAGE_PUBLICATION_SETTINGS]: [AUTH_ROLES.ADMIN],
    [STAFF_CAPABILITIES.CREATE_ARTICLES]: [AUTH_ROLES.AUTHOR, AUTH_ROLES.EDITOR, AUTH_ROLES.ADMIN],
    [STAFF_CAPABILITIES.EDIT_OWN_ARTICLES]: [AUTH_ROLES.AUTHOR, AUTH_ROLES.EDITOR, AUTH_ROLES.ADMIN],
    [STAFF_CAPABILITIES.EDIT_AUTHORS_ARTICLES]: [AUTH_ROLES.EDITOR, AUTH_ROLES.ADMIN],
    [STAFF_CAPABILITIES.REVIEW_ARTICLES]: [AUTH_ROLES.EDITOR, AUTH_ROLES.ADMIN],
    [STAFF_CAPABILITIES.PUBLISH_ARTICLES]: [AUTH_ROLES.EDITOR, AUTH_ROLES.ADMIN],
    [STAFF_CAPABILITIES.ARCHIVE_ARTICLES]: [AUTH_ROLES.EDITOR, AUTH_ROLES.ADMIN],
  };

  for (const capability of Object.values(STAFF_CAPABILITIES)) {
    const permittedRoles = expectations[capability];
    for (const role of Object.values(AUTH_ROLES)) {
      assert.equal(
        hasStaffCapability({ role }, capability),
        permittedRoles.includes(role),
        `${role} should ${permittedRoles.includes(role) ? "" : "not "}have ${capability}`,
      );
    }
  }
});

test("invalid, missing and Reader identities cannot use staff capabilities", () => {
  for (const user of [null, undefined, { role: "SUPERADMIN" }, { role: AUTH_ROLES.READER }, {}]) {
    assert.equal(hasStaffCapability(user, STAFF_CAPABILITIES.CREATE_ARTICLES), false);
  }

  assert.throws(
    () => requireStaffCapability(null, STAFF_CAPABILITIES.ACCESS_ADMIN_AREA),
    (error: unknown) => error instanceof AuthorizationError && error.status === 401,
  );
  assert.throws(
    () => requireStaffCapability({ role: AUTH_ROLES.READER }, STAFF_CAPABILITIES.ACCESS_ADMIN_AREA),
    (error: unknown) => error instanceof AuthorizationError && error.status === 403,
  );
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
