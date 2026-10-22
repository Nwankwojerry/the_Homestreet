import { redirect } from "next/navigation";
import { AuthorizationError, AUTH_ROLES } from "@/lib/auth-roles";
import { requireServerRole } from "@/lib/auth-session";

export default async function AdminPage() {
  let user;

  try {
    ({ user } = await requireServerRole(AUTH_ROLES.ADMIN));
  } catch (error) {
    if (!(error instanceof AuthorizationError)) throw error;
    redirect(error.status === 401 ? "/account?returnTo=%2Fadmin" : "/forbidden");
  }

  return (
    <main className="article">
      <div className="container">
        <section className="article-main">
          <header className="article-header">
            <h1>Administrative access</h1>
            <p>Signed in as {user.email}.</p>
          </header>
        </section>
      </div>
    </main>
  );
}