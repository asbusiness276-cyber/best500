const fs = require("node:fs");
const path = require("node:path");

const csvPath = "C:\\Users\\PC\\Downloads\\New Article - Sheet1.csv";
const outFile = path.join(process.cwd(), "src", "data", "articles", "best-30-mph-electric-scooter-under-500.ts");
const now = new Date().toISOString();
const FEATURED_ASIN = "B0GDXT3Y11";
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

function isImageUrl(value) {
  const url = String(value || "").trim();
  return /^https?:\/\//i.test(url) && !/image unavailable/i.test(url);
}

function splitImageList(value) {
  const text = String(value || "");
  const fromRegex = text.match(/https?:\/\/[^\s,"']+/gi) || [];
  return [...new Set(fromRegex.map((url) => url.trim()).filter(isImageUrl))];
}

function brandFrom(rowBrand, title) {
  let brand = clean(rowBrand);
  if (/out of 5 stars/i.test(brand) || /^\d/.test(brand)) {
    const known = [
      "VOLPAM",
      "WERHY",
      "NAVEE",
      "iScooter",
      "isinwheel",
      "MAXSHOT",
      "NAVIC",
      "ZapRun",
      "Fcgeoi",
      "MEGAWHEELS",
      "CAROMA"
    ];
    for (const name of known) {
      if (new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(title)) return name;
    }
    return clean(title).split(/[\s,]/)[0] || "Scooter";
  }
  return brand.replace(/^Visit the\s+/i, "").replace(/\s+Store$/i, "") || "Scooter";
}

function shortTitle(title, brand) {
  const t = clean(title);
  const motor = t.match(/(\d{3,4})W/i)?.[1];
  const speed = t.match(/(\d{2})\s*MPH/i)?.[1];
  const range = t.match(/(\d{2,3})\s*(?:Miles|Miles Range|mile)/i)?.[1];
  const tire = t.match(/(\d+(?:\.\d+)?)["″]\s*(?:Solid|Pneumatic|Off-Road|Tire)/i)?.[1];
  const bits = [brand];
  if (motor) bits.push(`${motor}W`);
  if (speed) bits.push(`${speed} MPH`);
  else if (/31|30|28|25|22|19/i.test(t)) {
    const s = t.match(/(\d{2})\s*\/\s*(\d{2})\s*MPH/i) || t.match(/Top Speed\s*(\d{2})/i);
    if (s) bits.push(`${s[1] || s[2]} MPH`);
  }
  if (range) bits.push(`${range} mi range`);
  else if (tire) bits.push(`${tire}" tires`);
  return bits.join(" ").replace(/\s+/g, " ").trim().slice(0, 72);
}

const BLOCKED_BULLETS = [
  "coverage",
  "asurion",
  "claim",
  "return",
  "image unavailable",
  "best value",
  "protection",
  "cybersecurity",
  "product eligibility",
  "easy claims",
  "past and future",
  "trusted cybersecurity",
  "pre-existing",
  "calculate the overall star rating"
];

function meaningfulBullets(value) {
  return clean(value)
    .split(/\n|,|\|/)
    .map((item) => item.trim())
    .filter((item) => item.length > 35)
    .filter((item) => !BLOCKED_BULLETS.some((word) => item.toLowerCase().includes(word)))
    .filter((item, index, arr) => arr.findIndex((other) => other.slice(0, 80) === item.slice(0, 80)) === index)
    .slice(0, 8);
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
  return map;
}

function techValue(tech, techRaw, key) {
  if (tech[key]) return tech[key];
  return fieldFromRaw(techRaw, key);
}

function extractMotor(title, bullets, tech) {
  const source = `${title} ${bullets.join(" ")}`;
  const m = source.match(/(\d{3,4})W(?:\s*\/\s*(\d{3,4})W)?(?:\s*Peak|\s*Motor|\s*Powerful)?/i);
  if (m) return m[2] ? `${m[1]}W / ${m[2]}W peak` : `${m[1]}W motor`;
  const hp = techValue(tech, "", "Motor");
  if (hp) return hp;
  return "";
}

function extractSpeed(title, bullets, tech) {
  const source = `${title} ${bullets.join(" ")}`;
  const range = source.match(/(\d{2})\s*\/\s*(\d{2})\s*MPH/i);
  if (range) return `Up to ${Math.max(Number(range[1]), Number(range[2]))} MPH`;
  const single = source.match(/(?:top speed|max speed|speed)[^\d]*(\d{2})\s*MPH/i) || source.match(/(\d{2})\s*MPH/i);
  if (single) return `Up to ${single[1]} MPH`;
  const techSpeed = techValue(tech, "", "Maximum Speed");
  if (techSpeed) return techSpeed;
  return "";
}

function extractRange(title, bullets, tech) {
  const source = `${title} ${bullets.join(" ")}`;
  const range = source.match(/(\d{2,3})\s*(?:\/\s*(\d{2,3}))?\s*(?:Miles|miles|Miles Range|mile range)/i);
  if (range) {
    const max = Math.max(Number(range[1]), Number(range[2] || 0));
    return `Up to ${max} miles`;
  }
  const techRange = techValue(tech, "", "Maximum Distance Range");
  if (techRange) {
    const n = techRange.match(/(\d{2,3})/);
    if (n) return `Up to ${n[1]} miles`;
  }
  return "";
}

function extractTires(title, tech) {
  const source = `${title} ${Object.values(tech).join(" ")}`;
  const size = source.match(/(\d+(?:\.\d+)?)["″]\s*(?:Solid|Pneumatic|Off-Road|Tire|Tires)/i);
  const type = /solid tire|solid rubber|honeycomb/i.test(source)
    ? "Solid"
    : /pneumatic|off-road tire|off road tire/i.test(source)
      ? "Pneumatic"
      : "";
  if (size && type) return `${size[1]}" ${type.toLowerCase()}`;
  if (size) return `${size[1]}" tires`;
  const wheelSize = techValue(tech, "", "Wheel Size");
  const wheelType = techValue(tech, "", "Wheel Type");
  if (wheelSize && wheelType) return `${wheelSize.replace(/ inches/i, "")} ${wheelType.toLowerCase()}`;
  return type || "";
}

function extractBrakes(title, bullets, tech) {
  const source = `${title} ${bullets.join(" ")}`.toLowerCase();
  if (/dual disc|disc brake/i.test(source)) return "E-ABS + disc brake";
  if (/dual brak|double brak/i.test(source)) return "Dual braking (E-ABS + drum/disc)";
  if (/drum brake/i.test(source)) return "E-ABS + drum brake";
  const brake = techValue(tech, "", "Brake Style");
  if (brake) return brake;
  return "";
}

function extractSuspension(title, bullets, tech) {
  const source = `${title} ${bullets.join(" ")}`.toLowerCase();
  if (/dual suspension|front and rear suspension|double shock/i.test(source)) return "Dual suspension";
  if (/suspension/i.test(source)) return "Front/rear suspension";
  const sus = techValue(tech, "", "Suspension Type");
  if (sus && !/^no$/i.test(sus) && !/^rigid$/i.test(sus)) return sus;
  return "";
}

function extractCapacity(title, tech) {
  const source = `${title} ${Object.values(tech).join(" ")}`;
  const m = source.match(/(\d{2,3})\s*(?:lbs|LBS|pounds|Pounds)/i);
  if (m) return `${m[1]} lbs max load`;
  const cap = techValue(tech, "", "Weight Capacity Maximum");
  if (cap) return `${cap.replace(/ pounds/i, "")} lbs max load`;
  return "";
}

function specsFrom(title, techRaw, desc, bullets) {
  const tech = parseTechDetails(techRaw);
  const specs = [];
  const motor = extractMotor(title, bullets, tech);
  const speed = extractSpeed(title, bullets, tech);
  const range = extractRange(title, bullets, tech);
  const tires = extractTires(title, tech);
  const brakes = extractBrakes(title, bullets, tech);
  const suspension = extractSuspension(title, bullets, tech);
  const capacity = extractCapacity(title, tech);

  if (motor) specs.push(`Motor: ${motor}`);
  if (speed) specs.push(`Top speed: ${speed}`);
  if (range) specs.push(`Range: ${range}`);
  if (tires) specs.push(`Tires: ${tires}`);
  if (brakes) specs.push(`Brakes: ${brakes}`);
  if (suspension) specs.push(`Suspension: ${suspension}`);
  if (capacity) specs.push(`Max load: ${capacity}`);

  if (/app control|smart app|bluetooth/i.test(`${title} ${desc} ${bullets.join(" ")}`) && !specs.some((s) => /app/i.test(s))) {
    specs.push("Extras: App control");
  }
  if (/fold/i.test(title) && !specs.some((s) => /fold/i.test(s))) {
    specs.push("Extras: Foldable frame");
  }

  return specs.slice(0, 8);
}

function highlightFrom(specs) {
  return (
    specs.find((s) => /^Top speed:/i.test(s))?.replace(/^Top speed:\s*/i, "") ||
    specs.find((s) => /^Motor:/i.test(s))?.replace(/^Motor:\s*/i, "") ||
    specs.find((s) => /^Range:/i.test(s))?.replace(/^Range:\s*/i, "") ||
    specs[0]?.replace(/^[^:]+:\s*/, "") ||
    "Electric scooter"
  );
}

function pros(product, title, techRaw, bullets) {
  const text = (clean(title) + " " + techRaw + " " + bullets.join(" ")).toLowerCase();
  const items = [];
  if (product.rating >= 4.4) items.push("Strong buyer rating for a commuter scooter in this price band");
  if (/30\s*mph|31\s*mph|28\s*mph|25\s*mph/i.test(text)) items.push("Top speed in the 25–31 MPH class for faster commutes");
  if (/dual suspension|front and rear suspension/i.test(text)) items.push("Dual suspension helps smooth cracked pavement and curb cuts");
  if (/dual brak|disc brake|e-abs/i.test(text)) items.push("Redundant braking (E-ABS plus mechanical brake) adds stopping confidence");
  if (/(\d{2,3})\s*miles/i.test(text)) items.push("Range claims suit daily commuting without mid-day charging");
  if (product.price <= 200) items.push("Lower upfront cost leaves budget for helmet and lock");
  if (!items.length) items.push("Solid value among adult electric scooters under the $500 cap");
  return items.slice(0, 3);
}

function cons(product, title, techRaw, bullets) {
  const text = (clean(title) + " " + techRaw + " " + bullets.join(" ")).toLowerCase();
  const items = [];
  if (product.rating < 4.1) items.push("Lower rating than top picks—read recent reviews for build quality and battery life");
  if (product.price >= 480) items.push("Price sits near the $500 ceiling with little room for helmet and accessories");
  if (/solid tire|solid rubber/i.test(text) && !/pneumatic/i.test(text)) {
    items.push("Solid tires are puncture-proof but can feel harsher than air tires on rough roads");
  }
  if (/19\s*mph|18\s*mph|16\s*mph/i.test(text) && !/30|31|28|25|22/i.test(text)) {
    items.push("Top speed below 30 MPH—confirm the variant matches your commute needs");
  }
  if (!items.length) items.push("Verify live Amazon price, speed mode limits, and local scooter laws before buying");
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
    const bullets = meaningfulBullets(row[h["Bullet Features"]] || "");
    const brand = brandFrom(row[h.Brand], title);
    const affiliateUrl = clean(row[h["Affilate Links"]] || row[0]);
    const asin = asinFrom(affiliateUrl);
    const image = clean(row[h["Main HD Image"]]);
    const images = splitImageList(row[h["All HD Images"]] || "");
    const specs = specsFrom(title, techRaw, desc, bullets);
    const product = {
      title,
      shortTitle: shortTitle(title, brand),
      image,
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
    if (images.length > 1) product.images = images;
    product.pros = pros(product, title, techRaw, bullets);
    product.cons = cons(product, title, techRaw, bullets);
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

if (!products.length) throw new Error("No electric scooter products parsed from CSV.");

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
  id: `30-mph-scooter-${index + 1}`
}));

const featuredId = products[0]?.id || "30-mph-scooter-1";
const lowestId = products.find((p) => p.badge === "Lowest price")?.id || featuredId;
const topRatedId = topRated?.id || featuredId;

const comparisonColumns = [
  "Product",
  "Price",
  "Rating",
  "Best for",
  "Motor",
  "Top speed",
  "Range",
  "Tires",
  "Brakes"
];

const source = `import type { Article, Product } from "../../types";

export const best30MphElectricScooterUnder500Products: Product[] = ${JSON.stringify(products, null, 2)};

export const best30MphElectricScooterUnder500Article: Article = {
  slug: "best-30-mph-electric-scooter-under-500",
  navLabel: "30 MPH electric scooter under $500",
  keyword: "Best 30 MPH Electric Scooter Under $500",
  metaTitle: "Best 30 MPH Electric Scooter Under $500 in 2026",
  metaDescription:
    "Compare the best 30 MPH electric scooter under $500—500W+ motors, 25–31 MPH top speed, dual suspension, and dual braking for adult commuting.",
  category: "Outdoor & Travel",
  breadcrumb: ["Home", "Outdoor & Travel", "Best 30 MPH Electric Scooter Under $500"],
  heroImage: "/images/featured-30-mph-electric-scooter.webp",
  heroBadge: "Commuter speed guide",
  heroTitleLine1: "Best 30 MPH Electric Scooter",
  heroTitleLine2: "Under $500",
  heroSubtitle:
    "Adult e-scooters from about $138 to $499—compare motor power, top speed, range, tires, suspension, and dual braking before your next commute.",
  heroTrustNote:
    "Always confirm live Amazon pricing, helmet laws, local speed limits, and whether your city allows shared-road or bike-lane scooter use.",
  introHeading: "How we picked the best 30 MPH electric scooter under $500",
  introParagraphs: [
    "This BestBuyUnder500.com guide focuses on adult electric scooters that stayed at or below $500 when we last checked—models advertising roughly 19–31 MPH top speeds, 500W-class motors, and commuter-friendly folding frames.",
    "We compared motor wattage, claimed range, tire type (solid vs pneumatic), suspension, braking systems, and buyer ratings so you can match a scooter to commute distance, rider weight, and local road conditions."
  ],
  filters: [
    "Best pick",
    "Lowest price",
    "Top rated",
    "30+ MPH",
    "Dual suspension",
    "500W+ motor",
    "App control",
    "Solid tires",
    "VOLPAM",
    "NAVEE"
  ],
  comparisonColumns: ${JSON.stringify(comparisonColumns)},
  products: best30MphElectricScooterUnder500Products,
  buyingGuideHeading: "What to check before buying a 30 MPH electric scooter under $500",
  buyingGuide: [
    {
      title: "Top speed vs local laws",
      body:
        "Many listings advertise 22–31 MPH in sport mode. City rules often cap shared-path speeds at 15–20 MPH. Confirm your area's limits and whether the scooter lets you lock a lower top speed in the app before chasing the highest MPH number."
    },
    {
      title: "Motor power and hill climbing",
      body:
        "500W–800W motors handle flat commutes and moderate hills better than 350W entry models. Peak or dual-motor claims matter less than sustained torque—read reviews for hill tests at your rider weight."
    },
    {
      title: "Range, battery, and charge time",
      body:
        "Real-world range usually sits below listing maximums—rider weight, temperature, and speed mode all matter. Budget 4–6 hour charge times on most picks; verify battery warranty (often 180 days–12 months on cells)."
    },
    {
      title: "Tires, suspension, and braking",
      body:
        "10-inch pneumatic tires absorb bumps; solid honeycomb tires resist flats but ride firmer. Dual suspension plus E-ABS and a rear drum or disc brake is the safer combo for faster stops in wet or urban traffic."
    }
  ],
  faqs: [
    {
      question: "What is the best 30 MPH electric scooter under $500?",
      answer:
        "Our featured pick balances an 800W motor, 31 MPH top speed, dual suspension, and a $499 price when we last checked. The best choice for you depends on commute length, tire preference, and whether you need app speed limiting for local laws."
    },
    {
      question: "Can you really get 30 MPH on a scooter under $500?",
      answer:
        "Yes—several models in this guide list 25–31 MPH in sport or turbo mode with 500W–800W motors. Actual speed varies by rider weight, battery charge, and surface. Many also ship with lower default speed modes for beginners."
    },
    {
      question: "Solid tires or pneumatic tires for commuting?",
      answer:
        "Solid tires need no air and resist punctures—good for city debris. Pneumatic tires feel smoother on cracked pavement and offer better grip. Match tire type to your daily route and willingness to maintain air pressure."
    },
    {
      question: "How were these electric scooters chosen?",
      answer:
        "We filtered listings above $500, removed duplicate ASINs and warranty-plan clutter, then ranked scooters by buyer rating, price, motor power, top speed claims, range, braking, and suspension parsed from each listing."
    }
  ],
  quickPicks: [
    { label: "Best pick", productId: "${featuredId}", reason: "Top balance of 800W motor, 31 MPH speed, dual suspension, and $499 price." },
    { label: "Lowest price", productId: "${lowestId}", reason: "Lowest upfront price among scooters that stayed under the $500 cap." },
    { label: "Top rated", productId: "${topRatedId}", reason: "Highest buyer rating among the picks in this guide." }
  ],
  budgetTips: [
    "Budget $30–80 for a DOT-rated helmet and a sturdy lock if not included.",
    "Check whether your city requires registration, lights after dark, or bike-lane-only riding.",
    "Solid-tire models save on flats; keep a pump handy if you choose pneumatic tires.",
    "Recheck live Amazon pricing—flash sales can move scooters above or below $500 quickly."
  ],
  relatedArticles: ["electric-dirt-bike-under-500", "gas-go-karts-under-500", "best-barbecue-grill-under-500"],
  featuredProductId: "${featuredId}",
  sortOptions: [
    { label: "Top rated", value: "rating-desc" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" }
  ],
  defaultSort: "rating-desc",
  enableImageCarousel: true,
  publishedTime: "${now}",
  modifiedTime: "${now}"
};
`;

fs.writeFileSync(outFile, source);

console.log(`Wrote ${products.length} products to ${outFile}`);
console.log(`Featured: ${featured.shortTitle} (${featured.asin}) @ $${featured.price}`);
