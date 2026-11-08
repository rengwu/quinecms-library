# QuineCMS Library

Archline, Intr and Tessera layouts and blocks for independent QuineCMS sites.
This repository owns their implementations, settings controls, policy modules,
scoped styles and local assets. It contains no engine or admin fork.

The manifest exposes 45 block versions and three layout designs. Installed
implementations appear in the site's catalogs. A site subscribes by listing
`quinecms-library` in `quinecms.config.json` and installing compatible engine and
library dependencies. Production dependencies use exact versions or Git commits
and a committed lockfile. Upgrades are explicit and do not rewrite site content.

Configure designs through exposed fields. Source changes belong upstream here;
do not patch installed or generated files. Original site extensions may use
separate identities. See the
[engine contract](https://github.com/rengwu/quinecms/blob/engine-separation/docs/wiki/features/site-engine.md).

With the engine's default text localization, text and rich-text fields support
language copies without a `localized: true` declaration. Technical text such as
anchors, commands, code and contact addresses uses `localized: false`; collection
field mappings are always shared. Existing explicit localization choices are
retained. Upgrade engine and library together, then review existing language
copies: newly translatable text starts blank while the original values stay in
the main language. Subscribing to a library does not update site-owned collection
schemas; the Tessera starter marks release version identifiers shared for new sites.

## Tessera starter

[Tessera's preset](presets/tessera/v1/README.md) includes an explicit starter copy
of content and configuration, 16 block versions and local assets. It recreates
59 public pages from the reference with marketing, documentation and API modes
of one layout design. Library subscriptions never import this content implicitly.

The 0.2.0 library requires engine 0.3.0's declared collection-field rendering
(peer `^0.3.0`; manifest `>=0.3.0`). Use exact Git commit pins for installation; these source versions are not npm releases. The sibling dev site currently
links both repositories for authoring. The independently pinned Archline pilot
has not been upgraded or changed.

## Development

```sh
pnpm install --frozen-lockfile
pnpm test
```

The development dependency pins the compatible engine commit. Tests assemble an ignored
`.quinecms/` site from the installed engine and this library. Nine tests cover
Archline, Intr and Tessera validation, shared edits, rendering, local assets and
routes. Test fixtures/backups are not distributed; `presets/` is deliberately
included in the package for explicit starter adoption.

The dev site validates and typechecks with 255 files and no diagnostics. A
disposable site with exact installed version declarations built all 59 public
routes plus encrypted admin and passed `check-build`; its local links are test
plumbing, not evidence of a remote pinned installation or hosting deployment.
See the engine wiki's `verification/runs/2026-10-16-tessera.md` for browser checks,
source fingerprints and limits.
