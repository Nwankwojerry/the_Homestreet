export const AUTH_ROLES = {
  READER: "READER",
  AUTHOR: "AUTHOR",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
} as const;

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES];
export type AuthUser = { email?: string; role?: unknown } | null | undefined;

export const STAFF_CAPABILITIES = {
  ACCESS_ADMIN_AREA: "ACCESS_ADMIN_AREA",
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_PUBLICATION_SETTINGS: "MANAGE_PUBLICATION_SETTINGS",
  CREATE_ARTICLES: "CREATE_ARTICLES",
  EDIT_OWN_ARTICLES: "EDIT_OWN_ARTICLES",
  EDIT_AUTHORS_ARTICLES: "EDIT_AUTHORS_ARTICLES",
  REVIEW_ARTICLES: "REVIEW_ARTICLES",
  PUBLISH_ARTICLES: "PUBLISH_ARTICLES",
  ARCHIVE_ARTICLES: "ARCHIVE_ARTICLES",
} as const;

export type StaffCapability = (typeof STAFF_CAPABILITIES)[keyof typeof STAFF_CAPABILITIES];

export const STAFF_CAPABILITY_ROLES: Record<StaffCapability, readonly AuthRole[]> = {
  ACCESS_ADMIN_AREA: [AUTH_ROLES.ADMIN],
  MANAGE_USERS: [AUTH_ROLES.ADMIN],
  MANAGE_PUBLICATION_SETTINGS: [AUTH_ROLES.ADMIN],
  CREATE_ARTICLES: [AUTH_ROLES.AUTHOR, AUTH_ROLES.EDITOR, AUTH_ROLES.ADMIN],
  EDIT_OWN_ARTICLES: [AUTH_ROLES.AUTHOR, AUTH_ROLES.EDITOR, AUTH_ROLES.ADMIN],
  EDIT_AUTHORS_ARTICLES: [AUTH_ROLES.EDITOR, AUTH_ROLES.ADMIN],
  REVIEW_ARTICLES: [AUTH_ROLES.EDITOR, AUTH_ROLES.ADMIN],
  PUBLISH_ARTICLES: [AUTH_ROLES.EDITOR, AUTH_ROLES.ADMIN],
  ARCHIVE_ARTICLES: [AUTH_ROLES.EDITOR, AUTH_ROLES.ADMIN],
};

export class AuthorizationError extends Error {
  constructor(public readonly status: 401 | 403) {
    super(status === 401 ? "Unauthorized" : "Forbidden");
  }
}

export function hasRole(user: AuthUser, ...allowedRoles: AuthRole[]) {
  return user !== null && user !== undefined && allowedRoles.some((role) => role === user.role);
}

export function canAccessAdmin(user: AuthUser) {
  return hasRole(user, AUTH_ROLES.ADMIN);
}

export function hasStaffCapability(user: AuthUser, capability: StaffCapability) {
  return hasRole(user, ...STAFF_CAPABILITY_ROLES[capability]);
}

export function requireStaffCapability(user: AuthUser, capability: StaffCapability) {
  if (!user) throw new AuthorizationError(401);
  if (!hasStaffCapability(user, capability)) throw new AuthorizationError(403);
  return user;
}

export function forceReaderRole<T extends object>(
  user: T,
): Omit<T, "role"> & { role: typeof AUTH_ROLES.READER } {
  return { ...user, role: AUTH_ROLES.READER } as Omit<T, "role"> & {
    role: typeof AUTH_ROLES.READER;
  };
}

export function requireRole(user: AuthUser, ...allowedRoles: AuthRole[]) {
  if (!user) throw new AuthorizationError(401);
  if (!hasRole(user, ...allowedRoles)) throw new AuthorizationError(403);
  return user;
}