const fs = require("node:fs");
const path = require("node:path");

const csvPath = "c:\\Users\\DELL Latitude\\Desktop\\Shift\\New Article - Sheet1 (9).csv";
const outFile = path.join(process.cwd(), "src", "data", "articles", "refrigerator-sale-under-500.ts");
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
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/[，​]/g, ",")
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
    "image unavailable",
    "ships from",
    "best value",
    "protection",
    "cybersecurity",
    "top 100",
    "available options",
    "customer service",
    "owner manual",
  ];
  return clean(value)
    .split("|")
    .map((item) => item.trim())
    .filter((item) => item.length > 36)
    .filter((item) => !blocked.some((word) => item.toLowerCase().includes(word)))
    .filter((item, index, arr) => arr.findIndex((other) => other.slice(0, 80) === item.slice(0, 80)) === index)
    .slice(0, 8);
}

function brandFrom(rowBrand, title) {
  const brand = clean(rowBrand).replace(/^Visit the\s+/i, "").replace(/\s+Store$/i, "").replace(/^Brand:\s*/i, "");
  if (brand && !/out of 5 stars/i.test(brand)) return brand;
  const first = clean(title).split(/[,\s]/)[0];
  return first || "Compact";
}

function shortTitle(title, brand) {
  const cleanTitle = clean(title)
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+with\s+Freezer.*/i, " with Freezer")
    .replace(/\s+Apartment Size.*/i, " Apartment Refrigerator")
    .replace(/\s+Refrigerator for.*/i, " Refrigerator")
    .replace(/\s+Two Door.*/i, " Two-Door Refrigerator")
    .replace(/\s+/g, " ")
    .trim();
  const capacity = cleanTitle.match(/\b\d+(?:\.\d+)?\s*(?:cu\.?\s*ft|cubic foot|Cu\.Ft\.?)\b/i)?.[0]?.replace(/\s+/g, " ");
  const style = /bottom freezer/i.test(cleanTitle) ? "Bottom-Freezer Refrigerator" : /top freezer/i.test(cleanTitle) ? "Top-Freezer Refrigerator" : /two|double|2 door/i.test(cleanTitle) ? "Two-Door Refrigerator" : "Compact Refrigerator";
  return `${brand} ${capacity ? `${capacity} ` : ""}${style}`.replace(/\s+/g, " ").trim();
}

function specsFrom(title, bullets) {
  const source = clean(`${title} ${bullets.join(" ")}`);
  const specs = [];
  const capacity = source.match(/\b\d+(?:\.\d+)?\s*(?:cu\.?\s*ft|cubic feet|cubic foot|Cu\.Ft\.?)\b/i)?.[0];
  const freezer = source.match(/\b(?:top|bottom|separate|dedicated)\s+freezer\b/i)?.[0];
  const temp = /7[-\s]?(?:level|setting)|7\s+temperature/i.test(source)
    ? "7 settings"
    : /5[-\s]?(?:level|setting)|5\s+(?:adjustable\s+)?temperature/i.test(source)
      ? "5 settings"
      : /adjustable\s+(?:temperature|thermostat)/i.test(source)
        ? "Adjustable thermostat"
        : "";
  const dimensions = source.match(/\b\d+(?:\.\d+)?(?:\s*inch|")\s*[x*]\s*\d+(?:\.\d+)?(?:\s*inch|")\s*[x*]\s*\d+(?:\.\d+)?(?:\s*inch|")/i)?.[0];
  const shelves = /adjustable|removable|glass shelves|crisper/i.test(source) ? "Adjustable shelves / crisper" : "";
  const noise = source.match(/\b\d+\s*dB\b/i)?.[0];
  if (capacity) specs.push(`Capacity: ${capacity.replace(/cubic feet/i, "cu. ft.")}`);
  if (freezer) specs.push(`Freezer: ${freezer.replace(/\b\w/g, (c) => c.toUpperCase())}`);
  if (temp) specs.push(`Temperature: ${temp.replace(/\s+/g, " ")}`);
  if (shelves) specs.push(`Storage: ${shelves}`);
  if (dimensions) specs.push(`Size: ${dimensions.replace(/\s+/g, " ")}`);
  if (noise) specs.push(`Noise: ${noise}`);
  if (/reversible/i.test(source)) specs.push("Door: Reversible");
  if (/energy/i.test(source)) specs.push("Efficiency: Energy-focused");
  return specs.slice(0, 7);
}

function featuresFrom(bullets, specs) {
  const text = bullets.join(" ").toLowerCase();
  const features = [...specs];
  if (/crisper|produce|vegetable|fruit/.test(text)) features.push("Crisper storage for produce");
  if (/reversible/.test(text)) features.push("Reversible door for flexible placement");
  if (/quiet|39db|42db|noise/.test(text)) features.push("Quiet operation for apartments or offices");
  if (/energy|1kwh|efficient/.test(text)) features.push("Energy-conscious cooling design");
  if (/led|interior lighting|light/.test(text)) features.push("Interior lighting for easier access");
  return [...new Set(features)].slice(0, 5);
}

function pros(product, bullets) {
  const text = `${product.title} ${bullets.join(" ")}`.toLowerCase();
  const items = [];
  if (/7\.7|8\.5|9\.2/.test(text)) items.push("More storage capacity than many compact fridges under $500");
  if (/bottom freezer/.test(text)) items.push("Bottom freezer layout keeps fresh food easier to reach");
  if (/quiet|39db|42db/.test(text)) items.push("Quiet operation is useful for apartments, dorms, and offices");
  if (/energy|1kwh/.test(text)) items.push("Energy-focused design can help with everyday running costs");
  if (/reversible/.test(text)) items.push("Reversible door makes placement easier in tight rooms");
  if (!items.length) items.push("Practical fridge/freezer layout for budget home storage");
  return items.slice(0, 3);
}

function cons(product, bullets) {
  const text = `${product.title} ${bullets.join(" ")}`.toLowerCase();
  const items = [];
  if (product.rating && product.rating < 4) items.push("Lower rating than some competing picks");
  if (/retro|platinum|stainless|silver/.test(text) && product.price > 450) items.push("Style-focused finish pushes the price closer to the $500 ceiling");
  if (!/frost-free/i.test(text)) items.push("May need more freezer maintenance than frost-free models");
  if (!/garage ready/i.test(text) && /garage/i.test(text)) items.push("Verify garage placement requirements before buying");
  if (!items.length) items.push("Check dimensions carefully before ordering for a small kitchen or dorm");
  return items.slice(0, 3);
}

const [headers, ...rows] = parseCsv(fs.readFileSync(csvPath, "utf8"));
const h = Object.fromEntries(headers.map((header, index) => [header.trim(), index]));
const seen = new Set();
const products = rows
  .map((row, index) => {
    const title = clean(row[h.Title]);
    const bullets = meaningfulBullets(row[h["Bullet Features"]]);
    const brand = brandFrom(row[h.Brand], title);
    const product = {
      id: `refrigerator-${index + 1}`,
      title,
      shortTitle: shortTitle(title, brand),
      image: clean(row[h["Main HD Image"]]),
      price: numberFrom(row[h.Price]),
      rating: numberFrom(row[h.Rating]),
      affiliateUrl: clean(row[h["Affilate Links"]]),
      asin: clean(row[h.ASIN]),
      specs: specsFrom(title, bullets),
      features: [],
      pros: [],
      cons: [],
      badge: undefined,
      highlightFeature: undefined,
    };
    product.features = featuresFrom(bullets, product.specs);
    product.pros = pros(product, bullets);
    product.cons = cons(product, bullets);
    product.highlightFeature = product.specs[0]?.replace(/^[^:]+:\s*/, "");
    return product;
  })
  .filter((product) => product.title && product.image && product.affiliateUrl && product.price)
  .filter((product) => {
    const key = product.asin || `${product.title}-${product.image}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .sort((a, b) => a.price - b.price)
  .map((product, index) => ({
    ...product,
    id: `refrigerator-${index + 1}`,
    badge: index === 0 ? "Lowest price" : index === 1 ? "Best apartment value" : index === 2 ? "Best quiet pick" : product.badge,
  }));

const source = `import type { Article, Product } from "../../types";

export const refrigeratorProducts: Product[] = ${JSON.stringify(products, null, 2)};

export const refrigeratorArticle: Article = {
  slug: "refrigerator-sale-under-500",
  navLabel: "Refrigerator sale under $500",
  keyword: "Refrigerator Sale Under $500",
  metaTitle: "Refrigerator Sale Under $500 in 2026",
  metaDescription:
    "Compare refrigerator sale under $500 picks for apartments, dorms, offices, and compact kitchens with capacity, freezer, shelves, and price notes.",
  category: "Home & Living",
  breadcrumb: ["Home", "Home & Living", "Refrigerator Sale Under $500"],
  heroImage: "/images/featured-refrigerator.svg",
  heroBadge: "New refrigerator sale guide",
  heroTitleLine1: "Refrigerator Sale",
  heroTitleLine2: "Under $500",
  heroSubtitle:
    "A practical comparison of compact and apartment-size refrigerators with freezer space, useful storage, and prices below the $500 ceiling.",
  heroTrustNote:
    "Always check live dimensions, delivery terms, and current Amazon pricing before buying a refrigerator.",
  introHeading: "How we picked refrigerators under $500",
  introParagraphs: [
    "This BestBuyUnder500.com guide focuses on compact and apartment-size refrigerators that balance storage capacity, freezer layout, shelf flexibility, quiet operation, and real price value.",
    "We cleaned the supplied product sheet to remove warranty-plan and marketplace noise, then rewrote the notes around the details buyers actually compare: capacity, freezer position, thermostat control, shelves, reversible doors, and everyday placement."
  ],
  filters: ["Apartment kitchens", "Dorm rooms", "Quiet operation", "Large capacity", "Bottom freezer"],
  comparisonColumns: ["Product", "Price", "Rating", "Best for", "Key specs", "Buy"],
  products: refrigeratorProducts,
  buyingGuideHeading: "What to check before buying a refrigerator under $500",
  buyingGuide: [
    {
      title: "Measure the space first",
      body:
        "Compact refrigerators vary more than they look online. Measure width, depth, height, door swing, and ventilation space before comparing prices."
    },
    {
      title: "Compare total capacity and freezer layout",
      body:
        "A 7.5 cu. ft. fridge can feel very different depending on whether the freezer is top-mounted, bottom-mounted, or smaller than expected."
    },
    {
      title: "Look for adjustable shelves",
      body:
        "Removable shelves, door bins, and crisper drawers make a small refrigerator much easier to organize for groceries, drinks, and meal prep."
    },
    {
      title: "Check noise and energy notes",
      body:
        "Quiet operation matters in dorms, bedrooms, offices, and studio apartments. Energy-focused models may also cost less to run over time."
    }
  ],
  faqs: [
    {
      question: "Can I get a useful refrigerator under $500?",
      answer:
        "Yes. Under $500, the strongest values are usually compact, apartment-size, and two-door refrigerators rather than full-size family models."
    },
    {
      question: "What size refrigerator is best for an apartment?",
      answer:
        "Many apartment buyers choose around 7 to 9 cu. ft. because it offers useful grocery storage without taking over a small kitchen."
    },
    {
      question: "Is a bottom freezer better than a top freezer?",
      answer:
        "A bottom freezer can be easier for fresh-food access, while a top freezer is common and simple. Choose based on what you reach for most often."
    },
    {
      question: "Should I trust refrigerator sale prices online?",
      answer:
        "Use sale pricing as a starting point, but confirm delivery, dimensions, warranty details, and current availability before buying."
    }
  ],
  quickPicks: [
    { label: "Lowest listed price", productId: refrigeratorProducts[0]?.id || "", reason: "Best starting point if keeping the appliance budget low matters most." },
    { label: "Best apartment value", productId: refrigeratorProducts.find((product) => product.shortTitle.includes("Upstreman") || product.shortTitle.includes("EUHOMY"))?.id || refrigeratorProducts[1]?.id || "", reason: "Good capacity and flexible storage for apartment or office use." },
    { label: "Best large capacity", productId: refrigeratorProducts.find((product) => product.shortTitle.includes("9.2") || product.shortTitle.includes("8.5"))?.id || refrigeratorProducts[2]?.id || "", reason: "More usable space while staying below the $500 ceiling." }
  ],
  budgetTips: [
    "Check whether delivery or haul-away fees change the real final price.",
    "Compare freezer capacity separately from total refrigerator capacity.",
    "For dorms or offices, quiet operation can matter as much as storage size.",
    "If two models are close in price, choose the one with better shelves, crisper storage, and reversible door placement."
  ],
  relatedArticles: [],
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
console.log(`Wrote ${products.length} refrigerator products to ${outFile}`);
