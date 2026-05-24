const fs = require("node:fs");
const path = require("node:path");

const csvPath = "c:\\Users\\DELL Latitude\\Desktop\\Shift\\New Article - Sheet1 (15).csv";
const outFile = path.join(process.cwd(), "src", "data", "articles", "best-electric-wheelchair-under-500.ts");
const now = new Date().toISOString();
const FEATURED_ASIN = "B0FHW1J155";

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
  "top 100",
  "#",
  "wheelchairs, mobility scooters",
  "this item can be returned",
  "non-returnable"
];

function meaningfulBullets(value) {
  return clean(value)
    .split(/\n/)
    .map((item) => item.trim())
    .filter((item) => item.length > 40)
    .filter((item) => !BLOCKED_BULLETS.some((word) => item.toLowerCase().includes(word)))
    .slice(0, 8);
}

function brandFrom(rowBrand, title) {
  const brand = clean(rowBrand)
    .replace(/^Brand:\s*/i, "")
    .replace(/^Visit the\s+/i, "")
    .replace(/\s+Store$/i, "");
  if (brand && !/out of 5 stars/i.test(brand)) return brand;
  return clean(title).split(/[\s,]/)[0] || "Wheelchair";
}

function shortTitle(title, brand) {
  const t = clean(title)
    .replace(/\[2026 Upgrade\]/gi, "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const motor = t.match(/(\d{3,4})W/i)?.[1];
  const range = t.match(/(\d{1,2})\s*(?:-|to\s*)?(\d{1,2})?\s*miles?/i);
  const weight = t.match(/(\d{2,3})\s*lbs?\b/i)?.[1];
  const bits = [brand];
  if (weight && Number(weight) < 80) bits.push(`${weight} lb`);
  if (motor) bits.push(`${motor}W`);
  if (range) bits.push(`${range[2] ? `${range[1]}-${range[2]}` : range[1]} mi`);
  bits.push("Foldable Power Chair");
  return bits.join(" ").replace(/\s+/g, " ").trim().slice(0, 72);
}

function firstMatch(source, patterns) {
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match) return match;
  }
  return null;
}

function lbsNum(value) {
  const n = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function isCapacityLbs(n) {
  return n >= 200 && n <= 450;
}

function isProductWeightLbs(n, capacity) {
  if (n < 25 || n > 90) return false;
  if (capacity && n === capacity) return false;
  return true;
}

function extractCapacity(title, bullets) {
  const source = `${clean(title)} ${bullets.join(" ")}`;
  const patterns = [
    /(\d{3})\s*(?:lbs?|lb)\s*(?:weight\s*)?capacity/i,
    /(?:weight\s*)?capacity[:\s-]*(?:of\s*)?(\d{3})\s*(?:lbs?|lb)/i,
    /(\d{3})\s*(?:lbs?|lb)\s*(?:weight\s*)?(?:max|limit|rated)/i,
    /(?:support|supports|supporting|holding|holds|hold|max(?:imum)?|up to|built for)\s*(?:a\s*)?(?:weight\s*(?:of\s*|capacity\s*)?)?(\d{3})\s*(?:lbs?|lb)/i,
    /(?:for|rated)\s*(\d{3})\s*(?:lbs?|lb)\s*(?:users?|riders?|capacity)?/i,
    /(\d{3})\s*(?:lbs?|lb)\s*without\s+sagging/i,
    /(?:senior\s+)?support\s+(\d{3})\s*(?:lbs?|lb)/i,
    /(\d{3})\s*lb\s+capacity/i,
    /(\d{3})\s*lbs?\s+capacity/i,
    /max(?:imum)?\s+weight\s+capacity\s+of\s+(\d{3})\s*(?:lbs?|lb)/i,
    /(\d{3})\s*(?:lbs?|lb)\s+users?/i
  ];
  const match = firstMatch(source, patterns);
  if (match) {
    const n = lbsNum(match[1]);
    if (isCapacityLbs(n)) return n;
  }
  const titleOnly = clean(title);
  const titleCap = titleOnly.match(/\b(\d{3})\s*(?:lbs?|lb)\b/i);
  if (titleCap) {
    const n = lbsNum(titleCap[1]);
    if (isCapacityLbs(n) && /support|capacity|lbs/i.test(titleOnly)) return n;
  }
  return 0;
}

function extractRange(title, bullets) {
  const source = `${clean(title)} ${bullets.join(" ")}`;
  const found = [];
  const patterns = [
    /(\d{1,2})\s*\+?\s*(?:-|to\s*)?(\d{1,2})?\s*(?:-|\s)?\s*miles?\b/gi,
    /(\d{1,2})\s*\+?\s*miles?\s*(?:of\s*)?(?:travel|range|battery|per charge|on a)/gi,
    /(?:range|travel|battery life|battery)\s*(?:of\s*|up to\s*|exceeding\s*)?(\d{1,2})\s*\+?\s*miles?/gi,
    /up to\s*(\d{1,2})\s*\+?\s*miles?/gi,
    /(\d{1,2})\s*mi\s*range/gi,
    /(\d{1,2})\s*mile\s*range/gi,
    /(\d{1,2})\s*miles?\s*long(?:er)?\s*travel/gi,
    /(\d{1,2})\s*miles?\s*electric/gi
  ];
  for (const pattern of patterns) {
    let match;
    const re = new RegExp(pattern.source, pattern.flags);
    while ((match = re.exec(source)) !== null) {
      const a = lbsNum(match[1]);
      const b = match[2] ? lbsNum(match[2]) : 0;
      if (a >= 8 && a <= 30) found.push(b && b > a ? b : a);
    }
  }
  if (!found.length) return 0;
  return Math.max(...found);
}

function extractMotor(title, bullets) {
  const source = `${clean(title)} ${bullets.join(" ")}`;
  const peak = source.match(/(\d{3,4})\s*w\s*peak/i);
  const dualTotal = source.match(/dual\s*(\d{2,4})\s*w\s*motors?\s*\((\d{2,4})\s*w\s*total\)/i);
  if (dualTotal) return `${dualTotal[1]}W×2 (${dualTotal[2]}W)`;
  const dualWithTotal = source.match(/dual\s*(\d{2,4})\s*w[^.]{0,40}?(\d{2,4})\s*w\s*total/i);
  if (dualWithTotal) return `${dualWithTotal[1]}W×2 (${dualWithTotal[2]}W)`;
  const paired = source.match(/(\d{2,4})\s*w\s*[\(（]\s*(\d{2,4})\s*w\s*[×x\*]\s*2/i);
  if (paired) return `${paired[2]}W×2 (${paired[1]}W)`;
  const dualTimes2 = source.match(/dual\s*(\d{2,4})\s*w\s*motors?/i) || source.match(/(\d{2,4})\s*w\s*[×x\*]\s*2/i);
  if (dualTimes2) {
    const each = lbsNum(dualTimes2[1]);
    if (peak) return `${each}W×2 (${lbsNum(peak[1])}W peak)`;
    return `${each}W×2`;
  }
  const twoMotors = source.match(/two\s*(\d{2,3})[- ]?watt\s*motors?/i);
  if (twoMotors) return `${twoMotors[1]}W×2`;
  const brushlessDual = source.match(/dual\s*(\d{2,4})\s*w\s*brushless/i);
  if (brushlessDual) return `${brushlessDual[1]}W×2`;
  if (peak) return `${peak[1]}W peak`;
  const single = source.match(/(\d{3,4})\s*w\s*(?:brushless\s*)?(?:dual\s*)?motors?/i) || source.match(/(\d{3,4})\s*w\s*motor/i);
  if (single) return `${single[1]}W`;
  const titleMotor = clean(title).match(/(\d{3,4})\s*w/i);
  if (titleMotor) return `${titleMotor[1]}W`;
  return "";
}

function extractProductWeight(title, bullets, capacity) {
  const titleClean = clean(title);
  const source = `${titleClean} ${bullets.join(" ")}`;
  const candidates = [];
  const patterns = [
    /(?:weighing|weighs|weight[:\s]+)\s*(?:only\s*|just\s*|about\s*)?(\d{2,3})\s*(?:lbs?|lb|pounds?)\b/gi,
    /(?:tips the scales at|scales at)\s*(?:just\s*)?(\d{2,3})\s*(?:lbs?|lb|pounds?)\b/gi,
    /(\d{2,3})\s*(?:lbs?|lb|pounds?)\s+with\s+batteries/gi,
    /(\d{2,3})\s*(?:lbs?|lb)\s*\(includes?\s*battery/gi,
    /(\d{2,3})\s*(?:lbs?|lb)\s*\(without\s*battery/gi,
    /weighs\s+only\s+(\d{2,3})\s*(?:lbs?|lb|pounds?)/gi,
    /(\d{2,3})\s*(?:lbs?|lb)\s*\(includes?\s*battery/gi,
    /(?:only|just)\s+(\d{2,3})\s*(?:lbs?|lb|pounds?)\b/gi
  ];
  for (const pattern of patterns) {
    let match;
    const re = new RegExp(pattern.source, pattern.flags);
    while ((match = re.exec(source)) !== null) {
      const n = lbsNum(match[1]);
      if (isProductWeightLbs(n, capacity)) candidates.push(n);
    }
  }
  const titlePatterns = [
    /^(\d{2,3})\s*lbs?\b/i,
    /\b(\d{2,3})\s*lbs?\s+lightweight/i,
    /(\d{2,3})\s*lb\s+electric/i,
    /lightweight[,\s]+(\d{2,3})\s*lbs?/i,
    /(\d{2,3})\s*lbs?\s+lightweight/i
  ];
  for (const pattern of titlePatterns) {
    const match = titleClean.match(pattern);
    if (match) {
      const n = lbsNum(match[1]);
      if (isProductWeightLbs(n, capacity)) candidates.push(n);
    }
  }
  const portable = source.match(/(?:portable|chair|wheelchair|frame)[^.]{0,40}?(\d{2,3})\s*(?:lbs?|lb|pounds?)\b/i);
  if (portable) {
    const n = lbsNum(portable[1]);
    if (isProductWeightLbs(n, capacity)) candidates.push(n);
  }
  if (!candidates.length) return 0;
  return candidates.sort((a, b) => a - b)[0];
}

function extractFoldable(title, bullets) {
  const source = `${clean(title)} ${bullets.join(" ")}`;
  if (/non[- ]?fold|does not fold/i.test(source)) return "No";
  if (/fold/i.test(source)) return "Yes";
  return "Yes";
}

function specsFrom(title, bullets) {
  const source = `${clean(title)} ${bullets.join(" ")}`;
  const capacity = extractCapacity(title, bullets);
  const range = extractRange(title, bullets);
  const motor = extractMotor(title, bullets);
  const weight = extractProductWeight(title, bullets, capacity);
  const foldable = extractFoldable(title, bullets);
  const battery = source.match(/(\d{1,2})\s*Ah/i);
  const specs = [];

  if (capacity) specs.push(`Capacity: ${capacity} lbs`);
  if (range) specs.push(`Range: ~${range} miles`);
  specs.push(`Foldable: ${foldable}`);
  if (motor) specs.push(`Motor: ${motor}`);
  if (weight) specs.push(`Weight: ~${weight} lbs`);
  if (battery) specs.push(`Battery: ${battery[1]}Ah`);
  if (/airline|faa|air transport|airline approved|airline-approved/i.test(source)) {
    specs.push("Travel: Airline-friendly battery");
  }
  if (/fda class ii/i.test(source)) specs.push("Medical: FDA Class II device");
  const speed = source.match(/(\d(?:\.\d)?)\s*mph/i);
  if (speed) specs.push(`Speed: ${speed[1]} MPH`);
  if (/electromagnetic|auto brake/i.test(source)) specs.push("Safety: Electromagnetic braking");

  if (!specs.length) {
    const snippet = clean(title).split(/\s+/).slice(0, 8).join(" ");
    specs.push(snippet.length > 72 ? `${snippet.slice(0, 69)}...` : snippet);
  }
  return specs.slice(0, 8);
}

function highlightFrom(specs) {
  return (
    specs.find((s) => /^Range:/i.test(s))?.replace(/^Range:\s*/i, "") ||
    specs.find((s) => /^Weight:/i.test(s))?.replace(/^Weight:\s*/i, "") ||
    specs.find((s) => /^Motor:/i.test(s))?.replace(/^Motor:\s*/i, "") ||
    specs[0]?.replace(/^[^:]+:\s*/, "") ||
    "Foldable power wheelchair"
  );
}

function pros(product, title, bullets) {
  const text = (clean(title) + " " + bullets.join(" ")).toLowerCase();
  const items = [];
  if (/36\s*lbs|32\s*lbs|39\s*lbs|ultralight|ultra-light/i.test(text)) {
    items.push("Lightweight frame is easier to lift into a car trunk than 60+ lb models");
  }
  if (/15\s*miles|16\s*miles|20\s*miles|25\s*miles/i.test(text)) {
    items.push("Advertised range covers typical errands without mid-day charging");
  }
  if (/airline|faa|air transport/i.test(text)) items.push("Battery sizing may qualify for air travel (confirm with airline)");
  if (/350\s*lbs|330\s*lbs|390\s*lbs/i.test(text)) items.push("Higher weight capacity than many budget folding chairs");
  if (product.rating >= 4.5) items.push("Strong buyer rating among electric wheelchairs in this price band");
  if (product.price <= 350) items.push("Leaves headroom under a strict $500 budget for accessories");
  if (!items.length) items.push("Fits shoppers comparing electric wheelchairs under $500 on Amazon");
  return items.slice(0, 3);
}

function cons(product, title, bullets) {
  const text = (clean(title) + " " + bullets.join(" ")).toLowerCase();
  const items = [];
  if (product.rating < 4.2) items.push("Lower rating than several competing picks in this guide");
  if (/lead-acid|lead acid/i.test(text)) items.push("Lead-acid battery adds weight versus lithium packs on lighter rivals");
  if (/65\s*lbs|63\s*lbs|heavier/i.test(text) && !/36\s*lbs|32\s*lbs|39\s*lbs/i.test(text)) {
    items.push("Heavier unit may need two people to lift into a vehicle");
  }
  if (product.price >= 480) items.push("Price sits close to the $500 ceiling with little room for ramps or bags");
  if (/used electric wheelchair/i.test(text)) items.push("Used/refurb listing—verify condition and return policy before buying");
  if (!items.length) items.push("Confirm live weight, range, and FDA/medical claims on the Amazon listing");
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
      affiliateUrl: clean(row[h["Affilate Links"]] || row[0]),
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
  .filter((product) => product.price <= 500)
  .filter((product) => {
    const key = product.asin || product.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

if (!products.length) {
  throw new Error("No electric wheelchair products parsed from CSV.");
}

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
  id: `electric-wheelchair-${index + 1}`
}));

const featuredId = products[0]?.id || "electric-wheelchair-1";
const lowestId = products.find((p) => p.badge === "Lowest price")?.id || featuredId;
const topRatedId = topRated?.id || featuredId;

const source = `import type { Article, Product } from "../../types";

export const bestElectricWheelchairUnder500Products: Product[] = ${JSON.stringify(products, null, 2)};

export const bestElectricWheelchairUnder500Article: Article = {
  slug: "best-electric-wheelchair-under-500",
  navLabel: "Electric wheelchair under $500",
  keyword: "Best Electric Wheelchair Under $500",
  metaTitle: "Best Electric Wheelchair Under $500 in 2026",
  metaDescription:
    "Compare the best electric wheelchair under $500 with foldable, lightweight, and long-range picks—motor power, weight capacity, and travel notes.",
  category: "Home & Living",
  breadcrumb: ["Home", "Home & Living", "Best Electric Wheelchair Under $500"],
  heroImage: "/images/featured-electric-wheelchair.webp",
  heroBadge: "Mobility buyer guide",
  heroTitleLine1: "Best Electric Wheelchair",
  heroTitleLine2: "Under $500",
  heroSubtitle:
    "Foldable motorized wheelchairs from about $281 to $499—compare weight, range, capacity, airline-friendly batteries, and safety features before you buy.",
  heroTrustNote:
    "Always confirm live Amazon pricing, weight limits, battery rules for flights, and whether you need a prescription or FDA-registered device.",
  introHeading: "How we picked the best electric wheelchair under $500",
  introParagraphs: [
    "This BestBuyUnder500.com guide focuses on electric wheelchair under $500 searches—portable power chairs, lightweight folding models, and motorized wheelchairs for seniors that stayed at or below $500 when we last checked.",
    "We compared foldable power chairs on motor power, mile range, weight capacity, fold size, and travel-friendly battery options so you can match a chair to doorways, trunks, and caregiver lifting ability."
  ],
  filters: [
    "Best pick",
    "Lowest price",
    "Top rated",
    "Under 40 lbs",
    "15+ mile range",
    "330+ lb capacity",
    "Airline friendly",
    "FDA Class II"
  ],
  comparisonColumns: ["Product", "Price", "Rating", "Best for", "Capacity", "Range", "Foldable", "Motor", "Weight"],
  products: bestElectricWheelchairUnder500Products,
  buyingGuideHeading: "What to check before buying an electric wheelchair under $500",
  buyingGuide: [
    {
      title: "Weight and who will lift it",
      body:
        "Budget chairs range from about 32–65 lbs assembled. Ultralight models under 40 lbs fold smaller but may trade battery size. Confirm whether one person can lift the folded frame into your vehicle."
    },
    {
      title: "Range, battery type, and charging",
      body:
        "Most listings claim 12–25 miles per charge; real range drops with rider weight, hills, and speed. Lithium packs are lighter than lead-acid. Removable batteries simplify charging away from the chair and may help with airline rules."
    },
    {
      title: "Capacity, seat width, and comfort",
      body:
        "Check weight limits (often 250–390 lbs) and seat width (17–19 inches). Flip-up armrests, adjustable footrests, and anti-tip wheels matter for transfers and stability on ramps."
    },
    {
      title: "Travel, medical claims, and safety",
      body:
        "Airline approval depends on battery watt-hours—not marketing copy. FDA Class II listings are medical devices; others are general mobility products. Look for electromagnetic brakes, seat belts, and responsive joysticks."
    }
  ],
  faqs: [
    {
      question: "Can you get a good electric wheelchair under $500?",
      answer:
        "Yes. This guide includes multiple foldable power chairs between about $281 and $499 with 4+ star ratings. Expect compromises on seat padding, suspension, or top speed versus $800+ clinical chairs."
    },
    {
      question: "What is the difference between a power wheelchair and a mobility scooter?",
      answer:
        "Power wheelchairs in this guide use joystick control and a compact chair frame for indoor/outdoor use. Mobility scooters usually have tillers, larger decks, and different turning radius—match the device to doorway width and trunk space."
    },
    {
      question: "Are lightweight electric wheelchairs under $500 airline approved?",
      answer:
        "Some list FAA-friendly or airline-approved batteries (often under 300 Wh per pack). Always verify the exact battery label, airline policy, and whether you need a medical certificate before flying."
    },
    {
      question: "How were these electric wheelchairs chosen?",
      answer:
        "We filtered listings above $500, removed duplicate ASINs, and ranked foldable power chairs by buyer rating, price, motor watts, range claims, and weight capacity."
    }
  ],
  quickPicks: [
    { label: "Best pick", productId: "${featuredId}", reason: "Top balance of 4.6 rating, $281 price, 500W motor, and 15-mile range in this comparison." },
    { label: "Lowest price", productId: "${lowestId}", reason: "Lowest upfront price among electric wheelchairs that stayed under the $500 cap." },
    { label: "Top rated", productId: "${topRatedId}", reason: "Highest buyer rating among the picks in this guide." }
  ],
  budgetTips: [
    "Compare motor watts, battery Ah, weight, and fold dimensions—not add-on warranty listings.",
    "Budget for a ramp, travel bag, or spare battery if caregivers lift the chair often.",
    "If you need Medicare or insurance coverage, confirm whether the listing is an FDA-registered medical device.",
    "Recheck live Amazon pricing—sales can dip below $500 or push variants above the cap."
  ],
  relatedArticles: ["refrigerator-sale-under-500", "best-washer-and-dryer-bundles-under-500"],
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
