import { z } from "zod";
import { guestBookingSchema } from "@/lib/validation/booking";

export const bookingPaystackInitializeSchema = guestBookingSchema.extend({
  staffId: z.string().uuid("Invalid stylist assignment"),
});

export type BookingPaystackInitializeInput = z.infer<typeof bookingPaystackInitializeSchema>;
