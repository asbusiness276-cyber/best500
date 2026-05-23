import fs from "node:fs";
import path from "node:path";

const articlesTs = path.join(process.cwd(), "src", "data", "articles.ts");
const articlesDir = path.join(process.cwd(), "src", "data", "articles");

const source = fs.readFileSync(articlesTs, "utf8");
const importRe = /from\s+["']\.\/articles\/([^"']+)["']/g;
const missing = [];

for (const match of source.matchAll(importRe)) {
  const slug = match[1];
  const file = path.join(articlesDir, `${slug}.ts`);
  if (!fs.existsSync(file)) {
    missing.push(`  ./articles/${slug}.ts (imported in src/data/articles.ts)`);
  }
}

if (missing.length) {
  console.error("Missing article module files:\n" + missing.join("\n"));
  console.error(
    "\nFix: create src/data/articles/{slug}.ts first, then add the import to articles.ts.\nSee PUBLISH-ARTICLE.md"
  );
  process.exit(1);
}

console.log("All article imports in articles.ts resolve to existing files.");
