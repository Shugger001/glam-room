import { z } from "zod";
import { isValidGhanaPhone } from "@/lib/booking/phone";
import { BOOKING_TIME_SLOTS } from "@/lib/validation/booking";

const timeValues = BOOKING_TIME_SLOTS.map((s) => s.value) as [string, ...string[]];

const identityFields = {
  phone: z.string().min(8),
  nameSuffix: z
    .string()
    .length(4)
    .regex(/^[a-zA-Z]{4}$/),
  bookingId: z.string().uuid(),
};

export const bookingManageSchema = z
  .object({
    action: z.enum(["cancel", "reschedule"]),
    ...identityFields,
    bookingDate: z.string().optional(),
    bookingTime: z.enum(timeValues).optional(),
  })
  .superRefine((data, ctx) => {
    if (!isValidGhanaPhone(data.phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid Ghana number.",
        path: ["phone"],
      });
    }
    if (data.action === "reschedule" && (!data.bookingDate || !data.bookingTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pick a new date and time.",
        path: ["bookingDate"],
      });
    }
  });
