"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";
import { Button, ButtonLink } from "@/components/ui/button";
import { BRAND } from "@/lib/constants/brand";
import { buildWhatsAppDeepLink } from "@/lib/notifications/whatsapp-links";
import { cn } from "@/lib/utils/cn";
import { BOOKING_TIME_SLOTS } from "@/lib/validation/booking";
import type { BookingTimeSlot } from "@/lib/data/live-site-content";

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

const inputClass =
  "w-full border border-glam-border bg-glam-secondary px-4 py-3 text-sm outline-none transition duration-200 focus:border-glam-accent focus:ring-2 focus:ring-glam-accent/20";

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: "Pending",
    awaiting_approval: "Awaiting confirmation",
    confirmed: "Confirmed",
    arrived: "Checked in",
    completed: "Completed",
    cancelled: "Cancelled",
    rejected: "Not available",
    no_show: "Missed",
  };
  return map[status] ?? status.replaceAll("_", " ");
}

function statusTone(status: string) {
  if (status === "confirmed" || status === "arrived" || status === "completed") {
    return "text-glam-accent";
  }
  if (status === "cancelled" || status === "rejected" || status === "no_show") {
    return "text-red-700";
  }
  return "text-amber-800";
}

export function FindBookingTracker({
  timeSlots = BOOKING_TIME_SLOTS,
  showHeader = true,
}: {
  timeSlots?: ReadonlyArray<BookingTimeSlot>;
  showHeader?: boolean;
}) {
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
        setError(data.error ?? "Could not look up your booking. Please try again.");
        setResults(null);
        return;
      }
      setResults(data.bookings ?? []);
      setError(null);
    } catch {
      setError("Could not look up your booking. Please try again or WhatsApp Glam Room.");
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
      toast.success("Booking rescheduled.");
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

  const helpWhatsApp = buildWhatsAppDeepLink(
    BRAND.links.phone,
    `Hi Glam Room! I need help with my booking. Phone: ${phone || "(add number)"}.`,
  );

  return (
    <Section
      id="track-booking"
      background="default"
      className={cn(!showHeader && "!pt-0")}
    >
      <div className="mx-auto max-w-lg">
        {showHeader ? (
          <div className="mb-8">
            <p className="font-[family-name:var(--font-cormorant)] text-lg italic text-glam-muted">
              Track
            </p>
            <h2 className="heading-display mt-1 text-3xl text-glam-primary sm:text-4xl">
              Find my booking
            </h2>
            <p className="mt-3 text-sm text-glam-muted">
              Phone plus the last 4 letters of your name.
            </p>
          </div>
        ) : null}

        <Reveal delay={0.05}>
          <form
            onSubmit={onSubmit}
            className="space-y-4 border border-glam-border/70 bg-glam-secondary p-5 sm:p-6"
          >
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
                className={inputClass}
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
                onChange={(e) =>
                  setNameSuffix(e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 4))
                }
                placeholder="Last 4 letters of your name"
                className={cn(inputClass, "uppercase")}
              />
            </div>
            <Button
              type="submit"
              variant="accent"
              disabled={loading}
              className="w-full !rounded-none sm:w-auto"
            >
              {loading ? "Checking…" : "Check status"}
            </Button>
          </form>

          {error ? (
            <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p>{error}</p>
              {helpWhatsApp ? (
                <a href={helpWhatsApp} className="mt-2 inline-block font-medium underline">
                  Message Glam Room on WhatsApp
                </a>
              ) : null}
            </div>
          ) : null}

          {results && results.length === 0 ? (
            <div className="mt-4 border border-glam-border bg-glam-background px-4 py-5 text-sm text-glam-muted">
              <p>No bookings found for that phone and name.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <ButtonLink href="/book" variant="accent" size="sm" className="!rounded-none">
                  Book now
                </ButtonLink>
                {helpWhatsApp ? (
                  <a
                    href={helpWhatsApp}
                    className="inline-flex min-h-10 items-center border border-glam-border px-4 text-sm font-medium text-glam-primary transition hover:border-glam-accent hover:text-glam-accent"
                  >
                    WhatsApp help
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}

          {results && results.length > 0 ? (
            <ul className="mt-6 space-y-3">
              {results.map((booking) => {
                const supportLink = buildWhatsAppDeepLink(
                  BRAND.links.phone,
                  `Hi Glam Room! I'm checking on my ${booking.service} on ${booking.date} at ${booking.time}${booking.location ? ` (${booking.location})` : ""}. Status shows ${statusLabel(booking.status)}.`,
                );

                return (
                  <li
                    key={booking.id}
                    className="border border-glam-border bg-glam-secondary px-4 py-4 text-sm leading-relaxed text-glam-primary"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p>
                        <strong>{booking.service}</strong>
                        <span className="text-glam-muted">
                          {" "}
                          · {booking.date} at {booking.time}
                        </span>
                      </p>
                      <span
                        className={cn(
                          "text-xs font-semibold uppercase tracking-wider",
                          statusTone(booking.status),
                        )}
                      >
                        {statusLabel(booking.status)}
                      </span>
                    </div>
                    {booking.location ? (
                      <p className="mt-1 text-glam-muted">{booking.location}</p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {booking.can_manage ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="!rounded-none"
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
                            className="!rounded-none"
                            disabled={managingId === booking.id}
                            onClick={() => void cancelBooking(booking.id)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : null}
                      {supportLink ? (
                        <a
                          href={supportLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-9 items-center border border-glam-border px-3 text-xs font-semibold uppercase tracking-wider text-glam-primary transition hover:border-glam-accent hover:text-glam-accent"
                        >
                          WhatsApp
                        </a>
                      ) : null}
                    </div>

                    {rescheduleFor === booking.id ? (
                      <div className="mt-4 grid gap-3 border border-glam-border bg-glam-background p-3 sm:grid-cols-2">
                        <label className="block text-xs font-medium">
                          New date
                          <input
                            type="date"
                            min={new Date().toISOString().slice(0, 10)}
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="mt-1 w-full border border-glam-border px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="block text-xs font-medium">
                          New time
                          <select
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="mt-1 w-full border border-glam-border px-3 py-2 text-sm"
                          >
                            {timeSlots.map((slot) => (
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
                            className="!rounded-none"
                            disabled={managingId === booking.id}
                            onClick={() => void rescheduleBooking(booking.id)}
                          >
                            {managingId === booking.id ? "Saving…" : "Confirm new time"}
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}

          <p className="mt-6 text-sm text-glam-muted">
            Prefer WhatsApp?{" "}
            <a
              href={helpWhatsApp ?? BRAND.links.whatsapp}
              className="font-medium text-glam-accent hover:underline"
            >
              Chat with Glam Room
            </a>
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
