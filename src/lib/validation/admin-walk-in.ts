import { z } from "zod";
import { isValidGhanaPhone } from "@/lib/booking/phone";

export const adminWalkInSchema = z.object({
  locationId: z.string().min(1, "Select a shop"),
  serviceId: z.string().min(1, "Select a service"),
  staffId: z.string().optional(),
  bookingDate: z.string().min(1, "Pick a date"),
  bookingTime: z.string().min(1, "Pick a time"),
  clientName: z.string().min(2, "Client name required"),
  clientPhone: z
    .string()
    .min(8, "Phone required")
    .refine(isValidGhanaPhone, "Valid Ghana number required"),
  clientNotes: z.string().max(500).optional(),
  status: z.enum(["confirmed", "awaiting_approval"]).default("confirmed"),
  waiveDeposit: z.enum(["true", "false"]).optional(),
  adminNotes: z.string().max(500).optional(),
});

export type AdminWalkInValues = z.infer<typeof adminWalkInSchema>;

export function parseAdminWalkInForm(formData: FormData) {
  return adminWalkInSchema.safeParse({
    locationId: formData.get("locationId"),
    serviceId: formData.get("serviceId"),
    staffId: formData.get("staffId") || undefined,
    bookingDate: formData.get("bookingDate"),
    bookingTime: formData.get("bookingTime"),
    clientName: formData.get("clientName"),
    clientPhone: formData.get("clientPhone"),
    clientNotes: formData.get("clientNotes") || undefined,
    status: formData.get("status") || "confirmed",
  waiveDeposit: formData.get("waiveDeposit") === "true" ? "true" : "false",
    adminNotes: formData.get("adminNotes") || undefined,
  });
}
