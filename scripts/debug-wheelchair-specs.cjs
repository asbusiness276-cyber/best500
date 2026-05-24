const fs = require("node:fs");
const path = require("node:path");

// Load only the helper functions by requiring the import script's logic inline
const csvPath = "c:\\Users\\DELL Latitude\\Desktop\\Shift\\New Article - Sheet1 (15).csv";

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
      } else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      if (row.some((item) => item.trim())) rows.push(row);
      row = [];
      field = "";
    } else field += char;
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

const [headers, ...rows] = parseCsv(fs.readFileSync(csvPath, "utf8"));
const h = Object.fromEntries(headers.map((header, index) => [header.trim(), index]));
const row = rows.find((r) => clean(r[h.ASIN]) === "B0FHW1J155");
const title = clean(row[h.Title]);
const bullets = clean(row[h["Bullet Features"]])
  .split(/\n/)
  .map((item) => item.trim())
  .filter((item) => item.length > 40);
console.log("Title snippet:", title.slice(0, 80));
console.log("Bullet count:", bullets.length);
console.log("Has 390:", bullets.some((b) => b.includes("390")));
console.log("Has 39lbs:", bullets.some((b) => /39\s*lbs/i.test(b)));

const source = `${title} ${bullets.join(" ")}`;
const cap = source.match(/(\d{3})\s*(?:lbs?|lb)\s*(?:weight\s*)?capacity/i);
console.log("Capacity match:", cap && cap[0], cap && cap[1]);
const wt = source.match(/(?:weighing|weighs)\s*(?:only\s*)?(\d{2,3})\s*(?:lbs?|lb)/i);
console.log("Weight match:", wt && wt[0], wt && wt[1]);
const idx = source.indexOf("390");
console.log("390 chars:", idx >= 0 ? [...source.slice(idx, idx + 8)].map((c) => c.charCodeAt(0)) : "not found");
