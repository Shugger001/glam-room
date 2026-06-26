"use client";

import { useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants/brand";

type LookupResult = {
  date: string;
  time: string;
  status: string;
  service: string;
  location: string | null;
};

export function FindBookingTracker() {
  const [phone, setPhone] = useState("");
  const [nameSuffix, setNameSuffix] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<LookupResult[] | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, nameSuffix }),
      });
      const data = (await res.json()) as { bookings?: LookupResult[]; error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResults(data.bookings ?? []);
    } catch {
      setError("Something went wrong. Please try again or WhatsApp Glam Room.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section id="track-booking" background="white">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image
            src="/images/glam-red-indoor.png"
            alt="Find your Glam Room booking"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-glam-primary/70 via-glam-primary/20 to-transparent" />
        </Reveal>

        <div>
          <SectionHeader
            eyebrow="Track"
            title="Find My Booking"
            description="Phone and last 4 letters of your name"
          />
          <Reveal delay={0.1}>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="lookup-phone" className="mb-1.5 block text-sm font-medium">
                  WhatsApp / phone number
                </label>
                <input
                  id="lookup-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="024 XXX XXXX or +233 XX XXX XXXX"
                  className="w-full rounded-xl border border-glam-border px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label htmlFor="lookup-name" className="mb-1.5 block text-sm font-medium">
                  Last 4 letters of your name
                </label>
                <input
                  id="lookup-name"
                  type="text"
                  required
                  maxLength={4}
                  value={nameSuffix}
                  onChange={(e) => setNameSuffix(e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 4))}
                  placeholder="Last 4 letters of your name"
                  className="w-full rounded-xl border border-glam-border px-4 py-3 text-sm uppercase"
                />
              </div>
              <Button type="submit" variant="accent" disabled={loading} className="w-full sm:w-auto">
                {loading ? "Checking…" : "Check Status"}
              </Button>
            </form>

            {error ? (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {results && results.length > 0 ? (
              <ul className="mt-6 space-y-3">
                {results.map((booking) => (
                  <li
                    key={`${booking.date}-${booking.time}-${booking.service}`}
                    className="rounded-xl border border-glam-border bg-glam-background px-4 py-4 text-sm leading-relaxed text-glam-primary"
                  >
                    Your booking on <strong>{booking.date}</strong> at <strong>{booking.time}</strong>{" "}
                    is <strong>{booking.status}</strong>.
                    {booking.location ? (
                      <>
                        {" "}
                        Location: <strong>{booking.location}</strong>.
                      </>
                    ) : null}{" "}
                    Service: <strong>{booking.service}</strong>.
                  </li>
                ))}
              </ul>
            ) : null}

            <p className="mt-6 text-sm text-glam-muted">
              Prefer WhatsApp?{" "}
              <a href={BRAND.links.whatsapp} className="font-medium text-glam-accent hover:underline">
                Chat with Glam Room directly
              </a>
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
