// @vitest-environment jsdom
// Real editor controls with Kahf content; Git transport and preview islands are mocked.
import { afterEach, expect, it, vi } from "vitest";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import App from "quinecms/editor/App";
import { retain } from "quinecms/editor/recovery";
import { filesFor, parseFiles } from "quinecms/core/content";
import type { Content } from "quinecms/core/types";
import { connect } from "../.quinecms/site/.quinecms/workspace/src/integrations/git";
vi.mock("../.quinecms/site/.quinecms/workspace/src/editor/Island", () => ({
  default: () => null,
}));
vi.mock(
  "../.quinecms/site/.quinecms/workspace/src/integrations/git",
  async (original) => ({ ...(await original<object>()), connect: vi.fn() }),
);
const repository = {
  provider: "github" as const,
  owner: "local-test",
  repo: "kahf-fixture",
  branch: "draft",
};
let root: Root | undefined;
let host: HTMLDivElement;
afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  host?.remove();
  sessionStorage.clear();
  vi.restoreAllMocks();
});
async function fixture() {
  const files: Record<string, string> = {};
  async function walk(dir: string) {
    for (const e of await readdir(join("presets/kahf/v1", dir), {
      withFileTypes: true,
    })) {
      const path = dir + "/" + e.name;
      if (e.isDirectory()) await walk(path);
      else if (path.endsWith(".json"))
        files[path] = await readFile(join("presets/kahf/v1", path), "utf8");
    }
  }
  await walk("content");
  return parseFiles(files);
}
async function mount(initial: Content, recovered: Content) {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = vi
    .fn()
    .mockReturnValue({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    });
  const base = {
    sha: "local-base",
    treeSha: "local-tree",
    content: initial,
    files: filesFor(initial),
    blobs: {},
    sourceFiles: {},
  };
  const saved = {
    ...base,
    sha: "local-draft",
    content: recovered,
    files: filesFor(recovered),
  };
  const save = vi.fn().mockResolvedValue(saved),
    publish = vi.fn().mockResolvedValue(undefined);
  vi.mocked(connect).mockResolvedValue({
    repository,
    load: async () => base,
    save,
    publish,
  });
  retain({ version: 1, repository, base, content: recovered });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      createElement(App, {
        initial,
        config: {
          git: { repository, token: "fixture-only" },
          encryptedAdmin: false,
          r2: null,
        },
      }),
    ),
  );
  return { save, publish };
}
async function click(label: string, scope: ParentNode = document) {
  const b = [...scope.querySelectorAll("button")].find(
    (b) => b.textContent === label,
  );
  expect(b, label).toBeDefined();
  await act(async () => b!.click());
}
it("saves a Kahf draft with missing translations and publishes it after confirmation under fallback", async () => {
  const c = await fixture(),
    draft = structuredClone(c);
  draft.pages.find((p) => p.path === "/")!.title = "Kahf local draft";
  const store = await mount(c, draft);
  await click("Save draft");
  expect(store.save).toHaveBeenCalledOnce();
  expect(host.textContent).toContain("Saved to draft");
  await click("Publish");
  expect(document.body.textContent).toContain("Publish this draft?");
  expect(store.publish).not.toHaveBeenCalled();
  await click("Publish", [...document.querySelectorAll('[role="dialog"]')].find((d) => d.textContent?.includes("Publish this draft?"))!);
  expect(store.publish).toHaveBeenCalledOnce();
  expect(document.body.textContent).toContain("Published to");
});
it("allows saving incomplete Indonesian copies but rejects strict publication before provider calls", async () => {
  const c = await fixture(),
    draft = structuredClone(c);
  draft.site.i18n!.missing = "strict";
  draft.entries.find((e) => e.id === "entry_kahf_facewash")!.copies!.id.title =
    "";
  const store = await mount(c, draft);
  await click("Save draft");
  expect(store.save).toHaveBeenCalledOnce();
  await click("Publish");
  expect(document.body.textContent).toContain("Cannot publish yet");
  expect(document.body.textContent).toContain("Indonesian");
  expect(store.publish).not.toHaveBeenCalled();
});
