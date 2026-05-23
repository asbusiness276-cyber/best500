const fs = require("node:fs");
const path = require("node:path");

const csvPath = "c:\\Users\\DELL Latitude\\Desktop\\Shift\\New Article - Sheet1 (13).csv";
const outFile = path.join(process.cwd(), "src", "data", "articles", "best-washer-and-dryer-bundles-under-500.ts");
const now = new Date().toISOString();
const FEATURED_ASIN = "B0GQZBF81R";

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
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function numberFrom(value) {
  const parsed = Number(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function meaningfulBullets(value) {
  const blocked = [
    "coverage",
    "asurion",
    "claim",
    "terms",
    "return",
    "best value",
    "protection",
    "cybersecurity",
    "pre-existing",
    "product eligibility",
    "easy claims",
    "past and future",
    "trusted cybersecurity",
  ];
  return clean(value)
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter((item) => item.length > 36)
    .filter((item) => !blocked.some((word) => item.toLowerCase().includes(word)))
    .slice(0, 6);
}

function brandFrom(rowBrand, title) {
  const brand = clean(rowBrand).replace(/^Brand:\s*/i, "").replace(/^Visit the\s+/i, "").replace(/\s+Store$/i, "");
  if (brand && !/out of 5 stars/i.test(brand)) return brand;
  const first = clean(title).split(/[,\s]/)[0];
  return first || "Portable";
}

function shortTitle(title, brand) {
  const t = clean(title);
  const lbs = t.match(/\b(\d+(?:\.\d+)?)\s*(?:lbs|LBS|Lbs)\b/)?.[1];
  const cuft = t.match(/\b(\d+(?:\.\d+)?)\s*(?:cu\.?\s*ft|Cu\.Ft)\b/i)?.[1];
  const isSet = /combo set|washer and dryer|dryer set|washing machine set|clothes dryer and/i.test(t);
  const isTwin = /twin tub/i.test(t);
  const isCombo = /combo(?! set)|washer and spin dryer/i.test(t) && !isSet;
  const type = isSet ? "Washer & Dryer Set" : isTwin ? "Twin-Tub Washer" : isCombo ? "Washer-Dryer Combo" : "Portable Washer";
  const cap = lbs ? `${lbs} lb` : cuft ? `${cuft} cu.ft` : "";
  return `${brand} ${cap ? `${cap} ` : ""}${type}`.replace(/\s+/g, " ").trim();
}

function specsFrom(title) {
  const source = clean(title);
  const specs = [];
  const washerLbs = source.match(/\b(\d+(?:\.\d+)?)\s*(?:lbs|LBS|Lbs)\b/);
  const cuft = source.match(/\b(\d+(?:\.\d+)?)\s*(?:cu\.?\s*ft|Cu\.Ft)\b/gi);
  const cycles = source.match(/\b(\d+)\s*(?:wash\s*)?cycles?\b/i)?.[1];
  const water = source.match(/\b(\d+)\s*water levels?\b/i)?.[1];
  const programs = source.match(/\b(\d+)\s*programs?\b/i)?.[1];

  if (/twin tub/i.test(source)) specs.push("Type: Twin-tub washer/spin");
  else if (/combo set|washer and dryer set|washing machine set|clothes dryer and/i.test(source)) specs.push("Type: Separate washer + dryer set");
  else if (/full[- ]?automatic|fully automatic/i.test(source)) specs.push("Type: Full-automatic");
  else specs.push("Type: Compact laundry unit");

  if (washerLbs) specs.push(`Washer capacity: ${washerLbs[1]} lbs`);
  if (cuft?.length) {
    if (/dryer/i.test(source) && cuft.length > 1) {
      specs.push(`Dryer capacity: ${cuft[cuft.length - 1].replace(/\s+/g, " ")}`);
    } else if (/dryer|cu\.ft/i.test(source)) {
      specs.push(`Dryer capacity: ${cuft[0].replace(/\s+/g, " ")}`);
    }
  }
  if (cycles) specs.push(`Wash cycles: ${cycles}`);
  if (water) specs.push(`Water levels: ${water}`);
  if (programs) specs.push(`Programs: ${programs}`);
  if (/stainless steel/i.test(source)) specs.push("Tub: Stainless steel");
  if (/drain pump/i.test(source)) specs.push("Drain: Built-in pump");
  if (/led display/i.test(source)) specs.push("Display: LED");
  if (/apartment|dorm|rv/i.test(source)) specs.push("Best for: Apartment, dorm, RV");
  return specs.slice(0, 6);
}

function featuresFrom(specs, title) {
  const text = clean(title).toLowerCase();
  const features = [...specs];
  if (/boot dryer/i.test(text)) features.push("Boot dryer mode on portable dryer");
  if (/space saving|compact/i.test(text)) features.push("Space-saving layout for small homes");
  if (/spin dryer|spinner/i.test(text)) features.push("Built-in spin-dry function");
  return [...new Set(features)].slice(0, 5);
}

function pros(product, title) {
  const text = clean(title).toLowerCase();
  const items = [];
  if (/combo set|washer and dryer set/i.test(text)) items.push("True washer and dryer bundle instead of a single combo drum");
  if (/stainless steel/i.test(text)) items.push("Stainless tub is easier to clean and resists odors better than basic plastic");
  if (/drain pump/i.test(text)) items.push("Built-in drain pump simplifies apartment and RV hookups");
  if (product.rating >= 4.3) items.push("Strong buyer rating compared with other bundles in this guide");
  if (product.price <= 200) items.push("Low upfront cost leaves room for hoses, vents, and laundry supplies");
  if (/black\+decker|black decker/i.test(text)) items.push("Recognized home-appliance brand with familiar support expectations");
  if (!items.length) items.push("Compact footprint fits apartments, dorms, and secondary laundry spaces");
  return items.slice(0, 3);
}

function cons(product, title) {
  const text = clean(title).toLowerCase();
  const items = [];
  if (product.rating < 4.1) items.push("Lower rating than several competing picks in this price band");
  if (!/dryer/i.test(text) || (/washer.*spin dryer/i.test(text) && !/combo set|dryer set/i.test(text))) {
    items.push("Spin or combo units dry slower than a separate vented dryer");
  }
  if (/twin tub/i.test(text)) items.push("Twin-tub models need more manual steps than full-automatic sets");
  if (product.price >= 480) items.push("Price sits close to the $500 ceiling with little room for install extras");
  if (!items.length) items.push("Verify hose, vent, and electrical requirements before ordering");
  return items.slice(0, 3);
}

const [headers, ...rows] = parseCsv(fs.readFileSync(csvPath, "utf8"));
const h = Object.fromEntries(headers.map((header, index) => [header.trim(), index]));
const seen = new Set();

let products = rows
  .map((row) => {
    const title = clean(row[h.Title]);
    const bullets = meaningfulBullets(row[h["Bullet Features"]]);
    const brand = brandFrom(row[h.Brand], title);
    const asin = clean(row[h.ASIN]);
    const product = {
      title,
      shortTitle: shortTitle(title, brand),
      image: clean(row[h["Main HD Image"]]),
      price: numberFrom(row[h.Price]),
      rating: numberFrom(row[h.Rating]),
      affiliateUrl: clean(row[h["Affilates Links"]] || row[h["Affilate Links"]] || row[0]),
      asin,
      specs: specsFrom(title),
      features: [],
      pros: [],
      cons: [],
      highlightFeature: undefined,
      badge: undefined,
    };
    product.features = featuresFrom(product.specs, title);
    product.pros = pros(product, title);
    product.cons = cons(product, title);
    product.highlightFeature = product.specs.find((s) => /capacity|Type/i.test(s))?.replace(/^[^:]+:\s*/, "") || product.specs[0]?.replace(/^[^:]+:\s*/, "");
    return product;
  })
  .filter((product) => product.title && product.image && product.affiliateUrl && product.price)
  .filter((product) => {
    const key = product.asin || product.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

if (!products.length) {
  throw new Error("No washer-dryer products parsed from CSV. Check affiliate column headers.");
}

const featured = products.find((p) => p.asin === FEATURED_ASIN) || [...products].sort((a, b) => b.rating - a.rating)[0];
const rest = products.filter((p) => p.asin !== featured.asin).sort((a, b) => b.rating - a.rating || a.price - b.price);

featured.badge = "Best bundle pick";
const lowest = [...products].sort((a, b) => a.price - b.price)[0];
if (lowest && lowest.asin !== featured.asin) lowest.badge = lowest.badge || "Lowest price";

products = [featured, ...rest].map((product, index) => ({
  ...product,
  id: `washer-dryer-${index + 1}`,
}));

const featuredId = products[0]?.id || "washer-dryer-1";
const lowestId = products.find((p) => p.badge === "Lowest price")?.id || products.find((p) => p.price === Math.min(...products.map((x) => x.price)))?.id;
const topRatedId = [...products].sort((a, b) => b.rating - a.rating)[0]?.id;

const source = `import type { Article, Product } from "../../types";

export const washerDryerProducts: Product[] = ${JSON.stringify(products, null, 2)};

export const washerDryerArticle: Article = {
  slug: "best-washer-and-dryer-bundles-under-500",
  navLabel: "Washer dryer bundles under $500",
  keyword: "Best Washer and Dryer Bundles Under $500",
  metaTitle: "Best Washer & Dryer Bundles Under $500 in 2026",
  metaDescription:
    "Compare the best washer and dryer bundles under $500 with portable sets, compact combos, capacity, cycles, and apartment-friendly value notes.",
  category: "Home & Living",
  breadcrumb: ["Home", "Home & Living", "Best Washer and Dryer Bundles Under $500"],
  heroImage: "/images/featured-washer-dryer.webp",
  heroBadge: "New washer & dryer guide",
  heroTitleLine1: "Washer & Dryer",
  heroTitleLine2: "Bundles Under $500",
  heroSubtitle:
    "A practical comparison of portable washer and dryer bundles, compact laundry sets, and combo units that stay below the $500 ceiling for apartments and dorms.",
  heroTrustNote:
    "Always check live dimensions, hookup requirements, venting needs, and current Amazon pricing before buying a laundry bundle.",
  introHeading: "How we picked washer and dryer bundles under $500",
  introParagraphs: [
    "This BestBuyUnder500.com guide focuses on portable washer and dryer bundles that balance wash capacity, drying method, cycle options, drain convenience, and real price value for small homes.",
    "We cleaned the supplied product sheet to remove warranty-plan noise, then organized picks around what buyers compare: separate washer/dryer sets vs combo drums, lb or cu.ft capacity, full-automatic vs twin-tub operation, and apartment or RV placement."
  ],
  filters: [
    "Best bundle pick",
    "Lowest price",
    "Top rated",
    "Full automatic",
    "Twin tub",
    "Separate dryer",
    "Apartment",
    "RV & dorm",
    "Stainless tub",
    "Drain pump",
    "Erivess sets",
    "Auertech bundles"
  ],
  comparisonColumns: ["Product", "Price", "Rating", "Best for", "Key specs"],
  products: washerDryerProducts,
  buyingGuideHeading: "What to check before buying washer dryer bundles under $500",
  buyingGuide: [
    {
      title: "Separate set vs all-in-one combo",
      body:
        "A washer and dryer combo set gives you a real dryer drum, while many combo washers rely on spin-drying that takes longer. Match the format to how much laundry you do each week."
    },
    {
      title: "Compare capacity in lbs and cu.ft",
      body:
        "Washer ratings often use pounds of laundry, while dryers use cubic feet. A 16–20 lb washer with a 1.5–1.8 cu.ft dryer is typical in this price band."
    },
    {
      title: "Plan hookups and drainage",
      body:
        "Check faucet adapters, drain hose routing, and whether you need a vent kit. Built-in drain pumps are helpful in apartments without floor drains."
    },
    {
      title: "Expect compact performance",
      body:
        "Portable bundles under $500 are not full-size laundry rooms. They work best for singles, couples, dorms, RVs, and secondary laundry spaces."
    }
  ],
  faqs: [
    {
      question: "Can you get a washer and dryer bundle under $500?",
      answer:
        "Yes. Under $500 you will mostly find portable and compact sets rather than full-size stacked laundry centers. The best values are usually separate portable washer and dryer pairs or smaller full-automatic combos."
    },
    {
      question: "Are portable washer dryer bundles good for apartments?",
      answer:
        "They can work well when space, venting, and noise rules allow them. Measure the footprint, confirm landlord or HOA rules, and plan drainage before buying."
    },
    {
      question: "Is a combo washer dryer the same as a bundle?",
      answer:
        "Not always. A bundle usually means two machines. A combo unit washes and spin-dries in one cabinet, which saves space but often dries more slowly than a separate dryer."
    },
    {
      question: "What capacity should I look for?",
      answer:
        "For one or two people, many buyers target roughly 15–20 lb washers with 1.5–2.0 cu.ft dryers. Larger households may outgrow compact bundles quickly."
    }
  ],
  quickPicks: [
    { label: "Best bundle pick", productId: "${featuredId}", reason: "Strong rating and separate washer plus dryer set at a practical price under the $500 cap." },
    { label: "Lowest price", productId: "${lowestId || featuredId}", reason: "Best starting point when keeping the laundry budget as low as possible." },
    { label: "Top rated", productId: "${topRatedId || featuredId}", reason: "Highest buyer rating in the cleaned comparison sheet." }
  ],
  budgetTips: [
    "Ignore scraped protection-plan bullet text and compare wash capacity, dryer size, and drain setup instead.",
    "Budget for hoses, adapters, and possible vent kits even when the machines are under $500.",
    "Twin-tub models cost less but need more hands-on laundry steps than full-automatic sets.",
    "If two bundles are close in price, choose the one with a separate dryer and stainless tub."
  ],
  relatedArticles: ["refrigerator-sale-under-500"],
  featuredProductId: "${featuredId}",
  sortOptions: [
    { label: "Top rated", value: "rating-desc" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" }
  ],
  defaultSort: "rating-desc",
  publishedTime: "${now}",
  modifiedTime: "${now}"
};
`;

fs.writeFileSync(outFile, source);
console.log(`Wrote ${products.length} washer-dryer products to ${outFile}`);
console.log(`Featured: ${featured.shortTitle} (${featured.asin})`);
