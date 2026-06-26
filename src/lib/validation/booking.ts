import { z } from "zod";

export const bookingFormSchema = z.object({
  locationId: z.string().min(1, "Select a location"),
  serviceId: z.string().min(1, "Select a service"),
  staffId: z.string().min(1, "Select a stylist"),
  startAt: z.string().min(1, "Pick a date and time"),
  clientName: z.string().min(2, "Name is required"),
  clientEmail: z.union([z.literal(""), z.string().email("Valid email required")]).optional(),
  clientPhone: z.string().min(8, "WhatsApp / phone number is required"),
  clientNotes: z.string().max(800).optional(),
  acceptDeposit: z.boolean(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const DEPOSIT_PERCENT = 0;

export const BOOKING_TIME_SLOTS = [
  { value: "09:00", label: "09:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "15:00", label: "03:00 PM" },
  { value: "18:00", label: "06:00 PM" },
] as const;
