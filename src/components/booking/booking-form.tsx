"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";
import { BRAND } from "@/lib/constants/brand";
import { SALON_LOCATIONS } from "@/lib/constants/locations";
import {
  SERVICE_CATEGORIES,
  type SalonService,
  type ServiceCategory,
} from "@/lib/constants/services";
import { isSlotAvailable } from "@/lib/booking/availability";
import { formatShopPrice } from "@/lib/format/money";
import { createClient } from "@/lib/supabase/client";
import {
  BOOKING_TIME_SLOTS,
  DEPOSIT_PERCENT,
  guestBookingSchema,
  type GuestBookingValues,
} from "@/lib/validation/booking";
import { cn } from "@/lib/utils/cn";

type BookingFormProps = {
  services: SalonService[];
  staffId: string;
  initialServiceId?: string;
  initialLocationId?: string;
};

const CATEGORY_ORDER: ServiceCategory[] = ["hair-reset", "hair-installation", "braids"];

function buildDatetime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

function findCategoryForService(services: SalonService[], serviceId?: string) {
  if (!serviceId) return "";
  return services.find((s) => s.id === serviceId)?.category ?? "";
}

export function BookingForm({
  services,
  staffId,
  initialServiceId,
  initialLocationId,
}: BookingFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    },
  });

  const locationId = useWatch({ control: form.control, name: "locationId" });
  const category = useWatch({ control: form.control, name: "category" });
  const serviceId = useWatch({ control: form.control, name: "serviceId" });
  const bookingDate = useWatch({ control: form.control, name: "bookingDate" });
  const bookingTime = useWatch({ control: form.control, name: "bookingTime" });
  const clientName = useWatch({ control: form.control, name: "clientName" });

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
    () => SALON_LOCATIONS.find((l) => l.id === locationId),
    [locationId],
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

  const summaryReady = Boolean(
    clientName?.trim() &&
      selectedService &&
      selectedLocation &&
      bookingDate &&
      bookingTime,
  );

  async function onSubmit(values: GuestBookingValues) {
    setSubmitting(true);
    try {
      let supabase: ReturnType<typeof createClient>;
      try {
        supabase = createClient();
      } catch {
        toast.error("Booking is being configured. Please WhatsApp us to book.");
        return;
      }

      const startAt = buildDatetime(values.bookingDate, values.bookingTime);
      const durationMin = selectedService?.durationMinutes ?? 60;
      const end = new Date(new Date(startAt).getTime() + durationMin * 60_000);

      const slotCheck = await isSlotAvailable(supabase, startAt, values.locationId);
      if (!slotCheck.available) {
        toast.error(slotCheck.error ?? "That time slot is full. Please choose another time.");
        return;
      }

      const depositAmount = selectedService
        ? Math.round(selectedService.price * DEPOSIT_PERCENT)
        : 0;

      const { error } = await supabase.from("bookings").insert({
        user_id: null,
        service_id: values.serviceId,
        staff_id: staffId,
        start_at: startAt,
        end_at: end.toISOString(),
        status: "awaiting_approval",
        location_type: "studio",
        deposit_amount: depositAmount,
        deposit_paid: false,
        client_name: values.clientName.trim(),
        client_phone: values.clientPhone.trim(),
        location_id: values.locationId,
        client_notes: [
          `Location: ${selectedLocation?.area ?? values.locationId}`,
          values.clientNotes?.trim(),
          `Name: ${values.clientName.trim()}`,
          values.clientEmail ? `Email: ${values.clientEmail}` : null,
          `Phone: ${values.clientPhone.trim()}`,
        ]
          .filter(Boolean)
          .join("\n"),
        add_ons: { deposit_percent: DEPOSIT_PERCENT },
      });

      if (error) {
        toast.error(error.message);
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
      <div className="rounded-2xl border border-glam-border bg-glam-secondary p-8 text-center shadow-soft sm:p-10">
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
    "mt-2 w-full rounded-xl border border-glam-border bg-glam-secondary px-4 py-3 text-sm text-glam-primary outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-12">
      <aside className="rounded-2xl border border-glam-border bg-glam-secondary/80 p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-glam-accent">
          Locations
        </p>
        <ul className="mt-4 space-y-4 text-sm text-glam-muted">
          {SALON_LOCATIONS.map((loc) => (
            <li key={loc.id}>
              <p className="font-medium text-glam-primary">
                {loc.area}
                {loc.badge ? (
                  <span className="ml-2 rounded-full bg-glam-accent/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-glam-accent">
                    {loc.badge}
                  </span>
                ) : null}
              </p>
              <p className="text-glam-muted">{loc.address}</p>
            </li>
          ))}
          <li className="border-t border-glam-border pt-4">
            <p className="font-medium text-glam-primary">Opening hours</p>
            <p className="text-glam-muted">Mon to Sun: 8am to 8pm</p>
          </li>
        </ul>
      </aside>

      <div className="rounded-2xl border border-glam-border bg-glam-secondary p-6 shadow-soft sm:p-8">
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
              {SALON_LOCATIONS.map((loc) => (
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

          <p className="rounded-xl bg-glam-background px-4 py-3 text-sm text-glam-muted" role="note">
            {BRAND.copy.braidsNotice}
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
            </label>
            <label className="block text-sm font-medium">
              Time
              <select className={inputClass} {...form.register("bookingTime")}>
                <option value="">Select time</option>
                {BOOKING_TIME_SLOTS.map((slot) => (
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
                  {BOOKING_TIME_SLOTS.find((s) => s.value === bookingTime)?.label ?? bookingTime}
                </p>
              </>
            ) : selectedService && selectedLocation ? (
              "Pick a date and time to finish."
            ) : (
              "Choose category and style to see your summary."
            )}
          </div>

          <Button type="submit" variant="accent" className="w-full" disabled={submitting}>
            {submitting ? "Booking…" : "Book appointment"}
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
