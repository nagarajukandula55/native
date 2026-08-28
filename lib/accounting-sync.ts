/**
 * Pushes a completed order into AN-Accounting (the owner's own bookkeeping
 * app — unrelated to the an-sdk/ANgroup e-commerce backend in this repo).
 * Calls this app's own /api/notify-accounting route (not AN-Accounting
 * directly), which holds the real secret key server-side.
 *
 * Never throws — a failure here must never break the order-success page
 * for a customer whose order already succeeded.
 */

export interface OrderLineItem {
  description: string;
  quantity: number;
  rate: number;
  gstRatePercent: number;
}

export interface NotifyAccountingInput {
  orderId: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    gstin?: string | null;
    state: string;
  };
  lines: OrderLineItem[];
  payment?: {
    amount: number;
    reference?: string;
    date?: string;
  };
}

export async function notifyAccounting(input: NotifyAccountingInput): Promise<void> {
  try {
    await fetch("/api/notify-accounting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        externalOrderId: input.orderId,
        externalSource: "native-storefront",
        customer: input.customer,
        lines: input.lines,
        payment: input.payment
          ? {
              amount: input.payment.amount,
              method: "OTHER",
              reference: input.payment.reference,
              date: input.payment.date,
            }
          : undefined,
      }),
    });
  } catch {
    // Intentionally swallowed — see file-level comment.
  }
}
