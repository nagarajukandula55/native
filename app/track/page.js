"use client";

import { useState } from "react";
import { getOrders } from "@/lib/an-sdk/orders";
import { syncTracking } from "@/lib/an-sdk/shipping";

export default function TrackOrderPage() {
  const [input, setInput] = useState("");
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= FETCH ================= */

  const fetchTracking = async () => {
    try {
      setLoading(true);
      setError("");
      setOrder(null);
      setTracking(null);

      if (!input.trim()) {
        setError("Please enter Order ID or AWB Number");
        return;
      }

      const ordersRes = await getOrders();

      if (!ordersRes?.success) {
        setError("Failed to load orders");
        return;
      }

      const allOrders = ordersRes.orders || [];

      const foundOrder = allOrders.find(
        (o) =>
          o?.orderId === input.trim() ||
          o?.shipping?.awbNumber === input.trim()
      );

      if (!foundOrder) {
        setError("Order not found");
        return;
      }

      setOrder(foundOrder);

      /* ================= LIVE TRACKING ================= */

      if (foundOrder?.shipping?.awbNumber) {
        const trackRes = await syncTracking(
          foundOrder.shipping.awbNumber
        );

        if (trackRes?.success) {
          setTracking(trackRes);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while tracking order");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div style={container}>
      {/* HERO */}
      <div style={hero}>
        <h1 style={title}>📦 Track Your Order</h1>
        <p style={sub}>
          Enter Order ID or AWB Number to track shipment
        </p>

        <div style={searchBox}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter Order ID / AWB"
            style={inputStyle}
          />

          <button onClick={fetchTracking} style={btn}>
            Track
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && <div style={errorBox}>{error}</div>}

      {/* LOADING */}
      {loading && <div style={loadingBox}>Tracking your order...</div>}

      {/* ORDER CARD */}
      {order && (
        <div style={card}>
          <h2 style={{ marginBottom: 8 }}>
            Order #{order.orderId}
          </h2>

          <p style={{ opacity: 0.8 }}>
            {order?.address?.name} • {order?.address?.phone}
          </p>

          <div style={grid}>
            <div>
              <b>Status</b>
              <p>{order?.status}</p>
            </div>

            <div>
              <b>Amount</b>
              <p>₹{order?.amount}</p>
            </div>

            <div>
              <b>AWB</b>
              <p>{order?.shipping?.awbNumber || "-"}</p>
            </div>
          </div>
        </div>
      )}

      {/* TRACKING CARD */}
      {tracking && (
        <div style={card}>
          <h2>🚚 Live Shipment Tracking</h2>

          <p>
            Status: <b>{tracking?.trackingStatus || "IN_TRANSIT"}</b>
          </p>

          <p>
            Order ID: <b>{tracking?.orderId}</b>
          </p>
        </div>
      )}
    </div>
  );
}

/* ================= PREMIUM DARK UI ================= */

const container = {
  minHeight: "100vh",
  background: "linear-gradient(135deg,#0b0f19,#111827)",
  color: "#fff",
  padding: 24,
};

const hero = {
  maxWidth: 900,
  margin: "0 auto",
  padding: 40,
  borderRadius: 20,
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const title = {
  fontSize: 34,
  fontWeight: 700,
};

const sub = {
  opacity: 0.7,
  marginTop: 8,
};

const searchBox = {
  display: "flex",
  gap: 12,
  marginTop: 20,
};

const inputStyle = {
  flex: 1,
  padding: 14,
  borderRadius: 12,
  border: "none",
  outline: "none",
};

const btn = {
  padding: "14px 22px",
  background: "#3b82f6",
  border: "none",
  borderRadius: 12,
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const card = {
  maxWidth: 900,
  margin: "20px auto",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: 20,
  backdropFilter: "blur(10px)",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 12,
  marginTop: 12,
};

const errorBox = {
  maxWidth: 900,
  margin: "20px auto",
  background: "#7f1d1d",
  padding: 12,
  borderRadius: 12,
};

const loadingBox = {
  textAlign: "center",
  marginTop: 20,
  opacity: 0.8,
};
