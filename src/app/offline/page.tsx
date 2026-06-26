import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-glam-primary px-6 text-center text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-glam-accent">
        The Glam Room
      </p>
      <h1 className="heading-display mt-6 text-3xl sm:text-4xl">You are offline</h1>
      <p className="mt-4 max-w-md text-sm text-white/65">
        Please reconnect to browse services and book your appointment.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex rounded-full bg-glam-accent px-8 py-3 text-sm font-semibold text-glam-primary"
      >
        Try Again
      </Link>
    </div>
  );
}
