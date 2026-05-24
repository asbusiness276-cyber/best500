import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input =
  process.argv[2] ||
  "C:\\Users\\DELL Latitude\\.cursor\\projects\\c-Users-DELL-Latitude-Desktop-best-500\\assets\\c__Users_DELL_Latitude_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-766312af-cc36-445c-a49b-d778b4b3cd08.png";
const out = path.join(root, "public/images/featured-barbecue-grill.webp");

if (!fs.existsSync(input)) {
  console.error("Featured image not found:", input);
  process.exit(1);
}

const info = await sharp(input)
  .resize(1200, null, { withoutEnlargement: true })
  .webp({ quality: 82, effort: 6 })
  .toFile(out);

console.log(`Wrote ${out} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB)`);
