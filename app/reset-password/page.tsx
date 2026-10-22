import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password | Homestreet Media",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="article">
      <div className="container">
        <section className="article-main">
          <header className="article-header">
            <h1>Reset your password</h1>
          </header>
          <ResetPasswordForm />
        </section>
      </div>
    </main>
  );
}