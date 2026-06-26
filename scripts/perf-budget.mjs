import fs from "fs";
import path from "path";

const buildManifestPath = path.join(process.cwd(), ".next", "build-manifest.json");
if (!fs.existsSync(buildManifestPath)) {
  console.error("Missing .next/build-manifest.json. Run `npm run build` first.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(buildManifestPath, "utf8"));
const appEntries = [
  ...(manifest.polyfillFiles ?? []),
  ...(manifest.rootMainFiles ?? []),
  ...(manifest.lowPriorityFiles ?? []),
  ...Object.values(manifest.pages ?? {}).flat(),
];
const uniqueAssets = [...new Set(appEntries)];
let totalBytes = 0;

for (const asset of uniqueAssets) {
  const normalized = String(asset).replace(/^\/+/, "").replace(/^_next\//, "");
  const fullPath = path.join(process.cwd(), ".next", normalized);
  if (fs.existsSync(fullPath)) totalBytes += fs.statSync(fullPath).size;
}

const maxBytes = 3_500_000;
if (totalBytes > maxBytes) {
  console.error(`Performance budget exceeded: ${totalBytes} bytes > ${maxBytes} bytes`);
  process.exit(1);
}

console.log(`Performance budget pass: ${totalBytes} bytes <= ${maxBytes} bytes`);
