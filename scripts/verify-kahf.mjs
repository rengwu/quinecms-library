// Local artifact proof, using installed checkouts. This does not prove a remote install.
import { cp, mkdir, writeFile, symlink, rm, readFile } from "node:fs/promises";
import { dirname, resolve, join } from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
const require = createRequire(import.meta.url);
const engine = dirname(require.resolve("quinecms/package.json"));
const root = resolve(".quinecms/kahf-proof");
await rm(root, { recursive: true, force: true });
await mkdir(join(root, "node_modules"), { recursive: true });
for (const [name, path] of [
  ["quinecms", engine],
  ["quinecms-library", resolve(".")],
])
  await symlink(path, join(root, "node_modules", name), "dir");
const libraryPackage = JSON.parse(await readFile("package.json", "utf8"));
const enginePackage = JSON.parse(
  await readFile(join(engine, "package.json"), "utf8"),
);
await writeFile(
  join(root, "package.json"),
  JSON.stringify(
    {
      name: "kahf-local-proof",
      private: true,
      type: "module",
      dependencies: {
        quinecms: enginePackage.version,
        "quinecms-library": libraryPackage.version,
      },
    },
    null,
    2,
  ),
);
await writeFile(join(root, "pnpm-lock.yaml"), 'lockfileVersion: "9.0"\n');
await writeFile(
  join(root, ".env"),
  "ADMIN_EMAIL=fixture@example.com\nADMIN_PASSWORD=fixture-password\n",
);
await cp("presets/kahf/v1/content", join(root, "content"), { recursive: true });
await cp(
  "presets/kahf/v1/quinecms.config.json",
  join(root, "quinecms.config.json"),
);
for (const command of ["validate", "check", "build", "check-build"]) {
  const result = spawnSync(
    process.execPath,
    [join(engine, "bin/quinecms.mjs"), command],
    { cwd: root, stdio: "inherit" },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}
await import("./audit-kahf.mjs");
console.log("Kahf local artifacts:", join(root, "dist"));
