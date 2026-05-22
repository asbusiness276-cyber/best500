const fs = require("node:fs");
const path = require("node:path");
const { parseProductImages } = require("./csv-product-images.cjs");

const csvPath = "c:\\Users\\DELL Latitude\\Desktop\\Shift\\New Article - Sheet1 (11).csv";
const outFile = path.join(process.cwd(), "src", "data", "articles", "best-watches-mens-under-500.ts");
const now = new Date().toISOString();

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"') {
      if (quoted && next === '"') {
        field += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      if (row.some((item) => item.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function clean(value) {
  return String(value || "")
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/®/g, "")
    .replace(/°/g, " degrees ")
    .replace(/\s+/g, " ")
    .trim();
}

function numberFrom(value) {
  const parsed = Number(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function brandFrom(rowBrand, title) {
  const raw = clean(rowBrand);
  const fromStore = raw.replace(/^Visit the\s+/i, "").replace(/\s+Store$/i, "").replace(/\.premium-logo.*/i, "");
  if (fromStore && fromStore.length < 40 && !/stars/i.test(fromStore)) return fromStore;
  const brands = ["Bulova", "Citizen", "Fossil", "SEIKO", "Seiko", "Stuhrling", "Tissot"];
  for (const name of brands) {
    if (new RegExp(name, "i").test(title)) return name === "SEIKO" ? "Seiko" : name;
  }
  return clean(title).split(/\s+/)[0] || "Watch";
}

function shortTitle(title, brand) {
  const t = clean(title)
    .replace(/\s+Style:\s*\S+/i, "")
    .replace(/\s+for Men\b/i, "")
    .replace(/\s+Watch\b/i, " Watch")
    .replace(/\s+/g, " ")
    .trim();
  const model = t.match(/\b(?:98[A-Z]\d+|AT\d+-\d+\w*|SSK\d+|B\d+\w+|AN\d+-\d+\w*)\b/i)?.[0];
  const line = t.match(/\b(?:Marine Star|Corso|Grant|Coutura|Presage|Tsuyosa|Eco-Drive|Precisionist|Sutton)\b/i)?.[0];
  const type = /chronograph/i.test(t) ? "Chronograph" : /automatic/i.test(t) ? "Automatic" : /eco-drive/i.test(t) ? "Eco-Drive" : /dress/i.test(t) ? "Dress" : "";
  const label = [brand, line || model, type].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  return (label || t).slice(0, 95);
}

function specsFrom(title) {
  const source = clean(title);
  const specs = [];
  const movement = /eco-drive/i.test(source)
    ? "Eco-Drive solar quartz"
    : /automatic|self-winding/i.test(source)
      ? "Automatic (self-winding)"
      : /quartz/i.test(source)
        ? "Quartz"
        : /radio sync solar/i.test(source)
          ? "Radio-sync solar quartz"
          : "";
  const water = source.match(/\b(\d{2,3})M\b/i)?.[1] || source.match(/(\d{2,3})\s*meters?\s*water/i)?.[1];
  const caseMm = source.match(/\b(\d{2})mm\b/i)?.[1];
  const band = /leather/i.test(source) ? "Leather strap" : /silicone|rubber/i.test(source) ? "Silicone strap" : /stainless steel|bracelet/i.test(source) ? "Stainless steel bracelet" : "";
  if (movement) specs.push(`Movement: ${movement}`);
  if (/chronograph|6-hand|multi-function/i.test(source)) specs.push("Complications: Chronograph / multi-function");
  if (water) specs.push(`Water resistance: ${water}M`);
  if (caseMm) specs.push(`Case size: ${caseMm}mm`);
  if (band) specs.push(`Band: ${band}`);
  if (/sapphire/i.test(source)) specs.push("Crystal: Sapphire");
  if (/luminous/i.test(source)) specs.push("Display: Luminous hands/markers");
  if (/gmt/i.test(source)) specs.push("Feature: GMT bezel");
  if (!specs.length) specs.push("Style: Men's dress / sport watch");
  return specs.slice(0, 6);
}

function featuresFrom(specs, title) {
  const text = clean(title).toLowerCase();
  const features = [...specs];
  if (/eco-drive|solar/.test(text)) features.push("No battery changes with light-powered Eco-Drive");
  if (/automatic|exhibition caseback|open aperture/.test(text)) features.push("Mechanical automatic appeal with visible movement details");
  if (/chronograph|tachymeter|perpetual calendar/.test(text)) features.push("Useful timing and calendar complications");
  if (/dive|200\s*m|100m|300m/i.test(text)) features.push("Water resistance suited to swimming or diving");
  if (/crystal|diamond|pave/i.test(text)) features.push("Dress-forward dial finishing for office wear");
  return [...new Set(features)].slice(0, 5);
}

function pros(product, title) {
  const text = clean(title).toLowerCase();
  const items = [];
  if (/eco-drive|solar/.test(text)) items.push("Eco-Drive solar power reduces battery maintenance over years of wear");
  if (/automatic|self-winding/.test(text)) items.push("Automatic movement offers traditional mechanical watch appeal");
  if (/sapphire/.test(text)) items.push("Sapphire crystal improves scratch resistance for daily wear");
  if (/chronograph|multi-function|gmt/.test(text)) items.push("Chronograph or GMT features add useful everyday functionality");
  if (product.rating >= 4.6) items.push("Strong buyer ratings compared with other picks in this guide");
  if (product.price < 280) items.push("Leaves room in a $500 budget for straps, sizing, or a second casual watch");
  if (!items.length) items.push("Solid brand and feature mix for shoppers staying under the $500 ceiling");
  return items.slice(0, 3);
}

function cons(product, title) {
  const text = clean(title).toLowerCase();
  const items = [];
  if (product.rating && product.rating < 4.4) items.push("Rating trails some higher-scoring Citizen and Bulova picks in this list");
  if (product.price > 450) items.push("Premium price uses most of a $500 watch budget in one purchase");
  if (/leather/.test(text)) items.push("Leather straps may need replacement sooner than steel bracelets with heavy wear");
  if (/quartz/.test(text) && !/eco-drive|solar/.test(text)) items.push("Standard quartz lacks the enthusiast appeal of automatic or Eco-Drive models");
  if (/crystal|diamond|pave/i.test(text)) items.push("Dressy crystals and stones may feel flashy for minimal everyday outfits");
  if (!items.length) items.push("Check case size, lug width, and band fit against your wrist before ordering");
  return items.slice(0, 3);
}

const [headers, ...rows] = parseCsv(fs.readFileSync(csvPath, "utf8"));
const h = Object.fromEntries(headers.map((header, index) => [header.trim().toLowerCase(), index]));
const headerMap = Object.fromEntries(headers.map((header, index) => [header.trim(), index]));
const seen = new Set();

let products = rows
  .map((row, index) => {
    const col = (name) => row[h[name.toLowerCase()]];
    const title = clean(col("Title"));
    const brand = brandFrom(col("Brand"), title);
    const { image } = parseProductImages(row, headerMap, clean);
    const product = {
      id: `watch-${index + 1}`,
      title,
      shortTitle: shortTitle(title, brand),
      image,
      price: numberFrom(col("Price")),
      rating: numberFrom(col("Rating")),
      affiliateUrl: clean(col("Affilate Links") || col("Affiliate Links")),
      asin: clean(col("ASIN")),
      specs: specsFrom(title),
      features: [],
      pros: [],
      cons: [],
      badge: undefined,
      highlightFeature: undefined,
    };
    product.features = featuresFrom(product.specs, title);
    product.pros = pros(product, title);
    product.cons = cons(product, title);
    product.highlightFeature = product.specs[0]?.replace(/^[^:]+:\s*/, "");
    return product;
  })
  .filter((product) => product.title && product.image && product.affiliateUrl && product.price)
  .filter((product) => product.price <= 500)
  .filter((product) => {
    const key = product.asin || `${product.title}-${product.image}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

const featuredAsin = "B00UMD8D72";
const featured = products.find((p) => p.asin === featuredAsin) || products.find((p) => p.rating >= 4.7 && p.price < 300) || products[0];
const others = products.filter((p) => p.asin !== featured?.asin).sort((a, b) => b.rating - a.rating || a.price - b.price);
products = [featured, ...others].filter(Boolean).map((product, index) => ({
  ...product,
  id: `watch-${index + 1}`,
  badge: index === 0 ? "Best overall pick" : index === 1 ? "Best budget value" : index === 2 ? "Best automatic" : product.badge,
}));

const featuredId = products[0]?.id || "";

const source = `import type { Article, Product } from "../../types";

export const watchProducts: Product[] = ${JSON.stringify(products, null, 2)};

export const watchArticle: Article = {
  slug: "best-watches-mens-under-500",
  navLabel: "Men's watches under $500",
  keyword: "Best Watches Mens Under 500",
  metaTitle: "Best Men's Watches Under $500 in 2026",
  metaDescription:
    "Compare the best men's watches under $500 with dress, dive, chronograph, Eco-Drive, and automatic picks from Citizen, Bulova, Seiko, Fossil, and Tissot.",
  category: "Fashion",
  breadcrumb: ["Home", "Fashion", "Best Watches Mens Under 500"],
  heroImage: "/images/featured-watches.webp",
  heroBadge: "New men's watch buying guide",
  heroTitleLine1: "Best Men's Watches",
  heroTitleLine2: "Under $500",
  heroSubtitle:
    "A practical comparison of dress, sport, dive, chronograph, Eco-Drive, and automatic men's watches with movement type, water resistance, and real buyer tradeoffs.",
  heroTrustNote:
    "Prices and availability change on Amazon. Confirm case size, band fit, and movement type before buying.",
  introHeading: "How we picked men's watches under $500",
  introParagraphs: [
    "This BestBuyUnder500.com guide rounds up good watches for under $500 from trusted brands, with each pick verified under the price ceiling at publish time.",
    "Whether you want nice watches under $500 for the office, great watches for under $500 with chronograph features, or top watches under $500 with Eco-Drive or automatic movements, we organized the list around what buyers actually compare: movement, water resistance, case size, band type, and long-term wear.",
    "We cleaned the supplied product sheet, preserved each affiliate URL, and wrote concise pros and cons so you can compare best watches under 500 mens styles without wading through marketplace clutter."
  ],
  filters: [
    "Best overall pick",
    "Best budget value",
    "Dress watch",
    "Dive / sport",
    "Chronograph",
    "Eco-Drive solar",
    "Automatic",
    "Japanese brands",
    "Swiss style",
    "Under $300",
    "Bulova Marine Star",
    "Citizen Corso"
  ],
  comparisonColumns: ["Product", "Price", "Rating", "Best for", "Key specs", "Buy"],
  products: watchProducts,
  buyingGuideHeading: "What to check before buying men's watches under $500",
  buyingGuide: [
    {
      title: "Choose movement type first",
      body:
        "Quartz is accurate and low-maintenance. Eco-Drive solar quartz avoids battery swaps. Automatic watches feel more traditional but need regular wear or a winder."
    },
    {
      title: "Match water resistance to your lifestyle",
      body:
        "30M suits light splashes. 100M is fine for swimming. True dive ratings matter only if you actually swim or dive with the watch regularly."
    },
    {
      title: "Check case size and band fit",
      body:
        "Case diameter and lug width determine wrist presence and strap options. Leather is dressy but wears faster; steel bracelets last longer for daily use."
    },
    {
      title: "Decide dress vs sport vs everyday",
      body:
        "Crystal dials and two-tone bracelets dress up easily. GMT and chronograph models add function. Pick one primary role so the watch earns daily wear."
    }
  ],
  faqs: [
    {
      question: "What are the best watches mens under 500 for everyday wear?",
      answer:
        "For daily wear, Eco-Drive models like the Citizen Corso, versatile Bulova Marine Star chronographs, and sub-$300 Fossil or Bulova dress watches balance price, ratings, and low maintenance."
    },
    {
      question: "Are best men's watches under $500 worth it compared with fashion watches?",
      answer:
        "Yes. In this range you get established movements, better crystals, and stronger resale interest from Citizen, Seiko, Bulova, Fossil, and Tissot rather than unknown fashion brands."
    },
    {
      question: "Should I buy quartz, Eco-Drive, or automatic?",
      answer:
        "Choose quartz for simplicity, Eco-Drive for solar convenience, and automatic if you want mechanical character and do not mind slightly less accuracy than quartz."
    },
    {
      question: "Can I find chronograph or dive watches under $500?",
      answer:
        "Absolutely. This list includes chronograph and 100M-rated sport picks from Bulova, Citizen, Seiko, and Stuhrling that stay below the $500 cap."
    }
  ],
  quickPicks: [
    { label: "Best overall pick", productId: watchProducts[0]?.id || "", reason: "Citizen Corso Eco-Drive pairs solar convenience, dress versatility, and strong ratings near $260." },
    { label: "Lowest strong-rated price", productId: watchProducts.find((p) => p.price < 250 && p.rating >= 4.6)?.id || watchProducts[1]?.id || "", reason: "Fossil Grant and Bulova sport picks offer top watches under 500 value without using the full budget." },
    { label: "Best automatic under $500", productId: watchProducts.find((p) => /automatic/i.test(p.title))?.id || watchProducts[2]?.id || "", reason: "Seiko, Bulova Sutton, and Stuhrling automatics deliver mechanical appeal below the ceiling." }
  ],
  budgetTips: [
    "You do not need to spend $500 to get a strong daily watch; many top-rated picks land between $250 and $350.",
    "Eco-Drive and standard quartz usually cost less to own than servicing an automatic over several years.",
    "If you want one watch for office and weekends, prioritize versatile dial colors and 100M water resistance.",
    "Confirm whether the listing includes sizing tools or extra straps before comparing final value."
  ],
  relatedArticles: ["best-gaming-headsets-for-under-500", "best-gaming-laptop-under-500"],
  featuredProductId: "${featuredId}",
  sortOptions: [
    { label: "Recommended", value: "recommended" },
    { label: "Price: low to high", value: "price-asc" },
    { label: "Rating: high to low", value: "rating-desc" }
  ],
  defaultSort: "recommended",
  publishedTime: "${now}",
  modifiedTime: "${now}"
};
`;

fs.writeFileSync(outFile, source);
console.log(`Wrote ${products.length} watch products to ${outFile}`);
