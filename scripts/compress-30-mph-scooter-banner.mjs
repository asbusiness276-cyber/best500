import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input =
  process.argv[2] ||
  "C:\\Users\\PC\\.cursor\\projects\\c-Users-PC-Desktop-best500\\assets\\c__Users_PC_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-4192bcf4-fa08-45b1-b9a9-92fb566d1963.png";
const out = path.join(root, "public/images/featured-30-mph-electric-scooter.webp");

if (!fs.existsSync(input)) {
  console.error("Featured image not found:", input);
  process.exit(1);
}

const info = await sharp(input)
  .resize(1200, null, { withoutEnlargement: true })
  .webp({ quality: 82, effort: 6 })
  .toFile(out);

console.log(`Wrote ${out} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB)`);
