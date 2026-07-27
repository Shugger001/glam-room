#!/usr/bin/env node
/**
 * Push notification / payment env keys from `.env.local` to Vercel Production.
 *
 * Usage:
 *   1. Fill the keys in `.env.local` (see `.env.example`)
 *   2. Run: node scripts/push-notification-env.mjs
 *
 * Only non-empty values are uploaded. Existing Vercel values are replaced.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const KEYS = [
  "PAYSTACK_SECRET_KEY",
  "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY",
  "NEXT_PUBLIC_PAYSTACK_CURRENCY",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "SALON_NOTIFY_EMAIL",
  "SALON_NOTIFY_PHONE",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_FROM_NUMBER",
  "CRON_SECRET",
];

const envPath = resolve(process.cwd(), ".env.local");
if (!existsSync(envPath)) {
  console.error("Missing .env.local — copy .env.example and fill keys first.");
  process.exit(1);
}

const raw = readFileSync(envPath, "utf8");
const values = {};
for (const line of raw.split(/\n/)) {
  if (!line || line.trim().startsWith("#")) continue;
  const i = line.indexOf("=");
  if (i < 0) continue;
  const key = line.slice(0, i).trim();
  let val = line.slice(i + 1).trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  if (KEYS.includes(key) && val) values[key] = val;
}

const present = Object.keys(values);
const missing = KEYS.filter((k) => !values[k]);

console.log(`Ready to push ${present.length}/${KEYS.length} keys to Vercel Production.`);
if (present.length) console.log("  SET:", present.join(", "));
if (missing.length) console.log("  SKIP (empty):", missing.join(", "));

if (!present.length) {
  console.error("\nNo notification/payment keys found in .env.local.");
  console.error("Paste your Paystack / Resend / Twilio values, then re-run.");
  process.exit(1);
}

for (const [key, value] of Object.entries(values)) {
  try {
    execFileSync("vercel", ["env", "rm", key, "production", "--yes"], {
      stdio: "ignore",
    });
  } catch {
    // key may not exist yet
  }
  execFileSync("vercel", ["env", "add", key, "production"], {
    input: `${value}\n`,
    stdio: ["pipe", "inherit", "inherit"],
  });
  console.log(`✓ ${key}`);
}

console.log("\nDone. Redeploy production so the new env vars apply:");
console.log("  npm run deploy:vercel");
