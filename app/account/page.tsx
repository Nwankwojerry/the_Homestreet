import type { Metadata } from "next";
import { AccountPanel } from "@/components/AccountPanel";

export const metadata: Metadata = {
  title: "Sign in to Homestreet | Homestreet Media",
  description: "Sign in to your Homestreet Media account.",
};

export default function AccountPage() {
  return (
    <main className="sign-in-page">
      <div className="container">
        <div className="sign-in-layout">
          <section className="sign-in-intro" aria-labelledby="sign-in-title">
          <div className="sign-in-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M20 21a8 8 0 0 0-16 0" />
              <circle cx="12" cy="8" r="4" />
            </svg>
          </div>
          <p className="sign-in-kicker">Homestreet Media</p>
          <h1 id="sign-in-title">Sign in to Homestreet</h1>
          <p className="sign-in-deck">
            Your home for the stories, ideas and perspectives that matter.
          </p>
          </section>
          <section className="sign-in-card" aria-label="Sign in or manage your account">
          <AccountPanel />
          </section>
        </div>
      </div>
    </main>
  );
}