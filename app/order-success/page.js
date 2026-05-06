"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrderSuccess() {
  const params = useSearchParams();

  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState("LOADING");
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ORDER ================= */
  useEffect(() => {
    const id =
      params.get("orderId") ||
      sessionStorage.getItem("lastOrderId");

    if (!id) {
      setStatus("NOT_FOUND");
      setLoading(false);
      return;
    }

    setOrderId(id);

    // 🔥 store for reload safety
    sessionStorage.setItem("lastOrderId", id);

    fetchOrder(id);
  }, [params]);

  /* ================= FETCH ORDER ================= */
  const fetchOrder = async (id) => {
    try {
      const res = await fetch(`/api/orders/get?orderId=${id}`);
      const data = await res.json();

      if (!data.success) {
        setStatus("NOT_FOUND");
      } else {
        setStatus(data.order.status);
      }
    } catch (err) {
      console.error(err);
      setStatus("ERROR");
    } finally {
      setLoading(false);
    }
  };

  /* ================= COPY ================= */
  const copyOrderId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    alert("Order ID copied");
  };

  /* ================= UI ================= */
  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <h1 style={styles.title}>
          {status === "PAID"
            ? "🎉 Payment Successful"
            : "⏳ Order Created"}
        </h1>

        <p style={styles.subText}>Your Order ID</p>

        <div style={styles.orderBox}>
          <h2 style={styles.orderId}>
            {orderId || "Generating..."}
          </h2>

          <button onClick={copyOrderId} style={styles.copyBtn}>
            Copy
          </button>
        </div>

        {/* STATUS BADGE */}
        <div style={styles.statusBox}>
          Status: <b>{status}</b>
        </div>

        {/* INFO */}
        <div style={styles.infoBox}>
          {status === "PAID" && (
            <>
              <p>✔ Payment received successfully</p>
              <p>✔ Order will be processed soon</p>
            </>
          )}

          {status === "PENDING_PAYMENT" && (
            <>
              <p>⏳ Payment pending</p>
              <p>✔ If paid via UPI, click below to refresh</p>
            </>
          )}

          {status === "FAILED" && (
            <>
              <p>❌ Payment failed</p>
              <p>Please retry payment</p>
            </>
          )}
        </div>

        {/* ACTIONS */}
        <div style={{ marginTop: 20 }}>
          <button
            onClick={() => fetchOrder(orderId)}
            style={styles.refreshBtn}
          >
            🔄 Refresh Status
          </button>
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

  statusBox: {
    marginTop: "10px",
    padding: "10px",
    background: "#f1f1f1",
    borderRadius: "6px",
  },

  infoBox: {
    marginTop: "20px",
    textAlign: "left",
    fontSize: "14px",
    background: "#f9f9f9",
    padding: "15px",
    borderRadius: "8px",
  },

  refreshBtn: {
    padding: "10px 15px",
    background: "#333",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
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
