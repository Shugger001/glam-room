import { z } from "zod";

export const bookingFormSchema = z
  .object({
    serviceId: z.string().min(1, "Select a service"),
    staffId: z.string().min(1, "Select a stylist"),
    startAt: z.string().min(1, "Pick a date and time"),
    clientName: z.string().min(2, "Name is required"),
    clientEmail: z.string().email("Valid email required"),
    clientPhone: z.string().min(8, "Phone number is required"),
    clientNotes: z.string().max(800).optional(),
    acceptDeposit: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.acceptDeposit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please accept the deposit terms to continue.",
        path: ["acceptDeposit"],
      });
    }
  });

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const DEPOSIT_PERCENT = 0.3;
