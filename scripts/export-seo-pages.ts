import fs from "node:fs";
import path from "node:path";
import { articles } from "../src/data/articles";
import { staticPages } from "../src/data/routes";
import { renderArticleStatic, renderHomeStatic, renderStaticPage } from "../src/seo/renderStatic";

const outDir = path.join(process.cwd(), "public", "__seo-pages");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

function writeRoute(routePath: string, html: string) {
  const dir = routePath === "/" ? outDir : path.join(outDir, routePath.replace(/^\//, "").replace(/\/$/, ""));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

writeRoute("/", renderHomeStatic());
for (const article of articles) {
  writeRoute(`/${article.slug}/`, renderArticleStatic(article));
}
for (const page of staticPages) {
  writeRoute(`/${page.slug}/`, renderStaticPage(page.slug));
}
