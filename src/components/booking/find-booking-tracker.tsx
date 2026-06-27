"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants/brand";
import { BOOKING_TIME_SLOTS } from "@/lib/validation/booking";

type LookupResult = {
  id: string;
  date: string;
  time: string;
  status: string;
  service: string;
  location: string | null;
  start_at: string;
  booking_date: string;
  booking_time: string;
  can_manage: boolean;
};

export function FindBookingTracker() {
  const [phone, setPhone] = useState("");
  const [nameSuffix, setNameSuffix] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<LookupResult[] | null>(null);
  const [managingId, setManagingId] = useState<string | null>(null);
  const [rescheduleFor, setRescheduleFor] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  async function lookupBookings() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, nameSuffix }),
      });
      const data = (await res.json()) as { bookings?: LookupResult[]; error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setResults(null);
        return;
      }
      setResults(data.bookings ?? []);
      setError(null);
    } catch {
      setError("Something went wrong. Please try again or WhatsApp Glam Room.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRescheduleFor(null);
    await lookupBookings();
  }

  async function cancelBooking(bookingId: string) {
    if (!window.confirm("Cancel this booking? You can rebook anytime on WhatsApp.")) return;

    setManagingId(bookingId);
    try {
      const res = await fetch("/api/bookings/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", bookingId, phone, nameSuffix }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Could not cancel booking.");
        return;
      }
      toast.success("Booking cancelled.");
      setResults((prev) => prev?.filter((b) => b.id !== bookingId) ?? null);
    } catch {
      toast.error("Could not cancel booking. Please WhatsApp us.");
    } finally {
      setManagingId(null);
    }
  }

  async function rescheduleBooking(bookingId: string) {
    if (!newDate || !newTime) {
      toast.error("Pick a new date and time.");
      return;
    }

    setManagingId(bookingId);
    try {
      const res = await fetch("/api/bookings/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reschedule",
          bookingId,
          phone,
          nameSuffix,
          bookingDate: newDate,
          bookingTime: newTime,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; start_at?: string };
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Could not reschedule.");
        return;
      }
      toast.success("Booking rescheduled!");
      setRescheduleFor(null);
      setNewDate("");
      setNewTime("");
      await lookupBookings();
    } catch {
      toast.error("Could not reschedule. Please WhatsApp us.");
    } finally {
      setManagingId(null);
    }
  }

  return (
    <Section id="track-booking" background="white">
      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="order-1 lg:order-2">
          <SectionHeader
            eyebrow="Track"
            title="Find My Booking"
            description="Check status, cancel, or reschedule with your phone and last 4 letters of your name."
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
              <ul className="mt-6 space-y-4">
                {results.map((booking) => (
                  <li
                    key={booking.id}
                    className="rounded-xl border border-glam-border bg-glam-background px-4 py-4 text-sm leading-relaxed text-glam-primary"
                  >
                    <p>
                      <strong>{booking.service}</strong> · {booking.date} at {booking.time}
                    </p>
                    <p className="mt-1 text-glam-muted">
                      Status: <strong>{booking.status}</strong>
                      {booking.location ? <> · {booking.location}</> : null}
                    </p>

                    {booking.can_manage ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={managingId === booking.id}
                          onClick={() => {
                            setRescheduleFor(rescheduleFor === booking.id ? null : booking.id);
                            setNewDate(booking.booking_date);
                            setNewTime(booking.booking_time);
                          }}
                        >
                          Reschedule
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={managingId === booking.id}
                          onClick={() => void cancelBooking(booking.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : null}

                    {rescheduleFor === booking.id ? (
                      <div className="mt-4 grid gap-3 rounded-lg border border-glam-border bg-white p-3 sm:grid-cols-2">
                        <label className="block text-xs font-medium">
                          New date
                          <input
                            type="date"
                            min={new Date().toISOString().slice(0, 10)}
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-glam-border px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="block text-xs font-medium">
                          New time
                          <select
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-glam-border px-3 py-2 text-sm"
                          >
                            {BOOKING_TIME_SLOTS.map((slot) => (
                              <option key={slot.value} value={slot.value}>
                                {slot.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className="sm:col-span-2">
                          <Button
                            type="button"
                            variant="accent"
                            size="sm"
                            disabled={managingId === booking.id}
                            onClick={() => void rescheduleBooking(booking.id)}
                          >
                            {managingId === booking.id ? "Saving…" : "Confirm new time"}
                          </Button>
                        </div>
                      </div>
                    ) : null}
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

        <Reveal className="relative order-2 aspect-[4/3] overflow-hidden rounded-2xl lg:order-1">
          <ParallaxImage
            src="/images/glam-red-indoor.png"
            alt="Find your Glam Room booking"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="absolute inset-0"
            yRange={["-6%", "6%"]}
            scaleRange={[1.06, 1.12]}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-glam-primary/70 via-glam-primary/20 to-transparent" />
        </Reveal>
      </div>
    </Section>
  );
}
