import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const assetSrc =
  process.argv[2] ||
  "C:/Users/DELL Latitude/.cursor/projects/c-Users-DELL-Latitude-Desktop-best-500/assets/c__Users_DELL_Latitude_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-a9abbccf-69a7-4ef3-97ac-700ca966b751.png";
const fallbackUrl =
  "https://m.media-amazon.com/images/I/710dtKK8FfL._AC_SL1500_.jpg";
const out = path.join(root, "public/images/featured-watches.webp");

let input = assetSrc;
if (!fs.existsSync(input)) {
  const response = await fetch(process.argv[2] || fallbackUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch banner source: ${response.status}`);
  }
  input = Buffer.from(await response.arrayBuffer());
}

const info = await sharp(input)
  .resize(1200, 675, { fit: "cover", position: "centre" })
  .webp({ quality: 82, effort: 6 })
  .toFile(out);

console.log(JSON.stringify({ input: typeof input === "string" ? input : "buffer", out, ...info }));
