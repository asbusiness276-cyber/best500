import fs from "node:fs";
import path from "node:path";
import { allRoutes, articleRoutes } from "./site-routes.mjs";

const distDir = path.join(process.cwd(), "dist");
const failures = [];
const oldDomain = "bestbuyunder" + "100";
const oldBrand = "BestBuyUnder" + "100";
const forbiddenLegacyPattern = new RegExp(`${oldDomain}\\.com|${oldBrand}|bing-site-verification|msvalidate\\.01`, "i");

function fileFor(routePath) {
  return routePath === "/" ? path.join(distDir, "index.html") : path.join(distDir, routePath.replace(/^\//, "").replace(/\/$/, ""), "index.html");
}

for (const route of allRoutes) {
  const html = fs.readFileSync(fileFor(route.path), "utf8");
  const checks = [
    [/name="google-site-verification" content="_5cnMmkaVIiJL5mG-etShTMtCu0BjLj-6Xx---gJZxY"/, "Google Search Console verification missing"],
    [/googletagmanager\.com\/gtag\/js\?id=G-48K07CR8Z5/, "Google Analytics gtag script missing"],
    [/gtag\('config', 'G-48K07CR8Z5'\)/, "Google Analytics config missing"],
    [/name="robots"/, "robots missing"],
    [/name="theme-color"/, "theme-color missing"],
    [/property="og:site_name"/, "og:site_name missing"],
    [/name="twitter:image"/, "twitter:image missing"],
    [/hreflang="en"/, "hreflang en missing"],
    [/hreflang="x-default"/, "hreflang x-default missing"]
  ];
  for (const [regex, message] of checks) {
    if (!regex.test(html)) failures.push(`${message} for ${route.path}`);
  }
  if (forbiddenLegacyPattern.test(html)) {
    failures.push(`old domain or Bing placeholder remains for ${route.path}`);
  }
}

for (const route of articleRoutes) {
  const html = fs.readFileSync(fileFor(route.path), "utf8");
  if (!/article:published_time/.test(html)) failures.push(`article published date missing for ${route.path}`);
  if (!/article:modified_time/.test(html)) failures.push(`article modified date missing for ${route.path}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
