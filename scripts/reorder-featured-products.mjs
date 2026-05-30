#!/usr/bin/env node
/**
 * Reorder products so the scored best pick is index 0; sync badges, quickPicks, featuredProductId.
 * Usage: npx tsx scripts/reorder-featured-products.mjs [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { register } from "tsx/esm/api";

register();

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");

const { reorderFeaturedProduct, pickBestProduct, scoreProduct, bestPickBadge } = await import(
  "../src/utils/scoreFeaturedProduct.ts"
);

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
  { file: "best-barbecue-grill-under-500.ts", productsExport: "bestBarbecueGrillUnder500Products", articleExport: "bestBarbecueGrillUnder500Article" },
  { file: "best-30-mph-electric-scooter-under-500.ts", productsExport: "best30MphElectricScooterUnder500Products", articleExport: "best30MphElectricScooterUnder500Article" }
];

function bestPickReason(product) {
  const badge = bestPickBadge(product);
  const pros = product.pros.length;
  return `${badge}: ${product.rating} rating, USD ${product.price}, ${pros} strong pro${pros === 1 ? "" : "s"} (score ${scoreProduct(product)}).`;
}

function replaceQuickPickEntry(block, labelPattern, entry) {
  const re = new RegExp(`\\{ label: "${labelPattern.source || labelPattern}"[^}]+\\}`);
  if (re.test(block)) return block.replace(re, entry);
  return block;
}

function topRatedProduct(products) {
  return [...products].sort((a, b) => b.rating - a.rating || a.price - b.price)[0];
}

function lowestProduct(products) {
  return [...products].sort((a, b) => a.price - b.price)[0];
}

function updateQuickPicksBlock(content, reordered, winner) {
  const lowest = lowestProduct(reordered);
  const topRated = topRatedProduct(reordered);
  const reason = bestPickReason(winner).replace(/"/g, '\\"');

  const bestPickLabels = /Best (buy )?pick|Best overall pick|Best gas pick/i;
  const quickPicksMatch = content.match(/quickPicks: \[([\s\S]*?)\],\n/);
  if (!quickPicksMatch) return content;

  let block = quickPicksMatch[1];
  const bestEntry = `{ label: "Best pick", productId: "${winner.id}", reason: "${reason}" }`;

  if (bestPickLabels.test(block)) {
    block = block.replace(/\{ label: "(Best (buy )?pick|Best overall pick|Best gas pick)"[^}]+\}/, bestEntry);
  } else {
    block = `\n    ${bestEntry},${block}`;
  }

  if (/\{ label: "Top rated"/i.test(block)) {
    block = block.replace(
      /\{ label: "Top rated"[^}]+\}/i,
      `{ label: "Top rated", productId: "${topRated.id}", reason: "Highest buyer rating (${topRated.rating}) among picks in this guide." }`
    );
  }
  if (/\{ label: "Lowest (listed )?price"/i.test(block)) {
    block = block.replace(
      /\{ label: "Lowest (listed )?price[^"]*"[^}]+\}/i,
      `{ label: "Lowest price", productId: "${lowest.id}", reason: "Lowest upfront price at USD ${lowest.price} among picks under the cap." }`
    );
  }

  return content.replace(quickPicksMatch[0], `quickPicks: [${block}\n  ],\n`);
}

function updateArticleFile(entry, reordered, winner, oldFirst) {
  const abs = path.join(root, "src/data/articles", entry.file);
  let content = fs.readFileSync(abs, "utf8");

  const productsJson = JSON.stringify(reordered, null, 2);
  const productsPattern = new RegExp(
    `export const ${entry.productsExport}: Product\\[\\] = \\[[\\s\\S]*?\\];`
  );
  content = content.replace(
    productsPattern,
    `export const ${entry.productsExport}: Product[] = ${productsJson};`
  );

  if (/featuredProductId:/.test(content)) {
    content = content.replace(/featuredProductId: [^\n]+/, `featuredProductId: "${winner.id}",`);
  } else {
    content = content.replace(
      /(relatedArticles: [^\n]+,\n)/,
      `$1  featuredProductId: "${winner.id}",\n`
    );
  }

  content = updateQuickPicksBlock(content, reordered, winner);


  if (entry.file === "refrigerator-sale-under-500.ts") {
    content = content.replace(
      /featuredProductId: [^\n]+/,
      `featuredProductId: "${winner.id}",`
    );
  }

  if (!dryRun) fs.writeFileSync(abs, content, "utf8");

  return {
    slug: entry.file.replace(".ts", ""),
    old: `${oldFirst.shortTitle} (${oldFirst.rating})`,
    new: `${winner.shortTitle} (${winner.rating})`,
    changed: oldFirst.id !== winner.id
  };
}

const rows = [];

for (const entry of articleFiles) {
  const abs = path.join(root, "src/data/articles", entry.file);
  delete require.cache[require.resolve(abs)];
  const mod = require(abs);
  const products = mod[entry.productsExport];
  const oldFirst = products[0];
  const reordered = reorderFeaturedProduct(products);
  const winner = reordered[0];

  const row = updateArticleFile(entry, reordered, winner, oldFirst);
  rows.push(row);
  if (row.changed) {
    console.log(`Updated ${entry.file}: ${row.old} → ${row.new}`);
  } else {
    console.log(`OK ${entry.file}: ${row.new} already featured`);
  }
}

console.log("\n| Article | Old #1 | New #1 | Rating |");
console.log("|---------|--------|--------|--------|");
for (const r of rows) {
  const rating = r.new.match(/\(([0-9.]+)\)/)?.[1] || "";
  console.log(`| ${r.slug} | ${r.old} | ${r.new} | ${rating} |`);
}

if (dryRun) console.log("\nDry run — no files written.");
