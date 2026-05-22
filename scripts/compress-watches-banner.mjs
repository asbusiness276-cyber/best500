import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const imageUrl =
  process.argv[2] ||
  "https://m.media-amazon.com/images/I/710dtKK8FfL._AC_SL1500_.jpg";
const out = path.join(root, "public/images/featured-watches.webp");

const response = await fetch(imageUrl);
if (!response.ok) {
  throw new Error(`Failed to fetch banner source: ${response.status}`);
}

const buffer = Buffer.from(await response.arrayBuffer());
const info = await sharp(buffer)
  .resize(1200, 675, { fit: "cover", position: "centre" })
  .webp({ quality: 82, effort: 6 })
  .toFile(out);

console.log(JSON.stringify({ imageUrl, out, ...info }));
