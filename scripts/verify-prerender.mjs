import fs from "node:fs";
import path from "node:path";
import { allRoutes, articleRoutes } from "./site-routes.mjs";

const distDir = path.join(process.cwd(), "dist");
const failures = [];

function fileFor(routePath) {
  return routePath === "/" ? path.join(distDir, "index.html") : path.join(distDir, routePath.replace(/^\//, "").replace(/\/$/, ""), "index.html");
}

for (const route of allRoutes) {
  const file = fileFor(route.path);
  if (!fs.existsSync(file)) {
    failures.push(`Missing prerender file for ${route.path}`);
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  if (!/<div id="root"><\/div>/.test(html)) failures.push(`#root is not empty for ${route.path}`);
  if (!/id="seo-static"/.test(html)) failures.push(`#seo-static missing for ${route.path}`);
  if (!/seo-crawler-only/.test(html)) failures.push(`seo-crawler-only class missing for ${route.path}`);
  if (!/pointer-events:\s*none/.test(html)) failures.push(`pointer-events none missing on SEO block for ${route.path}`);
  if ((html.match(/id="seo-static"/g) || []).length > 1) failures.push(`duplicate HTML corruption for ${route.path}`);
  if (/body\.style\.overflow\s*=\s*["']hidden["']/.test(html)) failures.push(`body overflow hidden boot pattern exists for ${route.path}`);
}

for (const route of articleRoutes) {
  if (!fs.existsSync(fileFor(route.path))) failures.push(`prerender article missing for ${route.path}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
