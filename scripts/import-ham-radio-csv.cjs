const fs = require("node:fs");
const path = require("node:path");
const { parseProductImages } = require("./csv-product-images.cjs");

const csvPath = "c:\\Users\\DELL Latitude\\Desktop\\Shift\\New Article - Sheet1 (10).csv";
const outFile = path.join(process.cwd(), "src", "data", "articles", "ham-radio-under-500.ts");
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
    "go to your orders",
    "free shipping",
    "portable audio",
    "cb & two-way",
    "fixed-mount cb",
    "cb radios & scanners",
    "#",
    "most users do not need",
    "purchasers should also",
  ];
  return clean(value)
    .split("|")
    .map((item) => item.trim())
    .filter((item) => item.length > 35)
    .filter((item) => !blocked.some((word) => item.toLowerCase().includes(word)))
    .filter((item, index, arr) => arr.findIndex((other) => other.slice(0, 80) === item.slice(0, 80)) === index)
    .slice(0, 8);
}

function brandFrom(rowBrand, title) {
  const brand = clean(rowBrand).replace(/^Visit the\s+/i, "").replace(/\s+Store$/i, "").replace(/^Brand:\s*/i, "");
  if (brand && !/out of 5 stars/i.test(brand)) return brand;
  const match = clean(title).match(/^(?:YAESU|BTECH|Radioddity|AnyTone|Xiegu|Retevis|Midland|Wouxun|TYT|HESENATE)/i);
  if (match) return match[0];
  return clean(title).split(/[\s,]/)[0] || "Ham Radio";
}

function shortTitle(title, brand) {
  const t = clean(title)
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+with\s+.*/i, "")
    .replace(/\s+for\s+.*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  const model = t.match(/\b(?:AT-\d+\w*|QT\d+\w*|DB-?\d+\w*|UV-\d+\w*|TH-\d+\w*|G\d+\w*|FT-\d+\w*|DA-\d+\w*|KG-\w+|MA\d+\w*|MXT\d+\w*)\b/i)?.[0];
  const type = /handheld|portable/i.test(t)
    ? "Handheld"
    : /mobile|vehicle|car|truck/i.test(t)
      ? "Mobile"
      : /base station|base/i.test(t)
        ? "Base"
        : /transceiver|radio/i.test(t)
          ? "Transceiver"
          : "Radio";
  const bands = /quad band/i.test(t) ? "Quad-Band" : /dual band/i.test(t) ? "Dual-Band" : /10 meter|10m/i.test(t) ? "10M" : /hf|ssb/i.test(t) ? "HF" : "";
  const label = [brand, model, bands, type].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  return label.slice(0, 95);
}

function specsFrom(title, bullets) {
  const source = clean(`${title} ${bullets.join(" ")}`);
  const specs = [];
  const power = source.match(/\b(\d+)W(?:\s*(?:PEP|High Power|output|Peak))?\b/i)?.[0];
  const bands =
    /quad band/i.test(source) ? "Quad-band (10M/6M/2M/70cm)"
      : /dual band/i.test(source) ? "Dual-band VHF/UHF"
        : /10 meter|10m/i.test(source) ? "10-meter band"
          : /hf|3\.5.*29\.7/i.test(source) ? "HF amateur bands"
            : /gmrs/i.test(source) ? "GMRS"
              : "";
  const modes = [];
  if (/ssb/i.test(source)) modes.push("SSB");
  if (/\bam\b/i.test(source)) modes.push("AM");
  if (/\bfm\b/i.test(source)) modes.push("FM");
  if (/\bcw\b/i.test(source)) modes.push("CW");
  if (/\bdmr/i.test(source)) modes.push("DMR");
  const form = /handheld|portable/i.test(source) ? "Handheld" : /mobile|vehicle|detachable.*panel|faceplate/i.test(source) ? "Mobile mount" : /base station/i.test(source) ? "Base station" : "";
  if (power) specs.push(`Power: ${power.replace(/\s+/g, " ")}`);
  if (bands) specs.push(`Bands: ${bands}`);
  if (modes.length) specs.push(`Modes: ${modes.join(", ")}`);
  if (form) specs.push(`Type: ${form}`);
  if (/cross.?band|repeater/i.test(source)) specs.push("Feature: Cross-band repeat");
  if (/gps|aprs/i.test(source)) specs.push("Feature: GPS/APRS");
  if (/noise reduction|squelch|anl|nb/i.test(source)) specs.push("Audio: Noise reduction");
  if (/antenna tuner|auto tuner/i.test(source)) specs.push("Tuner: Built-in ATU");
  return specs.slice(0, 7);
}

function featuresFrom(bullets, specs) {
  const text = bullets.join(" ").toLowerCase();
  const features = [...specs];
  if (/detachable|remote.*panel|faceplate/i.test(text)) features.push("Detachable control panel for vehicle installs");
  if (/dual display|dual receive|dual watch/i.test(text)) features.push("Dual-channel monitoring on two frequencies");
  if (/programming|chirp|pc/i.test(text)) features.push("PC programming support");
  if (/noaa|weather/i.test(text)) features.push("NOAA weather alert monitoring");
  if (/bluetooth/i.test(text)) features.push("Bluetooth connectivity");
  return [...new Set(features)].slice(0, 5);
}

function pros(product, bullets) {
  const text = `${product.title} ${bullets.join(" ")}`.toLowerCase();
  const items = [];
  if (/80w|60w|50w|20w/.test(text)) items.push("High power output supports longer-range communication");
  if (/quad band|dual band|multi.?band/.test(text)) items.push("Multi-band coverage reduces the need for multiple radios");
  if (/detachable|remote mount|faceplate/.test(text)) items.push("Detachable faceplate helps with vehicle and mobile installs");
  if (/noise reduction|squelch|anl/.test(text)) items.push("Noise reduction features improve clarity in noisy environments");
  if (/dmr|digital/.test(text)) items.push("Digital modes can improve audio quality on supported networks");
  if (/antenna tuner|auto tuner/.test(text)) items.push("Built-in antenna tuner simplifies field operation");
  if (!items.length) items.push("Solid feature mix for licensed operators staying under the $500 ceiling");
  return items.slice(0, 3);
}

function cons(product, bullets) {
  const text = `${product.title} ${bullets.join(" ")}`.toLowerCase();
  const items = [];
  if (product.rating && product.rating < 4) items.push("Lower rating than some competing picks in this guide");
  if (/license|fcc|gmrs/i.test(text) && !/gmrs/i.test(product.title.toLowerCase())) items.push("Requires appropriate amateur radio licensing before transmitting");
  if (/gmrs/i.test(text)) items.push("GMRS license required; not a substitute for full HF ham capability");
  if (product.price > 450) items.push("Premium price leaves less room for antennas and accessories");
  if (/programming|firmware|computer/i.test(text)) items.push("May need PC programming or firmware updates for full feature access");
  if (!items.length) items.push("Verify band coverage and power limits match your intended use before buying");
  return items.slice(0, 3);
}

const [headers, ...rows] = parseCsv(fs.readFileSync(csvPath, "utf8"));
const h = Object.fromEntries(headers.map((header, index) => [header.trim().toLowerCase(), index]));
const headerMap = Object.fromEntries(headers.map((header, index) => [header.trim(), index]));
const seen = new Set();
const products = rows
  .map((row, index) => {
    const col = (name) => row[h[name.toLowerCase()]];
    const title = clean(col("Title"));
    const bullets = meaningfulBullets(col("Bullet Features"));
    const brand = brandFrom(col("Brand"), title);
    const { image, images } = parseProductImages(row, headerMap, clean);
    const product = {
      id: `ham-radio-${index + 1}`,
      title,
      shortTitle: shortTitle(title, brand),
      image,
      images,
      price: numberFrom(col("Price")),
      rating: numberFrom(col("Rating")),
      affiliateUrl: clean(col("Affilate links")),
      asin: clean(col("ASIN")),
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
  .filter((product) => product.price <= 500)
  .filter((product) => {
    const key = product.asin || `${product.title}-${product.image}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .sort((a, b) => a.price - b.price)
  .map((product, index) => ({
    ...product,
    id: `ham-radio-${index + 1}`,
    badge: index === 0 ? "Best budget pick" : index === 1 ? "Best mobile value" : index === 2 ? "Best HF pick" : product.badge,
  }));

const source = `import type { Article, Product } from "../../types";

export const hamRadioProducts: Product[] = ${JSON.stringify(products, null, 2)};

export const hamRadioArticle: Article = {
  slug: "ham-radio-under-500",
  navLabel: "Ham radio under $500",
  keyword: "Ham Radio Under $500",
  metaTitle: "Best Ham Radio Under $500 in 2026",
  metaDescription:
    "Compare the best ham radio under $500 picks for mobile, handheld, HF, and dual-band transceivers with power, bands, modes, and buyer notes.",
  category: "Tech & Outdoors",
  breadcrumb: ["Home", "Tech & Outdoors", "Ham Radio Under $500"],
  heroImage: "/images/featured-ham-radio.webp",
  heroBadge: "New ham radio buying guide",
  heroTitleLine1: "Best Ham Radio",
  heroTitleLine2: "Under $500",
  heroSubtitle:
    "A practical comparison of mobile, handheld, HF, and dual-band ham radios with power output, band coverage, modes, and real buyer tradeoffs.",
  heroTrustNote:
    "Amateur radio operation requires the appropriate FCC license. Always verify band coverage, power limits, and current Amazon pricing before buying.",
  introHeading: "How we picked ham radios under $500",
  introParagraphs: [
    "This BestBuyUnder500.com guide focuses on ham radios that stay below the $500 ceiling while offering useful power, band coverage, and features for licensed operators.",
    "We cleaned the supplied product sheet to remove warranty-plan and marketplace noise, preserved each affiliate URL, and rewrote the notes around the details buyers actually compare: power output, bands, modes, mobile vs handheld form factor, programming, and noise reduction."
  ],
  filters: ["Mobile mount", "Handheld", "Dual-band VHF/UHF", "HF/SSB", "High power"],
  comparisonColumns: ["Product", "Price", "Rating", "Best for", "Key specs", "Buy"],
  products: hamRadioProducts,
  buyingGuideHeading: "What to check before buying a ham radio under $500",
  buyingGuide: [
    {
      title: "Confirm your license and band needs",
      body:
        "Match the radio to the bands you are licensed to use. VHF/UHF mobile radios differ from 10-meter, HF, and digital DMR transceivers."
    },
    {
      title: "Compare power output and antenna plans",
      body:
        "Higher wattage can help with range, but antenna quality and placement matter just as much. Budget for a suitable antenna and feed line."
    },
    {
      title: "Choose mobile vs handheld vs base",
      body:
        "Mobile radios with detachable faceplates suit vehicles. Handhelds are portable but usually lower power. HF radios excel at long-distance communication."
    },
    {
      title: "Check programming and accessories",
      body:
        "Many radios need PC programming cables, mounting hardware, or firmware updates. Factor those into the total cost before comparing prices."
    }
  ],
  faqs: [
    {
      question: "Can you get a good ham radio under $500?",
      answer:
        "Yes. Under $500 you can find capable mobile dual-band radios, 10-meter transceivers, entry HF rigs, and feature-rich handhelds for licensed operators."
    },
    {
      question: "Do I need a license to use a ham radio?",
      answer:
        "Yes. Transmitting on amateur radio frequencies in the United States requires an FCC amateur radio license at the appropriate class for the bands you want to use."
    },
    {
      question: "What is the difference between mobile and handheld ham radios?",
      answer:
        "Mobile radios typically offer higher power and vehicle mounting options. Handhelds prioritize portability with lower power and built-in batteries."
    },
    {
      question: "Is a GMRS radio the same as ham radio?",
      answer:
        "No. GMRS radios use different frequencies and licensing rules. Some products in broader radio categories are GMRS-focused rather than full amateur band coverage."
    }
  ],
  quickPicks: [
    { label: "Lowest listed price", productId: hamRadioProducts[0]?.id || "", reason: "Best starting point if keeping radio budget low matters most." },
    { label: "Best mobile dual-band", productId: hamRadioProducts.find((product) => /dual.?band|uv-50|db50|db-25/i.test(product.title))?.id || hamRadioProducts[1]?.id || "", reason: "Strong VHF/UHF mobile value for repeaters and local comms." },
    { label: "Best HF transceiver", productId: hamRadioProducts.find((product) => /hf|g90|g106|ssb/i.test(product.title))?.id || hamRadioProducts[2]?.id || "", reason: "HF capability for long-distance amateur communication." }
  ],
  budgetTips: [
    "Budget for antennas, coax, and mounting hardware — the radio is rarely the only purchase.",
    "Compare analog vs digital (DMR) based on what your local repeaters and clubs actually support.",
    "For vehicle installs, a detachable faceplate and noise reduction are worth prioritizing.",
    "Check whether programming software and cables are included or sold separately."
  ],
  relatedArticles: ["best-gaming-laptop-under-500", "best-gaming-headsets-for-under-500"],
  sortOptions: [
    { label: "Recommended", value: "recommended" },
    { label: "Price: low to high", value: "price-asc" },
    { label: "Rating: high to low", value: "rating-desc" }
  ],
  defaultSort: "recommended",
  enableImageCarousel: true,
  publishedTime: "${now}",
  modifiedTime: "${now}"
};
`;

fs.writeFileSync(outFile, source);

const imageCounts = products.map((p) => p.images?.length || 1);
console.log(`Wrote ${products.length} ham radio products to ${outFile}`);
console.log(`Images per product: min=${Math.min(...imageCounts)}, max=${Math.max(...imageCounts)}, avg=${(imageCounts.reduce((a, b) => a + b, 0) / imageCounts.length).toFixed(1)}`);
