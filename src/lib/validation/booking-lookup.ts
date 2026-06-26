import { z } from "zod";
import { isValidGhanaPhone } from "@/lib/booking/phone";

export const bookingLookupSchema = z
  .object({
    phone: z.string().min(8, "Enter a valid Ghana number"),
    nameSuffix: z
      .string()
      .length(4, "Enter exactly 4 letters")
      .regex(/^[a-zA-Z]{4}$/, "Letters only"),
  })
  .superRefine((data, ctx) => {
    if (!isValidGhanaPhone(data.phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid Ghana number (e.g. 024XXXXXXX).",
        path: ["phone"],
      });
    }
  });

export type BookingLookupInput = z.infer<typeof bookingLookupSchema>;
