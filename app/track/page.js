"use client";

import { useState } from "react";
import { getOrders } from "@/lib/an-sdk/orders";
import { syncTracking } from "@/lib/an-sdk/shipping";

export default function TrackOrderPage() {
  const [input, setInput] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTracking = async () => {
    try {
      setLoading(true);
      setError("");
      setOrder(null);
      setTracking(null);

      if (!input.trim()) {
        setError("Enter Order ID or AWB");
        return;
      }

      const ordersRes = await getOrders();

      if (!ordersRes?.success) {
        setError("Failed to fetch orders");
        return;
      }

      const allOrders = ordersRes.orders || [];

      const foundOrder = allOrders.find(
        (o: any) =>
          o.orderId === input ||
          o.shipping?.awbNumber === input
      );

      if (!foundOrder) {
        setError("Order not found");
        return;
      }

      setOrder(foundOrder);

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
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      {/* HERO */}
      <div style={hero}>
        <h1 style={title}>📦 Track Your Order</h1>
        <p style={sub}>
          Enter Order ID or AWB Number
        </p>

        <div style={searchBox}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Order ID / AWB"
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
      {loading && <div style={loading}>Loading...</div>}

      {/* ORDER CARD */}
      {order && (
        <div style={card}>
          <h2>{order.orderId}</h2>

          <p>
            {order.address?.name} | {order.address?.phone}
          </p>

          <div style={grid}>
            <div>Status: {order.status}</div>
            <div>Amount: ₹{order.amount}</div>
            <div>
              AWB: {order.shipping?.awbNumber || "-"}
            </div>
          </div>
        </div>
      )}

      {/* TRACKING */}
      {tracking && (
        <div style={card}>
          <h2>🚚 Live Tracking</h2>

          <p>Status: {tracking.trackingStatus}</p>
        </div>
      )}
    </div>
  );
}

/* ================= PREMIUM UI ================= */

const container = {
  minHeight: "100vh",
  background: "#0b0f19",
  color: "#fff",
  padding: 24,
};

const hero = {
  maxWidth: 900,
  margin: "0 auto",
  padding: 40,
  borderRadius: 20,
  background: "linear-gradient(135deg,#111827,#1f2937)",
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
};

const btn = {
  padding: "14px 20px",
  background: "#3b82f6",
  border: "none",
  borderRadius: 12,
  color: "#fff",
  fontWeight: 700,
};

const card = {
  maxWidth: 900,
  margin: "20px auto",
  background: "#111827",
  padding: 20,
  borderRadius: 16,
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

const loading = {
  textAlign: "center",
  marginTop: 20,
};
