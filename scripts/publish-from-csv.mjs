#!/usr/bin/env node
/**
 * Unified CSV → article publish CLI.
 * Order: article .ts → articles.ts → site-routes.mjs → optional featured webp
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseCsv,
  clean,
  numberFrom,
  meaningfulBullets,
  brandFrom,
  shortTitleFrom,
  specsFromBullets,
  genericPros,
  genericCons,
  buildHeaderMaps,
  rowValue,
  parseProductImages
} from "./lib/csv-utils.mjs";
import {
  slugToCamel,
  articleFilePath,
  featuredWebpName,
  heroTitleLines,
  navLabelFrom,
  compressFeaturedImage,
  patchArticlesRegistry,
  patchSiteRoutes
} from "./lib/publish-utils.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function usage() {
  console.log(`Usage:
  node scripts/publish-from-csv.mjs \\
    --csv "C:/path/to/sheet.csv" \\
    --keyword "Best Washer and Dryer Bundles Under $500" \\
    --slug "best-washer-and-dryer-bundles-under-500" \\
    --category "Home & Living" \\
    [--featured "C:/path/to/banner.png"] \\
    [--carousel] \\
    [--featured-asin B0XXXX] \\
    [--dry-run]

Defaults: meta title/description derived from keyword; single product image unless --carousel.`);
}

function parseArgs(argv) {
  const args = {
    csv: "",
    keyword: "",
    slug: "",
    category: "Home & Living",
    featured: "",
    carousel: false,
    featuredAsin: "",
    dryRun: false
  };
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    const next = argv[i + 1];
    if (key === "--csv" && next) args.csv = next, i++;
    else if (key === "--keyword" && next) args.keyword = next, i++;
    else if (key === "--slug" && next) args.slug = next, i++;
    else if (key === "--category" && next) args.category = next, i++;
    else if (key === "--featured" && next) args.featured = next, i++;
    else if (key === "--featured-asin" && next) args.featuredAsin = next, i++;
    else if (key === "--carousel") args.carousel = true;
    else if (key === "--dry-run") args.dryRun = true;
    else if (key === "--help" || key === "-h") {
      usage();
      process.exit(0);
    }
  }
  return args;
}

function productsFromCsv(csvPath, slug, { carousel, featuredAsin }) {
  const text = fs.readFileSync(csvPath, "utf8");
  const [headers, ...rows] = parseCsv(text);
  const { lower, exact } = buildHeaderMaps(headers);
  const prefix = slug.replace(/-under-500$/, "").replace(/^best-/, "").slice(0, 24) || slug.slice(0, 24);
  const seen = new Set();

  let products = rows
    .map((row, index) => {
      const title = clean(rowValue(row, lower, "Title"));
      const bullets = meaningfulBullets(rowValue(row, lower, "Bullet Features", "Bullet features"));
      const brand = brandFrom(rowValue(row, lower, "Brand"), title);
      const { image, images } = parseProductImages(row, exact, clean);
      const affiliateUrl = clean(
        rowValue(row, lower, "Affilates Links", "Affilate Links", "Affiliate Links", "Affilate links")
      );
      const asin = clean(rowValue(row, lower, "ASIN"));
      const price = numberFrom(rowValue(row, lower, "Price"));
      const rating = numberFrom(rowValue(row, lower, "Rating"));
      const specs = specsFromBullets(bullets, title);
      const product = {
        id: `${prefix}-${index + 1}`,
        title,
        shortTitle: shortTitleFrom(title, brand),
        image,
        price,
        rating,
        affiliateUrl,
        asin,
        specs,
        features: specs.slice(0, 5),
        pros: [],
        cons: [],
        highlightFeature: specs[0]?.slice(0, 48)
      };
      if (carousel && images.length > 1) product.images = images;
      product.pros = genericPros(product);
      product.cons = genericCons(product);
      return product;
    })
    .filter((p) => p.title && p.image && p.affiliateUrl && p.price)
    .filter((p) => p.price <= 500)
    .filter((p) => {
      const key = p.asin || p.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.rating - a.rating || a.price - b.price);

  products = products.map((p, index) => ({ ...p, id: `${prefix}-${index + 1}` }));

  if (featuredAsin) {
    const idx = products.findIndex((p) => p.asin === featuredAsin);
    if (idx > 0) {
      const [featured] = products.splice(idx, 1);
      featured.badge = featured.badge || "Best pick";
      products.unshift(featured);
      products = products.map((p, i) => ({ ...p, id: `${prefix}-${i + 1}` }));
    }
  }

  if (products[0] && !products[0].badge) products[0].badge = "Best pick";
  const lowest = [...products].sort((a, b) => a.price - b.price)[0];
  if (lowest && lowest.id !== products[0]?.id) lowest.badge = lowest.badge || "Lowest price";

  return products;
}

function renderArticleSource({
  slug,
  keyword,
  category,
  products,
  productsExport,
  articleExport,
  heroImage,
  carousel,
  metaTitle,
  metaDescription
}) {
  const { line1, line2 } = heroTitleLines(keyword);
  const navLabel = navLabelFrom(keyword);
  const now = new Date().toISOString();
  const featuredId = products[0]?.id || `${slug}-1`;
  const lowest = [...products].sort((a, b) => a.price - b.price)[0];
  const topRated = [...products].sort((a, b) => b.rating - a.rating)[0];
  const carouselLine = carousel ? "\n  enableImageCarousel: true," : "";

  return `import type { Article, Product } from "../../types";

export const ${productsExport}: Product[] = ${JSON.stringify(products, null, 2)};

export const ${articleExport}: Article = {
  slug: "${slug}",
  navLabel: "${navLabel.replace(/"/g, '\\"')}",
  keyword: "${keyword.replace(/"/g, '\\"')}",
  metaTitle: "${metaTitle.replace(/"/g, '\\"')}",
  metaDescription:
    "${metaDescription.replace(/"/g, '\\"')}",
  category: "${category.replace(/"/g, '\\"')}",
  breadcrumb: ["Home", "${category.replace(/"/g, '\\"')}", "${keyword.replace(/"/g, '\\"')}"],
  heroImage: "${heroImage}",
  heroBadge: "New buyer guide",
  heroTitleLine1: "${line1.replace(/"/g, '\\"')}",
  heroTitleLine2: "${line2.replace(/"/g, '\\"')}",
  heroSubtitle:
    "A practical comparison of picks that stay below the $500 ceiling with specs, ratings, and buyer notes from the supplied product sheet.",
  heroTrustNote:
    "Always verify live Amazon pricing, compatibility, and current availability before buying.",
  introHeading: "How we picked ${keyword.replace(/"/g, '\\"').toLowerCase()}",
  introParagraphs: [
    "This BestBuyUnder500.com guide focuses on products that balance price, ratings, and useful features for shoppers staying under $500.",
    "We cleaned the supplied CSV to remove warranty-plan and marketplace noise, then organized picks around what buyers actually compare in this category."
  ],
  filters: ["Best pick", "Lowest price", "Top rated"],
  comparisonColumns: ["Product", "Price", "Rating", "Best for", "Key specs"],
  products: ${productsExport},
  buyingGuideHeading: "What to check before buying",
  buyingGuide: [
    {
      title: "Confirm fit and compatibility",
      body: "Measure space, check hookups or accessories, and read the manufacturer requirements before comparing prices."
    },
    {
      title: "Compare total cost",
      body: "Budget for shipping, install parts, and safety gear. A product under $500 on paper may cost more once essentials are added."
    },
    {
      title: "Read recent buyer feedback",
      body: "Ratings and review themes matter as much as headline specs. Look for repeat complaints about durability, noise, or missing parts."
    },
    {
      title: "Verify live listing details",
      body: "Amazon titles and prices change. Confirm the ASIN, variant, and current price on the live product page before buying."
    }
  ],
  faqs: [
    {
      question: "Can you find good options under $500?",
      answer: "Yes. This guide highlights products that stayed at or below $500 in the supplied sheet, with notes on tradeoffs at this price point."
    },
    {
      question: "How were these products chosen?",
      answer: "We imported the CSV, removed warranty-plan noise, deduplicated listings, and ranked picks using price, rating, and useful spec bullets."
    },
    {
      question: "Do prices stay under $500?",
      answer: "Not always. Recheck live Amazon pricing before purchase because sales and stock changes can move items above the cap."
    },
    {
      question: "Are affiliate links used?",
      answer: "Yes. BestBuyUnder500 may earn a commission if you buy through our links, at no extra cost to you. See the affiliate disclosure page."
    }
  ],
  quickPicks: [
    { label: "Best pick", productId: "${featuredId}", reason: "Top overall balance of rating, price, and features in this sheet." },
    { label: "Lowest price", productId: "${lowest?.id || featuredId}", reason: "Best starting point when keeping the budget as low as possible." },
    { label: "Top rated", productId: "${topRated?.id || featuredId}", reason: "Highest buyer rating among the cleaned comparison set." }
  ],
  budgetTips: [
    "Ignore scraped protection-plan bullet text and compare real product specs instead.",
    "Leave room in the budget for accessories, install parts, or safety gear.",
    "If two picks are close in price, choose the one with better ratings and clearer spec bullets.",
    "Recheck live Amazon pricing before checkout."
  ],
  relatedArticles: [],
  featuredProductId: "${featuredId}",
  sortOptions: [
    { label: "Top rated", value: "rating-desc" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" }
  ],
  defaultSort: "rating-desc",${carouselLine}
  publishedTime: "${now}",
  modifiedTime: "${now}"
};
`;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.csv || !args.keyword || !args.slug) {
    usage();
    process.exit(1);
  }

  const csvPath = path.resolve(args.csv);
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const camel = slugToCamel(args.slug);
  const productsExport = `${camel}Products`;
  const articleExport = `${camel}Article`;
  const outFile = articleFilePath(root, args.slug);
  const webpName = featuredWebpName(args.slug);
  const heroImage = `/images/${webpName}`;
  const metaTitle = args.keyword.includes("2026") ? args.keyword : `${args.keyword.replace(/\s+Under\s+\$500$/i, "")} Under $500 in 2026`;
  const metaDescription = `Compare ${args.keyword.toLowerCase()} picks with specs, pros, cons, quick picks, and buying tips.`;

  const products = productsFromCsv(csvPath, args.slug, {
    carousel: args.carousel,
    featuredAsin: args.featuredAsin
  });

  if (!products.length) {
    console.error("No valid products parsed from CSV (need Title, Price, image URL, affiliate link).");
    process.exit(1);
  }

  const source = renderArticleSource({
    slug: args.slug,
    keyword: args.keyword,
    category: args.category,
    products,
    productsExport,
    articleExport,
    heroImage,
    carousel: args.carousel,
    metaTitle,
    metaDescription
  });

  console.log(`Parsed ${products.length} products from ${csvPath}`);

  if (args.dryRun) {
    console.log(`Would write: ${path.relative(root, outFile)}`);
    console.log(`Would register: ${articleExport} in articles.ts + site-routes.mjs`);
    if (args.featured) console.log(`Would compress featured image → public/images/${webpName}`);
    process.exit(0);
  }

  fs.writeFileSync(outFile, source);
  console.log(`Wrote ${path.relative(root, outFile)}`);

  patchArticlesRegistry({ root, slug: args.slug, exportName: articleExport });
  console.log(`Updated src/data/articles.ts → ${articleExport}`);

  patchSiteRoutes({
    root,
    slug: args.slug,
    metaTitle,
    metaDescription,
    category: args.category
  });
  console.log(`Updated scripts/site-routes.mjs → /${args.slug}/`);

  if (args.featured) {
    const outPath = path.join(root, "public", "images", webpName);
    const info = await compressFeaturedImage(path.resolve(args.featured), outPath);
    console.log(`Featured WebP: ${path.relative(root, outPath)} (${info.width}x${info.height})`);
  } else {
    console.log(`Tip: add banner with --featured "path/to.png" → public/images/${webpName}`);
  }

  console.log("\nNext: npm run build  (then push from PowerShell yourself)");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
