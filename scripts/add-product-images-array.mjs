const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const files = [
  "src/data/articles/best-gaming-headsets-for-under-500.ts",
  "src/data/articles/best-gaming-laptop-under-500.ts",
  "src/data/articles/refrigerator-sale-under-500.ts"
];

for (const rel of files) {
  const file = path.join(root, rel);
  let content = fs.readFileSync(file, "utf8");
  if (content.includes('"images":')) {
    console.log(`Skip (already has images): ${rel}`);
    continue;
  }
  content = content.replace(/("image": "([^"]+)"),\n/g, '$1,\n    "images": ["$2"],\n');
  fs.writeFileSync(file, content);
  const count = (content.match(/"images":/g) || []).length;
  console.log(`Updated ${rel} (${count} products)`);
}
