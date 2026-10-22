import type { Metadata } from "next";
import { AccountPanel } from "@/components/AccountPanel";

export const metadata: Metadata = {
  title: "Account | Homestreet Media",
  description: "Sign in or create a Homestreet Media account.",
};

export default function AccountPage() {
  return (
    <main className="article">
      <div className="container">
        <section className="article-main">
          <header className="article-header">
            <h1>Your account</h1>
          </header>
          <AccountPanel />
        </section>
      </div>
    </main>
  );
}