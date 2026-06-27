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
  type SalonService,
  type ServiceCategory,
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

const CATEGORY_ORDER: ServiceCategory[] = ["hair-reset", "hair-installation", "braids"];

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

  const form = useForm<GuestBookingValues>({
    resolver: zodResolver(guestBookingSchema),
    defaultValues: {
      locationId: initialLocationId ?? "",
      category: findCategoryForService(services, initialServiceId),
      serviceId: initialServiceId ?? "",
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
  const promoCode = useWatch({ control: form.control, name: "promoCode" });

  const categoriesInCatalog = useMemo(() => {
    const present = new Set(services.map((s) => s.category));
    return CATEGORY_ORDER.filter((c) => present.has(c));
  }, [services]);

  const stylesForCategory = useMemo(
    () => services.filter((s) => s.category === category),
    [services, category],
  );

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId],
  );

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === locationId),
    [locationId, locations],
  );

  useEffect(() => {
    if (initialServiceId) {
      const cat = findCategoryForService(services, initialServiceId);
      if (cat) form.setValue("category", cat);
      form.setValue("serviceId", initialServiceId);
    }
  }, [initialServiceId, services, form]);

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
      toast.success("Booking request sent!", {
        description: "Asantewaa will confirm via WhatsApp shortly.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-white/20 bg-glam-secondary/95 p-8 text-center shadow-premium backdrop-blur-md sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-glam-accent">
          Request received
        </p>
        <h2 className="heading-display mt-4 text-3xl text-glam-primary">You&apos;re on the list</h2>
        <p className="mt-4 text-glam-muted">
          Your booking request has been received. We&apos;ll confirm via WhatsApp at{" "}
          {BRAND.links.phone}.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href={BRAND.links.whatsapp} variant="accent">
            Chat on WhatsApp
          </ButtonLink>
          <ButtonLink href="/#track-booking" variant="outline">
            Find My Booking
          </ButtonLink>
        </div>
      </div>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-glam-border bg-glam-secondary px-4 py-3 text-sm text-glam-primary outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent touch-manipulation";

  const locationsPanel = (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-glam-accent">
        Locations
      </p>
      <ul className="mt-4 space-y-4 text-sm text-white/70">
        {locations.map((loc) => (
          <li key={loc.id}>
            <p className="font-medium text-white">
              {loc.area}
              {loc.badge ? (
                <span className="ml-2 rounded-full bg-glam-accent/20 px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-glam-accent">
                  {loc.badge}
                </span>
              ) : null}
            </p>
            <p className="text-white/60">{loc.address}</p>
          </li>
        ))}
        <li className="border-t border-white/20 pt-4">
          <p className="font-medium text-white">Opening hours</p>
          <p className="text-white/60">Mon to Sun: 8am to 8pm</p>
        </li>
      </ul>
    </>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-12">
      <details className="group rounded-2xl border border-white/20 bg-transparent p-5 lg:hidden">
        <summary className="cursor-pointer list-none text-sm font-semibold text-white marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-3">
            Salon locations & hours
            <span className="text-glam-accent transition group-open:rotate-180" aria-hidden>
              ▾
            </span>
          </span>
        </summary>
        <div className="mt-4 border-t border-white/20 pt-4">{locationsPanel}</div>
      </details>

      <aside className="hidden rounded-2xl border border-white/20 bg-transparent p-6 lg:block">
        {locationsPanel}
      </aside>

      <div className="rounded-2xl border border-white/20 bg-glam-secondary/95 p-6 shadow-premium backdrop-blur-md sm:p-8">
        <h1 className="heading-display text-3xl text-glam-primary">Book appointment</h1>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
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

          <label className="block text-sm font-medium">
            Location
            <select className={inputClass} {...form.register("locationId")}>
              <option value="">Select location</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.area}
                  {loc.badge ? ` (${loc.badge})` : ""}
                </option>
              ))}
            </select>
            {form.formState.errors.locationId ? (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.locationId.message}</p>
            ) : null}
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Category
              <select
                className={inputClass}
                {...form.register("category")}
                onChange={(e) => {
                  form.setValue("category", e.target.value as ServiceCategory | "");
                  form.setValue("serviceId", "");
                }}
              >
                <option value="">Select category</option>
                {categoriesInCatalog.map((cat) => (
                  <option key={cat} value={cat}>
                    {SERVICE_CATEGORIES[cat]}
                  </option>
                ))}
              </select>
              {form.formState.errors.category ? (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.category.message}</p>
              ) : null}
            </label>
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
          </div>

          {staff.length > 0 ? (
            <label className="block text-sm font-medium">
              Stylist
              <select
                className={inputClass}
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
              >
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                    {member.role ? ` · ${member.role}` : ""}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-glam-muted">
                {staff.length === 1
                  ? "Your appointment will be with our lead stylist."
                  : "Choose your preferred expert or leave the default."}
              </p>
            </label>
          ) : null}

          <p className="rounded-xl bg-glam-background px-4 py-3 text-sm text-glam-muted" role="note">
            {braidsNotice}
          </p>

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
                <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
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
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
                {appliedPromo.label} — you save {formatShopPrice(appliedPromo.savings)} on the
                deposit
              </p>
            ) : null}
          </div>

          <div
            className={cn(
              "rounded-xl border px-4 py-3 text-sm",
              summaryReady
                ? "border-glam-accent/30 bg-glam-accent/5 text-glam-primary"
                : "border-glam-border bg-glam-background text-glam-muted",
            )}
          >
            {summaryReady && selectedService && selectedLocation ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-glam-accent">
                  Summary
                </p>
                <p className="mt-2">
                  {clientName?.trim() || "Guest"} · {selectedService.name}
                </p>
                <p>
                  {selectedLocation.area} · {bookingDate} at{" "}
                  {timeSlots.find((s) => s.value === bookingTime)?.label ?? bookingTime}
                </p>
                {requiresDeposit ? (
                  <p className="mt-3 border-t border-glam-accent/20 pt-3 text-glam-primary">
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
              "Choose category and style to see your summary."
            )}
          </div>

          <Button
            type="submit"
            variant="accent"
            className="w-full"
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
        </form>
      </div>
    </div>
  );
}
