# QuineCMS Library

Archline and Intr layouts and blocks, installed as a pinned dependency by QuineCMS
sites. This repository owns their implementations, settings controls, policy modules,
scoped styles and local media/fonts. It does not include an engine or admin fork.

A consuming site declares the exact Git commit in package.json, commits the pnpm
lockfile, and lists `quinecms-library` in its `quinecms.config.json` libraries array.
The library manifest exposes 29 block versions and two layouts. All installed
implementations appear in the site's catalogs; changing the active layout does not
filter available blocks.

Use exposed fields to configure designs. Deeper changes belong upstream in this
repository; copying or patching installed library source is not a supported site
workflow. Sites can author independent extensions with distinct identities.

See the [engine contract](https://github.com/rengwu/quinecms/blob/engine-separation/docs/wiki/features/site-engine.md)
and [Archline pilot](https://github.com/rengwu/quinecms-site-archline).
Engine and library revisions are upgraded independently and manually. Verify the
site's content, types, build and relevant browser journeys after an upgrade.

## Library development

```sh
pnpm install --frozen-lockfile
pnpm test
```

Tests create an ignored `.quinecms/` fixture using the pinned engine, then validate
fixture records, media, shared project edits, generic bindings and rendering. The
fixture content and backups under `tests/` are not distributed to sites. Reference
design work originated in the QuineCMS Archline/Intr recreation trials; this
extraction preserves those implementations and assets.
