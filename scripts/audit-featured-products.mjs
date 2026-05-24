#!/usr/bin/env node
/**
 * Audit featured / best-pick ordering across published articles.
 * Usage: node scripts/audit-featured-products.mjs
 */
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "tsx/esm/api";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
register();

const { scoreProduct, pickBestProduct } = await import("../src/utils/scoreFeaturedProduct.ts");

const articleFiles = [
  { file: "best-gaming-laptop-under-500.ts", productsExport: "laptopProducts", articleExport: "laptopArticle" },
  { file: "best-gaming-headsets-for-under-500.ts", productsExport: "headsetProducts", articleExport: "headsetArticle" },
  { file: "refrigerator-sale-under-500.ts", productsExport: "refrigeratorProducts", articleExport: "refrigeratorArticle" },
  { file: "ham-radio-under-500.ts", productsExport: "hamRadioProducts", articleExport: "hamRadioArticle" },
  { file: "best-watches-mens-under-500.ts", productsExport: "watchProducts", articleExport: "watchArticle" },
  { file: "gas-go-karts-under-500.ts", productsExport: "goKartProducts", articleExport: "goKartArticle" },
  { file: "best-washer-and-dryer-bundles-under-500.ts", productsExport: "washerDryerProducts", articleExport: "washerDryerArticle" },
  { file: "electric-dirt-bike-under-500.ts", productsExport: "electricDirtBikeProducts", articleExport: "electricDirtBikeArticle" },
  { file: "best-electric-wheelchair-under-500.ts", productsExport: "bestElectricWheelchairUnder500Products", articleExport: "bestElectricWheelchairUnder500Article" },
  { file: "best-barbecue-grill-under-500.ts", productsExport: "bestBarbecueGrillUnder500Products", articleExport: "bestBarbecueGrillUnder500Article" }
];

const rows = [];

for (const entry of articleFiles) {
  const abs = path.join(root, "src/data/articles", entry.file);
  delete require.cache[require.resolve(abs)];
  const mod = require(abs);
  const products = mod[entry.productsExport];
  const article = mod[entry.articleExport];
  const oldFirst = products[0];
  const winner = pickBestProduct(products);

  rows.push({
    slug: article.slug,
    oldTitle: oldFirst.shortTitle,
    oldRating: oldFirst.rating,
    newTitle: winner.shortTitle,
    newRating: winner.rating,
    same: oldFirst.id === winner.id,
    score: scoreProduct(winner),
    oldScore: scoreProduct(oldFirst),
    reason: `${winner.pros.length} pros, $${winner.price}, badge=${winner.badge || "none"}`
  });
}

console.log("\n| Article | Old #1 | New #1 | Rating | Changed |");
console.log("|---------|--------|--------|--------|---------|");
for (const r of rows) {
  console.log(
    `| ${r.slug} | ${r.oldTitle} (${r.oldRating}) | ${r.newTitle} (${r.newRating}) | ${r.newRating} | ${r.same ? "no" : "YES"} |`
  );
  if (!r.same) {
    console.log(`  → ${r.oldTitle} score ${r.oldScore} → ${r.newTitle} score ${r.score}: ${r.reason}`);
  }
}
