const fs = require("node:fs");
const path = require("node:path");

const csvPath = "c:\\Users\\DELL Latitude\\Desktop\\Shift\\New Article - Sheet1 (14).csv";
const outFile = path.join(process.cwd(), "src", "data", "articles", "electric-dirt-bike-under-500.ts");
const now = new Date().toISOString();
const FEATURED_ASIN = "B0GR9ZQRYQ";

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

const BLOCKED_BULLETS = [
  "coverage",
  "asurion",
  "claim",
  "terms",
  "return",
  "image unavailable",
  "best value",
  "protection",
  "cybersecurity",
  "pre-existing",
  "product eligibility",
  "easy claims",
  "past and future",
  "trusted cybersecurity",
  "top 100",
  "#"
];

function meaningfulBullets(value) {
  return clean(value)
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter((item) => item.length > 36)
    .filter((item) => !BLOCKED_BULLETS.some((word) => item.toLowerCase().includes(word)))
    .slice(0, 6);
}

function brandFrom(rowBrand, title) {
  const brand = clean(rowBrand)
    .replace(/^Brand:\s*/i, "")
    .replace(/^Visit the\s+/i, "")
    .replace(/\s+Store$/i, "");
  if (brand && !/out of 5 stars/i.test(brand)) return brand;
  return clean(title).split(/[\s,]/)[0] || "E-Bike";
}

function shortTitle(title, brand) {
  const t = clean(title);
  const motor = t.match(/(\d{3,4})W/i)?.[1];
  const mph = t.match(/(\d{1,2})\s*MPH/i)?.[1];
  const isKids = /kids|ages?\s*4|ages?\s*6|teenager/i.test(t) && !/adults? teens?/i.test(t);
  const type = isKids ? "Kids E-Dirt Bike" : "Adult E-Dirt Bike";
  const power = motor ? `${motor}W ` : mph ? `${mph} MPH ` : "";
  return `${brand} ${power}${type}`.replace(/\s+/g, " ").trim().slice(0, 72);
}

function specsFrom(title, bullets) {
  const source = clean(title) + " " + bullets.join(" ");
  const specs = [];
  const motor = source.match(/(\d{3,4})W\s*(?:peak|Peak)?/i)?.[1];
  const battery = source.match(/48V\s*(\d+(?:\.\d+)?)\s*Ah/i);
  const mph = source.match(/(\d{1,2})\s*MPH/i)?.[1];
  const range = source.match(/(\d{1,2})\s*(?:-|to\s*)?(\d{1,2})?\s*miles?/i);
  const isKids = /kids|ages?\s*4-8|ages?\s*4-12/i.test(source) && !/adults? teens?/i.test(source);

  if (isKids) specs.push("Rider: Kids / youth");
  else if (/adults?|teens?/i.test(source)) specs.push("Rider: Teens & adults");
  if (motor) specs.push(`Motor: ${motor}W peak`);
  if (battery) specs.push(`Battery: 48V ${battery[1]}Ah`);
  else if (/36V/i.test(source)) specs.push("Battery: 36V system");
  if (mph) specs.push(`Top speed: ${mph} MPH`);
  if (range) {
    const miles = range[2] ? `${range[1]}-${range[2]}` : range[1];
    specs.push(`Range: ~${miles} miles`);
  }
  if (/hydraulic/i.test(source)) specs.push("Brakes: Hydraulic disc");
  if (/suspension/i.test(source)) specs.push("Suspension: Full or dual");
  if (/14.?\/12|fat tire/i.test(source)) specs.push("Tires: 14\"/12\" off-road");
  if (!specs.length) {
    const snippet = clean(title).split(/\s+/).slice(0, 8).join(" ");
    specs.push(snippet.length > 72 ? `${snippet.slice(0, 69)}...` : snippet);
  }
  return specs.slice(0, 6);
}

function highlightFrom(specs) {
  return (
    specs.find((s) => /^Motor:/i.test(s))?.replace(/^Motor:\s*/i, "") ||
    specs.find((s) => /^Top speed:/i.test(s))?.replace(/^Top speed:\s*/i, "") ||
    specs[0]?.replace(/^[^:]+:\s*/, "") ||
    "Off-road e-bike"
  );
}

function pros(product, title, bullets) {
  const text = (clean(title) + " " + bullets.join(" ")).toLowerCase();
  const items = [];
  if (/hydraulic|dual disc/i.test(text)) items.push("Hydraulic brakes and suspension are called out for trail control");
  if (/removable.*battery|removable battery/i.test(text)) items.push("Removable battery simplifies charging away from the bike");
  if (/3.?speed|three speed/i.test(text)) items.push("Multiple speed modes help beginners and experienced riders");
  if (product.rating >= 4.5) items.push("Strong buyer rating compared with other electric dirt bikes in this guide");
  if (/adults?|teens?/i.test(text) && !/kids ages/i.test(text)) {
    items.push("Sized for teens and adults comparing an electric dirt bike for adults under $500");
  }
  if (product.price <= 520) items.push("Stays near the $500 target without jumping to $800+ premium builds");
  if (!items.length) items.push("Fits shoppers comparing electric dirt bikes under $500 on Amazon");
  return items.slice(0, 3);
}

function cons(product, title, bullets) {
  const text = (clean(title) + " " + bullets.join(" ")).toLowerCase();
  const items = [];
  if (product.rating < 4) items.push("Lower rating than several competing picks in this price band");
  if (/kids|ages?\s*4|ages?\s*6-8/i.test(text) && !/adults? teens?/i.test(text)) {
    items.push("Built for kids—not a substitute for a full-size adult electric dirt bike");
  }
  if (product.price > 500) items.push("Live price may sit slightly above a strict $500 cap even when close in search");
  if (/local law|license|off-road only/i.test(text) || bullets.some((b) => /local law|license/i.test(b))) {
    items.push("Check local age, license, and where you can legally ride before buying");
  }
  if (!items.length) items.push("Verify motor claims, range, and current Amazon pricing before ordering");
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
    const specs = specsFrom(title, bullets);
    const product = {
      title,
      shortTitle: shortTitle(title, brand),
      image: clean(row[h["Main HD Image"]]),
      price: numberFrom(row[h.Price]),
      rating: numberFrom(row[h.Rating]),
      affiliateUrl: clean(row[h["Affilate Links"]] || row[h["Affilates Links"]] || row[0]),
      asin,
      specs,
      features: specs.slice(0, 5),
      pros: [],
      cons: [],
      highlightFeature: highlightFrom(specs),
      badge: undefined
    };
    product.pros = pros(product, title, bullets);
    product.cons = cons(product, title, bullets);
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
  throw new Error("No electric dirt bike products parsed from CSV.");
}

const featured =
  products.find((p) => p.asin === FEATURED_ASIN) ||
  [...products].filter((p) => /adult/i.test(p.title)).sort((a, b) => b.rating - a.rating || a.price - b.price)[0] ||
  products[0];

const rest = products
  .filter((p) => p.asin !== featured.asin)
  .sort((a, b) => b.rating - a.rating || a.price - b.price);

featured.badge = "Best value pick";
const lowest = [...products].sort((a, b) => a.price - b.price)[0];
if (lowest && lowest.asin !== featured.asin) lowest.badge = lowest.badge || "Lowest price";
const topRated = [...products].sort((a, b) => b.rating - a.rating || a.price - b.price)[0];

products = [featured, ...rest].map((product, index) => ({
  ...product,
  id: `e-dirt-bike-${index + 1}`
}));

const featuredId = products[0]?.id || "e-dirt-bike-1";
const lowestId = products.find((p) => p.badge === "Lowest price")?.id || featuredId;
const topRatedId = topRated?.id || featuredId;

const source = `import type { Article, Product } from "../../types";

export const electricDirtBikeProducts: Product[] = ${JSON.stringify(products, null, 2)};

export const electricDirtBikeArticle: Article = {
  slug: "electric-dirt-bike-under-500",
  navLabel: "Electric dirt bike under $500",
  keyword: "Electric Dirt Bike Under $500",
  metaTitle: "Electric Dirt Bike Under $500 in 2026",
  metaDescription:
    "Compare electric dirt bikes under $500 with adult and youth picks, motor power, range, hydraulic brakes, and honest Amazon pricing notes.",
  category: "Sports & Outdoors",
  breadcrumb: ["Home", "Sports & Outdoors", "Electric Dirt Bike Under $500"],
  heroImage: "/images/featured-electric-dirt-bike.webp",
  heroBadge: "New e-dirt bike guide",
  heroTitleLine1: "Electric Dirt Bike",
  heroTitleLine2: "Under $500",
  heroSubtitle:
    "A practical look at electric dirt bikes under $500 and close alternatives—adult trail rigs, teen-sized machines, and youth models—with motor, battery, and safety notes.",
  heroTrustNote:
    "Always confirm live Amazon pricing, local riding laws, age limits, and safety gear before buying any electric dirt bike.",
  introHeading: "How we picked electric dirt bikes under $500",
  introParagraphs: [
    "This BestBuyUnder500.com guide covers electric dirt bike under $500 searches alongside electric dirt bikes under $500 and electric dirt bikes under 500 listings that often land between about $510 and $720 at retail. We cleaned warranty-plan noise from the source sheet and focused on real bikes with motors, batteries, and trail hardware.",
    "Most adult electric dirt bike for adults under $500 picks are high-torque e-motorcycles with 48V packs—not gas 125cc dirt bike under 500 or 110cc dirt bike under $500 frames. We also note youth RFN and KOOZ models when parents compare them to used dirt bikes under $500, and we flag when live price sits above a strict $500 cap."
  ],
  filters: [
    "Best value pick",
    "Lowest price",
    "Top rated",
    "Adults & teens",
    "Kids & youth",
    "3000W+ motor",
    "Hydraulic brakes",
    "Long range",
    "Removable battery",
    "Malzahar",
    "NCMMOSCOW",
    "ESKUTE",
    "RFN kids"
  ],
  comparisonColumns: ["Product", "Price", "Rating", "Best for", "Key specs"],
  products: electricDirtBikeProducts,
  buyingGuideHeading: "What to check before buying an e dirt bike under $500",
  buyingGuide: [
    {
      title: "Electric vs gas at this budget",
      body:
        "A 125cc dirt bike under 500 or 110cc dirt bike under $500 usually means used gas bikes with fuel and maintenance costs. New electric dirt bikes under $500 are mostly battery-powered trail rigs with instant torque and quieter operation—but verify local rules for e-bikes vs motorcycles."
    },
    {
      title: "Adult vs kids sizing",
      body:
        "Electric dirt bike for adults under $500 listings often show 3000W+ motors and 35–40 MPH claims. Kids models use 36V systems and lower speeds. Match seat height, weight limit, and age guidance to the rider."
    },
    {
      title: "Battery, range, and charging",
      body:
        "Look for removable 48V packs, realistic mile range (not lab peaks), and 5–8 hour charge times. Range drops with rider weight, hills, and speed mode."
    },
    {
      title: "Brakes, suspension, and tires",
      body:
        "Hydraulic disc brakes, full suspension, and 14/12-inch knobby tires matter more than headline top speed on rough trails. Budget for a DOT-approved helmet and pads beyond the bike price."
    }
  ],
  faqs: [
    {
      question: "Can you find an electric dirt bike under $500?",
      answer:
        "Complete adult rigs often list between about $510 and $720 on Amazon, so a strict electric dirt bike under $500 search may need sales, open-box deals, or youth models. This guide shows the closest current picks and what you give up below $550."
    },
    {
      question: "How is an e dirt bike under $500 different from a gas dirt bike?",
      answer:
        "Electric models charge instead of using gas, run quieter, and deliver instant torque. Gas 125cc or 110cc bikes may cost less used but need fuel, oil, and more maintenance. Check whether your area treats high-power e-bikes like bicycles or motorcycles."
    },
    {
      question: "Are used dirt bikes under $500 a better deal?",
      answer:
        "Used gas bikes can beat new e-bikes on upfront price if you accept wear, repairs, and fuel. New electric listings add warranty support and predictable charging costs but rarely stay under $500 for full adult power."
    },
    {
      question: "What should adults look for in electric dirt bikes under 500 dollars?",
      answer:
        "Prioritize hydraulic brakes, suspension, battery capacity (Ah), speed modes, and weight limits over peak motor watts alone. Confirm off-road-only use, assembly level (often 85–90% pre-built), and local license rules before riding."
    }
  ],
  quickPicks: [
    { label: "Best value pick", productId: "${featuredId}", reason: "Strong adult-oriented specs, 5-star buyer rating, and removable 48V battery near the top of the cleaned sheet." },
    { label: "Lowest price", productId: "${lowestId}", reason: "Lowest upfront price in the comparison when you need to stay closest to a $500 budget." },
    { label: "Top rated", productId: "${topRatedId}", reason: "Highest buyer rating among the electric dirt bikes we parsed from the CSV." }
  ],
  budgetTips: [
    "Ignore scraped protection-plan bullet text and compare motor, battery Ah, brakes, and suspension instead.",
    "If you need a true electric dirt bike under $500, watch for coupons or consider youth models—not 3000W adult builds.",
    "Leave budget for a helmet, gloves, and pads; many listings assume off-road-only use.",
    "Check whether your pick is 90% pre-assembled and keep original packaging for warranty support."
  ],
  relatedArticles: ["gas-go-karts-under-500"],
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
console.log(`Wrote ${products.length} products to ${outFile}`);
console.log(`Featured: ${featured.shortTitle} (${featured.asin})`);
