import { z } from "zod";

export const paystackInitializeSchema = z.object({
  email: z.string().email(),
  amount: z.number().positive().max(10_000_000),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive().max(20),
      }),
    )
    .min(1),
  metadata: z.unknown().optional(),
});

export type PaystackInitializeInput = z.infer<typeof paystackInitializeSchema>;
