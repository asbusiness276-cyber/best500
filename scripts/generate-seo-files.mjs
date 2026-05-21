import fs from "node:fs";
import path from "node:path";
import { SITE_URL, allRoutes, articleRoutes } from "./site-routes.mjs";

const root = process.cwd();
const publicDir = path.join(root, "public");
fs.mkdirSync(publicDir, { recursive: true });
const lastmod = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map((route) => `  <url><loc>${SITE_URL}${route.path}</loc><lastmod>${lastmod}</lastmod></url>`).join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

const llms = `# BestBuyUnder500

BestBuyUnder500.com publishes clean, practical affiliate buying guides for shoppers comparing useful products near the $500 budget range.

## Guides
${articleRoutes.map((route) => `- [${route.title}](${SITE_URL}${route.path}) - ${route.description}`).join("\n")}

## Important Pages
- [About](${SITE_URL}/about/)
- [Contact](${SITE_URL}/contact/)
- [Affiliate Disclosure](${SITE_URL}/affiliate-disclosure/)

## Author
- Navjeet Kamboj, Founder & Editor
- Email: bestbuyunder500@gmail.com
- LinkedIn: https://in.linkedin.com/in/navjeet-kamboj
- Instagram: https://www.instagram.com/jeet_7.7/
`;

fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(publicDir, "robots.txt"), robots);
fs.writeFileSync(path.join(publicDir, "llms.txt"), llms);
