import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  requireRole,
  requireStaffCapability,
  type AuthRole,
  type StaffCapability,
} from "@/lib/auth-roles";

export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireServerRole(...roles: AuthRole[]) {
  const session = await getServerSession();
  const user = requireRole(session?.user, ...roles);

  return { session, user };
}

export async function requireServerStaffCapability(capability: StaffCapability) {
  const session = await getServerSession();
  const user = requireStaffCapability(session?.user, capability);

  return { session, user };
}