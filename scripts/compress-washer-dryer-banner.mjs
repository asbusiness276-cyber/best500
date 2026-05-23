import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const assetSrc =
  "C:/Users/DELL Latitude/.cursor/projects/c-Users-DELL-Latitude-Desktop-best-500/assets/c__Users_DELL_Latitude_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-ab39a337-699b-4753-acf6-5ec0292126b9.png";
const out = path.join(root, "public/images/featured-washer-dryer.webp");
const input = [assetSrc].find((file) => fs.existsSync(file));

if (!input) {
  throw new Error("No washer-dryer source image found for WebP compression.");
}

const info = await sharp(input)
  .resize(1200, 675, { fit: "cover", position: "centre" })
  .webp({ quality: 82, effort: 6 })
  .toFile(out);

console.log(JSON.stringify({ input, out, ...info }));
