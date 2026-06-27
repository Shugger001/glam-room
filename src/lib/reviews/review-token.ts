export function generateReviewToken() {
  return `rv_${crypto.randomUUID().replace(/-/g, "")}`;
}

export function reviewPageUrl(token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://glam-room-gilt.vercel.app";
  return `${base}/review?token=${encodeURIComponent(token)}`;
}
