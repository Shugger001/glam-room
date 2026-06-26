import { z } from "zod";
import { isValidGhanaPhone } from "@/lib/booking/phone";

export { BOOKING_DEPOSIT_GHS, computeDepositAmount } from "@/lib/booking/deposit";

export const guestBookingSchema = z.object({
  locationId: z.string().min(1, "Select a location"),
  category: z.string().min(1, "Select a category"),
  serviceId: z.string().min(1, "Select a service"),
  bookingDate: z.string().min(1, "Pick a date"),
  bookingTime: z.string().min(1, "Select a time"),
  clientName: z.string().min(2, "Full name is required"),
  clientEmail: z.union([z.literal(""), z.string().email("Valid email required")]).optional(),
  clientPhone: z
    .string()
    .min(8, "WhatsApp / phone number is required")
    .refine(isValidGhanaPhone, "Enter a valid Ghana number (e.g. 024XXXXXXX)"),
  clientNotes: z.string().max(800).optional(),
});

export type GuestBookingValues = z.infer<typeof guestBookingSchema>;

export const BOOKING_TIME_SLOTS = [
  { value: "09:00", label: "09:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "15:00", label: "03:00 PM" },
  { value: "18:00", label: "06:00 PM" },
] as const;

/** @deprecated Use guestBookingSchema — kept for legacy wizard */
export const bookingFormSchema = guestBookingSchema.extend({
  staffId: z.string().optional(),
  startAt: z.string().optional(),
  acceptDeposit: z.boolean().optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
