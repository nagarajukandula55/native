"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  return (
    <div style={{ padding: "80px 60px", minHeight: "100vh", textAlign: "center" }}>
      <h1 style={{ fontSize: "40px", color: "#2e7d32" }}>
        🎉 Order Placed Successfully!
      </h1>

      <p style={{ marginTop: "20px", fontSize: "18px" }}>
        Your Order ID:
      </p>

      <h2 style={{ marginTop: "10px", color: "#c28b45" }}>
        {orderId}
      </h2>

      <p style={{ marginTop: "30px" }}>
        We will contact you shortly regarding payment and delivery.
      </p>

      <button
        onClick={() => router.push("/")}
        style={{
          marginTop: "40px",
          padding: "12px 30px",
          borderRadius: "25px",
          border: "none",
          backgroundColor: "#c28b45",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Continue Shopping
      </button>
    </div>
  );
}
