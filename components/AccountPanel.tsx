"use client";

import { type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

type AccountMode = "sign-in" | "register" | "reset" | "verify";

const modeLabels: Record<AccountMode, string> = {
  "sign-in": "Sign in",
  register: "Create account",
  reset: "Reset password",
  verify: "Resend verification",
};

export function AccountPanel() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const [mode, setMode] = useState<AccountMode>("sign-in");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");

    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") ?? "").trim();
    const password = String(values.get("password") ?? "");
    const name = String(values.get("name") ?? "").trim();

    try {
      if (mode === "register") {
        const result = await authClient.signUp.email({ name, email, password });
        if (result.error) throw new Error(result.error.message);
        setMessage("Check your email for a verification link before signing in.");
      } else if (mode === "sign-in") {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) throw new Error(result.error.message);
        await refetch();
        const returnTo = new URLSearchParams(window.location.search).get("returnTo");
        window.location.assign(returnTo === "/admin" ? returnTo : "/account");
      } else if (mode === "reset") {
        const result = await authClient.requestPasswordReset({
          email,
          redirectTo: "/reset-password",
        });
        if (result.error) throw new Error(result.error.message);
        setMessage("If that address has an account, a password reset link has been sent.");
      } else {
        const result = await authClient.sendVerificationEmail({
          email,
          callbackURL: "/account?verified=1",
        });
        if (result.error) throw new Error(result.error.message);
        setMessage("If that address needs verification, a new link has been sent.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The request could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error(result.error.message);
      await refetch();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign out could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  if (isPending) return <p aria-live="polite">Loading account...</p>;

  if (session) {
    return (
      <div className="form">
        <p>Signed in as {session.user.email}.</p>
        <p>Email status: {session.user.emailVerified ? "verified" : "not verified"}.</p>
        <button className="btn" type="button" onClick={signOut} disabled={busy}>
          {busy ? "Signing out..." : "Sign out"}
        </button>
        {error && <p role="alert">{error}</p>}
      </div>
    );
  }

  return (
    <>
      <nav aria-label="Account actions" className="account-actions">
        {(Object.keys(modeLabels) as AccountMode[]).map((value) => (
          <button
            aria-pressed={mode === value}
            className={`btn ${mode === value ? "" : "btn-outline"}`}
            key={value}
            onClick={() => {
              setMode(value);
              setMessage("");
              setError("");
            }}
            type="button"
          >
            {modeLabels[value]}
          </button>
        ))}
      </nav>
      <form className="form" onSubmit={submit}>
        {mode === "register" && (
          <>
            <label htmlFor="account-name">Name</label>
            <input autoComplete="name" id="account-name" name="name" required />
          </>
        )}
        <label htmlFor="account-email">Email</label>
        <input
          autoComplete="email"
          id="account-email"
          name="email"
          required
          type="email"
        />
        {(mode === "register" || mode === "sign-in") && (
          <>
            <label htmlFor="account-password">Password</label>
            <input
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              id="account-password"
              minLength={8}
              name="password"
              required
              type="password"
            />
          </>
        )}
        <button className="btn" disabled={busy} type="submit">
          {busy ? "Working..." : modeLabels[mode]}
        </button>
        {message && <p aria-live="polite">{message}</p>}
        {error && <p aria-live="assertive" role="alert">{error}</p>}
      </form>
    </>
  );
}