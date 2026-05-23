/**
 * Atomic publish helper: generate article file, then patch registries.
 *
 * Usage (example — wire your import script):
 *   node scripts/publish-article-from-csv.mjs --import scripts/import-washer-dryer-csv.cjs
 *
 * Order enforced:
 *   1. Run CSV import → writes src/data/articles/{slug}.ts
 *   2. Patch src/data/articles.ts (import + articles array) — manual or extend this script
 *   3. Patch scripts/site-routes.mjs — manual or extend this script
 *   4. node scripts/verify-articles-imports.mjs
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const importFlag = process.argv.indexOf("--import");
const importScript =
  importFlag >= 0 ? process.argv[importFlag + 1] : process.argv[2];

if (!importScript) {
  console.error(
    "Usage: node scripts/publish-article-from-csv.mjs --import scripts/import-FOO-csv.cjs\n" +
      "The import script must write src/data/articles/{slug}.ts. Then add articles.ts + site-routes.mjs entries, run verify."
  );
  process.exit(1);
}

const importPath = path.isAbsolute(importScript)
  ? importScript
  : path.join(root, importScript);

const gen = spawnSync(process.execPath, [importPath], { cwd: root, stdio: "inherit" });
if (gen.status !== 0) process.exit(gen.status ?? 1);

const verify = spawnSync(process.execPath, ["scripts/verify-articles-imports.mjs"], {
  cwd: root,
  stdio: "inherit"
});
if (verify.status !== 0) {
  console.error(
    "\nArticle file was generated but articles.ts still references missing modules.\n" +
      "Add the import to src/data/articles.ts only after the .ts file exists, then re-run verify."
  );
  process.exit(verify.status ?? 1);
}

console.log("Article module generated; imports verified. Update articles.ts and site-routes.mjs if this is a new slug.");
