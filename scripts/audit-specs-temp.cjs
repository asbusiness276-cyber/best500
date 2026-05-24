const fs = require("node:fs");
const path = require("node:path");

const src = fs.readFileSync(
  path.join(process.cwd(), "src/data/articles/best-electric-wheelchair-under-500.ts"),
  "utf8"
);
const m = src.match(/Product\[\] = (\[[\s\S]*?\]);/);
if (!m) {
  console.log("no match");
  process.exit(1);
}
const products = JSON.parse(m[1]);
const cols = ["Capacity", "Range", "Foldable", "Motor", "Weight"];

function specVal(specs, label) {
  const s = specs.find((x) => x.toLowerCase().startsWith(label.toLowerCase()));
  if (!s) return "MISSING";
  const c = s.indexOf(":");
  return c >= 0 ? s.slice(c + 1).trim() : s;
}

let full = 0;
let partial = 0;
const missing = {};

products.forEach((p) => {
  let miss = 0;
  cols.forEach((c) => {
    const v = specVal(p.specs, c);
    if (v === "MISSING") {
      missing[c] = (missing[c] || 0) + 1;
      miss++;
    }
  });
  if (miss === 0) full++;
  else partial++;
});

console.log("Products:", products.length, "Full:", full, "Partial:", partial);
console.log("Missing by column:", missing);
