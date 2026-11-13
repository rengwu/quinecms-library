import { defineConfig } from "vitest/config";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const engineRequire = createRequire(require.resolve("quinecms/package.json"));
export default defineConfig({
  server: {
    fs: { allow: [resolve("."), dirname(require.resolve("quinecms/package.json"))] },
  },
  resolve: {
    alias: [
      // The assembled editor and its provider/UI dependencies share the engine renderer.
      {
        find: "react",
        replacement: dirname(engineRequire.resolve("react/package.json")),
      },
      {
        find: "react-dom",
        replacement: dirname(engineRequire.resolve("react-dom/package.json")),
      },
      {
        find: /^quinecms\/(core|editor)\/(.*)$/,
        replacement:
          resolve(".quinecms/site/.quinecms/workspace/src") + "/$1/$2",
      },
    ],
  },
  test: { include: ["tests/*.test.ts"], environment: "node" },
});
