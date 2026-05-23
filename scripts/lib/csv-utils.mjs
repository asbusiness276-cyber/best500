/** Shared CSV parsing and product row helpers for publish/import scripts. */

export function parseCsv(text) {
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

export function clean(value) {
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

export function numberFrom(value) {
  const parsed = Number(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isImageUrl(value) {
  const url = String(value || "").trim();
  return /^https?:\/\//i.test(url) && !/image unavailable/i.test(url);
}

export function splitImageList(value) {
  const text = String(value || "");
  const fromRegex = text.match(/https?:\/\/[^\s,"']+/gi) || [];
  const fromDelimiters = text
    .split(/[\n,|]+/)
    .map((item) => item.trim())
    .filter(isImageUrl);
  return [...new Set([...fromRegex, ...fromDelimiters].map((url) => url.trim()).filter(isImageUrl))];
}

export function parseProductImages(row, headerMap, cleanFn = clean) {
  const mainKeys = ["Main HD Image", "Main Image", "Image", "Primary Image"];
  let primary = "";
  for (const key of mainKeys) {
    if (headerMap[key] !== undefined) {
      primary = cleanFn(row[headerMap[key]]);
      if (isImageUrl(primary)) break;
      primary = "";
    }
  }

  const columnImages = Object.entries(headerMap)
    .filter(
      ([key]) =>
        /^(?:main hd image|main image|image|primary image)$/i.test(key) ||
        /^image\s*\d+$/i.test(key) ||
        /^gallery image\s*\d+$/i.test(key)
    )
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, index]) => cleanFn(row[index]))
    .filter(isImageUrl);

  const listKeys = ["All HD Images", "Product Images", "Images", "Gallery Images", "Additional Images"];
  const listImages = listKeys.flatMap((key) => {
    if (headerMap[key] === undefined) return [];
    return splitImageList(cleanFn(row[headerMap[key]]));
  });

  const merged = [...(primary ? [primary] : []), ...columnImages, ...listImages].filter(isImageUrl);
  const unique = [...new Set(merged)];
  const image = unique[0] || "";
  const images = unique.length ? unique : image ? [image] : [];

  return { image, images };
}

const BLOCKED_BULLETS = [
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
  "most users do not need",
  "purchasers should also",
  "product eligibility",
  "easy claims",
  "past and future",
  "trusted cybersecurity",
  "pre-existing",
  "portable audio",
  "cb & two-way",
  "#"
];

export function meaningfulBullets(value) {
  return clean(value)
    .split(/\n|,|\|/)
    .map((item) => item.trim())
    .filter((item) => item.length > 35)
    .filter((item) => !BLOCKED_BULLETS.some((word) => item.toLowerCase().includes(word)))
    .filter((item, index, arr) => arr.findIndex((other) => other.slice(0, 80) === item.slice(0, 80)) === index)
    .slice(0, 8);
}

export function brandFrom(rowBrand, title) {
  const brand = clean(rowBrand)
    .replace(/^Brand:\s*/i, "")
    .replace(/^Visit the\s+/i, "")
    .replace(/\s+Store$/i, "");
  if (brand && !/out of 5 stars/i.test(brand)) return brand;
  return clean(title).split(/[\s,]/)[0] || "Product";
}

export function shortTitleFrom(title, brand) {
  const t = clean(title)
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+with\s+.*/i, "")
    .replace(/\s+for\s+.*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  const words = t.split(/\s+/).slice(0, 6).join(" ");
  return `${brand} ${words}`.replace(/\s+/g, " ").trim().slice(0, 72);
}

export function specsFromBullets(bullets, title) {
  const specs = bullets
    .slice(0, 4)
    .map((item) => (item.length > 72 ? `${item.slice(0, 69)}...` : item));
  if (!specs.length) {
    const snippet = clean(title).split(/\s+/).slice(0, 8).join(" ");
    specs.push(snippet.length > 72 ? `${snippet.slice(0, 69)}...` : snippet);
  }
  return specs.slice(0, 6);
}

export function genericPros(product) {
  const items = [];
  if (product.rating >= 4.3) items.push("Strong buyer rating compared with other picks in this guide");
  if (product.price <= 200) items.push("Lower upfront cost leaves room for accessories in the same budget");
  if (!items.length) items.push("Fits shoppers comparing options under the $500 ceiling");
  return items.slice(0, 3);
}

export function genericCons(product) {
  const items = [];
  if (product.rating > 0 && product.rating < 4) items.push("Lower rating than several competing picks in this price band");
  if (product.price >= 480) items.push("Price sits close to the $500 ceiling with little room for extras");
  if (!items.length) items.push("Verify live specs, compatibility, and current Amazon pricing before buying");
  return items.slice(0, 3);
}

export function buildHeaderMaps(headers) {
  const trimmed = headers.map((h) => h.trim());
  const lower = Object.fromEntries(trimmed.map((header, index) => [header.toLowerCase(), index]));
  const exact = Object.fromEntries(trimmed.map((header, index) => [header, index]));
  return { trimmed, lower, exact };
}

export function rowValue(row, lowerMap, ...names) {
  for (const name of names) {
    const index = lowerMap[name.toLowerCase()];
    if (index !== undefined) return row[index];
  }
  return "";
}
