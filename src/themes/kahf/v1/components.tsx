import { useEffect, useRef, useState, useId } from "react";
import type { Context, Json, Values, ViewProps } from "quinecms/core/types";
import { markdown } from "quinecms/core/markdown";
import { text, rows, href, media, entries } from "./content";
import "./styles.css";
export function Picture({
  value,
  context,
  className = "",
  eager = false,
}: {
  value: Json | undefined;
  context: Context;
  className?: string;
  eager?: boolean;
}) {
  const m = media(value, context);
  return m?.mime.startsWith("image/") ? (
    <img
      className={className}
      src={m.src}
      alt={m.alt}
      loading={eager ? "eager" : "lazy"}
    />
  ) : null;
}
function Video({
  value,
  context,
  className = "",
  labels,
}: {
  value: Json | undefined;
  context: Context;
  className?: string;
  labels: Values;
}) {
  const m = media(value, context);
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const pausedByUser = useRef(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !motion.matches && !pausedByUser.current)
        void v.play().catch(() => {});
      else v.pause();
    });
    observer.observe(v);
    return () => {
      observer.disconnect();
      v.pause();
    };
  }, [m?.src]);
  return m?.mime.startsWith("video/") ? (
    <div className={"kf-video " + className}>
      <video
        ref={ref}
        src={m.src}
        muted
        playsInline
        loop
        preload="metadata"
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
      <button
        className="kf-video-control"
        aria-label={text(playing ? labels.pauseLabel : labels.playLabel)}
        onClick={() => {
          const v = ref.current;
          if (v) {
            pausedByUser.current = playing;
            playing ? v.pause() : void v.play().catch(() => {});
          }
        }}
      >
        {playing ? "Ⅱ" : "▷"}
      </button>
    </div>
  ) : null;
}
export function Action({
  label,
  url,
  outline = false,
}: {
  label: Json | undefined;
  url: Json | undefined;
  outline?: boolean;
}) {
  return text(label) && href(url) ? (
    <a
      className={"kf-button" + (outline ? " kf-outline" : "")}
      href={href(url)}
    >
      {text(label)}
    </a>
  ) : null;
}
function Intro({ props }: { props: Values }) {
  return (
    <div className="kf-intro">
      {text(props.eyebrow) && (
        <p className="kf-eyebrow">{text(props.eyebrow)}</p>
      )}
      {text(props.heading) && <h2>{text(props.heading)}</h2>}
      {text(props.description) && <p>{text(props.description)}</p>}
    </div>
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
      className="kf-prose"
      dangerouslySetInnerHTML={{ __html: markdown(value, context.media) }}
    />
  );
}
function HeroView({ props: p, context: c }: ViewProps) {
  const video = media(p.video, c);
  const Heading = p.headingLevel === "h2" ? "h2" : "h1";
  return (
    <section className={"kf-hero kf-hero-" + text(p.variant)}>
      <div className="kf-hero-media">
        {video ? (
          <>
            <Video
              labels={p}
              value={p.video}
              context={c}
              className={p.mobileVideo ? "kf-desktop-media" : ""}
            />
            {p.mobileVideo && (
              <Video
                labels={p}
                value={p.mobileVideo}
                context={c}
                className="kf-mobile-media"
              />
            )}
          </>
        ) : (
          <>
            <Picture
              value={p.image}
              context={c}
              className={p.mobileImage ? "kf-desktop-media" : ""}
              eager
            />
            {p.mobileImage && (
              <Picture
                value={p.mobileImage}
                context={c}
                className="kf-mobile-media"
                eager
              />
            )}
          </>
        )}
      </div>
      <div className="kf-hero-copy">
        {text(p.eyebrow) && <p className="kf-eyebrow">{text(p.eyebrow)}</p>}
        <Heading>{text(p.heading)}</Heading>
        {text(p.description) && <p>{text(p.description)}</p>}
        <div className="kf-actions">
          <Action label={p.actionLabel} url={p.actionURL} />
          <Action label={p.secondaryLabel} url={p.secondaryURL} outline />
        </div>
      </div>
    </section>
  );
}
function SplitView({ props: p, context: c }: ViewProps) {
  return (
    <section
      className={"kf-split kf-split-" + text(p.variant)}
      style={
        media(p.background, c)
          ? { backgroundImage: `url("${media(p.background, c)!.src}")` }
          : undefined
      }
    >
      <div className="kf-split-copy">
        <Intro props={p} />
        <Action label={p.actionLabel} url={p.actionURL} />
      </div>
      <div className="kf-split-media">
        {media(p.video, c) ? (
          <Video labels={p} value={p.video} context={c} />
        ) : (
          <Picture value={p.image} context={c} />
        )}
      </div>
    </section>
  );
}
function CardsView({ props: p, context: c }: ViewProps) {
  return (
    <section className={"kf-section kf-cards-" + text(p.variant)}>
      <Intro props={p} />
      <div className="kf-card-grid">
        {rows(p.items).map((r, i) => (
          <div key={text(r._rowId) || i} className="kf-owned-card">
            <Picture value={r.image} context={c} />
            <h3>
              {href(r.url) ? (
                <a href={href(r.url)}>{text(r.title)}</a>
              ) : (
                text(r.title)
              )}
            </h3>
            {text(r.description) && <p>{text(r.description)}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
function ListingView({ props: p, context: c }: ViewProps) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("");
  const all = entries(c, p);
  const filtered = all.filter(
    (e) =>
      (!category || text(e.values.category) === category) &&
      [e.title, e.values.summary, e.values.category]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
  );
  const shown =
    Number(p.limit) > 0 ? filtered.slice(0, Number(p.limit)) : filtered;
  const id = useId();
  if (p.variant === "feature") {
    const entry = shown[0];
    return entry ? (
      <section className="kf-feature-article">
        <div className="kf-feature-copy">
          <p className="kf-eyebrow">{text(p.heading)}</p>
          <p className="kf-meta">{text(entry.values.metadata)}</p>
          <h1 lang={text(entry.values.contentLanguage) || undefined}>
            {entry.title}
          </h1>
          <p lang={text(entry.values.contentLanguage) || undefined}>
            {text(entry.values.summary)}
          </p>
          <Action label={p.cardLabel} url={entry.url} />
        </div>
        <a href={entry.url}>
          <Picture value={entry.values.image} context={c} eager />
        </a>
      </section>
    ) : null;
  }
  return (
    <section
      className={
        "kf-section kf-listing kf-listing-" +
        text(p.variant) +
        (p.featured ? " kf-featured" : "")
      }
    >
      <div className="kf-section-top">
        <Intro props={p} />
        <Action label={p.actionLabel} url={p.actionURL} outline />
      </div>
      {p.filter && (
        <div className="kf-filters">
          <label htmlFor={id}>
            {text(p.searchLabel)}
            <input
              id={id}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div role="group" aria-label={text(p.allLabel)}>
            {[
              "",
              ...new Set(
                all.map((e) => text(e.values.category)).filter(Boolean),
              ),
            ].map((cat) => (
              <button
                key={cat}
                className={category === cat ? "active" : ""}
                aria-pressed={category === cat}
                onClick={() => setCategory(cat)}
              >
                {cat || text(p.allLabel)}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="kf-card-grid">
        {shown.map((e) => (
          <article
            key={e.id}
            className="kf-entry-card"
            style={
              p.featured && media(e.values.background, c)
                ? {
                    backgroundImage: `url("${media(e.values.background, c)!.src}")`,
                  }
                : undefined
            }
          >
            <a href={e.url} className="kf-card-image">
              <Picture value={e.values.image} context={c} />
            </a>
            <p className="kf-eyebrow">{text(e.values.category)}</p>
            <h3 lang={text(e.values.contentLanguage) || undefined}>
              <a href={e.url}>{e.title}</a>
            </h3>
            {text(e.values.metadata) && (
              <p className="kf-meta">{text(e.values.metadata)}</p>
            )}
            {text(e.values.summary) && (
              <p lang={text(e.values.contentLanguage) || undefined}>
                {text(e.values.summary)}
              </p>
            )}
            <Action label={p.cardLabel} url={e.url} />
          </article>
        ))}
      </div>
      {!shown.length && <p role="status">{text(p.emptyLabel)}</p>}
    </section>
  );
}
function ProductView({ props: p, context: c }: ViewProps) {
  const images = [p.image, ...rows(p.gallery).map((r) => r.image)].filter(
    Boolean,
  );
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const dialogTitle = useId();
  return (
    <>
      <div className="kf-section kf-product">
        <nav className="kf-breadcrumb" aria-label="Breadcrumb">
          <a href={href(p.shopURL)}>{text(p.shopLabel)}</a>
          <span>/</span>
          <span>{text(p.title)}</span>
        </nav>
        <div className="kf-product-grid">
          <div className="kf-gallery">
            <div className="kf-thumbs">
              {images.map((m, i) => (
                <button
                  key={i}
                  aria-label={`${text(p.title)} — ${i + 1}`}
                  aria-pressed={active === i}
                  onClick={() => setActive(i)}
                >
                  <Picture value={m} context={c} />
                </button>
              ))}
            </div>
            <Picture
              value={images[active] ?? p.image}
              context={c}
              className="kf-product-image"
              eager
            />
          </div>
          <div className="kf-product-copy">
            <p className="kf-eyebrow">{text(p.category)}</p>
            <h1>{text(p.title)}</h1>
            <p className="kf-lead">{text(p.summary)}</p>
            {text(p.size) && <p>{text(p.size)}</p>}
            {rows(p.marketplaces).length > 0 && (
              <button
                className="kf-button"
                ref={button}
                onClick={() => dialog.current?.showModal()}
              >
                {text(p.buyLabel)}
              </button>
            )}
            <div className="kf-usage">
              <h2>{text(p.usageLabel)}</h2>
              <p>{text(p.usage)}</p>
            </div>
            <details className="kf-disclosure">
              <summary>{text(p.ingredientsLabel)}</summary>
              <Rich value={p.ingredients} context={c} />
            </details>
          </div>
        </div>
        {rows(p.benefits).length > 0 && (
          <div className="kf-benefits">
            {rows(p.benefits).map((r, i) => (
              <div key={i}>
                <h3>{text(r.title)}</h3>
                <p>{text(r.description)}</p>
              </div>
            ))}
          </div>
        )}
        {text(p.body) && <Rich value={p.body} context={c} />}
      </div>
      <dialog
        className="kf-marketplaces"
        aria-labelledby={dialogTitle}
        ref={dialog}
        onClose={() => button.current?.focus()}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <h2 id={dialogTitle}>{text(p.marketplaceLabel)}</h2>
        {rows(p.marketplaces).map((r, i) => (
          <Action key={i} label={r.title} url={r.url} />
        ))}
        <button
          className="kf-button kf-outline"
          onClick={() => dialog.current?.close()}
        >
          {text(p.closeLabel)}
        </button>
      </dialog>
    </>
  );
}
function ArticleView({ props: p, context: c }: ViewProps) {
  const [copied, setCopied] = useState(false);
  return (
    <article className="kf-article" lang={text(p.contentLanguage) || undefined}>
      <nav className="kf-breadcrumb">
        <a href={href(p.backURL)}>{text(p.backLabel)}</a>
        <span>/</span>
        <span>{text(p.title)}</span>
      </nav>
      <Picture value={p.image} context={c} className="kf-article-cover" eager />
      <header className="kf-article-head">
        <p className="kf-eyebrow">{text(p.category)}</p>
        <h1>{text(p.title)}</h1>
        <p>{text(p.metadata)}</p>
      </header>
      <div className="kf-article-body">
        <Rich value={p.body} context={c} />
        <footer>
          <p>{text(p.author)}</p>
          <button
            className="kf-text-button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(location.href);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? "✓" : text(p.shareLabel)}
          </button>
          <Action label={p.backLabel} url={p.backURL} outline />
        </footer>
      </div>
    </article>
  );
}
function IngredientView({ props: p, context: c }: ViewProps) {
  return (
    <>
      <section className="kf-ingredient-head kf-split">
        <div className="kf-split-copy">
          <a href={href(p.backURL)}>{text(p.backLabel)}</a>
          <h1>{text(p.title)}</h1>
          <p className="kf-lead">{text(p.summary)}</p>
        </div>
        <Picture value={p.image} context={c} eager />
      </section>
      <CardsView
        props={{
          heading: p.benefitsHeading,
          items: p.benefits,
          variant: "benefits",
        }}
        context={c}
      />
      <section className="kf-section kf-faq">
        <h2>{text(p.faqHeading)}</h2>
        <div>
          {rows(p.questions).map((r, i) => (
            <details key={i} className="kf-disclosure">
              <summary>{text(r.title)}</summary>
              <Rich value={r.answer} context={c} />
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
function ConcernView({ props: p, context: c }: ViewProps) {
  return (
    <>
      <HeroView
        props={{
          heading: p.title,
          description: p.summary,
          image: p.image,
          variant: "concern",
        }}
        context={c}
      />
      <section className="kf-section kf-routine">
        <h2>{text(p.routineHeading)}</h2>
        <div className="kf-card-grid">
          {rows(p.steps).map((r, i) => (
            <article key={i}>
              <div className="kf-step">
                {text(r.step)}
                <strong>{i + 1}</strong>
              </div>
              <Picture value={r.image} context={c} />
              <p className="kf-eyebrow">{text(r.eyebrow)}</p>
              <h3>{text(r.title)}</h3>
              <p>{text(r.description)}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
function SearchView({ props: p, context: c }: ViewProps) {
  const [query, setQuery] = useState("");
  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get("q") ?? "");
  }, []);
  const id = useId();
  const docs = [
    ...(c.collections ?? []).flatMap((col) =>
      col.entries
        .filter((e) => e.url)
        .map((e) => ({ id: e.id, title: e.title, url: e.url })),
    ),
    ...rows(p.pages).map((r, i) => ({
      id: "page-" + i,
      title: text(r.title),
      url: href(r.url),
    })),
  ];
  const results = query.trim()
    ? docs.filter((e) =>
        e.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
      )
    : [];
  return (
    <section className="kf-section kf-search">
      <h1>{text(p.heading)}</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const url = new URL(location.href);
          if (query.trim()) url.searchParams.set("q", query.trim());
          else url.searchParams.delete("q");
          history.replaceState(null, "", url);
        }}
      >
        <label htmlFor={id}>{text(p.searchLabel)}</label>
        <div>
          <input
            id={id}
            type="search"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="kf-button">{text(p.searchLabel)}</button>
        </div>
      </form>
      <div aria-live="polite">
        {!query.trim() ? (
          <p>{text(p.hint)}</p>
        ) : results.length ? (
          <ul>
            {results.map((e) => (
              <li key={e.id}>
                <a href={e.url}>
                  {e.title}
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>{text(p.emptyLabel)}</p>
        )}
      </div>
    </section>
  );
}

// Catalog previews render blocks without a site layout. Keep their styles scoped.
function scoped(View: (props: ViewProps) => React.ReactNode) {
  return function KahfBlock(props: ViewProps) {
    return (
      <div className="kahf-block">
        <View {...props} />
      </div>
    );
  };
}
export const Hero = scoped(HeroView);
export const Split = scoped(SplitView);
export const Cards = scoped(CardsView);
export const Listing = scoped(ListingView);
export const Product = scoped(ProductView);
export const Article = scoped(ArticleView);
export const Ingredient = scoped(IngredientView);
export const Concern = scoped(ConcernView);
export const Search = scoped(SearchView);
