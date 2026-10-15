import { useEffect, useRef, useState, useId } from "react";
import type { CSSProperties } from "react";
import type { LayoutProps } from "quinecms/core/layout-contract";
import { contentSpacing } from "quinecms/core/site-style";
import { Mark, Action } from "../../../themes/tessera/v1/components";
import { text, href, rows } from "../../../themes/tessera/v1/content";
import definition from "./definition.json";

export default function Tessera({
  settings,
  content,
  children,
  preview,
  onNavigate,
}: LayoutProps) {
  const root = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const mainId = useId();
  const [dark, setDark] = useState(settings.colorMode === "dark");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const docs = settings.mode === "docs" || settings.mode === "api";
  const spacing = contentSpacing(settings, definition.defaults);
  useEffect(() => {
    setDark(settings.colorMode === "dark");
    if (!preview) {
      try {
        const v = localStorage.getItem("tessera-color-mode");
        if (v) setDark(v === "dark");
      } catch {}
    }
  }, [settings.colorMode, preview]);
  const destinations = [
    ...content.pages
      .filter((p) => p.kind === "static" && p.path)
      .map((p) => ({ title: p.title, url: p.path! })),
    ...content.entries.flatMap((e) => {
      const c = content.collections.find((c) => c.id === e.collectionId);
      return c?.path && c.genericPageId
        ? [
            {
              title: text(e.values[c.titleField ?? "title"]),
              url: c.path.replace(/\/$/, "") + "/" + e.slug,
            },
          ]
        : [];
    }),
  ];
  const results = destinations
    .filter(
      (d) =>
        (d.url.startsWith("/docs") || d.url.startsWith("/api-reference")) &&
        (d.title + " " + d.url).toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 20);
  useEffect(() => {
    if (searchOpen) search.current?.focus();
  }, [searchOpen]);
  useEffect(() => {
    if (!docs || preview) return;
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [docs, preview]);
  useEffect(() => {
    if (preview || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const elements = root.current?.querySelectorAll(
      ".ts-intro, .ts-hero h1, .ts-cta-copy",
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.animate(
              [
                { opacity: 0, transform: "translateY(12px)" },
                { opacity: 1, transform: "none" },
              ],
              { duration: 650, easing: "ease" },
            );
            observer.unobserve(entry.target);
          }
      },
      { threshold: 0.1 },
    );
    elements?.forEach((element) => {
      observer.observe(element);
    });
    return () => {
      observer.disconnect();
    };
  }, [preview]);
  const toggle = () =>
    setDark((current) => {
      if (!preview) {
        try {
          localStorage.setItem(
            "tessera-color-mode",
            current ? "light" : "dark",
          );
        } catch {}
      }
      return !current;
    });
  const nav = (
    <nav aria-label="Main navigation">
      {rows(settings.navigation).map((r, i) => (
        <a key={i} href={href(r.url)}>
          {text(r.label)}
        </a>
      ))}
    </nav>
  );
  const sidebar = (
    <nav className="ts-doc-links" aria-label="Documentation navigation">
      {rows(settings.sidebar).map((r, i, list) => (
        <div key={i}>
          {(i === 0 || r.group !== list[i - 1].group) && (
            <h2>{text(r.group)}</h2>
          )}
          <a href={href(r.url)}>{text(r.label)}</a>
        </div>
      ))}
    </nav>
  );
  return (
    <div
      ref={root}
      className={`tessera-site tessera-scope ts-mode-${text(settings.mode)}`}
      data-theme={dark ? "dark" : "light"}
      data-preview={preview || undefined}
      style={
        {
          "--ts-max": `${spacing.contentMaxWidth}px`,
          "--ts-gutter": `${spacing.pageGutter}px`,
        } as CSSProperties
      }
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setSearchOpen(false);
          root.current
            ?.querySelectorAll("details[open]")
            .forEach((d) => d.removeAttribute("open"));
        }
      }}
      onClick={(e) => {
        const a = (e.target as HTMLElement).closest("a");
        if (!a || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
        root.current
          ?.querySelectorAll(".ts-menu[open],.ts-mobile-sidebar[open]")
          .forEach((d) => d.removeAttribute("open"));
        setSearchOpen(false);
        const url = a.getAttribute("href") ?? "";
        if (preview) {
          e.preventDefault();
          if (url.startsWith("#"))
            root.current
              ?.querySelector(`[id="${CSS.escape(url.slice(1))}"]`)
              ?.scrollIntoView();
          else if (url.startsWith("/")) onNavigate?.(url);
        }
      }}
    >
      <a className="ts-skip" href={`#${mainId}`}>
        Skip to content
      </a>
      <header className={`ts-header${docs ? " ts-doc-header" : ""}`}>
        <div className="ts-header-inner">
          <a className="ts-brand" href="/">
            <Mark />
            {text(settings.brand)}
            {docs && <span>docs</span>}
          </a>
          {docs ? (
            <nav aria-label="Documentation sections">
              <a href="/docs">Documentation</a>
              <a href="/api-reference">API Reference</a>
            </nav>
          ) : (
            nav
          )}
          <div className="ts-header-actions">
            {docs && (
              <button
                type="button"
                className="ts-search-trigger"
                onClick={() => setSearchOpen(true)}
              >
                ⌕ <span>Search docs…</span>
                <kbd>⌘K</kbd>
              </button>
            )}
            <button
              type="button"
              className="ts-theme-toggle"
              aria-label={dark ? "Use light theme" : "Use dark theme"}
              onClick={toggle}
            >
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              >
                {dark ? (
                  <>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
                  </>
                ) : (
                  <path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z" />
                )}
              </svg>
            </button>
            {!docs && href(settings.repositoryURL) && (
              <a className="ts-repo" href={href(settings.repositoryURL)}>
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 22v-4c-4 1-4-2-6-2m12 6v-4c0-1-.3-1.8-1-2.2 3-.4 6-1.5 6-6a5 5 0 0 0-1.4-3.5c.3-1 .2-2.3-.4-3.3-1.5-.2-3 1-3.6 1.3a12 12 0 0 0-6.2 0C7.8 4 6.3 2.8 4.8 3c-.6 1-.7 2.3-.4 3.3A5 5 0 0 0 3 9.8c0 4.5 3 5.6 6 6-.7.4-1 1.2-1 2.2v4" />
                </svg>{" "}
                {text(settings.repositoryLabel)}
              </a>
            )}
            {!docs && href(settings.signInURL) && (
              <a className="ts-signin" href={href(settings.signInURL)}>
                Sign in
              </a>
            )}
            <Action
              label={docs ? "Launch Tessera" : settings.actionLabel}
              url={docs ? "/" : settings.actionURL}
            />
          </div>
          {!docs && (
            <details className="ts-menu">
              <summary aria-label="Open navigation">☰</summary>
              {nav}
              <Action label={settings.actionLabel} url={settings.actionURL} />
            </details>
          )}
        </div>
      </header>
      {docs && (
        <details className="ts-mobile-sidebar">
          <summary>
            Browse {settings.mode === "api" ? "API reference" : "documentation"}
          </summary>
          {sidebar}
        </details>
      )}
      <div className={docs ? "ts-doc-shell" : "ts-marketing-shell"}>
        {docs && <aside className="ts-doc-sidebar">{sidebar}</aside>}
        <main id={mainId}>{children}</main>
      </div>
      {docs ? (
        <footer className="ts-doc-footer">
          <span>{text(settings.copyright)}</span>
          <a href="/">Back to Tessera</a>
        </footer>
      ) : (
        <footer className="ts-footer">
          <div className="ts-footer-top">
            <div>
              <a className="ts-brand" href="/">
                <Mark />
                {text(settings.brand)}
              </a>
              <p>{text(settings.footerDescription)}</p>
            </div>
            {[
              ...new Set(rows(settings.footerLinks).map((r) => text(r.group))),
            ].map((g) => (
              <div key={g}>
                <h2>{g}</h2>
                {rows(settings.footerLinks)
                  .filter((r) => r.group === g)
                  .map((r, i) => (
                    <a key={i} href={href(r.url)}>
                      {text(r.label)}
                    </a>
                  ))}
              </div>
            ))}
          </div>
          <div className="ts-footer-bottom">{text(settings.copyright)}</div>
        </footer>
      )}
      {searchOpen && (
        <div
          className="ts-search-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false);
          }}
        >
          <section
            className="ts-search-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Search documentation"
            onKeyDown={(e) => {
              if (e.key !== "Tab") return;
              const focusable = Array.from(
                e.currentTarget.querySelectorAll<HTMLElement>("input,button,a"),
              );
              const first = focusable[0],
                last = focusable[focusable.length - 1];
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
              }
            }}
          >
            <div>
              <input
                ref={search}
                aria-label="Search documentation"
                placeholder="Search docs and API reference…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                ×
              </button>
            </div>
            <ul>
              {results.map((d) => (
                <li key={d.url}>
                  <a href={d.url}>
                    {d.title}
                    <small>{d.url}</small>
                  </a>
                </li>
              ))}
            </ul>
            {results.length === 0 && <p>No matching pages.</p>}
          </section>
        </div>
      )}
    </div>
  );
}
