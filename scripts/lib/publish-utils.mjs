import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export function slugToCamel(slug) {
  return slug
    .replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

export function articleFilePath(root, slug) {
  return path.join(root, "src", "data", "articles", `${slug}.ts`);
}

export function featuredWebpName(slug) {
  return `featured-${slug.replace(/-under-500$/, "").replace(/^best-/, "")}.webp`;
}

export function heroTitleLines(keyword) {
  const words = keyword.trim().split(/\s+/);
  if (words.length <= 3) return { line1: keyword, line2: "Under $500" };
  const mid = Math.ceil(words.length / 2);
  return {
    line1: words.slice(0, mid).join(" "),
    line2: words.slice(mid).join(" ") || "Under $500"
  };
}

export function navLabelFrom(keyword) {
  return keyword.replace(/^Best\s+/i, "").replace(/\s+Under\s+\$500$/i, " under $500");
}

export async function compressFeaturedImage(inputPath, outPath) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Featured image not found: ${inputPath}`);
  }
  await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
  const info = await sharp(inputPath)
    .resize(1200, 675, { fit: "cover", position: "centre" })
    .webp({ quality: 82, effort: 6 })
    .toFile(outPath);
  return { inputPath, outPath, ...info };
}

export function patchArticlesRegistry({ root, slug, exportName }) {
  const file = path.join(root, "src", "data", "articles.ts");
  let source = fs.readFileSync(file, "utf8");
  const importLine = `import { ${exportName} } from "./articles/${slug}";`;

  if (!source.includes(importLine)) {
    const lastImport = [...source.matchAll(/^import .+;$/gm)].pop();
    if (!lastImport) throw new Error("Could not find import block in articles.ts");
    const insertAt = lastImport.index + lastImport[0].length;
    source = `${source.slice(0, insertAt)}\n${importLine}${source.slice(insertAt)}`;
  }

  const arrayMatch = source.match(/export const articles: Article\[\] = \[([\s\S]*?)\];/);
  if (!arrayMatch) throw new Error("Could not find articles array in articles.ts");
  if (!arrayMatch[1].includes(exportName)) {
    const items = arrayMatch[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    items.push(exportName);
    const nextArray = `export const articles: Article[] = [${items.join(", ")}];`;
    source = source.replace(/export const articles: Article\[\] = \[[\s\S]*?\];/, nextArray);
  }

  fs.writeFileSync(file, source);
}

export function patchSiteRoutes({ root, slug, metaTitle, metaDescription, category }) {
  const file = path.join(root, "scripts", "site-routes.mjs");
  let source = fs.readFileSync(file, "utf8");
  const routePath = `/${slug}/`;
  if (source.includes(`path: "${routePath}"`)) return;

  const entry = `  {
    path: "${routePath}",
    title: "${metaTitle.replace(/"/g, '\\"')}",
    description: "${metaDescription.replace(/"/g, '\\"')}",
    category: "${category.replace(/"/g, '\\"')}"
  }`;

  source = source.replace(
    /export const articleRoutes = \[\n/,
    `export const articleRoutes = [\n${entry},\n`
  );
  fs.writeFileSync(file, source);
}

export function listArticleImports(articlesTsSource) {
  const imports = [];
  for (const match of articlesTsSource.matchAll(/from "\.\/articles\/([^"]+)"/g)) {
    imports.push(match[1]);
  }
  return imports;
}
