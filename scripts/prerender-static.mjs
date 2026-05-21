import fs from "node:fs";
import path from "node:path";
import { allRoutes } from "./site-routes.mjs";

const root = process.cwd();
const distDir = path.join(root, "dist");
const seoDir = path.join(root, "public", "__seo-pages");
const appHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf8");
const guard = '<script>document.getElementById("seo-static")?.remove();</script>';
const seoStyle = `<style>
.seo-crawler-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: normal;
  border: 0;
  pointer-events: none;
}
</style>`;

function readSeo(routePath) {
  const file = routePath === "/" ? path.join(seoDir, "index.html") : path.join(seoDir, routePath.replace(/^\//, "").replace(/\/$/, ""), "index.html");
  const html = fs.readFileSync(file, "utf8");
  const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] || "";
  const seo = html.match(/<main id="seo-static"[\s\S]*?<\/main>/i)?.[0] || "";
  return { head, seo };
}

for (const route of allRoutes) {
  const { head, seo } = readSeo(route.path);
  let html = appHtml
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace("</head>", `${head}\n${seoStyle}\n</head>`)
    .replace('<div id="root"></div>', `<div id="root"></div>\n${seo}\n${guard}`);
  const outDir = route.path === "/" ? distDir : path.join(distDir, route.path.replace(/^\//, "").replace(/\/$/, ""));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);
}
