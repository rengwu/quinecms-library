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
import { definitions } from "../.quinecms/site/.quinecms/workspace/src/generated/definitions";
import { Article, Listing, Hero } from "../src/themes/tessera/v1/components";
import { applyView, recordView, startCopy, localize, localized } from "quinecms/core/languages";
async function fixture() {
  const files: Record<string, string> = {};
  async function walk(dir: string) {
    for (const item of await readdir(join("presets/tessera/v1", dir), {
      withFileTypes: true,
    })) {
      const path = dir + "/" + item.name;
      if (item.isDirectory()) await walk(path);
      else if (path.endsWith(".json"))
        files[path] = await readFile(join("presets/tessera/v1", path), "utf8");
    }
  }
  await walk("content");
  return parseFiles(files);
}
it("translates Tessera text by default and preserves technical values and English content", async () => {
  const content = await fixture();
  content.site.i18n = { enabled: true, main: "en", languages: ["zh"], missing: "fallback" };
  const home = content.pages.find((p) => p.path === "/")!;
  const main = structuredClone(home);
  const started = startCopy(content, home, "zh", definitions);
  const view = recordView(content, started, "zh", definitions);
  const hero = view.blocks.find((b) => b.type === "tessera-hero")!;
  expect(hero.props.heading).toBeNull();
  expect(hero.props.command).toBe("npm create tessera@latest");
  expect(hero.props.actionURL).toBe("/docs/quickstart");
  view.title = "首页";
  hero.props.heading = "定义你的架构。";
  hero.props.description = "中文介绍";
  hero.props.actionLabel = "开始构建";
  const edited = applyView(content, started, "zh", view, definitions);
  expect(edited.blocks).toEqual(started.blocks);
  expect(edited.title).toBe(main.title);
  expect(edited.copies!.zh.blocks![hero.id]).toMatchObject({ heading: "定义你的架构。", description: "中文介绍", actionLabel: "开始构建" });
  content.pages = content.pages.map((p) => p.id === edited.id ? edited : p);
  const chinese = localize(content, "zh", definitions);
  expect(chinese.fallback.has(home.id)).toBe(false);
  expect(chinese.content.pages.find((p) => p.id === home.id)!.blocks[0].props.heading).toBe("定义你的架构。");
  expect(home).toEqual(main);
  const layout = content.site.layouts![0];
  const translatedLayout = recordView(content, startCopy(content, layout, "zh", definitions), "zh", definitions);
  expect(translatedLayout.design.settings.footerDescription).toBeNull();
  expect((translatedLayout.design.settings.navigation as any)[0]).toMatchObject({ label: null, url: "/product" });
  expect(translatedLayout.design.settings.repositoryLabel).toBe(layout.design.settings.repositoryLabel);
  for (const definition of definitions.filter((d) => d.type.startsWith("tessera-"))) {
    for (const field of definition.fields.filter((f) => f.collectionField)) expect(localized(field)).toBe(false);
  }
});
it("validates the distributed starter, all routes and local media through the engine", async () => {
  const content = await fixture();
  expect(validate(content, definitions)).toEqual([]);
  expect(parseFiles(filesFor(content))).toEqual(content);
  const paths = content.pages
    .filter((p) => p.kind === "static")
    .map((p) => p.path!);
  for (const e of content.entries) {
    const c = content.collections.find((c) => c.id === e.collectionId);
    if (c?.path && c.genericPageId) paths.push(c.path + "/" + e.slug);
  }
  expect(new Set(paths).size).toBe(59);
  expect(paths.length).toBe(59);
  for (const layout of content.site.layouts ?? []) {
    const settings = layout.design.settings;
    for (const key of ["navigation", "sidebar", "footerLinks"])
      for (const row of (settings[key] ?? []) as { url: string }[]) {
        if (row.url.startsWith("/"))
          expect(paths, `${key}: ${row.url}`).toContain(row.url.split("#")[0]);
      }
  }
  for (const media of content.media)
    expect((await stat(join("public", media.original.url))).size).toBe(
      media.original.bytes,
    );
});
it("renders readable content without hydration and escapes unsafe rich text", async () => {
  const content = await fixture();
  const context = contextFor(content, "test");
  const entry = content.entries.find((e) => e.slug === "quickstart")!;
  const html = renderToStaticMarkup(
    createElement(Article, { props: entry.values, context }),
  );
  expect(html).toContain("Build your first endpoint");
  expect(html).toContain("npm create tessera@latest my-app");
  expect(html).toContain("<pre>");
  const unsafe = renderToStaticMarkup(
    createElement(Article, {
      props: {
        title: "Example",
        body: "<script>alert(1)</script>\n\n[bad](javascript:alert(1))",
      },
      context,
    }),
  );
  expect(unsafe).not.toContain("<script>");
  expect(unsafe).not.toContain('href="javascript:');
  const home = content.pages.find((p) => p.path === "/")!;
  expect(
    renderToStaticMarkup(
      createElement(Hero, { props: home.blocks[0].props, context }),
    ),
  ).toContain("Define your schema.");
});
it("uses shared collection data and source order for the blog listing", async () => {
  const content = await fixture();
  const first = content.entries.find(
    (e) =>
      e.slug === "why-we-generate-types-from-schemas-not-the-other-way-around",
  )!;
  first.values.title = "Updated shared article";
  const block = content.pages
    .find((p) => p.path === "/blog")!
    .blocks.find((b) => b.type === "tessera-listing")!;
  const html = renderToStaticMarkup(
    createElement(Listing, {
      props: block.props,
      context: contextFor(
        content,
        block.id,
        definitions.find(
          (d) => d.type === block.type && d.version === block.version,
        ),
      ),
    }),
  );
  expect(html).toContain("Updated shared article");
  expect(html.indexOf("Updated shared article")).toBeLessThan(
    html.indexOf("Introducing typed realtime queries"),
  );
  expect(html).toContain("/blog/tessera-2-0-what-changed-and-why");
});
