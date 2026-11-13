# Kahf starter

An explicit, partially bilingual recreation of https://www.kahfeveryday.com/en/.
This sample exercises QuineCMS locally; it is not the original brand's live site.
Source reviewed on 2026-10-25. Subscribing to the library never imports these
records automatically. Copy this preset only into a new site or a backed-up site
whose content replacement is authorized.

## Contents and ownership

One versioned layout design, with standard and overlay-header configurations;
ten block definitions; four collections; six static pages; seven entries; thirteen
logical routes. English is unprefixed, Indonesian uses `/id`, producing 26 routes.
Story, deodorant, the mosque article and oily skin intentionally lack Indonesian
copies. They exercise whole-item fallback with `noindex`. The shared layout and
generic templates have Indonesian copies.

Design components, schemas and original reusable assets belong to this library.
The adopting site owns its copied records, configuration, credentials and future
content. The engine owns validation, routing, translation, admin and persistence.
No engine files are overridden by the preset.

| Page | Blocks and content |
| --- | --- |
| Home | Video hero, owned category cards, Products listing, story split, Articles listing, promotion split |
| Story | Story hero, image/copy splits, owned value gallery and partnership cards |
| Shop | Overlay layout, image hero, Products filter/listing, Concerns listing |
| Product (2) | Generic product template: gallery, usage, ingredient disclosure, owned benefits and marketplace links; optional pairing text |
| Blog | Collection-backed featured article, searchable Articles listing, promotion |
| Article (2) | Generic article with cover, full Markdown, local inline media, metadata and copy-link control |
| Ingredients | Image hero and Ingredients listing |
| Ingredient (1) | Generic ingredient: overview, owned benefits and FAQ rows |
| Concern (2) | Generic concern: hero, four owned routine steps and Concerns listing |
| Search | Client title search over routed collection entries plus editable static-page links |

Listing blocks declare `collectionField` paths and use the engine-supplied values.
Editing one entry updates every listing and its detail. Owned arrays/lists use
stable row IDs; language copies vary only marked leaves and media alt text.

## Source treatment

- Images, videos and fonts are local. `public/kahf/v1/sources.json` records the
  original asset URLs, output paths, sizes and image optimization. Images larger
  than 1800px are resized; optimized images use WebP quality 88. Three source
  videos are retained. Source attribution is provenance, not a license grant.
- The two selected products are Skin Energizing and Brightening Face Wash and
  Extra Dry Antiperspirant Deodorant. The ingredient is Hydrobalance. Concerns are
  Acne Prone Skin and Oily Skin. Articles are Jembatan Berkahf and Masjid Al-Kahf NTT.
- The bridge's complete Indonesian article is translated into English for the
  main copy. Its Indonesian copy retains the original. The mosque article keeps
  its original Indonesian text, explicitly marked `lang="id"`, including on its
  English route. Indonesian summaries/usage/benefits are translated where the
  source Indonesian page still contained English. No new product claims are added.
- The source story's obvious `AAAAAAAAA` token and unnamed repeated ingredient
  testimonials are omitted. Recommendations pointing to omitted product records
  are omitted; concern routine steps remain informative owned content.
- Scope intentionally removes account, Decode, counselor, community service and
  funding flows, peripheral archives, legal pages and links to omitted routes.
  Only two catalog categories remain. Marketplace links navigate outward; there
  is no checkout. No trackers/cookie banner or WhatsApp signup is installed.
- The blog uses one featured article instead of an automatic carousel, then both
  retained articles. Featured products are static cards. Decorative motion is
  reduced; source videos have pause controls and pause offscreen. Reduced-motion
  users do not get automatic video playback.
- Navigation and contact footer are simplified to the retained scope. Language
  URLs are explicit editable values. Raw URLs/Markdown are not rewritten by the
  engine: a link inside a fallback English item may return to the main language.
  Collection-backed links and the language switch use resolved language routes.

## Local verification and release boundary

Requires the i18n engine at `7f7a47ba8409dc1bb9cdb44777869ca7c5930328` or later,
including the translated layout contract. That SHA was not downloadable from the
engine's GitHub archive on 2026-10-25. This development phase uses sibling local
links; no portable remote installation or release is claimed.

```sh
pnpm install --frozen-lockfile
pnpm test
node scripts/verify-kahf.mjs
```

Run these in the library root. The last command creates only the disposable
`.quinecms/kahf-proof` fixture, validates, typechecks, builds and checks its static
artifacts using installed checkouts. Its exact installed-version declarations and
symlinks are test plumbing, not a remote package installation. The engine rejects
production builds of ordinary sites with floating/local-link dependency specs.
Before delivery, publish reviewed engine/library commits, replace links with
supported exact pins, regenerate the lockfile and repeat a clean frozen install
and the site's own checks. Hosting and live Git/R2 are outside this local proof.

See the engine wiki's `features/kahf.md` and
`verification/runs/2026-10-25-kahf.md` for the authoring recipe and evidence.
