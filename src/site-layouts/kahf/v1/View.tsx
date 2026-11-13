import { useState, useId } from "react";
import type { LayoutProps } from "quinecms/core/layout-contract";
import { text, rows, href } from "../../../themes/kahf/v1/content";
import "../../../themes/kahf/v1/styles.css";
export default function Kahf({
  settings: s,
  children,
  languages,
  preview,
  onNavigate,
}: LayoutProps) {
  const [open, setOpen] = useState(false);
  const navId = useId();
  const links = rows(s.navigation);
  return (
    <div
      className={"kahf-site" + (s.overlayHeader ? " kf-overlay-header" : "")}
      data-preview={preview || undefined}
      onClick={(e) => {
        const a = (e.target as HTMLElement).closest("a");
        if (preview && a?.getAttribute("href")?.startsWith("/") && onNavigate) {
          e.preventDefault();
          onNavigate(a.getAttribute("href")!);
        }
      }}
    >
      <a className="kf-skip" href="#kahf-main">
        {text(s.skipLabel)}
      </a>
      <header className="kf-header">
        <div className="kf-announcement">
          <div>
            {text(s.announcement)}{" "}
            <a href={href(s.announcementURL)}>{text(s.announcementLabel)}</a>
          </div>
          {languages && languages.length > 1 && (
            <nav aria-label="Language" className="kf-languages">
              {languages.map((l) => (
                <a
                  key={l.code}
                  href={l.path}
                  hrefLang={l.code}
                  lang={l.code}
                  aria-current={l.current ? "true" : undefined}
                >
                  {l.code.toUpperCase()}
                </a>
              ))}
            </nav>
          )}
        </div>
        <div className="kf-nav">
          <a className="kf-logo" href={href(s.homeURL)} aria-label="Kahf">
            Kahf
          </a>
          <button
            className="kf-menu-toggle"
            aria-expanded={open}
            aria-controls={navId}
            onClick={() => setOpen(!open)}
          >
            {open ? text(s.closeLabel) : text(s.menuLabel)}{" "}
            <span aria-hidden="true">{open ? "×" : "☰"}</span>
          </button>
          <nav
            id={navId}
            className={"kf-nav-links" + (open ? " kf-open" : "")}
            aria-label="Main navigation"
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          >
            {links.map((r, i) => (
              <a key={i} href={href(r.url)}>
                {text(r.label)}
              </a>
            ))}
            {rows(s.concerns).length > 0 && (
              <details>
                <summary>{text(s.concernsLabel)}</summary>
                <div className="kf-submenu">
                  {rows(s.concerns).map((r, i) => (
                    <a key={i} href={href(r.url)}>
                      {text(r.label)}
                    </a>
                  ))}
                </div>
              </details>
            )}
            <a
              href={href(s.searchURL)}
              className="kf-search-link"
              aria-label={text(s.searchLabel)}
            >
              <svg
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m16 16 5 5" />
              </svg>
            </a>
          </nav>
        </div>
      </header>
      <main id="kahf-main">{children}</main>
      <footer className="kf-footer">
        <div className="kf-footer-grid">
          <div>
            <a className="kf-logo" href={href(s.homeURL)}>
              Kahf
            </a>
            <nav aria-label="Footer">
              {rows(s.footerLinks).map((r, i) => (
                <a key={i} href={href(r.url)}>
                  {text(r.label)}
                </a>
              ))}
            </nav>
          </div>
          <div>
            <h2>{text(s.contactLabel)}</h2>
            <a href={href("tel:" + text(s.phone).replace(/[^+\d]/g, ""))}>
              {text(s.phone)}
            </a>
            <a href={href("mailto:" + text(s.email))}>{text(s.email)}</a>
          </div>
          <div>
            <h2>{text(s.socialLabel)}</h2>
            {rows(s.socialLinks).map((r, i) => (
              <a key={i} href={href(r.url)}>
                {text(r.label)}
              </a>
            ))}
          </div>
        </div>
        <p className="kf-copyright">{text(s.copyright)}</p>
      </footer>
    </div>
  );
}
