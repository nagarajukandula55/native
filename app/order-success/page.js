"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId") || "N/A"; // fallback if missing

  return (
    <div
      style={{
        padding: "80px 60px",
        minHeight: "100vh",
        textAlign: "center",
        fontFamily: "'Georgia', serif",
        backgroundColor: "#f4efe6",
      }}
    >
      <h1
        style={{
          fontSize: "40px",
          color: "#2e7d32",
          marginBottom: "20px",
        }}
      >
        🎉 Order Placed Successfully!
      </h1>

      <p style={{ fontSize: "18px", marginBottom: "10px" }}>
        Your Order ID:
      </p>

      <h2 style={{ color: "#c28b45", fontSize: "28px", marginBottom: "30px" }}>
        {orderId}
      </h2>

      <p style={{ fontSize: "16px", marginBottom: "40px" }}>
        We will contact you shortly regarding payment and delivery.
      </p>

      <button
        onClick={() => router.push("/")}
        style={{
          padding: "12px 30px",
          borderRadius: "25px",
          border: "none",
          backgroundColor: "#c28b45",
          color: "#fff",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Continue Shopping
      </button>
    </div>
  );
}
