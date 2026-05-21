import fs from "node:fs";
import path from "node:path";

const distDir = path.join(process.cwd(), "dist");
const failures = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (entry.isFile() && entry.name.endsWith(".html")) {
      const html = fs.readFileSync(full, "utf8");
      if (/FAQPage/.test(html)) failures.push(`FAQPage appears in ${path.relative(distDir, full)}`);
    }
  }
}

walk(distDir);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
