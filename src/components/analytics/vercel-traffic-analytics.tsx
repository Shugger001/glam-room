import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

/** Vercel Web Analytics + Speed Insights — no env keys required once enabled in the project. */
export function VercelTrafficAnalytics() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
