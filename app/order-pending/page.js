"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function OrderPendingPage() {
  const params = useSearchParams();
  const router = useRouter();

  const orderId = params.get("orderId");

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      
      <h1>⏳ Payment Pending</h1>

      <p style={{ marginTop: 10 }}>
        Your order has been created but payment is not completed yet.
      </p>

      <p style={{ marginTop: 10 }}>
        <b>Order ID:</b> {orderId}
      </p>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => router.push("/")}>
          Go to Home
        </button>

        <button
          onClick={() => router.push(`/order-success?orderId=${orderId}`)}
          style={{ marginLeft: 10 }}
        >
          I Paid → Check Status
        </button>
      </div>
    </div>
  );
}
