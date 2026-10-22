export const AUTH_ROLES = {
  READER: "READER",
  AUTHOR: "AUTHOR",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
} as const;

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES];
export type AuthUser = { email?: string; role?: unknown } | null | undefined;

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