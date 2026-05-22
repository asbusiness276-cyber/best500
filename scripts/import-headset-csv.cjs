const fs = require("node:fs");
const path = require("node:path");
const { parseProductImages } = require("./csv-product-images.cjs");

const csvPath = "c:\\Users\\DELL Latitude\\Desktop\\Shift\\New Article - Sheet1 (8).csv";
const outFile = path.join(process.cwd(), "src", "data", "articles", "best-gaming-headsets-for-under-500.ts");
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
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/®/g, "")
    .replace(/°/g, " degrees ")
    .replace(/\s+/g, " ")
    .trim();
}

function price(value) {
  const parsed = Number(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function rating(value) {
  const parsed = Number(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function shortTitle(title) {
  return clean(title)
    .replace(/\s+Bundle.*$/i, " Bundle")
    .split("|")[0]
    .split(" - ")[0]
    .slice(0, 95)
    .trim();
}

function meaningfulBullets(value) {
  const blocked = [
    "coverage",
    "asurion",
    "claim",
    "terms",
    "return",
    "image unavailable",
    "free shipping",
    "go to your orders",
    "best value",
    "protection",
    "audio & midi interface",
    "see top 100",
    "seller who offers",
    "reliable delivery",
  ];
  return clean(value)
    .split("|")
    .map((item) => item.trim())
    .filter((item) => item.length > 35)
    .filter((item) => !blocked.some((word) => item.toLowerCase().includes(word)))
    .filter((item, index, arr) => arr.findIndex((other) => other.slice(0, 70) === item.slice(0, 70)) === index)
    .slice(0, 7);
}

function specsFrom(title, bullets) {
  const source = clean(`${title} ${bullets.join(" ")}`);
  const specs = [];
  if (/wireless|lightspeed|bluetooth|2\.4ghz/i.test(source)) specs.push("Connection: Wireless / Bluetooth");
  if (/wired|usb-c|3\.5mm|usb-a/i.test(source)) specs.push("Connection: Wired support");
  if (/7\.1|surround|spatial/i.test(source)) specs.push("Audio: Surround / spatial sound");
  if (/noise cancel|anc/i.test(source)) specs.push("Noise control: Active noise canceling");
  if (/microphone|mic|voice|beamforming/i.test(source)) specs.push("Mic: Voice chat microphone");
  if (/battery|hours/i.test(source)) specs.push("Battery: Long-play design");
  if (/open-back|audiophile|transducer|driver/i.test(source)) specs.push("Sound: Audiophile-style tuning");
  return specs.slice(0, 6);
}

function featuresFrom(bullets, specs) {
  const text = bullets.join(" ").toLowerCase();
  const features = [...specs];
  if (/spatial|7\.1|surround/.test(text)) features.push("Immersive positional audio for games");
  if (/noise cancel|anc/.test(text)) features.push("Noise control for focus and clearer calls");
  if (/microphone|voice|discord|chat/.test(text)) features.push("Mic support for team chat and meetings");
  if (/battery|quick charging|charge/.test(text)) features.push("Battery or quick-charge features for long sessions");
  if (/comfort|cushion|lightweight|ear/.test(text)) features.push("Comfort-focused earcups for longer use");
  if (/software|customizable|eq|hub/.test(text)) features.push("Software tuning or EQ customization");
  return [...new Set(features)].slice(0, 5);
}

function pros(product, bullets) {
  const text = `${product.title} ${bullets.join(" ")}`.toLowerCase();
  const items = [];
  if (/wireless|bluetooth|2\.4ghz/.test(text)) items.push("Wireless connectivity is convenient for gaming and desk setups");
  if (/noise cancel|anc/.test(text)) items.push("Noise canceling helps with focus, calls, and shared rooms");
  if (/spatial|7\.1|surround/.test(text)) items.push("Spatial or surround audio can improve game awareness");
  if (/battery|hours/.test(text)) items.push("Battery-focused design supports longer sessions");
  if (/open-back|audiophile/.test(text)) items.push("Audio-first tuning is useful for music, editing, and immersive play");
  if (!items.length) items.push("Useful feature mix for shoppers staying under the $500 ceiling");
  return items.slice(0, 3);
}

function cons(product, bullets) {
  const text = `${product.title} ${bullets.join(" ")}`.toLowerCase();
  const items = [];
  if (/open-back/.test(text)) items.push("Open-back design leaks sound and is not ideal for noisy rooms");
  if (/bundle|mouse|keyboard|stand|earbuds/.test(text)) items.push("Bundle pricing can make headset-to-headset comparisons less direct");
  if (!/wireless|bluetooth|2\.4ghz/.test(text)) items.push("Wired-first design may not suit buyers who want cable-free gaming");
  if (product.price > 400) items.push("Premium price leaves less room in a $500 setup budget");
  if (!/mic|microphone/.test(text)) items.push("Mic details may be limited, so verify chat features before buying");
  return items.slice(0, 3);
}

const [headers, ...rows] = parseCsv(fs.readFileSync(csvPath, "utf8"));
const h = Object.fromEntries(headers.map((header, index) => [header.trim(), index]));
const seen = new Set();
const products = rows
  .map((row, index) => {
    const title = clean(row[h.Title]);
    const bullets = meaningfulBullets(row[h["Bullet Features"]]);
    const { image, images } = parseProductImages(row, h, clean);
    const product = {
      id: `headset-${index + 1}`,
      title,
      shortTitle: shortTitle(title),
      image,
      images,
      price: clean(row[h.ASIN]) === "B082YVPCMK" ? 199.99 : price(row[h.Price]),
      rating: rating(row[h.Rating]),
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
  .filter((product) => product.title && product.image && product.affiliateUrl)
  .filter((product) => {
    if (seen.has(product.asin)) return false;
    seen.add(product.asin);
    return true;
  })
  .sort((a, b) => a.price - b.price)
  .map((product, index) => ({
    ...product,
    id: `headset-${index + 1}`,
    badge: index === 0 ? "Best budget pick" : index === 1 ? "Best wireless value" : index === 2 ? "Best premium audio" : product.badge,
  }));

const source = `import type { Article, Product } from "../../types";

export const headsetProducts: Product[] = ${JSON.stringify(products, null, 2)};

export const headsetArticle: Article = {
  slug: "best-gaming-headsets-for-under-500",
  navLabel: "Gaming headsets under $500",
  keyword: "Best Gaming Headsets for Under $500",
  metaTitle: "Best Gaming Headsets Under $500 in 2026",
  metaDescription:
    "Compare the best gaming headsets under $500 with wireless, noise-canceling, audiophile, and developer-friendly picks.",
  category: "Tech & Outdoors",
  breadcrumb: ["Home", "Tech & Outdoors", "Best Gaming Headsets for Under $500"],
  heroImage: headsetProducts[0]?.image || "",
  heroBadge: "New headset buying guide",
  heroTitleLine1: "Best Gaming Headsets",
  heroTitleLine2: "Under $500",
  heroSubtitle:
    "A clean comparison of premium and affordable gaming headsets for PC, console, calls, streaming, and long development sessions.",
  heroTrustNote:
    "Some listings are bundles, so compare the live price and included accessories before buying.",
  introHeading: "How we picked these gaming headsets",
  introParagraphs: [
    "This BestBuyUnder500.com guide focuses on headsets that stay below the $500 ceiling while offering strong audio, clear communication, and comfortable long-session use.",
    "For readers searching affordable AR headsets under $500 for developers, this guide is focused on audio headsets for gaming, coding, meetings, spatial audio, and immersive desk setups rather than standalone AR glasses.",
    "We cleaned the supplied product sheet, removed warranty and marketplace noise, preserved each affiliate URL, and rewrote the product notes around sound, mic quality, comfort, wireless features, and real buyer tradeoffs."
  ],
  filters: ["Wireless gaming", "Noise canceling", "Spatial audio", "Developer desk setup", "Console and PC"],
  comparisonColumns: ["Product", "Price", "Rating", "Best for", "Key specs", "Buy"],
  products: headsetProducts,
  buyingGuideHeading: "What to check before buying a gaming headset under $500",
  buyingGuide: [
    {
      title: "Decide between gaming-first and audio-first tuning",
      body:
        "Gaming headsets usually prioritize positional cues, mic quality, and low latency. Audiophile headphones can sound more natural, but may need a separate microphone."
    },
    {
      title: "Check the connection type",
      body:
        "For competitive play, 2.4GHz wireless or wired USB-C is usually safer than basic Bluetooth. Bluetooth is still useful for calls, phones, and casual listening."
    },
    {
      title: "Noise canceling matters for shared spaces",
      body:
        "Active noise canceling helps if you work, code, or game around people. Open-back headphones can sound spacious but leak audio and let room noise in."
    },
    {
      title: "Watch bundle pricing",
      body:
        "Several products in the sheet include mice, keyboards, stands, or earbuds. Bundles can be useful, but they make direct headset value comparisons harder."
    }
  ],
  faqs: [
    {
      question: "Are gaming headsets under $500 worth it?",
      answer:
        "Yes, if you need better wireless, noise canceling, spatial audio, comfort, or mic quality. Many buyers do not need to spend the full $500."
    },
    {
      question: "Should developers buy a gaming headset?",
      answer:
        "A good gaming headset can work well for developers who spend hours in calls, pair programming, focus sessions, and occasional gaming."
    },
    {
      question: "Is Bluetooth enough for gaming?",
      answer:
        "Bluetooth is fine for casual use, but lower-latency 2.4GHz wireless or wired connections are better for competitive games."
    },
    {
      question: "Do audiophile headphones work for gaming?",
      answer:
        "They can sound excellent, especially for immersive games, but check whether you need a separate mic and whether open-back sound leakage is acceptable."
    }
  ],
  quickPicks: [
    { label: "Lowest listed price", productId: headsetProducts[0]?.id || "", reason: "Strong entry point if you want to spend far less than $500." },
    { label: "Best wireless gaming bundle", productId: headsetProducts.find((product) => product.title.includes("Logitech"))?.id || headsetProducts[1]?.id || "", reason: "Wireless gaming features and bundled gear may suit a full desk upgrade." },
    { label: "Best premium audio", productId: headsetProducts.find((product) => product.title.includes("Sennheiser"))?.id || headsetProducts[2]?.id || "", reason: "Audio-first tuning for music, editing, and immersive play." }
  ],
  budgetTips: [
    "Do not assume the highest price means the best gaming headset; check connection type, mic quality, and comfort first.",
    "If a listing is a bundle, compare the headset value separately from the included keyboard, mouse, stand, or earbuds.",
    "For developer calls and focus work, prioritize comfort, mic clarity, and noise control over RGB lighting.",
    "For competitive gaming, low-latency wireless or wired support matters more than generic Bluetooth alone."
  ],
  relatedArticles: ["best-gaming-laptop-under-500"],
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
console.log(`Wrote ${products.length} headset products to ${outFile}`);
