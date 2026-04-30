"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrderSuccess() {
  const params = useSearchParams();
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const id =
      params.get("orderId") ||
      sessionStorage.getItem("lastOrderId");

    setOrderId(id || "");
  }, [params]);

  const copyOrderId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    alert("Order ID copied");
  };

  return (
    <div style={styles.container}>

      <div style={styles.card}>

        <h1 style={styles.title}>
          🎉 Order Placed Successfully
        </h1>

        <p style={styles.subText}>
          Your Order ID
        </p>

        <div style={styles.orderBox}>
          <h2 style={styles.orderId}>
            {orderId || "Generating..."}
          </h2>

          <button onClick={copyOrderId} style={styles.copyBtn}>
            Copy
          </button>
        </div>

        <p style={styles.note}>
          💡 Keep this Order ID for tracking & support
        </p>

        <div style={styles.infoBox}>
          <p>✔ Payment Method Selected (Razorpay / UPI / Manual)</p>
          <p>✔ You will receive confirmation via WhatsApp</p>
          <p>✔ Admin will verify manual payments (if selected)</p>
        </div>

        <Link href="/products">
          <button style={styles.button}>
            Continue Shopping
          </button>
        </Link>

      </div>

    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  container: {
    padding: "60px",
    display: "flex",
    justifyContent: "center",
  },

  card: {
    maxWidth: "500px",
    width: "100%",
    textAlign: "center",
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },

  title: {
    marginBottom: "20px",
  },

  subText: {
    fontSize: "16px",
    color: "#666",
  },

  orderBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    margin: "15px 0",
  },

  orderId: {
    color: "green",
    margin: 0,
  },

  copyBtn: {
    padding: "6px 10px",
    cursor: "pointer",
    border: "1px solid #ccc",
    background: "#f5f5f5",
    borderRadius: "6px",
  },

  note: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#777",
  },

  infoBox: {
    marginTop: "20px",
    textAlign: "left",
    fontSize: "14px",
    background: "#f9f9f9",
    padding: "15px",
    borderRadius: "8px",
  },

  button: {
    marginTop: "25px",
    padding: "12px 25px",
    background: "#2c7a4b",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "8px",
  },
};
