const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const articles = [
  {
    key: "laptop",
    svgPath: "public/images/featured-laptop.svg",
    imagePath: "public/images/laptop-main.jpg",
    title: "Best Gaming Laptop Under 500",
    desc: "Featured buying guide image for best gaming laptop under 500 with a vivid gaming studio background and laptop product visual.",
    eyebrow: "BESTBUYUNDER500.COM",
    line1: "Best Gaming",
    line2: "Laptop",
    price: "Under $500",
    subtitle: "Budget rigs for school, streams, and light gaming.",
    badge1: "Fast picks",
    badge2: "Student ready",
    cta: "Compare laptops",
    theme: {
      bg1: "#12002f",
      bg2: "#24105f",
      bg3: "#031f4f",
      hot: "#22d3ee",
      accent: "#a855f7",
      accent2: "#f97316",
      text: "#ffffff",
      muted: "#dbeafe",
      panel: "#0f172a",
    },
    image: { x: 704, y: 150, width: 360, height: 360, rotate: -3, shape: "laptop" },
  },
  {
    key: "headset",
    svgPath: "public/images/featured-headset.svg",
    imagePath: "public/images/headset-main.jpg",
    title: "Best Gaming Headsets for Under $500",
    desc: "Featured buying guide image for best gaming headsets for under 500 with a vivid esports studio background and headset product visual.",
    eyebrow: "BESTBUYUNDER500.COM",
    line1: "Best Gaming",
    line2: "Headsets",
    price: "Under $500",
    subtitle: "Wireless, noise-canceling, and desk setup picks.",
    badge1: "Low latency",
    badge2: "Clear comms",
    cta: "Compare headsets",
    theme: {
      bg1: "#061024",
      bg2: "#11215f",
      bg3: "#2d0b59",
      hot: "#34d399",
      accent: "#22d3ee",
      accent2: "#f43f5e",
      text: "#ffffff",
      muted: "#dcfce7",
      panel: "#0b1220",
    },
    image: { x: 704, y: 126, width: 356, height: 404, rotate: 4, shape: "headset" },
  },
  {
    key: "refrigerator",
    svgPath: "public/images/featured-refrigerator.svg",
    imagePath: "public/images/refrigerator-main.jpg",
    title: "Refrigerator Sale Under $500",
    desc: "Featured buying guide image for refrigerator sale under 500 with a bright studio background and compact refrigerator product visual.",
    eyebrow: "BESTBUYUNDER500.COM",
    line1: "Refrigerator",
    line2: "Sale",
    price: "Under $500",
    subtitle: "Compact fridge picks for apartments, dorms, and offices.",
    badge1: "Compact picks",
    badge2: "Freezer space",
    cta: "Compare fridges",
    theme: {
      bg1: "#062a3b",
      bg2: "#064e3b",
      bg3: "#0f766e",
      hot: "#67e8f9",
      accent: "#34d399",
      accent2: "#facc15",
      text: "#ffffff",
      muted: "#ecfeff",
      panel: "#082f49",
    },
    image: { x: 742, y: 104, width: 288, height: 448, rotate: 2, shape: "fridge" },
  },
];

if (articles.every((article) => !fs.existsSync(path.join(root, article.imagePath)))) {
  console.log("No standalone product JPGs found; keeping vector featured images.");
  process.exit(0);
}

function currentImageHref(svgFile) {
  if (!fs.existsSync(svgFile)) return null;
  const svg = fs.readFileSync(svgFile, "utf8");
  return svg.match(/<image\b[^>]*\bhref="([^"]+)"/)?.[1] ?? null;
}

function productHref(svgFile, imageFile) {
  if (fs.existsSync(imageFile)) {
    return `data:image/jpeg;base64,${fs.readFileSync(imageFile).toString("base64")}`;
  }

  const existing = currentImageHref(svgFile);
  if (existing) return existing;

  throw new Error(`Missing product image for ${path.relative(root, svgFile)}`);
}

function productStage({ key, theme, image }) {
  const cx = image.x + image.width / 2;
  const cy = image.y + image.height / 2;
  const frame =
    image.shape === "fridge"
      ? `<rect x="${image.x - 30}" y="${image.y - 24}" width="${image.width + 70}" height="${image.height + 58}" rx="40" fill="#ffffff" opacity="0.12" stroke="${theme.hot}" stroke-width="2"/>
         <rect x="${image.x - 4}" y="${image.y + image.height - 10}" width="${image.width + 16}" height="22" rx="11" fill="#020617" opacity="0.32"/>`
      : `<path d="M650 560 C710 476 826 434 1028 454 C1086 462 1126 501 1122 555 C1004 596 782 607 650 560Z" fill="#020617" opacity="0.36"/>
         <rect x="688" y="116" width="408" height="388" rx="46" fill="#ffffff" opacity="0.10" stroke="${theme.hot}" stroke-width="2"/>
         <rect x="720" y="150" width="344" height="316" rx="36" fill="#020617" opacity="0.28"/>`;

  return `
  <g transform="rotate(${image.rotate} ${cx} ${cy})">
    ${frame}
    <image href="{{${key}Image}}" x="${image.x}" y="${image.y}" width="${image.width}" height="${image.height}" preserveAspectRatio="xMidYMid meet" filter="url(#productShadow)"/>
    <path d="M${image.x - 26} ${image.y + image.height + 28} C${image.x + 70} ${image.y + image.height + 4} ${image.x + image.width - 30} ${image.y + image.height + 4} ${image.x + image.width + 52} ${image.y + image.height + 30}" stroke="${theme.hot}" stroke-width="7" stroke-linecap="round" opacity="0.8" fill="none"/>
  </g>`;
}

function svgFor(article, href) {
  const { key, title, desc, eyebrow, line1, line2, price, subtitle, badge1, badge2, cta, theme } = article;
  const product = productStage(article).replace(`{{${key}Image}}`, href);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="${key}-title ${key}-desc">
  <title id="${key}-title">${title}</title>
  <desc id="${key}-desc">${desc}</desc>
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${theme.bg1}"/>
      <stop offset="50%" stop-color="${theme.bg2}"/>
      <stop offset="100%" stop-color="${theme.bg3}"/>
    </linearGradient>
    <radialGradient id="orbHot" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${theme.hot}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${theme.hot}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orbAccent" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="pricePill" x1="0" x2="1">
      <stop offset="0%" stop-color="${theme.accent2}"/>
      <stop offset="100%" stop-color="${theme.hot}"/>
    </linearGradient>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="18" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="productShadow" x="-35%" y="-35%" width="170%" height="170%">
      <feDropShadow dx="0" dy="28" stdDeviation="24" flood-color="#020617" flood-opacity="0.5"/>
      <feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="${theme.hot}" flood-opacity="0.32"/>
    </filter>
  </defs>
  <rect width="1200" height="675" rx="0" fill="url(#bg)"/>
  <circle cx="1020" cy="110" r="240" fill="url(#orbHot)" filter="url(#softGlow)"/>
  <circle cx="695" cy="606" r="285" fill="url(#orbAccent)" filter="url(#softGlow)"/>
  <path d="M-30 514 C180 411 336 390 492 452 C630 508 768 511 910 458 C1024 416 1118 405 1230 432 L1230 700 L-30 700Z" fill="#020617" opacity="0.34"/>
  <path d="M695 42 L1130 42 L1012 617 L581 617Z" fill="#ffffff" opacity="0.08"/>
  <path d="M725 78 L1072 78 L982 585 L631 585Z" fill="none" stroke="${theme.hot}" stroke-width="2" opacity="0.38"/>
  <g opacity="0.48">
    <path d="M70 563 H626" stroke="${theme.hot}" stroke-width="2"/>
    <path d="M118 603 H706" stroke="${theme.accent}" stroke-width="2"/>
    <path d="M96 88 H436" stroke="${theme.hot}" stroke-width="2"/>
    <path d="M64 128 H326" stroke="${theme.accent}" stroke-width="2"/>
  </g>
  <g transform="translate(76 78)">
    <rect x="0" y="0" width="236" height="40" rx="20" fill="#ffffff" opacity="0.13" stroke="#ffffff" stroke-opacity="0.22"/>
    <text x="24" y="26" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="800" letter-spacing="1.8" fill="${theme.muted}">${eyebrow}</text>
    <text x="0" y="138" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="72" font-weight="900" letter-spacing="-2.8" fill="${theme.text}">${line1}</text>
    <text x="0" y="218" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="80" font-weight="900" letter-spacing="-3.2" fill="${theme.text}">${line2}</text>
    <rect x="0" y="248" width="382" height="78" rx="28" fill="url(#pricePill)"/>
    <text x="34" y="301" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="46" font-weight="900" letter-spacing="-1.2" fill="#08111f">${price}</text>
    <text x="2" y="378" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="700" fill="${theme.muted}">${subtitle}</text>
    <g transform="translate(0 420)">
      <rect x="0" y="0" width="160" height="48" rx="16" fill="#ffffff" opacity="0.14" stroke="#ffffff" stroke-opacity="0.22"/>
      <text x="80" y="31" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="800" fill="#ffffff">${badge1}</text>
      <rect x="178" y="0" width="172" height="48" rx="16" fill="#ffffff" opacity="0.14" stroke="#ffffff" stroke-opacity="0.22"/>
      <text x="264" y="31" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="800" fill="#ffffff">${badge2}</text>
    </g>
    <g transform="translate(0 494)">
      <rect x="0" y="0" width="224" height="58" rx="20" fill="#ffffff"/>
      <text x="30" y="37" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="900" fill="${theme.panel}">${cta}</text>
      <path d="M178 29 H196 M190 20 L199 29 L190 38" stroke="${theme.panel}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>
  ${product}
  <path d="M1135 610 L1180 610 L1180 655" stroke="${theme.hot}" stroke-width="6" stroke-linecap="round" opacity="0.9"/>
  <path d="M36 66 L36 28 L86 28" stroke="${theme.accent2}" stroke-width="6" stroke-linecap="round" opacity="0.75"/>
</svg>
`;
}

for (const article of articles) {
  const svgFile = path.join(root, article.svgPath);
  const imageFile = path.join(root, article.imagePath);
  fs.writeFileSync(svgFile, svgFor(article, productHref(svgFile, imageFile)));
}
