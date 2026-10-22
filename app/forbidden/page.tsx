import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="article">
      <div className="container">
        <section className="article-main">
          <header className="article-header">
            <h1>Access denied</h1>
            <p>Your account is not authorized to access this page.</p>
            <Link className="btn btn-outline" href="/">
              Return to Homestreet
            </Link>
          </header>
        </section>
      </div>
    </main>
  );
}