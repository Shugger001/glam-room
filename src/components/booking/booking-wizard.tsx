"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  bookingFormSchema,
  BOOKING_TIME_SLOTS,
  DEPOSIT_PERCENT,
  type BookingFormValues,
} from "@/lib/validation/booking";
import { SALON_LOCATIONS } from "@/lib/constants/locations";
import { BRAND } from "@/lib/constants/brand";
import { createClient } from "@/lib/supabase/client";
import { useBookingDraftStore } from "@/stores/booking-draft-store";
import { formatShopPrice } from "@/lib/format/money";
import type { LiveService } from "@/lib/data/live-services";
import type { LiveStaff } from "@/lib/data/live-staff";
import { track } from "@/lib/analytics/track";
import { m } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type BookingWizardProps = {
  services: LiveService[];
  staff: LiveStaff[];
  initialServiceId?: string;
};

const STEPS = ["Location", "Service", "Schedule", "Details", "Confirm"] as const;

function buildDatetime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function BookingWizard({ services, staff, initialServiceId }: BookingWizardProps) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const draft = useBookingDraftStore();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      locationId: draft.locationId ?? "",
      serviceId: initialServiceId ?? draft.serviceId ?? "",
      staffId: draft.staffId ?? staff[0]?.id ?? "",
      startAt: draft.startAt ?? "",
      clientName: draft.clientName,
      clientEmail: draft.clientEmail,
      clientPhone: draft.clientPhone,
      clientNotes: draft.clientNotes,
      acceptDeposit: true,
    },
  });

  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");

  useEffect(() => {
    if (initialServiceId) form.setValue("serviceId", initialServiceId);
  }, [initialServiceId, form]);

  useEffect(() => {
    track("booking_step", { step: step + 1, name: STEPS[step] });
  }, [step]);

  const serviceIdW = useWatch({ control: form.control, name: "serviceId" });
  const locationIdW = useWatch({ control: form.control, name: "locationId" });
  const staffIdW = useWatch({ control: form.control, name: "staffId" });

  useEffect(() => {
    if (!staffIdW && staff[0]?.id) form.setValue("staffId", staff[0].id);
  }, [staff, staffIdW, form]);
  const acceptDepositW = useWatch({ control: form.control, name: "acceptDeposit" });
  void acceptDepositW;

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceIdW),
    [services, serviceIdW],
  );
  const selectedStaff = useMemo(() => staff.find((s) => s.id === staffIdW), [staff, staffIdW]);

  const selectedLocation = useMemo(
    () => SALON_LOCATIONS.find((l) => l.id === locationIdW),
    [locationIdW],
  );

  const depositAmount = selectedService
    ? Math.round(selectedService.price * DEPOSIT_PERCENT)
    : 0;

  const timeSlots = BOOKING_TIME_SLOTS;

  async function onSubmit(values: BookingFormValues) {
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      toast.error("Booking system is being configured. Please call us to book.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const start = new Date(values.startAt);
    const durationMin = selectedService?.duration ?? 60;
    const end = new Date(start.getTime() + durationMin * 60_000);

    const bookingPayload = {
      user_id: user?.id ?? null,
      service_id: values.serviceId,
      staff_id: values.staffId,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      status: "awaiting_approval" as const,
      location_type: "studio" as const,
      deposit_amount: depositAmount,
      deposit_paid: false,
      client_name: values.clientName,
      client_phone: values.clientPhone,
      location_id: values.locationId,
      client_notes: [
        `Location: ${selectedLocation?.area ?? values.locationId}`,
        values.clientNotes,
        `Name: ${values.clientName}`,
        values.clientEmail ? `Email: ${values.clientEmail}` : null,
        `Phone: ${values.clientPhone}`,
      ]
        .filter(Boolean)
        .join("\n"),
      add_ons: { deposit_percent: DEPOSIT_PERCENT },
    };

    const { error } = await supabase.from("bookings").insert(bookingPayload);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSubmitted(true);
    draft.reset();
    form.reset();
    toast.success("Appointment requested", {
      description: "We'll confirm your booking shortly.",
    });
  }

  function nextStep() {
    if (step === 0 && !locationIdW) {
      toast.error("Please select a location");
      return;
    }
    if (step === 1 && !serviceIdW) {
      toast.error("Please select a service");
      return;
    }
    if (step === 2) {
      if (!scheduleDate) {
        toast.error("Please select a date");
        return;
      }
      form.setValue("startAt", buildDatetime(scheduleDate, scheduleTime));
    }
    if (step === 3) {
      const valid = awaitValidateDetails();
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function awaitValidateDetails() {
    const fields = ["clientName", "clientPhone"] as const;
    const results = await Promise.all(fields.map((f) => form.trigger(f)));
    return results.every(Boolean);
  }

  if (submitted) {
    return (
      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-glam-border bg-glam-secondary p-10 text-center shadow-soft"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-glam-accent">
          Confirmed
        </p>
        <h3 className="heading-display mt-4 text-3xl text-glam-primary">Thank You</h3>
        <p className="mt-4 text-glam-muted">
          Your appointment request has been received. We&apos;ll confirm via WhatsApp shortly.
        </p>
        <ButtonLink href="/" variant="outline" className="mt-8">
          Return Home
        </ButtonLink>
      </m.div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex gap-1 overflow-x-auto" role="tablist" aria-label="Booking steps">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={step === i}
            onClick={() => i < step && setStep(i)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-wider transition sm:px-4 sm:text-xs",
              step === i
                ? "border-glam-primary bg-glam-primary text-glam-secondary"
                : i < step
                  ? "border-glam-accent bg-glam-accent/15 text-glam-primary cursor-pointer"
                  : "border-glam-border bg-glam-secondary text-glam-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-2xl border border-glam-border bg-glam-secondary p-6 shadow-soft sm:p-8">
        {step === 0 && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h3 className="heading-display text-2xl">Select Location</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {SALON_LOCATIONS.map((location) => (
                <label
                  key={location.id}
                  className={cn(
                    "flex cursor-pointer flex-col rounded-xl border p-4 transition",
                    locationIdW === location.id
                      ? "border-glam-accent bg-glam-accent/10"
                      : "border-glam-border hover:border-glam-accent/50",
                  )}
                >
                  <input
                    type="radio"
                    value={location.id}
                    className="sr-only"
                    {...form.register("locationId")}
                  />
                  <p className="text-xs font-semibold uppercase tracking-wider text-glam-accent">
                    Glam Room
                  </p>
                  <p className="font-medium">{location.area}</p>
                  <p className="text-sm text-glam-muted">{location.address}</p>
                </label>
              ))}
            </div>
          </m.div>
        )}

        {step === 1 && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h3 className="heading-display text-2xl">Select Service</h3>
            <div className="grid gap-3">
              {services.map((s) => (
                <label
                  key={s.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border px-5 py-4 transition",
                    serviceIdW === s.id
                      ? "border-glam-accent bg-glam-accent/10"
                      : "border-glam-border hover:border-glam-accent/50",
                  )}
                >
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-glam-muted">{s.duration} min</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatShopPrice(s.price)}</span>
                    <input
                      type="radio"
                      value={s.id}
                      className="accent-glam-accent"
                      {...form.register("serviceId")}
                    />
                  </div>
                </label>
              ))}
            </div>
          </m.div>
        )}

        {step === 2 && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h3 className="heading-display text-2xl">Date & Time</h3>
            <div>
              <label htmlFor="booking-date" className="mb-2 block text-sm font-medium">
                Date
              </label>
              <input
                id="booking-date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full rounded-xl border border-glam-border px-4 py-3 text-sm"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Time</p>
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => setScheduleTime(slot.value)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition",
                      scheduleTime === slot.value
                        ? "border-glam-primary bg-glam-primary text-glam-secondary"
                        : "border-glam-border hover:border-glam-accent",
                    )}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
          </m.div>
        )}

        {step === 3 && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h3 className="heading-display text-2xl">Your Details</h3>
            {(
              [
                { id: "clientName", label: "Full Name", type: "text", required: true },
                { id: "clientPhone", label: "WhatsApp / Phone", type: "tel", required: true },
                { id: "clientEmail", label: "Email (optional)", type: "email", required: false },
              ] as const
            ).map(({ id, label, type }) => (
              <div key={id}>
                <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
                  {label}
                </label>
                <input
                  id={id}
                  type={type}
                  className="w-full rounded-xl border border-glam-border px-4 py-3 text-sm"
                  {...form.register(id)}
                />
                {form.formState.errors[id] ? (
                  <p className="mt-1 text-xs text-red-600">
                    {form.formState.errors[id]?.message}
                  </p>
                ) : null}
              </div>
            ))}
            <div>
              <label htmlFor="clientNotes" className="mb-1.5 block text-sm font-medium">
                Notes (optional)
              </label>
              <textarea
                id="clientNotes"
                rows={3}
                className="w-full rounded-xl border border-glam-border px-4 py-3 text-sm"
                {...form.register("clientNotes")}
              />
            </div>
          </m.div>
        )}

        {step === 4 && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h3 className="heading-display text-2xl">Review Booking</h3>
            <dl className="space-y-3 rounded-xl bg-glam-background p-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-glam-muted">Location</dt>
                <dd className="font-medium">{selectedLocation?.area}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-glam-muted">Service</dt>
                <dd className="font-medium">{selectedService?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-glam-muted">Stylist</dt>
                <dd className="font-medium">{selectedStaff?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-glam-muted">Date & Time</dt>
                <dd className="font-medium">
                  {scheduleDate} at {timeSlots.find((s) => s.value === scheduleTime)?.label ?? scheduleTime}
                </dd>
              </div>
              <div className="flex justify-between border-t border-glam-border pt-3">
                <dt className="text-glam-muted">Service Total</dt>
                <dd className="font-semibold">
                  {selectedService ? formatShopPrice(selectedService.price) : "—"}
                </dd>
              </div>
            </dl>
            <p className="text-sm text-glam-muted">{BRAND.copy.braidsNotice}</p>
          </m.div>
        )}

        <div className="mt-8 flex justify-between gap-4">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" variant="accent" onClick={nextStep}>
              Continue
            </Button>
          ) : (
            <Button type="submit" variant="accent">
              Book Appointment
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
