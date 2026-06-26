/**
 * White → transparent, then trim. Overwrites kabuki-logo-trimmed.png
 * Run: npm run build:logo
 */
import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const input = path.join(root, "public/brand/kabuki-logo.png");
const output = path.join(root, "public/brand/kabuki-logo-trimmed.png");

/* Lower = more aggressive (removes off-white halos); raise if bronze gets eaten */
const threshold = 244;

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

for (let i = 0; i < data.length; i += channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (r >= threshold && g >= threshold && b >= threshold) {
    data[i + 3] = 0;
  }
}

const buf = await sharp(data, { raw: { width, height, channels: 4 } }).png().toBuffer();

await sharp(buf).trim().png().toFile(output);

const meta = await sharp(output).metadata();
console.log("Wrote", output, `(${meta.width}×${meta.height})`);
