import { expect, it } from "vitest";
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  contextFor,
  filesFor,
  parseFiles,
  validate,
} from "quinecms/core/content";
import { localize, pruneCopies } from "quinecms/core/languages";
import { publicRoutes } from "quinecms/core/routes";
import { definitions } from "../.quinecms/site/.quinecms/workspace/src/generated/definitions";
import { Article, Listing } from "../src/themes/kahf/v1/components";
async function fixture() {
  const files: Record<string, string> = {};
  async function walk(dir: string) {
    for (const item of await readdir(join("presets/kahf/v1", dir), {
      withFileTypes: true,
    })) {
      const path = dir + "/" + item.name;
      if (item.isDirectory()) await walk(path);
      else if (path.endsWith(".json"))
        files[path] = await readFile(join("presets/kahf/v1", path), "utf8");
    }
  }
  await walk("content");
  return parseFiles(files);
}
it("validates the 13-route starter and its local media, round-tripping without content loss", async () => {
  const c = await fixture();
  expect(validate(c, definitions)).toEqual([]);
  expect(parseFiles(filesFor(c))).toEqual(c);
  expect(publicRoutes(c)).toHaveLength(13);
  expect(c.collections).toHaveLength(4);
  for (const m of c.media)
    expect((await stat(join("public", m.original.url))).size).toBe(
      m.original.bytes,
    );
  const routes = new Set(publicRoutes(c).map((r) => r.path));
  function links(v: unknown): string[] {
    if (typeof v === "string")
      return v.startsWith("/") ? [v.split("#")[0]] : [];
    if (Array.isArray(v)) return v.flatMap(links);
    if (v && typeof v === "object") return Object.values(v).flatMap(links);
    return [];
  }
  for (const url of [
    ...links(c.pages.map((p) => p.blocks.map((b) => b.props))),
    ...links(c.site.layouts?.map((l) => l.design.settings)),
  ])
    expect(routes, url).toContain(url);
});
it("uses actual Indonesian copies and whole-item fallback, and blocks strict publication", async () => {
  const c = await fixture();
  const id = localize(c, "id", definitions);
  expect([...id.fallback].sort()).toEqual(
    [
      "entry_kahf_deodorant",
      "entry_kahf_mosque",
      "entry_kahf_oily",
      "page_kahf_story",
    ].sort(),
  );
  expect(publicRoutes(id.content)).toHaveLength(13);
  expect(publicRoutes(id.content).every((r) => r.path.startsWith("/id"))).toBe(
    true,
  );
  expect(
    id.content.entries.find((e) => e.id === "entry_kahf_hydrobalance")?.values
      .summary,
  ).toContain("kompleks pelembap");
  const entry = c.entries.find((e) => e.id === "entry_kahf_facewash")!;
  entry.copies!.id.title = "";
  expect(localize(c, "id", definitions).fallback.has(entry.id)).toBe(true);
  expect(validate(c, definitions)).toEqual([]);
  c.site.i18n!.missing = "strict";
  expect(
    validate(c, definitions).some((i) => i.message.includes("Indonesian")),
  ).toBe(true);
});
it("keeps starter copies canonical when an unchanged page is edited", async () => {
  const c = await fixture();
  for (const record of [...c.pages, ...c.entries, ...(c.site.layouts ?? [])])
    expect(pruneCopies(c, record, definitions), record.id).toEqual(record);
});
it("renders changed shared entries and selected field paths in listings in both languages", async () => {
  const c = await fixture();
  const home = c.pages.find((p) => p.path === "/")!;
  const b = home.blocks.find(
    (b) =>
      b.type === "kahf-listing" &&
      b.props.collection === "collection_kahf_products",
  )!;
  const definition = definitions.find((d) => d.type === b.type)!;
  c.entries.find((e) => e.id === "entry_kahf_facewash")!.values.title =
    "Updated face wash";
  let html = renderToStaticMarkup(
    createElement(Listing, {
      props: b.props,
      context: contextFor(c, b.id, definition),
    }),
  );
  expect(html).toContain("Updated face wash");
  b.props.titleField = "usage";
  html = renderToStaticMarkup(
    createElement(Listing, {
      props: b.props,
      context: contextFor(c, b.id, definition),
    }),
  );
  expect(html).toContain("Use on a wet face.");
  const translated = localize(c, "id", definitions).content;
  const copy = translated.pages
    .find((p) => p.id === home.id)!
    .blocks.find((x) => x.id === b.id)!;
  html = renderToStaticMarkup(
    createElement(Listing, {
      props: copy.props,
      context: contextFor(translated, b.id, definition),
    }),
  );
  expect(html).toContain("/id/product/");
  expect(html).toContain("Lihat");
});
it("keeps article images, actual language and safe Markdown rendering", async () => {
  const c = await fixture();
  const e = c.entries.find((e) => e.id === "entry_kahf_mosque")!;
  const html = renderToStaticMarkup(
    createElement(Article, { props: e.values, context: contextFor(c, "test") }),
  );
  expect(html).toContain('lang="id"');
  expect(html).toContain("Penampungan air hujan");
  expect(html).not.toContain("https://d2wp1jvukxs6se");
  const unsafe = renderToStaticMarkup(
    createElement(Article, {
      props: {
        title: "Example",
        body: "<script>alert(1)</script>\n\n[bad](javascript:alert(1))",
      },
      context: contextFor(c, "test"),
    }),
  );
  expect(unsafe).not.toContain("<script>");
  expect(unsafe).not.toContain('href="javascript:');
});
