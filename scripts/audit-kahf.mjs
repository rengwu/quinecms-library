// Inspect the actual local build, including language metadata and navigation targets.
import assert from "node:assert/strict";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { JSDOM } from "jsdom";
const root = resolve(".quinecms/kahf-proof/dist");
async function walk(dir) {
  const files = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    files.push(...(item.isDirectory() ? await walk(path) : [path]));
  }
  return files;
}
const files = await walk(root);
const pages = new Map();
for (const file of files.filter(
  (p) => p.endsWith("/index.html") && !p.endsWith("/admin/index.html"),
)) {
  const path = "/" + file.slice(root.length + 1, -"/index.html".length);
  const html = await readFile(file, "utf8");
  pages.set(path, { html, document: new JSDOM(html).window.document });
}
assert.equal(pages.size, 26);
const expectedFallbacks = [
  "/id/our-story",
  "/id/product/kahf-extra-dry-antiperspirant-deodorant",
  "/id/blog/langkah-berdampak-masjid-al-kahf-ntt",
  "/id/skin-concern/oily-skin",
];
let checkedLinks = 0,
  checkedAssets = 0;
const summary = [];
for (const [path, { html, document }] of pages) {
  assert.equal(
    document.documentElement.lang,
    path.startsWith("/id") ? "id" : "en",
    path,
  );
  const fallback =
    document.querySelector('meta[name="robots"]')?.content === "noindex";
  assert.equal(fallback, expectedFallbacks.includes(path), path + " fallback");
  if (fallback)
    assert.ok(
      document.querySelector('div[lang="en"]'),
      path + " fallback wrapper",
    );
  assert.equal(document.querySelectorAll("h1").length, 1, path + " heading");
  for (const element of document.querySelectorAll(
    "a[href],img[src],video[src],source[src],link[href],script[src]",
  )) {
    const raw = element.getAttribute("href") ?? element.getAttribute("src");
    const url = new URL(raw, "https://fixture.invalid" + path + "/");
    assert.notEqual(
      url.origin,
      "https://www.kahfeveryday.com",
      path + " original-site route",
    );
    if (url.origin !== "https://fixture.invalid") {
      assert.equal(element.tagName, "A", path + " remote asset");
      continue;
    }
    const target = decodeURIComponent(url.pathname).replace(/\/$/, "") || "/";
    if (element.tagName === "A") {
      assert.ok(pages.has(target), path + " broken route: " + raw);
      if (url.hash)
        assert.ok(
          pages.get(target).document.getElementById(url.hash.slice(1)),
          path + " missing fragment: " + raw,
        );
      checkedLinks++;
    } else {
      assert.ok(
        (await stat(join(root, target))).isFile(),
        path + " missing asset: " + raw,
      );
      checkedAssets++;
    }
  }
  summary.push({
    path,
    fallback,
    htmlBytes: Buffer.byteLength(html),
    gzipHtmlBytes: gzipSync(html).length,
  });
}
for (const file of files.filter((p) => p.endsWith(".css"))) {
  const css = await readFile(file, "utf8");
  for (const match of css.matchAll(/url\(["']?(\/kahf\/[^"')]+)["']?\)/g))
    assert.ok(
      (await stat(join(root, match[1]))).isFile(),
      "missing CSS asset: " + match[1],
    );
}
const result = {
  publicRoutes: pages.size,
  checkedLinks,
  checkedAssets,
  fallbackRoutes: expectedFallbacks,
  pages: summary,
};
await writeFile(
  ".quinecms/kahf-audit.json",
  JSON.stringify(result, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    {
      publicRoutes: pages.size,
      checkedLinks,
      checkedAssets,
      fallbackRoutes: expectedFallbacks,
    },
    null,
    2,
  ),
);
