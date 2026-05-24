const fs = require("node:fs");
const path = require("node:path");

const csvPath = "c:\\Users\\DELL Latitude\\Desktop\\Shift\\New Article - Sheet1 (16).csv";
const outFile = path.join(process.cwd(), "src", "data", "articles", "best-barbecue-grill-under-500.ts");
const now = new Date().toISOString();
const FEATURED_ASIN = "B0CLVGJ5X9";
const PRICE_CAP = 500;

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
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function numberFrom(value) {
  const parsed = Number(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function asinFrom(url) {
  const match = clean(url).match(/\/dp\/([A-Z0-9]{10})/i);
  return match ? match[1].toUpperCase() : "";
}

function ratingFrom(value) {
  const raw = clean(value);
  if (/^\$?\d(\.\d)?$/.test(raw.replace("$", ""))) {
    const n = numberFrom(raw);
    if (n >= 1 && n <= 5) return n;
  }
  const star = raw.match(/(\d(?:\.\d)?)\s*out of 5/i);
  if (star) return numberFrom(star[1]);
  return numberFrom(raw);
}

function brandFrom(rowBrand, title) {
  let brand = clean(rowBrand);
  if (/out of 5 stars/i.test(brand) || /^\d/.test(brand)) {
    const known = [
      "Weber",
      "Napoleon",
      "Kenmore",
      "Monument Grills",
      "Royal Gourmet",
      "Captiva Designs",
      "Sophia & William",
      "GREEN PARTY",
      "Flintex",
      "Grills House",
      "BRANDMAN",
      "Brand-Man",
      "COWSAR",
      "EUHOME"
    ];
    for (const name of known) {
      if (new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(title)) return name;
    }
    return clean(title).split(/[\s,]/)[0] || "Grill";
  }
  return brand.replace(/^Visit the\s+/i, "").replace(/\s+Store$/i, "") || "Grill";
}

function shortTitle(title, brand) {
  const t = clean(title);
  const burners = t.match(/(\d+)[\s-]*(?:burner|Burner)/i)?.[1];
  const btu = t.match(/([\d,]+)\s*BTU/i)?.[1]?.replace(/,/g, "");
  const sq = t.match(/(\d{3,4})\s*(?:sq\.?\s*in|SQIN|SQ\.?\s*IN)/i)?.[1];
  const dual = /dual fuel|gas and charcoal|charcoal and propane|2 in 1|combo/i.test(t);
  const griddle = /griddle/i.test(t);
  const bits = [brand];
  if (burners) bits.push(`${burners}-burner`);
  if (dual) bits.push("dual fuel");
  else if (griddle) bits.push("griddle combo");
  else if (/charcoal/i.test(t) && !/propane|gas/i.test(t)) bits.push("charcoal");
  else bits.push("propane");
  if (sq) bits.push(`${sq} sq in`);
  else if (btu) bits.push(`${Number(btu).toLocaleString()} BTU`);
  return bits.join(" ").replace(/\s+/g, " ").trim().slice(0, 72);
}

function fieldFromRaw(raw, key) {
  const re = new RegExp(`${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\s*(.+?)(?:\\r?\\n|$)`, "i");
  const m = String(raw || "").match(re);
  return m ? clean(m[1]) : "";
}

function parseTechDetails(raw) {
  const map = {};
  for (const line of clean(raw).split(/\n/)) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (key && val) map[key] = val;
    }
  }
  const keys = [
    "Main Burner Count",
    "Fuel Type",
    "Cooking Surface Area",
    "Material Type",
    "Frame Material",
    "Item Dimensions",
    "Item Dimensions D x W x H",
    "Heating Power",
    "Side Burner Count",
    "Grill Configuration"
  ];
  for (const key of keys) {
    if (!map[key]) {
      const val = fieldFromRaw(raw, key);
      if (val) map[key] = val;
    }
  }
  return map;
}

function techValue(tech, techRaw, key) {
  if (tech[key]) return tech[key];
  const re = new RegExp(`${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\s*(.+?)(?:\\r?\\n|$)`, "i");
  const match = String(techRaw || "").match(re);
  return match ? clean(match[1]) : "";
}

function extractBurners(title, tech, desc, techRaw) {
  const source = `${title} ${Object.values(tech).join(" ")} ${desc}`;
  const main = techValue(tech, techRaw, "Main Burner Count");
  if (main) return main;
  const m = source.match(/(\d+)[\s-]*(?:burner|Burner)/i);
  if (m) return m[1];
  if (/6[\s-]*burner/i.test(source)) return "6";
  if (/5[\s-]*burner/i.test(source)) return "5";
  if (/4[\s-]*burner/i.test(source)) return "4";
  if (/3[\s-]*burner/i.test(source)) return "3";
  if (/2[\s-]*burner/i.test(source)) return "2";
  return "";
}

function extractHeatSource(title, tech) {
  const fuel = tech["Fuel Type"] || "";
  const config = tech["Grill Configuration"] || "";
  const combined = `${fuel} ${config} ${title}`.toLowerCase();
  if (/charcoal,\s*gas|gas,\s*charcoal|dual fuel|gas and charcoal|charcoal and gas|2 in 1.*charcoal/i.test(combined)) {
    return "Gas + charcoal combo";
  }
  if (/charcoal/i.test(combined) && !/propane|gas|lpg/i.test(combined)) return "Charcoal";
  if (/pellet/i.test(combined)) return "Pellet";
  if (/propane|lpg|liquid propane|gas grill/i.test(combined)) return "Propane gas";
  if (/natural gas/i.test(combined)) return "Natural gas";
  return "";
}

function extractCookingArea(title, tech, techRaw) {
  const area = techValue(tech, techRaw, "Cooking Surface Area");
  if (area) {
    const n = area.match(/(\d{2,4})/);
    if (n) return `${n[1]} sq in`;
  }
  const m =
    clean(title).match(/(\d{3,4})\s*(?:sq\.?\s*in|SQIN|SQ\.?\s*IN|sp\.in)/i) ||
    clean(title).match(/(\d{3,4})\s*Square\s*Inches/i);
  if (m) return `${m[1]} sq in`;
  return "";
}

function extractFuel(title, tech) {
  const fuel = tech["Fuel Type"] || "";
  const combined = `${fuel} ${title}`.toLowerCase();
  if (/charcoal,\s*gas|gas,\s*charcoal|dual fuel|gas and charcoal|charcoal and propane|2 in 1.*(?:gas|propane).*charcoal/i.test(combined)) {
    return "Propane + charcoal";
  }
  if (/charcoal/i.test(combined) && !/propane|lpg|liquid propane|\bgas\b/i.test(combined.replace(/charcoal/g, ""))) {
    return "Charcoal";
  }
  if (/pellet/i.test(combined)) return "Pellet";
  if (/lpg/i.test(combined)) return "LPG (propane)";
  if (/propane|liquid propane|\bgas grill|\bgas bbq/i.test(combined)) return "Propane";
  if (/charcoal/i.test(combined)) return "Charcoal";
  return "";
}

function extractMaterial(tech, title) {
  const mat = tech["Material Type"] || tech["Frame Material"] || "";
  const t = clean(title).toLowerCase();
  if (/porcelain-enameled cast iron|porcelain enameled cast iron/i.test(`${mat} ${title}`)) {
    return "Porcelain cast iron grates";
  }
  if (/stainless/i.test(mat) || /stainless steel/i.test(t)) return "Stainless steel";
  if (/cast iron/i.test(mat) || (/cast iron/i.test(t) && /grate/i.test(t))) return "Cast iron grates";
  if (/alloy steel/i.test(mat)) return "Alloy steel";
  if (/porcelain/i.test(mat)) return "Porcelain enamel";
  return mat.split(",")[0]?.trim() || "";
}

function extractBtu(title, tech) {
  const m = clean(title).match(/([\d,]+)\s*BTU/i);
  if (m) return `${m[1].replace(/,/g, "")} BTU`;
  const hp = tech["Heating Power"];
  if (hp && /british thermal|btu/i.test(hp)) {
    const n = hp.match(/([\d,]+)/);
    if (n) return `${n[1].replace(/,/g, "")} BTU`;
  }
  return "";
}

function extractDimensions(tech) {
  const dim = tech["Item Dimensions"] || tech["Item Dimensions D x W x H"] || "";
  const m = dim.match(/([\d.]+)\s*x\s*([\d.]+)\s*x\s*([\d.]+)/i);
  if (m) return `${m[1]}" D × ${m[2]}" W × ${m[3]}" H`;
  return "";
}

function specsFrom(title, techRaw, desc) {
  const tech = parseTechDetails(techRaw);
  const specs = [];
  const burners = extractBurners(title, tech, desc);
  const heat = extractHeatSource(title, tech);
  const area = extractCookingArea(title, tech);
  const fuel = extractFuel(title, tech);
  const material = extractMaterial(tech, title);
  const btu = extractBtu(title, tech);
  const dimensions = extractDimensions(tech);

  if (burners) specs.push(`Burners: ${burners}`);
  if (heat) specs.push(`Heat source: ${heat}`);
  if (area) specs.push(`Cooking area: ${area}`);
  if (fuel) specs.push(`Fuel: ${fuel}`);
  if (material) specs.push(`Material: ${material}`);
  if (btu) specs.push(`BTU: ${btu}`);
  if (dimensions) specs.push(`Dimensions: ${dimensions}`);

  if (tech["Side Burner Count"] === "1" && !specs.some((s) => /side/i.test(s))) {
    specs.push("Extras: Side burner");
  }
  if (/infrared|sear zone|smoker/i.test(`${title} ${desc}`)) {
    const extra = /smoker/i.test(title) ? "Smoker box" : /infrared/i.test(title) ? "Infrared side burner" : "Sear zone";
    if (!specs.some((s) => s.includes(extra))) specs.push(`Feature: ${extra}`);
  }

  return specs.slice(0, 8);
}

function highlightFrom(specs) {
  return (
    specs.find((s) => /^Cooking area:/i.test(s))?.replace(/^Cooking area:\s*/i, "") ||
    specs.find((s) => /^BTU:/i.test(s))?.replace(/^BTU:\s*/i, "") ||
    specs.find((s) => /^Burners:/i.test(s))?.replace(/^Burners:\s*/i, "") ||
    specs[0]?.replace(/^[^:]+:\s*/, "") ||
    "Propane grill"
  );
}

function pros(product, title, techRaw) {
  const text = (clean(title) + " " + techRaw).toLowerCase();
  const items = [];
  if (product.rating >= 4.5) items.push("Strong buyer rating for a grill in this price range");
  if (/690|665|794|738|835|1020|941|961/.test(text)) items.push("Large cooking surface suits parties and multi-zone cooking");
  if (/dual fuel|gas and charcoal|charcoal and gas|combo/i.test(text)) items.push("Dual-fuel flexibility for gas weeknights and charcoal flavor");
  if (/weber|napoleon|kenmore|monument/i.test(text)) items.push("Recognized brand with clearer warranty and parts support");
  if (/stainless/i.test(text)) items.push("Stainless or porcelain grates help with rust resistance outdoors");
  if (product.price <= 320) items.push("Leaves budget room for cover, tools, and propane tank");
  if (!items.length) items.push("Solid value among propane and charcoal grills under the $500 cap");
  return items.slice(0, 3);
}

function cons(product, title, techRaw) {
  const text = (clean(title) + " " + techRaw).toLowerCase();
  const items = [];
  if (product.rating < 4.1) items.push("Lower rating than top picks—read recent reviews for assembly and heat consistency");
  if (product.price >= 480) items.push("Price sits near the $500 ceiling with little room for cover and accessories");
  if (/required assembly:\s*yes/i.test(techRaw) || /assembly/i.test(text)) {
    items.push("Expect 1–3 hours assembly; confirm burner alignment and leak-test propane connections");
  }
  if (/charcoal/i.test(text) && !/propane|gas/i.test(text)) items.push("Charcoal takes longer to light and clean than gas-only models");
  if (!items.length) items.push("Confirm live Amazon price, BTU claims, and grate material on the listing");
  return items.slice(0, 3);
}

const [headers, ...rows] = parseCsv(fs.readFileSync(csvPath, "utf8"));
const h = Object.fromEntries(headers.map((header, index) => [header.trim(), index]));
const seen = new Set();

let products = rows
  .map((row) => {
    const title = clean(row[h.Title]);
    const techRaw = row[h["Technical Details"]] || "";
    const desc = clean(row[h["Product Description"]] || "");
    const brand = brandFrom(row[h.Brand], title);
    const affiliateUrl = clean(row[h["Affilates Links"]] || row[0]);
    const asin = asinFrom(affiliateUrl);
    const specs = specsFrom(title, techRaw, desc);
    const product = {
      title,
      shortTitle: shortTitle(title, brand),
      image: clean(row[h["Main HD Image"]]),
      price: numberFrom(row[h.Price]),
      rating: ratingFrom(row[h.Rating]),
      affiliateUrl,
      asin,
      specs,
      features: specs.slice(0, 5),
      pros: [],
      cons: [],
      highlightFeature: highlightFrom(specs),
      badge: undefined
    };
    product.pros = pros(product, title, techRaw);
    product.cons = cons(product, title, techRaw);
    return product;
  })
  .filter((p) => p.title && p.image && p.affiliateUrl && p.price > 0)
  .filter((p) => p.price <= PRICE_CAP)
  .filter((p) => {
    const key = p.asin || p.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

if (!products.length) throw new Error("No barbecue grill products parsed from CSV.");

const featured =
  products.find((p) => p.asin === FEATURED_ASIN) ||
  [...products].sort((a, b) => b.rating - a.rating || a.price - b.price)[0];

const rest = products
  .filter((p) => p.asin !== featured.asin)
  .sort((a, b) => b.rating - a.rating || a.price - b.price);

featured.badge = "Best pick";
const lowest = [...products].sort((a, b) => a.price - b.price)[0];
if (lowest && lowest.asin !== featured.asin) lowest.badge = lowest.badge || "Lowest price";
const topRated = [...products].sort((a, b) => b.rating - a.rating || a.price - b.price)[0];

products = [featured, ...rest].map((product, index) => ({
  ...product,
  id: `barbecue-grill-${index + 1}`
}));

const featuredId = products[0]?.id || "barbecue-grill-1";
const lowestId = products.find((p) => p.badge === "Lowest price")?.id || featuredId;
const topRatedId = topRated?.id || featuredId;

const comparisonColumns = [
  "Product",
  "Price",
  "Rating",
  "Best for",
  "Burners",
  "Heat source",
  "Cooking area",
  "Fuel",
  "Material"
];

const source = `import type { Article, Product } from "../../types";

export const bestBarbecueGrillUnder500Products: Product[] = ${JSON.stringify(products, null, 2)};

export const bestBarbecueGrillUnder500Article: Article = {
  slug: "best-barbecue-grill-under-500",
  navLabel: "Barbecue grill under $500",
  keyword: "Best Barbecue Grill Under $500",
  metaTitle: "Best Barbecue Grill Under $500 in 2026",
  metaDescription:
    "Compare the best barbecue grill under $500—propane, dual-fuel, and charcoal picks with burners, cooking area, BTU, and build quality for patio and backyard BBQ.",
  category: "Outdoor & Travel",
  breadcrumb: ["Home", "Outdoor & Travel", "Best Barbecue Grill Under $500"],
  heroImage: "/images/featured-barbecue-grill.webp",
  heroBadge: "Backyard BBQ guide",
  heroTitleLine1: "Best Barbecue Grill",
  heroTitleLine2: "Under $500",
  heroSubtitle:
    "Propane, dual-fuel, and charcoal grills from about $299 to $499—compare burners, square inches, BTU output, and build before your next cookout.",
  heroTrustNote:
    "Always confirm live Amazon pricing, propane tank compatibility, assembly time, and local fire codes for outdoor grilling.",
  introHeading: "How we picked the best barbecue grill under $500",
  introParagraphs: [
    "This BestBuyUnder500.com guide focuses on barbecue grills that stayed at or below $500 when we last checked—cabinet-style propane grills, dual-fuel combos, large charcoal kettles, and griddle hybrids for patios and backyards.",
    "We compared burners, total cooking area, fuel type, grate material, and BTU output so you can match a grill to cookouts, family size, and how much assembly you want to tackle."
  ],
  filters: [
    "Best pick",
    "Lowest price",
    "Top rated",
    "Dual fuel",
    "6+ burners",
    "600+ sq in",
    "Charcoal",
    "Griddle combo",
    "Weber"
  ],
  comparisonColumns: ${JSON.stringify(comparisonColumns)},
  products: bestBarbecueGrillUnder500Products,
  buyingGuideHeading: "What to check before buying a barbecue grill under $500",
  buyingGuide: [
    {
      title: "Burners, BTU, and even heat",
      body:
        "More burners (often 3–6) give independent heat zones. Total BTU matters less than burner layout—look for even flame and porcelain or cast-iron grates. Budget grills often land between 30,000–65,000 BTU; match power to how many burgers or steaks you cook at once."
    },
    {
      title: "Cooking area and side burners",
      body:
        "Primary grate area from about 360–800+ sq in defines capacity. Side burners (9000–12,000 BTU) help sauces and sides. Warming racks add space without counting toward main grate specs—check listing photos for real layout."
    },
    {
      title: "Fuel type: propane, dual-fuel, or charcoal",
      body:
        "Propane lights fast for weeknight dinners. Dual-fuel gas-and-charcoal combos cost more but add smoky flavor. Pure charcoal needs longer prep and ash cleanup but excels for low-and-slow and sear-heavy cooks."
    },
    {
      title: "Build, assembly, and outdoor durability",
      body:
        "Stainless lids and cart panels resist rust better than painted steel. Expect 1–3 hours assembly on cart grills. Use a cover, leak-test propane connections with soapy water, and keep grease trays cleaned to reduce flare-ups."
    }
  ],
  faqs: [
    {
      question: "What is the best barbecue grill under $500?",
      answer:
        "Our featured pick balances a large dual-fuel cooking area, side burner, and strong ratings near $417. The best choice for you depends on fuel preference—propane for speed, charcoal for flavor, or dual-fuel for both."
    },
    {
      question: "How many BTU do I need on a gas grill?",
      answer:
        "Most grills in this guide list 30,000–65,000 BTU total. That is enough for backyard cooking if burners are spaced well. Prioritize cast-iron or porcelain grates and lid fit over chasing the highest BTU number."
    },
    {
      question: "Are dual-fuel gas and charcoal grills worth it?",
      answer:
        "Dual-fuel models cost more and take more space but let you use propane for quick meals and charcoal when you want smoke and sear. Confirm both chambers are easy to access and clean before buying."
    },
    {
      question: "How were these barbecue grills chosen?",
      answer:
        "We filtered listings above $500, removed duplicate ASINs, and ranked grills by buyer rating, price, burner count, cooking area, fuel type, and build materials parsed from each listing."
    }
  ],
  quickPicks: [
    { label: "Best pick", productId: "${featuredId}", reason: "Top balance of dual-fuel flexibility, 690 sq in cooking area, and side burner near $417." },
    { label: "Lowest price", productId: "${lowestId}", reason: "Lowest upfront price among grills that stayed under the $500 cap." },
    { label: "Top rated", productId: "${topRatedId}", reason: "Highest buyer rating among the picks in this guide." }
  ],
  budgetTips: [
    "Budget $30–60 for a cover and basic tool set if the grill does not include them.",
    "Propane tanks are usually sold separately—swap or refill locally.",
    "Sales can dip major brands under $500 briefly; recheck live Amazon pricing before checkout.",
    "Measure patio depth—6-burner carts often need 60+ inches of width clearance."
  ],
  relatedArticles: ["gas-go-karts-under-500", "electric-dirt-bike-under-500"],
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

const specKeys = ["Burners", "Heat source", "Cooking area", "Fuel", "Material"];
let filled = 0;
let total = 0;
for (const p of products) {
  for (const key of specKeys) {
    total++;
    const val = p.specs.find((s) => s.toLowerCase().startsWith(key.toLowerCase()));
    if (val && !/check listing/i.test(val)) filled++;
  }
}

console.log(`Wrote ${products.length} products to ${outFile}`);
console.log(`Featured: ${featured.shortTitle} (${featured.asin}) @ $${featured.price}`);
console.log(`Spec fill rate: ${Math.round((filled / total) * 100)}% (${filled}/${total} core fields)`);
