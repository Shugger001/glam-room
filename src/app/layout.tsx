import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { AnalyticsScripts } from "@/components/analytics/analytics-scripts";
import { AppProviders } from "@/components/providers/app-providers";
import { BRAND } from "@/lib/constants/brand";
import { MARKET } from "@/lib/constants/market";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3100"),
  title: {
    default: `${BRAND.fullName} — Luxury Hair & Beauty Salon · ${MARKET.city}`,
    template: `%s · ${BRAND.name}`,
  },
  description: `${BRAND.fullName} — ${BRAND.copy.heroSubtitle}. Hair reset, installs, and braids in Adenta and Sowutuom, Accra.`,
  applicationName: BRAND.fullName,
  keywords: [
    "luxury salon",
    "hair salon Accra",
    "beauty salon Ghana",
    "wig installation",
    "bridal makeup",
    "hair styling",
    "braids",
    "The Glam Room",
  ],
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
  manifest: "/manifest.json",
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "en_GH",
    siteName: BRAND.fullName,
    title: `${BRAND.fullName} — Luxury Hair & Beauty`,
    description: `Where beauty meets confidence. Premium hair and beauty services in ${MARKET.city}, ${MARKET.country}.`,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${BRAND.fullName} — Luxury Hair & Beauty Salon`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND.fullName,
    description: `Luxury hair and beauty salon in ${MARKET.city}. Book your appointment today.`,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F5F2" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0F0F" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={MARKET.htmlLocale}
      className={`${dmSans.variable} ${cormorant.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <AnalyticsScripts />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
