"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");

    const values = new FormData(event.currentTarget);
    const password = String(values.get("password") ?? "");
    const token = new URL(window.location.href).searchParams.get("token");

    if (!token) {
      setError("This reset link is invalid or expired. Request a new one.");
      setBusy(false);
      return;
    }

    try {
      const result = await authClient.resetPassword({ newPassword: password, token });
      if (result.error) throw new Error(result.error.message);
      setMessage("Password updated. You can now sign in.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The password could not be updated.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form className="form" onSubmit={submit}>
        <label htmlFor="new-password">New password</label>
        <input
          autoComplete="new-password"
          id="new-password"
          minLength={8}
          name="password"
          required
          type="password"
        />
        <button className="btn" disabled={busy} type="submit">
          {busy ? "Updating..." : "Update password"}
        </button>
        {message && <p aria-live="polite">{message}</p>}
        {error && <p aria-live="assertive" role="alert">{error}</p>}
      </form>
      {message && <Link href="/account">Return to sign in</Link>}
    </>
  );
}