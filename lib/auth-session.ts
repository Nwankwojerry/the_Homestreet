import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireRole, type AuthRole } from "@/lib/auth-roles";

export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireServerRole(...roles: AuthRole[]) {
  const session = await getServerSession();
  const user = requireRole(session?.user, ...roles);

  return { session, user };
}