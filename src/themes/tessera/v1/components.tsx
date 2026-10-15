import { useState, useEffect, useId } from "react";
import { ForwardMarch, PixelDemo, useDemoClock } from "./motion";
import type { ViewProps, Values, Json, Context } from "quinecms/core/types";
import { markdown } from "quinecms/core/markdown";
import { text, href, rows, image, entries } from "./content";
import "./styles.css";

export function Mark() {
  return (
    <span className="ts-mark" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
export function Action({
  label,
  url,
  secondary = false,
}: {
  label?: Json;
  url?: Json;
  secondary?: boolean;
}) {
  return text(label) && href(url) ? (
    <a
      className={`ts-button${secondary ? " ts-secondary" : ""}`}
      href={href(url)}
    >
      <span className="ts-button-label">
        <span>{text(label)}</span>
        <span aria-hidden="true">{text(label)}</span>
      </span>
    </a>
  ) : null;
}
export function Copy({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [status, setStatus] = useState("");
  return (
    <button
      type="button"
      className="ts-copy"
      aria-label={status || label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setStatus("Copied");
        } catch {
          setStatus("Copy unavailable");
        }
      }}
    >
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        {status === "Copied" ? (
          <path d="m5 12 4 4 10-10" />
        ) : (
          <>
            <rect x="8" y="8" width="12" height="12" rx="2" />
            <path d="M15 4H6a2 2 0 0 0-2 2v9" />
          </>
        )}
      </svg>{" "}
      <span className="ts-copy-label">{status || label}</span>
    </button>
  );
}
function Command({ value }: { value: Json | undefined }) {
  return text(value) ? (
    <div className="ts-command">
      <code>
        <span>$ </span>
        {text(value)}
      </code>
      <Copy value={text(value)} label="Copy command" />
    </div>
  ) : null;
}
function Emphasis({ value, emphasis }: { value?: Json; emphasis?: Json }) {
  const label = text(value),
    phrase = text(emphasis),
    at = phrase ? label.indexOf(phrase) : -1;
  return at < 0 ? (
    <>{label}</>
  ) : (
    <>
      {label.slice(0, at)}
      <em>{phrase}</em>
      {label.slice(at + phrase.length)}
    </>
  );
}
function Intro({ props, level = 2 }: { props: Values; level?: 1 | 2 }) {
  const H = level === 1 ? "h1" : "h2";
  return (
    <div className="ts-intro">
      {text(props.eyebrow) && (
        <p className="ts-eyebrow">{text(props.eyebrow)}</p>
      )}
      {text(props.heading) && (
        <H>
          <Emphasis value={props.heading} emphasis={props.emphasis} />
        </H>
      )}
      {text(props.description) && (
        <p className="ts-description">{text(props.description)}</p>
      )}
      {text(props.actionLabel) && (
        <a className="ts-text-link" href={href(props.actionURL)}>
          {text(props.actionLabel)}
        </a>
      )}
    </div>
  );
}
export function Code({
  code,
  filename = "schema.ts",
}: {
  code: string;
  filename?: string;
}) {
  return (
    <div className="ts-code">
      <header>
        <span>{filename}</span>
        <Copy value={code} />
      </header>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
const schema =
  "export const posts = table({\n  id: uuid().primaryKey(),\n  title: text().notNull(),\n  author: text().references(users.handle),\n  createdAt: timestamp().defaultNow(),\n})";
const sampleRows = [
  ["1", "Designing typed APIs", "ada", "Sep 12"],
  ["2", "Branching databases", "lin", "Sep 11"],
  ["3", "Row-level rules in practice", "ada", "Sep 09"],
  ["4", "Shipping realtime cursors", "sam", "Sep 08"],
  ["5", "Schema diffs, explained", "ada", "Sep 05"],
  ["6", "Cold starts under 100ms", "lin", "Sep 03"],
  ["7", "Migrating from REST", "sam", "Sep 01"],
];
function Tabs({
  names,
  active,
  onChange,
  label,
}: {
  names: string[];
  active: number;
  onChange(i: number): void;
  label: string;
}) {
  return (
    <div className="ts-tabs" role="group" aria-label={label}>
      {names.map((n, i) => (
        <button
          type="button"
          key={n}
          aria-pressed={active === i}
          onClick={() => onChange(i)}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
export function Hero({ props }: ViewProps) {
  return (
    <section
      className="ts-section ts-hero"
      id={text(props.anchor) || undefined}
    >
      <div>
        <Command value={props.command} />
        <h1>
          {text(props.heading)}
          <em>{text(props.emphasis)}</em>
        </h1>
        <p className="ts-description">{text(props.description)}</p>
        <div className="ts-actions">
          <Action label={props.actionLabel} url={props.actionURL} />
          <Action
            label={props.secondaryLabel}
            url={props.secondaryURL}
            secondary
          />
        </div>
      </div>
      <PixelDemo />
    </section>
  );
}
export function Heading({ props }: ViewProps) {
  return (
    <section
      className="ts-section ts-page-heading"
      id={text(props.anchor) || undefined}
    >
      <Intro props={props} level={1} />
    </section>
  );
}
export function Logos({ props }: ViewProps) {
  return (
    <section className="ts-section ts-logos">
      <p>{text(props.heading)}</p>
      <div>
        {rows(props.items).map((r, i) => (
          <span key={i}>{text(r.label)}</span>
        ))}
      </div>
    </section>
  );
}
function AppDemo({ active }: { active: number }) {
  const data =
    active === 2 ? sampleRows.filter((r) => r[2] === "ada") : sampleRows;
  return (
    <div className="ts-app-demo">
      <header>
        <Mark /> tessera <span>/ blog-app</span>
        <small>● main</small>
      </header>
      <div className="ts-app-body">
        <aside>
          {["Schema", "Data", "Queries", "Realtime", "Functions", "Logs"].map(
            (x, i) => (
              <span className={i === active ? "is-active" : ""} key={x}>
                {x}
              </span>
            ),
          )}
          <small>TABLES</small>
          <span>▦ posts</span>
          <span>▦ users</span>
          <span>▦ comments</span>
        </aside>
        <div className="ts-app-content">
          {active === 0 ? (
            <>
              <Code code={schema} />
              <div className="ts-generated">
                <p>Generated</p>
                <span>✓ Postgres table: posts</span>
                <span>✓ REST + realtime API: /v1/posts</span>
                <span>✓ Type: Post</span>
                <span>✓ Migration 0042</span>
              </div>
            </>
          ) : (
            <>
              {active === 2 && (
                <Code
                  filename="query.ts"
                  code={
                    'const posts = await db.posts\n  .where({ author: "ada" }).all()'
                  }
                />
              )}
              <div className="ts-table-scroll">
                <table>
                  <thead>
                    <tr>
                      {["id", "title", "author", "createdAt"].map((x) => (
                        <th key={x}>{x}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((r, i) => (
                      <tr key={i}>
                        {r.map((c, j) => (
                          <td key={j}>{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="ts-app-status">
                {data.length} rows ·{" "}
                {active === 3 ? "● Live subscription" : "12 ms"}{" "}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export function Walkthrough({ props }: ViewProps) {
  const [active, setActive] = useState(0);
  const steps = rows(props.steps);
  const { ref, tick } = useDemoClock(9000);
  useEffect(() => {
    if (tick) setActive((n) => (n + 1) % Math.max(steps.length, 1));
  }, [tick, steps.length]);
  return (
    <section
      className="ts-section ts-walkthrough"
      id={text(props.anchor) || undefined}
    >
      <Intro props={props} />
      <div className="ts-walkthrough-grid" ref={ref}>
        <div className="ts-steps">
          {steps.map((s, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={active === i}
              onClick={() => setActive(i)}
            >
              <span className="ts-step-number">{i + 1}</span>
              <span>
                <strong>{text(s.title)}</strong>
                <span>{text(s.description)}</span>
              </span>
            </button>
          ))}
        </div>
        <AppDemo active={active} />
      </div>
    </section>
  );
}
function Person({ row, context }: { row: Values; context: Context }) {
  const im = image(row.image, context);
  return (
    <div className="ts-person">
      <span className={`ts-avatar${im ? "" : " ts-avatar-initials"}`}>
        {im ? (
          <img {...im} width="40" height="40" loading="lazy" />
        ) : (
          text(row.name)
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")
        )}
      </span>
      <p>
        <strong>{text(row.name)}</strong>
        <span>{text(row.role)}</span>
      </p>
    </div>
  );
}
export function Testimonials({ props, context }: ViewProps) {
  const community = text(props.variant) === "community";
  const items = rows(props.items);
  const cards = (duplicate = false) => (
    <div
      className={community ? "ts-ticker-group" : "ts-quote-grid"}
      aria-hidden={duplicate || undefined}
    >
      {items.map((r, i) => (
        <article
          className={`ts-quote ts-wordmark-${text(r.wordmark) || "sans"}`}
          key={i}
        >
          {!community && (
            <span className="ts-quote-pattern" aria-hidden="true" />
          )}
          {community && <Person row={r} context={context} />}
          {text(r.title) && <h3>{text(r.title)}</h3>}
          <blockquote>{text(r.quote)}</blockquote>
          {!community && <Person row={r} context={context} />}
          {text(r.metric) && <p className="ts-metric">{text(r.metric)}</p>}
          {!duplicate && href(r.url) && (
            <a href={href(r.url)}>Read the story →</a>
          )}
        </article>
      ))}
    </div>
  );
  return (
    <section
      id={text(props.anchor) || undefined}
      className={`ts-section ts-testimonials ts-${community ? "community" : "stories"}`}
    >
      <Intro props={props} />
      {text(props.caption) && (
        <p className="ts-testimonial-caption">{text(props.caption)}</p>
      )}
      {community ? (
        <div
          className="ts-ticker"
          tabIndex={0}
          role="region"
          aria-label="Developer testimonials. Focus or hover to pause."
        >
          <div className="ts-ticker-track">
            {cards()}
            {cards(true)}
          </div>
        </div>
      ) : (
        cards()
      )}
    </section>
  );
}
export function Features({ props }: ViewProps) {
  const [tab, setTab] = useState(0);
  const panels = rows(props.panels);
  const active = Math.min(tab, Math.max(0, panels.length - 1));
  const panel = panels[active];
  const id = useId();
  return (
    <section
      className="ts-section ts-features"
      id={text(props.anchor) || undefined}
    >
      <Intro props={props} />
      {panel && (
        <div className="ts-feature-demo">
          <div
            className="ts-feature-tabs"
            role="tablist"
            aria-label="Platform features"
          >
            {panels.map((p, i) => (
              <button
                key={i}
                id={`${id}-tab-${i}`}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-controls={`${id}-panel`}
                tabIndex={i === active ? 0 : -1}
                onClick={() => setTab(i)}
                onKeyDown={(event) => {
                  const next =
                    event.key === "ArrowRight"
                      ? (i + 1) % panels.length
                      : event.key === "ArrowLeft"
                        ? (i + panels.length - 1) % panels.length
                        : event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? panels.length - 1
                            : null;
                  if (next !== null) {
                    event.preventDefault();
                    setTab(next);
                    document.getElementById(`${id}-tab-${next}`)?.focus();
                  }
                }}
              >
                {text(p.label)}
              </button>
            ))}
          </div>
          <div
            id={`${id}-panel`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${active}`}
            tabIndex={0}
          >
            <p className="ts-feature-description">{text(panel.description)}</p>
            <div className="ts-feature-panels">
              <div>
                <p>{text(panel.leftLabel)}</p>
                <pre>
                  <code>{text(panel.leftCode)}</code>
                </pre>
              </div>
              <div>
                <p>{text(panel.rightLabel)}</p>
                <pre>
                  <code>{text(panel.rightCode)}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="ts-feature-grid">
        {rows(props.items).map((r, i) => (
          <a key={i} href={href(r.url)}>
            <span className="ts-symbol" aria-hidden="true">
              <FeatureIcon index={i} />
            </span>
            <h3>{text(r.title)}</h3>
            <p>{text(r.description)}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
function FeatureIcon({ index }: { index: number }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {index % 4 === 0 ? (
        <>
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0" />
        </>
      ) : index % 4 === 1 ? (
        <>
          <rect x="5" y="10" width="14" height="11" rx="2" />
          <path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3" />
        </>
      ) : index % 4 === 2 ? (
        <>
          <circle cx="12" cy="12" r="2" />
          <path d="M7.8 7.8a6 6 0 0 0 0 8.4m8.4-8.4a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14" />
        </>
      ) : (
        <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18" />
      )}
    </svg>
  );
}
export function ProductFeature({ props }: ViewProps) {
  return (
    <section
      id={text(props.anchor) || undefined}
      className={`ts-section ts-product-feature${props.reverse ? " ts-reverse" : ""}`}
    >
      <div>
        <Intro props={{ ...props, actionLabel: "" }} />
        <ul className="ts-checks">
          {rows(props.items).map((r, i) => (
            <li key={i}>✓ {text(r.label)}</li>
          ))}
        </ul>
        <a className="ts-text-link" href={href(props.actionURL)}>
          {text(props.actionLabel)}
        </a>
      </div>
      <Code code={text(props.code)} filename={text(props.filename)} />
    </section>
  );
}
export function CTA({ props }: ViewProps) {
  return (
    <section className="ts-section ts-cta" id={text(props.anchor) || undefined}>
      <div className="ts-cta-copy">
        <h2>
          <Emphasis value={props.heading} emphasis={props.emphasis} />
        </h2>
        <Command value={props.command} />
        <div className="ts-actions">
          <Action label={props.actionLabel} url={props.actionURL} />
          <Action
            label={props.secondaryLabel}
            url={props.secondaryURL}
            secondary
          />
        </div>
      </div>
      <ForwardMarch />
    </section>
  );
}
export function Pricing({ props }: ViewProps) {
  const [annual, setAnnual] = useState(false);
  return (
    <section className="ts-section ts-pricing">
      <Tabs
        names={["Monthly", "Annual · Save 20%"]}
        active={annual ? 1 : 0}
        onChange={(i) => setAnnual(i === 1)}
        label="Billing period"
      />
      <div className="ts-plans">
        {rows(props.plans).map((p, i) => (
          <article key={i} className={p.featured ? "is-featured" : ""}>
            <div className="ts-plan-label">
              <h2>{text(p.name)}</h2>
              {p.featured && <span>Most popular</span>}
            </div>
            <p>{text(p.description)}</p>
            <h3>{text(annual ? p.annual : p.monthly)}</h3>
            <small>
              {text(p.period)}
              {annual && i > 0 && i < 3 ? " · billed annually" : ""}
            </small>
            <Action label={p.actionLabel} url={p.url} secondary={!p.featured} />
            <ul className="ts-checks">
              {text(p.features)
                .split("\n")
                .map((x) => (
                  <li key={x}>✓ {x}</li>
                ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
export function Comparison({ props }: ViewProps) {
  return (
    <section className="ts-section ts-comparison">
      <h2>{text(props.heading)}</h2>
      <div
        className="ts-table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Plan comparison"
      >
        <table>
          <thead>
            <tr>
              {["", "Free", "Pro", "Team", "Enterprise"].map((x) => (
                <th key={x}>{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows(props.items).map((r, i) => (
              <tr key={i} className={!text(r.free) ? "ts-table-group" : ""}>
                <th scope="row">{text(r.feature)}</th>
                {["free", "pro", "team", "enterprise"].map((k) => (
                  <td key={k}>{text(r[k])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
export function FAQ({ props }: ViewProps) {
  return (
    <section className="ts-section ts-faq">
      <Intro props={props} />
      <div>
        {rows(props.items).map((r, i) => (
          <details key={i}>
            <summary>
              {text(r.question)}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{text(r.answer)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
function Rich({
  value,
  context,
}: {
  value: Json | undefined;
  context: Context;
}) {
  return (
    <div
      className="ts-prose"
      dangerouslySetInnerHTML={{ __html: markdown(value, context.media) }}
    />
  );
}
export function Article({ props, context }: ViewProps) {
  const im = image(props.image, context);
  return (
    <article
      className={`ts-article${text(props.examples) ? " ts-api-article" : ""}`}
      data-article-title={text(props.title)}
    >
      <div className="ts-article-primary">
        <p className="ts-eyebrow">{text(props.category)}</p>
        <div className="ts-article-title">
          <h1>{text(props.title)}</h1>
          <Copy
            value={[
              text(props.title),
              text(props.summary),
              text(props.body),
              text(props.examples),
            ].join("\n\n")}
            label="Copy page"
          />
        </div>
        {text(props.metadata) && (
          <p className="ts-byline">{text(props.metadata)}</p>
        )}
        {text(props.summary) && (
          <p className="ts-article-summary">{text(props.summary)}</p>
        )}
        {im && <img className="ts-article-image" {...im} loading="lazy" />}
        <Rich value={props.body} context={context} />
        {href(props.nextURL) && (
          <a className="ts-next" href={href(props.nextURL)}>
            <span>Continue reading</span>
            {text(props.nextLabel)} →
          </a>
        )}
      </div>
      {text(props.examples) && (
        <aside className="ts-api-examples">
          <Copy value={text(props.examples)} label="Copy examples" />
          <Rich value={props.examples} context={context} />
        </aside>
      )}
    </article>
  );
}
export function Listing({ props, context }: ViewProps) {
  const list = entries(context, props);
  const limited =
    Number(props.limit) > 0 ? list.slice(0, Number(props.limit)) : list;
  return (
    <section
      className={`ts-section ts-listing ts-listing-${text(props.variant)}`}
    >
      <Intro props={props} />
      <div className="ts-listing-grid">
        {limited.map((e, i) => {
          const v = e.values ?? {};
          const im = image(v.image, context);
          return (
            <a key={e.id} href={href(e.url)} className="ts-story-card">
              {props.variant === "blog" ? (
                <div
                  className={`ts-blog-art ts-art-${i % 3}`}
                  aria-hidden="true"
                >
                  <span>
                    {["{ schema }", "⌁ realtime", "↳ row rules"][i % 3]}
                  </span>
                  <i />
                  <i />
                  <i />
                </div>
              ) : (
                <div className="ts-company-mark">{text(v.category)}</div>
              )}
              <div className="ts-story-copy">
                <p className="ts-eyebrow">{text(v.category)}</p>
                <h2>{e.title}</h2>
                <p>{text(v.summary)}</p>
                <div className="ts-person">
                  {im && <img {...im} width="36" height="36" loading="lazy" />}
                  <small>{text(v.metadata)}</small>
                </div>
                <span className="ts-text-link">
                  {props.variant === "customers"
                    ? "Read the story"
                    : "Read article"}{" "}
                  →
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
export function Updates({ props, context }: ViewProps) {
  return (
    <section className="ts-section ts-updates">
      <Intro props={props} />
      <div className="ts-update-cards">
        {entries(context, props)
          .slice(0, 3)
          .map((e) => (
            <a
              className="ts-update"
              key={e.id}
              href={href(e.url) || href(props.actionURL)}
            >
              <p className="ts-eyebrow">
                {text(e.values.category)} ·{" "}
                {text(e.values.version) || text(e.values.metadata)}{" "}
                {text(e.values.date)}
              </p>
              <h3>{e.title}</h3>
              <p>{text(e.values.summary)}</p>
            </a>
          ))}
      </div>
    </section>
  );
}
export function Changelog({ props, context }: ViewProps) {
  const [filter, setFilter] = useState("All");
  const items = entries(context, props);
  const cats = ["All", ...new Set(items.map((e) => text(e.values?.category)))];
  return (
    <section className="ts-section ts-changelog">
      <Tabs
        names={cats}
        active={cats.indexOf(filter)}
        onChange={(i) => setFilter(cats[i])}
        label="Filter releases"
      />
      {items
        .filter((e) => filter === "All" || e.values?.category === filter)
        .map((e) => (
          <article key={e.id} className="ts-release">
            <aside>
              <time>{text(e.values?.date)}</time>
              <span className="ts-badge">{text(e.values?.category)}</span>
              <code>{text(e.values?.version)}</code>
            </aside>
            <div>
              <h2>{e.title}</h2>
              <Rich value={e.values?.body} context={context} />
            </div>
          </article>
        ))}
    </section>
  );
}
