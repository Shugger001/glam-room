"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";
import { BRAND } from "@/lib/constants/brand";
import { SALON_LOCATIONS, type SalonLocation } from "@/lib/constants/locations";
import type { BookingTimeSlot } from "@/lib/data/live-site-content";
import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_ORDER,
  filterServicesForLocation,
  serviceAvailableAtLocation,
  type SalonService,
} from "@/lib/constants/services";
import {
  MAX_BOOKINGS_PER_SHOP_PER_DAY,
  MAX_BOOKINGS_PER_SLOT,
} from "@/lib/booking/availability";
import { computeDepositAmount } from "@/lib/booking/deposit";
import type { LiveStaff } from "@/lib/data/live-staff";
import { formatShopPrice } from "@/lib/format/money";
import {
  BOOKING_TIME_SLOTS,
  guestBookingSchema,
  type GuestBookingValues,
} from "@/lib/validation/booking";
import { cn } from "@/lib/utils/cn";

type BookingFormProps = {
  services: SalonService[];
  staff: LiveStaff[];
  locations?: SalonLocation[];
  timeSlots?: ReadonlyArray<BookingTimeSlot>;
  braidsNotice?: string;
  initialStaffId?: string;
  initialServiceId?: string;
  initialLocationId?: string;
  paystackEnabled?: boolean;
};

function findCategoryForService(services: SalonService[], serviceId?: string) {
  if (!serviceId) return "";
  return services.find((s) => s.id === serviceId)?.category ?? "";
}

export function BookingForm({
  services,
  staff,
  locations = SALON_LOCATIONS,
  timeSlots = BOOKING_TIME_SLOTS,
  braidsNotice = BRAND.copy.braidsNotice,
  initialStaffId,
  initialServiceId,
  initialLocationId,
  paystackEnabled = false,
}: BookingFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dateFullyBooked, setDateFullyBooked] = useState(false);
  const [checkingDateCapacity, setCheckingDateCapacity] = useState(false);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    deposit_amount: number;
    savings: number;
    label: string;
  } | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState(
    initialStaffId && staff.some((s) => s.id === initialStaffId)
      ? initialStaffId
      : staff[0]?.id ?? "",
  );
  const lastCapacityToastKey = useRef("");

  const resolvedLocationId =
    initialLocationId && locations.some((l) => l.id === initialLocationId)
      ? initialLocationId
      : "";
  const resolvedServiceId =
    initialServiceId && services.some((s) => s.id === initialServiceId)
      ? initialServiceId
      : "";

  const form = useForm<GuestBookingValues>({
    resolver: zodResolver(guestBookingSchema),
    defaultValues: {
      locationId: resolvedLocationId,
      category: findCategoryForService(services, resolvedServiceId),
      serviceId: resolvedServiceId,
      bookingDate: "",
      bookingTime: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientNotes: "",
      promoCode: "",
    },
  });

  const locationId = useWatch({ control: form.control, name: "locationId" });
  const category = useWatch({ control: form.control, name: "category" });
  const serviceId = useWatch({ control: form.control, name: "serviceId" });
  const bookingDate = useWatch({ control: form.control, name: "bookingDate" });
  const bookingTime = useWatch({ control: form.control, name: "bookingTime" });
  const clientName = useWatch({ control: form.control, name: "clientName" });
  const clientPhone = useWatch({ control: form.control, name: "clientPhone" });
  const promoCode = useWatch({ control: form.control, name: "promoCode" });

  const categoriesInCatalog = useMemo(() => {
    const scoped = filterServicesForLocation(services, locationId || null);
    const present = new Set(scoped.map((s) => s.category));
    return SERVICE_CATEGORY_ORDER.filter((c) => present.has(c));
  }, [services, locationId]);

  const stylesForCategory = useMemo(() => {
    const scoped = filterServicesForLocation(services, locationId || null);
    return scoped.filter((s) => s.category === category);
  }, [services, category, locationId]);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId],
  );

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === locationId),
    [locationId, locations],
  );

  useEffect(() => {
    if (!resolvedServiceId) return;
    const cat = findCategoryForService(services, resolvedServiceId);
    if (cat) form.setValue("category", cat);
    form.setValue("serviceId", resolvedServiceId);
  }, [resolvedServiceId, services, form]);

  useEffect(() => {
    if (!locationId) return;
    if (category && !categoriesInCatalog.includes(category as (typeof SERVICE_CATEGORY_ORDER)[number])) {
      form.setValue("category", "");
      form.setValue("serviceId", "");
      return;
    }
    if (serviceId) {
      const svc = services.find((s) => s.id === serviceId);
      if (svc && !serviceAvailableAtLocation(svc, locationId)) {
        form.setValue("serviceId", "");
      }
    }
  }, [locationId, category, categoriesInCatalog, serviceId, services, form]);

  useEffect(() => {
    if (!category) return;
    const stillValid = stylesForCategory.some((s) => s.id === serviceId);
    if (!stillValid) form.setValue("serviceId", "");
  }, [category, stylesForCategory, serviceId, form]);

  useEffect(() => {
    if (!locationId || !bookingDate) {
      setDateFullyBooked(false);
      return;
    }

    const capacityKey = `${locationId}:${bookingDate}`;
    let cancelled = false;

    async function checkDailyCapacity() {
      setCheckingDateCapacity(true);
      try {
        const params = new URLSearchParams({ locationId, bookingDate });
        const res = await fetch(`/api/bookings/capacity?${params.toString()}`);
        const data = (await res.json()) as {
          fullyBooked?: boolean;
          locationLabel?: string;
          error?: string;
        };

        if (cancelled) return;

        if (!res.ok) {
          setDateFullyBooked(false);
          return;
        }

        const fullyBooked = Boolean(data.fullyBooked);
        setDateFullyBooked(fullyBooked);

        if (fullyBooked) {
          form.setValue("bookingTime", "");
          if (lastCapacityToastKey.current !== capacityKey) {
            lastCapacityToastKey.current = capacityKey;
            toast.error("This date is fully booked", {
              description: `${data.locationLabel ?? selectedLocation?.area ?? "This shop"} has no openings left on ${bookingDate}. Please choose another date or location.`,
              duration: 6000,
            });
          }
        } else {
          lastCapacityToastKey.current = capacityKey;
        }
      } catch {
        if (!cancelled) setDateFullyBooked(false);
      } finally {
        if (!cancelled) setCheckingDateCapacity(false);
      }
    }

    void checkDailyCapacity();

    return () => {
      cancelled = true;
    };
  }, [locationId, bookingDate, form, selectedLocation?.area]);

  const summaryReady = Boolean(
    clientName?.trim() &&
      selectedService &&
      selectedLocation &&
      bookingDate &&
      bookingTime,
  );

  const depositAmount = computeDepositAmount();
  const checkoutDeposit = appliedPromo?.deposit_amount ?? depositAmount;
  const requiresDeposit = paystackEnabled && checkoutDeposit > 0;

  useEffect(() => {
    if (!appliedPromo) return;
    const current = promoCode?.trim().toUpperCase() ?? "";
    if (current !== appliedPromo.code.toUpperCase()) setAppliedPromo(null);
  }, [promoCode, appliedPromo]);

  async function applyPromoCode() {
    const code = promoCode?.trim();
    if (!code) {
      toast.error("Enter a promo code first.");
      return;
    }

    setValidatingPromo(true);
    try {
      const res = await fetch("/api/promotions/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json()) as {
        valid?: boolean;
        code?: string;
        deposit_amount?: number;
        savings?: number;
        label?: string;
        error?: string;
      };

      if (!res.ok || !data.valid || data.deposit_amount == null) {
        setAppliedPromo(null);
        toast.error(data.error ?? "Invalid promo code.");
        return;
      }

      setAppliedPromo({
        code: data.code ?? code.toUpperCase(),
        deposit_amount: data.deposit_amount,
        savings: data.savings ?? 0,
        label: data.label ?? "Promo applied",
      });
      toast.success(data.label ?? "Promo code applied!");
    } catch {
      toast.error("Could not validate promo code. Please try again.");
    } finally {
      setValidatingPromo(false);
    }
  }

  async function onSubmit(values: GuestBookingValues) {
    if (!selectedStaffId) {
      toast.error("Please select a stylist.");
      return;
    }

    if (dateFullyBooked) {
      toast.error("This date is fully booked", {
        description: "Please choose another date or Glam Room location.",
      });
      return;
    }

    setSubmitting(true);
    try {
      if (requiresDeposit) {
        const res = await fetch("/api/paystack/booking/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, staffId: selectedStaffId }),
        });
        const data = (await res.json()) as {
          authorization_url?: string;
          error?: string;
        };
        if (!res.ok || !data.authorization_url) {
          toast.error(data.error ?? "Could not start payment. Please try again or WhatsApp us.");
          return;
        }
        window.location.href = data.authorization_url;
        return;
      }

      const res = await fetch("/api/bookings/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, staffId: selectedStaffId }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Could not save booking. Please try again or WhatsApp us.");
        return;
      }

      setSubmitted(true);
      form.reset();
      toast.success("Booking request sent", {
        description: "Asantewaa will confirm via WhatsApp shortly.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const detailsComplete = Boolean(clientName?.trim() && clientPhone?.trim());
  const serviceComplete = Boolean(locationId && category && serviceId && selectedStaffId);
  const scheduleComplete = Boolean(bookingDate && bookingTime && !dateFullyBooked);
  const activeStep = !detailsComplete
    ? 1
    : !serviceComplete
      ? 2
      : !scheduleComplete
        ? 3
        : 4;

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg border border-glam-border/70 bg-glam-secondary px-6 py-10 text-center sm:px-10 sm:py-12">
        <p className="font-[family-name:var(--font-cormorant)] text-lg italic text-glam-muted">
          Request received
        </p>
        <h2 className="heading-display mt-3 text-3xl text-glam-primary sm:text-4xl">
          You&apos;re on the list
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-glam-muted sm:text-base">
          Your booking request is with the Glam Room team. We&apos;ll confirm on WhatsApp at{" "}
          {BRAND.links.phone}.
        </p>
        <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-glam-muted">
          <li className="border-l border-glam-accent/40 pl-3">Save this number so you don&apos;t miss confirmation.</li>
          <li className="border-l border-glam-accent/40 pl-3">
            Use <span className="font-medium text-glam-primary">Find my booking</span> anytime to check status or reschedule.
          </li>
        </ul>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href={BRAND.links.whatsapp} variant="accent" className="!rounded-none">
            Chat on WhatsApp
          </ButtonLink>
          <ButtonLink href="/track" variant="outline" className="!rounded-none">
            Find my booking
          </ButtonLink>
        </div>
      </div>
    );
  }

  const inputClass =
    "mt-2 w-full border border-glam-border bg-glam-secondary px-4 py-3 text-sm text-glam-primary outline-none transition duration-200 focus:border-glam-accent focus:ring-2 focus:ring-glam-accent/20 touch-manipulation";

  const choiceCardClass =
    "border px-4 py-3 text-left text-sm transition duration-200 ease-out touch-manipulation active:scale-[0.98]";
  const choiceSelected =
    "border-glam-accent bg-glam-accent/10 ring-1 ring-glam-accent/30";
  const choiceIdle =
    "border-glam-border bg-glam-secondary hover:border-glam-accent/50";

  const steps = [
    { n: 1, label: "You" },
    { n: 2, label: "Service" },
    { n: 3, label: "Schedule" },
    { n: 4, label: "Confirm" },
  ] as const;

  const locationsPanel = (
    <>
      <p className="font-[family-name:var(--font-cormorant)] text-lg italic text-glam-muted">
        Locations
      </p>
      <ul className="mt-5 space-y-4 text-sm text-glam-muted">
        {locations.map((loc) => (
          <li key={loc.id}>
            <p className="font-medium text-glam-primary">
              {loc.area}
              {loc.badge ? (
                <span className="ml-2 bg-glam-accent/20 px-2 py-0.5 text-[0.65rem] font-semibold text-glam-accent-deep">
                  {loc.badge}
                </span>
              ) : null}
            </p>
            <p>{loc.address}</p>
          </li>
        ))}
        <li className="border-t border-glam-border pt-4">
          <p className="font-medium text-glam-primary">Opening hours</p>
          <p>Mon to Sun: 8am to 8pm</p>
        </li>
      </ul>
    </>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,260px)_1fr] lg:gap-12">
      <details className="group border border-glam-border/70 bg-glam-secondary/80 p-5 lg:hidden">
        <summary className="cursor-pointer list-none text-sm font-semibold text-glam-primary marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-3">
            Salon locations & hours
            <span className="text-glam-accent transition group-open:rotate-180" aria-hidden>
              ▾
            </span>
          </span>
        </summary>
        <div className="mt-4 border-t border-glam-border pt-4">{locationsPanel}</div>
      </details>

      <aside className="hidden border border-glam-border/70 bg-glam-secondary/60 p-6 lg:block">
        {locationsPanel}
      </aside>

      <div className="border border-glam-border/70 bg-glam-secondary p-6 sm:p-8">
        <p className="font-[family-name:var(--font-cormorant)] text-lg italic text-glam-muted">
          Booking
        </p>
        <h1 className="heading-display mt-2 text-3xl text-glam-primary sm:text-4xl">
          Book appointment
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-glam-muted sm:text-base">
          Four steps — we confirm on WhatsApp.
        </p>

        <ol className="mt-8 flex gap-1 sm:gap-2" aria-label="Booking progress">
          {steps.map((step) => {
            const done =
              (step.n === 1 && detailsComplete) ||
              (step.n === 2 && serviceComplete) ||
              (step.n === 3 && scheduleComplete) ||
              (step.n === 4 && summaryReady);
            const current = activeStep === step.n;
            return (
              <li
                key={step.n}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1.5 border-b-2 pb-2 text-center transition duration-200",
                  done || current ? "border-glam-accent" : "border-glam-border",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center text-[0.7rem] font-semibold tabular-nums",
                    done || current
                      ? "bg-glam-accent text-glam-primary"
                      : "bg-glam-background text-glam-muted",
                  )}
                  aria-hidden
                >
                  {done ? "✓" : step.n}
                </span>
                <span
                  className={cn(
                    "text-[0.65rem] font-medium sm:text-xs",
                    current || done ? "text-glam-primary" : "text-glam-muted",
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 space-y-10">
          <section className="space-y-5" aria-labelledby="booking-step-you">
            <h2
              id="booking-step-you"
              className="heading-display text-xl text-glam-primary sm:text-2xl"
            >
              1. You
            </h2>

            <label className="block text-sm font-medium">
              Full name
              <input
                type="text"
                autoComplete="name"
                placeholder="e.g., Efua Mensah"
                className={inputClass}
                {...form.register("clientName")}
              />
              {form.formState.errors.clientName ? (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.clientName.message}</p>
              ) : null}
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                WhatsApp
                <input
                  type="tel"
                  autoComplete="tel"
                  placeholder="+233 XX XXX XXXX"
                  className={inputClass}
                  {...form.register("clientPhone")}
                />
                <p className="mt-1 text-xs text-glam-muted">We&apos;ll text you a reminder</p>
                {form.formState.errors.clientPhone ? (
                  <p className="mt-1 text-xs text-red-600">
                    {form.formState.errors.clientPhone.message}
                  </p>
                ) : null}
              </label>
              <label className="block text-sm font-medium">
                Email <span className="font-normal text-glam-muted">optional</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Optional"
                  className={inputClass}
                  {...form.register("clientEmail")}
                />
              </label>
            </div>
          </section>

          <section className="space-y-5" aria-labelledby="booking-step-service">
            <h2
              id="booking-step-service"
              className="heading-display text-xl text-glam-primary sm:text-2xl"
            >
              2. Service
            </h2>

            <fieldset>
              <legend className="text-sm font-medium">Location</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {locations.map((loc) => {
                  const selected = locationId === loc.id;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      className={cn(choiceCardClass, selected ? choiceSelected : choiceIdle)}
                      aria-pressed={selected}
                      onClick={() => form.setValue("locationId", loc.id, { shouldValidate: true })}
                    >
                      <span className="block font-semibold text-glam-primary">{loc.area}</span>
                      {loc.id === "glam-room-madina" ? (
                        <span className="mt-1 block text-[0.7rem] text-glam-muted">
                          Hair · Nails · Makeup
                        </span>
                      ) : null}
                      {loc.badge ? (
                        <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-wider text-glam-accent">
                          {loc.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <input type="hidden" {...form.register("locationId")} />
              {form.formState.errors.locationId ? (
                <p className="mt-2 text-xs text-red-600">{form.formState.errors.locationId.message}</p>
              ) : null}
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium">Category</legend>
              {!locationId ? (
                <p className="mt-2 text-xs text-glam-muted">Select a shop first to see categories.</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {categoriesInCatalog.map((cat) => {
                  const selected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      disabled={!locationId}
                      className={cn(
                        "border px-4 py-2 text-xs font-medium transition duration-200 active:scale-[0.98]",
                        selected ? choiceSelected : choiceIdle,
                        !locationId && "opacity-50",
                      )}
                      aria-pressed={selected}
                      onClick={() => {
                        form.setValue("category", cat, { shouldValidate: true });
                        form.setValue("serviceId", "");
                      }}
                    >
                      {SERVICE_CATEGORIES[cat]}
                    </button>
                  );
                })}
              </div>
              <input type="hidden" {...form.register("category")} />
              {form.formState.errors.category ? (
                <p className="mt-2 text-xs text-red-600">{form.formState.errors.category.message}</p>
              ) : null}
            </fieldset>

            <label className="block text-sm font-medium">
              Style
              <select
                className={cn(inputClass, !category && "opacity-60")}
                disabled={!category}
                {...form.register("serviceId")}
              >
                <option value="">{category ? "Select service" : "Select category first"}</option>
                {stylesForCategory.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({formatShopPrice(s.price)})
                  </option>
                ))}
              </select>
              {form.formState.errors.serviceId ? (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.serviceId.message}</p>
              ) : null}
            </label>

            {staff.length > 0 ? (
              <fieldset>
                <legend className="text-sm font-medium">Stylist</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {staff.map((member) => {
                    const selected = selectedStaffId === member.id;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        className={cn(choiceCardClass, selected ? choiceSelected : choiceIdle)}
                        aria-pressed={selected}
                        onClick={() => setSelectedStaffId(member.id)}
                      >
                        <span className="block font-semibold text-glam-primary">{member.name}</span>
                        {member.role ? (
                          <span className="mt-1 block text-xs text-glam-muted">{member.role}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-glam-muted">
                  {staff.length === 1
                    ? "Your appointment will be with our lead stylist."
                    : "Choose your preferred expert or leave the default."}
                </p>
              </fieldset>
            ) : null}

            <p
              className="border border-glam-border/60 bg-glam-background px-4 py-3 text-sm text-glam-muted"
              role="note"
            >
              {braidsNotice}
            </p>
          </section>

          <section className="space-y-5" aria-labelledby="booking-step-schedule">
            <h2
              id="booking-step-schedule"
              className="heading-display text-xl text-glam-primary sm:text-2xl"
            >
              3. Schedule
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Date
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  className={inputClass}
                  {...form.register("bookingDate")}
                />
                {form.formState.errors.bookingDate ? (
                  <p className="mt-1 text-xs text-red-600">
                    {form.formState.errors.bookingDate.message}
                  </p>
                ) : null}
                {checkingDateCapacity ? (
                  <p className="mt-2 text-xs text-glam-muted">Checking availability…</p>
                ) : null}
                {dateFullyBooked ? (
                  <p className="mt-2 rounded-lg border border-amber-500/40 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    {selectedLocation?.area ?? "This shop"} is fully booked on this date. Please pick
                    another date or location.
                  </p>
                ) : null}
              </label>
              <label className="block text-sm font-medium">
                Time
                <select
                  className={inputClass}
                  disabled={dateFullyBooked}
                  {...form.register("bookingTime")}
                >
                  <option value="">Select time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                {form.formState.errors.bookingTime ? (
                  <p className="mt-1 text-xs text-red-600">
                    {form.formState.errors.bookingTime.message}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-glam-muted">
                  Up to {MAX_BOOKINGS_PER_SLOT} clients per time · {MAX_BOOKINGS_PER_SHOP_PER_DAY} per
                  shop per day
                </p>
              </label>
            </div>

            <label className="block text-sm font-medium">
              Notes <span className="font-normal text-glam-muted">optional</span>
              <textarea
                rows={3}
                placeholder="Anything we should know?"
                className={inputClass}
                {...form.register("clientNotes")}
              />
            </label>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                Promo code <span className="font-normal text-glam-muted">optional</span>
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. GLAM10"
                  autoComplete="off"
                  className={cn(inputClass, "mt-0 flex-1 uppercase")}
                  {...form.register("promoCode")}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 self-start"
                  disabled={validatingPromo || !promoCode?.trim()}
                  onClick={() => void applyPromoCode()}
                >
                  {validatingPromo ? "Checking…" : "Apply"}
                </Button>
              </div>
              {appliedPromo ? (
                <p className="rounded-lg border border-emerald-500/40 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                  {appliedPromo.label}. You save {formatShopPrice(appliedPromo.savings)} on the
                  deposit
                </p>
              ) : null}
            </div>
          </section>

          <section className="space-y-5" aria-labelledby="booking-step-confirm">
            <h2
              id="booking-step-confirm"
              className="heading-display text-xl text-glam-primary sm:text-2xl"
            >
              4. Confirm
            </h2>

            <div
              className={cn(
                "border px-5 py-4 text-sm transition duration-200",
                summaryReady
                  ? "border-glam-accent/40 bg-glam-accent/10 text-glam-primary"
                  : "border-glam-border bg-glam-background text-glam-muted",
              )}
            >
              {summaryReady && selectedService && selectedLocation ? (
                <>
                  <p className="font-[family-name:var(--font-cormorant)] italic text-glam-muted">
                    Summary
                  </p>
                  <p className="mt-2 heading-display text-2xl text-glam-primary">
                    {selectedService.name}
                  </p>
                  <p className="mt-2">
                    {clientName?.trim() || "Guest"} · {selectedLocation.area}
                  </p>
                  <p>
                    {bookingDate} at{" "}
                    {timeSlots.find((s) => s.value === bookingTime)?.label ?? bookingTime}
                  </p>
                  {requiresDeposit ? (
                    <p className="mt-4 border-t border-glam-accent/25 pt-4 text-glam-primary">
                      Booking deposit due now:{" "}
                      <strong>{formatShopPrice(checkoutDeposit)}</strong>
                      {appliedPromo && appliedPromo.savings > 0 ? (
                        <span className="ml-2 text-xs font-normal text-glam-muted line-through">
                          {formatShopPrice(depositAmount)}
                        </span>
                      ) : null}
                      <span className="mt-1 block text-xs font-normal text-glam-muted">
                        Remaining balance paid at the salon · secure checkout via Paystack
                      </span>
                    </p>
                  ) : null}
                </>
              ) : selectedService && selectedLocation ? (
                "Pick a date and time to finish."
              ) : (
                "Choose location, category, and style to see your summary."
              )}
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full !rounded-none"
              disabled={submitting || dateFullyBooked || checkingDateCapacity}
            >
              {submitting
                ? requiresDeposit
                  ? "Redirecting to Paystack…"
                  : "Booking…"
                : requiresDeposit
                  ? `Pay ${formatShopPrice(checkoutDeposit)} deposit`
                  : "Book appointment"}
            </Button>

            <p className="text-center text-sm text-glam-muted">
              Prefer WhatsApp?{" "}
              <a
                href={BRAND.links.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-glam-accent hover:underline"
              >
                Chat with Asantewaa directly
              </a>
            </p>
          </section>
        </form>
      </div>
    </div>
  );
}
