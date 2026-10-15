# Tessera starter

An editable QuineCMS recreation of
[Tessera](https://tessera-template.framer.website/), captured 2026-10-16.
[reference.json](reference.json) records source routes, images and fonts.

## Included

- One `tessera@1` design with marketing, docs and API modes, and three saved
  configurations in `content/site.json`.
- Sixteen `tessera-*` block versions: hero, heading, logos, walkthrough,
  testimonials, features, CTA, product feature, pricing, comparison, FAQ, article,
  generic article, listing, updates and changelog.
- Twelve page records: eight static pages and four generic templates.
- Five collections and 59 entries: docs, API, posts, customers and releases.
  Together they generate 59 public routes. Releases appear on the changelog.
- Twenty media records and four local font files. Library assets live under
  `public/tessera/v1/`; media references use those installed public URLs.

## Adopt in an independent site

Install a compatible engine (0.3.0) and this library (0.2.0), using exact supported
pins for production. Add `quinecms-library` to the site's configured `libraries`.
This preset's configuration selects `tessera@1` as the initial design.

For a new or explicitly replaceable site, copy this preset's `content/` and
`quinecms.config.json` into that repository after checking/backing up existing
content and browser drafts. Merge configuration if it already has subscriptions
or original extensions. Supply the site's own environment credentials; the
preset contains none. Then run its content validation, check and build scripts.
The starter copy belongs to the site from that point onward. Updating a library
subscription does not replace or migrate it.

The sibling `quinecms-dev-site` demonstrates local authoring links. Its previous
Archline sample is preserved in `backups/archline-20261016-050638/` with a verified
archive and SHA-256 manifest.

## Design and intentional boundaries

The design uses scoped CSS and container queries, native menus/FAQ disclosures,
local title/path search, light/dark state, pricing tabs and small code demos.
Article prose, parameter lists and code examples use the existing Markdown
renderer. Collection field selectors feed reusable listing and release blocks;
the homepage uses separate blog and release sections. Articles and listings
share records. There is no new backend or reference-specific engine feature.

The design includes the animated schema demo, automatic walkthrough, developer
ticker, five editable feature panels, pixel-chevron CTA, entrance and button hover
effects. Motion preferences are respected. These are library-owned visual demos;
simulated product services, persistent feedback and the combined updates widget
are omitted. GitHub/contact destinations retain the
reference's public links; nothing is sent while browsing. The source's missing
CLI page links to Installation. Unfinished About/Status/Privacy/Terms links are
omitted; optional sign-in remains empty. The source blog slug containing `2.0`
is normalized to `2-0` for the existing QuineCMS route contract.

## Verification boundary

The starter passes publication validation and round-trip parsing. Tests cover
unique routes, local media, safe article rendering and shared listing edits.
A disposable production build passes output checks and a complete local
route/asset/anchor audit. Safari checks cover public desktop/mobile containers,
docs search, theme switching and admin mapping changes with cancellation.
This is a functional visual recreation, not a pixel-exact Framer export; live
Git/R2/hosting and external product services are not part of these checks.
