/**
 * Regenerate public/brand assets and PWA icons from the master logo file.
 *
 * Usage: node scripts/generate-brand-assets.mjs [path-to-master-logo]
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const defaultSource = path.join(
  root,
  "../.cursor/projects/Users-shugger-dadie-Glam-room/assets/Glam_room-3de4c7e3-1ddd-4d82-bafe-00ec971f67a6.png",
);

const sourcePath = path.resolve(process.argv[2] ?? defaultSource);
const brandDir = path.join(root, "public/brand");
const iconsDir = path.join(root, "public/icons");

const REGIONS = {
  monogram: { left: 380, top: 260, width: 264, height: 240 },
  wordmark: { left: 12, top: 578, width: 1000, height: 175 },
  lockup: { left: 12, top: 260, width: 1000, height: 500 },
};

function isBackgroundCandidate(r, g, b) {
  return r <= 8 && g <= 8 && b <= 8;
}

function isLogoPixel(r, g, b) {
  const max = Math.max(r, g, b);
  if (max > 8) return true;
  // Preserve dark maroon monogram strokes.
  return r >= 12 && r > g + 4 && r > b + 4;
}

function buildBackgroundMask(data, width, height, channels) {
  const size = width * height;
  const mask = new Uint8Array(size);
  const queue = [];

  const tryPush = (x, y) => {
    const idx = y * width + x;
    if (mask[idx]) return;
    const i = idx * channels;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (isLogoPixel(r, g, b)) return;
    if (!isBackgroundCandidate(r, g, b)) return;
    mask[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.pop();
    const x = idx % width;
    const y = (idx - x) / width;

    if (x > 0) tryPush(x - 1, y);
    if (x < width - 1) tryPush(x + 1, y);
    if (y > 0) tryPush(x, y - 1);
    if (y < height - 1) tryPush(x, y + 1);
  }

  return mask;
}

function fillDarkForeground(data, width, height, channels, backgroundMask) {
  const pixelCount = width * height;

  for (let pass = 0; pass < 4; pass++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (backgroundMask[idx]) continue;

        const i = idx * channels;
        const max = Math.max(data[i], data[i + 1], data[i + 2]);
        if (max > 24) continue;

        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let count = 0;

        for (let ny = Math.max(0, y - 2); ny <= Math.min(height - 1, y + 2); ny++) {
          for (let nx = Math.max(0, x - 2); nx <= Math.min(width - 1, x + 2); nx++) {
            const nIdx = ny * width + nx;
            if (backgroundMask[nIdx]) continue;
            const ni = nIdx * channels;
            const nMax = Math.max(data[ni], data[ni + 1], data[ni + 2]);
            if (nMax < 30) continue;
            sumR += data[ni];
            sumG += data[ni + 1];
            sumB += data[ni + 2];
            count++;
          }
        }

        if (count === 0) continue;

        data[i] = Math.round(sumR / count);
        data[i + 1] = Math.round(sumG / count);
        data[i + 2] = Math.round(sumB / count);
      }
    }
  }
}

function trimToContent(data, width, height, channels, backgroundMask, padding = 24) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (backgroundMask[idx]) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(width - 1, maxX + padding);
  maxY = Math.min(height - 1, maxY + padding);

  const nextWidth = maxX - minX + 1;
  const nextHeight = maxY - minY + 1;
  const trimmed = Buffer.alloc(nextWidth * nextHeight * channels);
  const trimmedMask = new Uint8Array(nextWidth * nextHeight);

  for (let y = 0; y < nextHeight; y++) {
    for (let x = 0; x < nextWidth; x++) {
      const srcIdx = (y + minY) * width + (x + minX);
      const dstIdx = y * nextWidth + x;
      const srcI = srcIdx * channels;
      const dstI = dstIdx * channels;
      trimmed[dstI] = data[srcI];
      trimmed[dstI + 1] = data[srcI + 1];
      trimmed[dstI + 2] = data[srcI + 2];
      trimmed[dstI + 3] = data[srcI + 3];
      trimmedMask[dstIdx] = backgroundMask[srcIdx];
    }
  }

  return {
    data: trimmed,
    width: nextWidth,
    height: nextHeight,
    backgroundMask: trimmedMask,
  };
}

async function makeTransparentPipeline(
  input,
  {
    lightenForLightBg = false,
    trim = true,
    padding = 24,
    brightStrokesOnly = false,
    minLuminance = 100,
  } = {},
) {
  const { data, info } = await input
    .clone()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let workingData = Buffer.from(data);
  let width = info.width;
  let height = info.height;
  let backgroundMask = buildBackgroundMask(workingData, width, height, info.channels);

  if (!brightStrokesOnly) {
    fillDarkForeground(workingData, width, height, info.channels, backgroundMask);
  }

  if (trim) {
    const trimmed = trimToContent(workingData, width, height, info.channels, backgroundMask, padding);
    workingData = trimmed.data;
    width = trimmed.width;
    height = trimmed.height;
    backgroundMask = trimmed.backgroundMask;
  }

  for (let pixel = 0; pixel < backgroundMask.length; pixel++) {
    const i = pixel * info.channels;
    if (backgroundMask[pixel]) {
      workingData[i + 3] = 0;
      continue;
    }

    const max = Math.max(workingData[i], workingData[i + 1], workingData[i + 2]);

    if (brightStrokesOnly && max < minLuminance) {
      workingData[i + 3] = 0;
      continue;
    }

    workingData[i + 3] = 255;

    if (brightStrokesOnly) {
      const scale = 235 / Math.max(max, 1);
      workingData[i] = Math.min(255, Math.round(workingData[i] * scale + 10));
      workingData[i + 1] = Math.min(255, Math.round(workingData[i + 1] * scale + 10));
      workingData[i + 2] = Math.min(255, Math.round(workingData[i + 2] * scale + 10));
      continue;
    }

    if (lightenForLightBg) {
      const r = workingData[i];
      const lift = r < 80 ? 1.85 : 1.15;
      workingData[i] = Math.min(255, Math.round(r * lift));
      workingData[i + 1] = Math.min(255, Math.round(workingData[i + 1] * lift));
      workingData[i + 2] = Math.min(255, Math.round(workingData[i + 2] * lift));
    }
  }

  return sharp(workingData, {
    raw: { width, height, channels: info.channels },
  }).png();
}

async function loadSource() {
  return sharp(sourcePath).ensureAlpha();
}

async function writePNG(pipeline, target, { width, height, fit = "contain", background } = {}) {
  let out = pipeline.clone();
  if (width || height) {
    out = out.resize(width, height, {
      fit,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }
  await out.toFile(target);
}

async function writeWordmark(sourcePipeline, target, { lighten = false, width, height, brightStrokesOnly = false, minLuminance = 100 } = {}) {
  const transparent = await makeTransparentPipeline(
    sourcePipeline.clone().extract(REGIONS.wordmark),
    { lightenForLightBg: lighten, trim: true, padding: 8, brightStrokesOnly, minLuminance },
  );
  await writePNG(transparent, target, width || height ? { width, height } : undefined);
  return transparent.metadata();
}

async function main() {
  await mkdir(brandDir, { recursive: true });
  await mkdir(iconsDir, { recursive: true });

  const source = await loadSource();
  const transparentFull = await makeTransparentPipeline(source, { trim: false });
  const transparentLightFull = await makeTransparentPipeline(source, {
    lightenForLightBg: true,
    trim: false,
  });
  const transparent = await makeTransparentPipeline(source);
  const transparentLight = await makeTransparentPipeline(source, { lightenForLightBg: true });
  const transparentMeta = await transparent.metadata();

  // Master lockup — transparent PNG used across the site.
  await transparent.clone().toFile(path.join(brandDir, "glam-room-logo.png"));

  await writePNG(transparent, path.join(brandDir, "glam-room-logo-hero.png"));
  await writePNG(transparent, path.join(brandDir, "glam-room-logo-nav.png"));
  await writePNG(transparent, path.join(brandDir, "glam-room-logo-transparent-dark.png"));
  await writePNG(transparentLight, path.join(brandDir, "glam-room-logo-transparent-light.png"));

  const heroBright = await makeTransparentPipeline(source.clone().extract(REGIONS.wordmark), {
    lightenForLightBg: true,
    trim: true,
    padding: 8,
  });
  await heroBright.clone().toFile(path.join(brandDir, "glam-room-logo-hero-bright.png"));
  const heroBrightMeta = await heroBright.metadata();

  await writePNG(
    transparentFull.clone().extract(REGIONS.lockup),
    path.join(brandDir, "glam-room-header.png"),
    { width: 834, height: 890 },
  );

  await writePNG(
    source.clone().extract(REGIONS.wordmark),
    path.join(brandDir, "glam-room-wordmark.png"),
    { width: 884, height: 340, background: { r: 0, g: 0, b: 0, alpha: 1 } },
  );

  const wordmarkDarkMeta = await writeWordmark(transparentFull, path.join(brandDir, "glam-room-wordmark-dark.png"), {
    width: 864,
    height: 123,
  });
  const wordmarkLightMeta = await writeWordmark(
    transparentLightFull,
    path.join(brandDir, "glam-room-wordmark-light.png"),
    { lighten: true, width: 864, height: 123 },
  );
  const navWordmarkDarkMeta = await writeWordmark(
    transparentFull,
    path.join(brandDir, "glam-room-logo-dark.png"),
    { lighten: true, width: 784, height: 142 },
  );
  const navWordmarkLightMeta = await writeWordmark(
    transparentLightFull,
    path.join(brandDir, "glam-room-logo-light.png"),
    { lighten: true, width: 784, height: 142 },
  );

  await writePNG(
    transparentFull.clone().extract(REGIONS.monogram),
    path.join(brandDir, "glam-room-mark.png"),
    { width: 150, height: 150 },
  );
  await writeWordmark(transparentLightFull, path.join(brandDir, "glam-room-mark-light.png"), {
    lighten: true,
    width: 629,
    height: 24,
  });

  const iconBackground = { r: 248, g: 245, b: 242, alpha: 1 };
  const iconWordmark = await makeTransparentPipeline(
    source.clone().extract(REGIONS.wordmark),
    { lightenForLightBg: true, trim: true, padding: 8, brightStrokesOnly: true, minLuminance: 80 },
  );

  // PWA icons — wordmark on brand cream (reads clearly at small sizes).
  await iconWordmark
    .clone()
    .resize(168, 56, {
      fit: "contain",
      background: iconBackground,
    })
    .extend({
      top: 68,
      bottom: 68,
      left: 12,
      right: 12,
      background: iconBackground,
    })
    .png()
    .toFile(path.join(iconsDir, "icon-192.png"));
  await iconWordmark
    .clone()
    .resize(448, 150, {
      fit: "contain",
      background: iconBackground,
    })
    .extend({
      top: 181,
      bottom: 181,
      left: 32,
      right: 32,
      background: iconBackground,
    })
    .png()
    .toFile(path.join(iconsDir, "icon-512.png"));

  console.log(`Generated brand assets from ${sourcePath}`);
  console.log(`Hero bright lockup: ${heroBrightMeta.width}x${heroBrightMeta.height}`);
  console.log(`Nav wordmark dark: ${navWordmarkDarkMeta.width}x${navWordmarkDarkMeta.height}`);
  console.log(`Nav wordmark light: ${navWordmarkLightMeta.width}x${navWordmarkLightMeta.height}`);
  console.log(`Wordmark dark: ${wordmarkDarkMeta.width}x${wordmarkDarkMeta.height}`);
  console.log(`Wordmark light: ${wordmarkLightMeta.width}x${wordmarkLightMeta.height}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
