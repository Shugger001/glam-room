export type PaystackTransaction = {
  status: string;
  amount: number;
  currency: string;
  metadata: Record<string, unknown> | null;
};

export async function fetchPaystackTransaction(reference: string): Promise<{
  ok: boolean;
  paid: boolean;
  transaction?: PaystackTransaction;
  error?: string;
}> {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) {
    return { ok: false, paid: false, error: "Paystack is not configured." };
  }

  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secret}` }, cache: "no-store" },
  );

  const payload = (await res.json()) as {
    status?: boolean;
    message?: string;
    data?: {
      status?: string;
      amount?: number;
      currency?: string;
      metadata?: Record<string, unknown>;
    };
  };

  if (!res.ok || !payload.status || !payload.data) {
    return { ok: false, paid: false, error: payload.message ?? "Verification failed." };
  }

  const tx = payload.data;
  return {
    ok: true,
    paid: tx.status === "success",
    transaction: {
      status: tx.status ?? "unknown",
      amount: typeof tx.amount === "number" ? tx.amount : 0,
      currency: tx.currency ?? "",
      metadata: tx.metadata ?? null,
    },
  };
}
