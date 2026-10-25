"use client";

import { type FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { label: "Home", href: "/index.html" },
  { label: "News", href: "/pages/news.html" },
  { label: "Tech", href: "/pages/tech.html" },
  { label: "Economy", href: "/pages/economy.html" },
];

const groups = [
  {
    label: "Explore",
    links: [
      ["Resources", "/pages/resources.html"],
      ["Tutorials", "/pages/tutorials.html"],
      ["Guides", "/pages/guides.html"],
      ["Tips & Tricks", "/pages/tips-tricks.html"],
    ],
  },
  {
    label: "Blog",
    links: [
      ["Stories", "/pages/stories.html"],
      ["Articles", "/pages/articles.html"],
      ["Posts", "/pages/posts.html"],
    ],
  },
  {
    label: "Entertainment",
    links: [
      ["Movie News", "/pages/movie-news.html"],
      ["Upcoming Movies", "/pages/upcoming-movies.html"],
      ["Celebrities", "/pages/celebrities.html"],
      ["Comedy", "/pages/comedy.html"],
    ],
  },
];

function SignInIcon() {
  return (
    <svg aria-hidden="true" className="sign-in-icon" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="11" fill="#3345a0" />
      <circle cx="12" cy="9" r="3" fill="#fff" />
      <path d="M6.5 18.5a5.5 5.5 0 0 1 11 0" fill="#fff" />
    </svg>
  );
}

export function SiteHeader() {
  const currentPath = usePathname();
  const pathname = currentPath === "/" ? "/index.html" : currentPath;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setOpenGroup(null);
    setMobileGroup(null);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setSearchOpen(false);
        setOpenGroup(null);
        setMobileGroup(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const active = (href: string) => pathname === href;

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("q");
    if (input instanceof HTMLInputElement && input.value.trim()) {
      window.location.href = `/pages/news.html?q=${encodeURIComponent(input.value.trim())}`;
    }
  }

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="/index.html" aria-label="Homestreet Media home">
            <img src="/images/logo/homestreet-media.svg" alt="Homestreet Media" />
          </a>
          <nav className="desktop-nav" aria-label="Primary">
            {links.map((link) => (
              <a
                className={`nav-link${active(link.href) ? " active" : ""}`}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </a>
            ))}
            {groups.map((group) => {
              const open = openGroup === group.label;
              return (
                <div className={`nav-item${open ? " dropdown-open" : ""}`} key={group.label}>
                  <button
                    aria-expanded={open}
                    className="nav-button"
                    onClick={() => setOpenGroup(open ? null : group.label)}
                    type="button"
                  >
                    {group.label}
                  </button>
                  <div className="dropdown">
                    {group.links.map(([label, href]) => (
                      <a href={href} key={href}>{label}</a>
                    ))}
                  </div>
                </div>
              );
            })}
            <a className="nav-link" href="/pages/about.html">About</a>
            <a className="nav-link" href="/pages/contact.html">Contact</a>
          </nav>
          <div className="header-actions">
            <button
              aria-expanded={searchOpen}
              aria-label="Toggle search"
              className="icon-button"
              onClick={() => setSearchOpen((value) => !value)}
              type="button"
            >
              <svg aria-hidden="true" className="header-control-icon" viewBox="0 0 24 24" fill="none">
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4.5 4.5" />
              </svg>
            </button>
            <a
              aria-label="Sign in"
              aria-current={active("/account") ? "page" : undefined}
              className={`header-sign-in${active("/account") ? " active" : ""}`}
              href="/account"
              title="Sign in"
            >
              <SignInIcon />
              <span>Sign in</span>
            </a>
            <button
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
              className="menu-button"
              onClick={() => setMobileOpen((value) => !value)}
              type="button"
            >
              ☰
            </button>
          </div>
        </div>
        <div className={`search-panel${searchOpen ? " open" : ""}`}>
          <form className="container search-form" onSubmit={submitSearch}>
            <input aria-label="Search Homestreet" name="q" placeholder="Search Homestreet…" type="search" />
            <button type="submit">Search</button>
          </form>
        </div>
      </header>
      <div aria-hidden={!mobileOpen} className={`mobile-drawer${mobileOpen ? " open" : ""}`}>
        <div className="drawer-backdrop" onClick={() => setMobileOpen(false)} />
        <aside className="drawer-panel">
          <div className="drawer-top">
            <a aria-label="Homestreet Media home" className="drawer-brand-link" href="/index.html">
              <img alt="Homestreet Media" className="drawer-brand" src="/images/logo/homestreet-media.svg" />
            </a>
            <button
              aria-label="Close menu"
              className="icon-button"
              onClick={() => setMobileOpen(false)}
              type="button"
            >
              ×
            </button>
          </div>
          <nav aria-label="Mobile" className="drawer-nav">
            {links.filter((link) => link.href !== "/index.html").map((link) => (
              <a className={`drawer-link${active(link.href) ? " active" : ""}`} href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
            {groups.map((group) => {
              const open = mobileGroup === group.label;
              return (
                <div key={group.label}>
                  <button
                    aria-expanded={open}
                    className="drawer-toggle"
                    onClick={() => setMobileGroup(open ? null : group.label)}
                    type="button"
                  >
                    {group.label}<span>{open ? "−" : "+"}</span>
                  </button>
                  <div className={`drawer-submenu${open ? " open" : ""}`}>
                    {group.links.map(([label, href]) => (
                      <a href={href} key={href}>{label}</a>
                    ))}
                  </div>
                </div>
              );
            })}
            <a className="drawer-link" href="/pages/about.html">About</a>
            <a className="drawer-link" href="/pages/contact.html">Contact</a>
            <a
              aria-current={active("/account") ? "page" : undefined}
              className={`drawer-link drawer-sign-in${active("/account") ? " active" : ""}`}
              href="/account"
            >
              <SignInIcon />
              <span>Sign in</span>
            </a>
          </nav>
        </aside>
      </div>
    </>
  );
}
