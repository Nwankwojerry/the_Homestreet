"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

type AccountMode = "sign-in" | "register" | "reset" | "verify";

const submitLabels: Record<AccountMode, string> = {
  "sign-in": "Sign in",
  register: "Create account",
  reset: "Send reset link",
  verify: "Send verification link",
};

const modeTitles: Record<AccountMode, string> = {
  "sign-in": "Welcome back",
  register: "Join Homestreet",
  reset: "Reset your password",
  verify: "Verify your email",
};

const modeDescriptions: Record<AccountMode, string> = {
  "sign-in": "Sign in to continue to Homestreet.",
  register: "Create an account to make Homestreet yours.",
  reset: "We’ll email you a link to choose a new password.",
  verify: "Get a fresh link to verify your email address.",
};

export function AccountPanel() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const [mode, setMode] = useState<AccountMode>("sign-in");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function changeMode(nextMode: AccountMode) {
    setMode(nextMode);
    setShowPassword(false);
    setMessage("");
    setError("");
  }

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
      <>
        <header className="sign-in-card__header">
          <h2>You’re signed in</h2>
          <p>Your Homestreet account is ready.</p>
        </header>
        <div className="account-session">
          <p className="account-session__email">Signed in as {session.user.email}.</p>
          <p className="account-session__status">
            Email status: {session.user.emailVerified ? "verified" : "not verified"}.
          </p>
          <button className="btn sign-in-submit" type="button" onClick={signOut} disabled={busy}>
            {busy ? "Signing out..." : "Sign out"}
          </button>
          {error && <p className="account-error" role="alert">{error}</p>}
        </div>
      </>
    );
  }

  return (
    <>
      <header className="sign-in-card__header">
        <h2>{modeTitles[mode]}</h2>
        <p>{modeDescriptions[mode]}</p>
      </header>
      <form className="form sign-in-form" onSubmit={submit}>
        {mode === "register" && (
          <>
            <label htmlFor="account-name">Your name</label>
            <input autoComplete="name" id="account-name" name="name" required />
          </>
        )}
        <label htmlFor="account-email">Email address</label>
        <input
          autoComplete="email"
          aria-describedby={error ? "account-error" : undefined}
          aria-invalid={Boolean(error)}
          id="account-email"
          name="email"
          required
          type="email"
        />
        {(mode === "register" || mode === "sign-in") && (
          <>
            <label htmlFor="account-password">Password</label>
            <div className="password-field">
              <input
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                aria-describedby={error ? "account-error" : undefined}
                aria-invalid={Boolean(error)}
                id="account-password"
                minLength={8}
                name="password"
                required
                type={showPassword ? "text" : "password"}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </>
        )}
        {mode === "sign-in" && (
          <div className="sign-in-utility">
            <button className="text-action" onClick={() => changeMode("reset")} type="button">
              Forgot password?
            </button>
          </div>
        )}
        <button className="btn sign-in-submit" disabled={busy} type="submit">
          {busy ? "Please wait..." : submitLabels[mode]}
        </button>
        {message && <p aria-live="polite" className="account-message">{message}</p>}
        {error && <p aria-live="assertive" className="account-error" id="account-error" role="alert">{error}</p>}
      </form>
      <div className="sign-in-links">
        {mode === "sign-in" && (
          <>
            <p>
              New to Homestreet?{" "}
              <button className="text-action" onClick={() => changeMode("register")} type="button">
                Create an account
              </button>
            </p>
            <p>
              Need a new verification link?{" "}
              <button className="text-action" onClick={() => changeMode("verify")} type="button">
                Resend verification
              </button>
            </p>
          </>
        )}
        {mode !== "sign-in" && (
          <p>
            Back to{" "}
            <button className="text-action" onClick={() => changeMode("sign-in")} type="button">
              sign in
            </button>
          </p>
        )}
        {mode === "reset" && (
          <p className="sign-in-note">If that address has an account, we’ll send a reset link.</p>
        )}
        {mode === "verify" && (
          <p className="sign-in-note">Enter your email and we’ll send a link if verification is needed.</p>
        )}
      </div>
      <Link className="sign-in-home-link" href="/">
        Back to Homestreet
      </Link>
    </>
  );
}