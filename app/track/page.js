"use client";

import { useState } from "react";
import { getOrderById } from "@/lib/an-sdk/orders";
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

      // Look up by orderId directly instead of pulling the entire (currently
      // unauthenticated, unfiltered) /api/orders/list — see lib/an-sdk/orders.ts
      // for why that route shouldn't be used for a customer-facing lookup.
      const res = await getOrderById(input.trim());
      const foundOrder = res?.order || (res?.success ? res : null);

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
          <h2 style={{ margin: "0 0 8px", color: "#1f3d2b" }}>
            Order #{order.orderId}
          </h2>

          <p style={{ margin: 0, color: "#666" }}>
            {order?.address?.name} • {order?.address?.phone}
          </p>

          <div style={grid}>
            <div style={gridCell}>
              <b style={gridLabel}>Status</b>
              <p style={gridValue}>{order?.status}</p>
            </div>

            <div style={gridCell}>
              <b style={gridLabel}>Amount</b>
              <p style={gridValue}>₹{order?.amount}</p>
            </div>

            <div style={gridCell}>
              <b style={gridLabel}>AWB</b>
              <p style={gridValue}>{order?.shipping?.awbNumber || "-"}</p>
            </div>
          </div>
        </div>
      )}

      {/* TRACKING CARD */}
      {tracking && (
        <div style={card}>
          <h2 style={{ margin: "0 0 8px", color: "#1f3d2b" }}>
            🚚 Live Shipment Tracking
          </h2>

          <p style={{ margin: "4px 0", color: "#444" }}>
            Status: <b>{tracking?.trackingStatus || "IN_TRANSIT"}</b>
          </p>

          <p style={{ margin: "4px 0", color: "#444" }}>
            Order ID: <b>{tracking?.orderId}</b>
          </p>
        </div>
      )}
    </div>
  );
}

/* ================= LIGHT UI — matches the site's established palette
   (cream background, #1f3d2b dark-green primary, #c28b45 gold accent,
   white rounded cards) already used across HomeClient.js / Footer.js /
   checkout / sell pages. ================= */

const container = {
  minHeight: "calc(100vh - 200px)",
  background: "#faf8f3",
  color: "#1a1a1a",
  padding: "40px 20px 60px",
};

const hero = {
  maxWidth: 700,
  margin: "0 auto",
  padding: 36,
  borderRadius: 16,
  background: "#fff",
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  textAlign: "center",
};

const title = {
  fontSize: 28,
  fontWeight: 700,
  margin: 0,
  color: "#1f3d2b",
};

const sub = {
  color: "#666",
  marginTop: 8,
  marginBottom: 0,
  fontSize: 14,
};

const searchBox = {
  display: "flex",
  alignItems: "stretch",
  gap: 12,
  marginTop: 22,
};

const inputStyle = {
  flex: 1,
  padding: "13px 14px",
  borderRadius: 8,
  border: "1px solid #ddd",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};

const btn = {
  padding: "13px 26px",
  background: "#1f3d2b",
  border: "none",
  borderRadius: 8,
  color: "#fff",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const card = {
  maxWidth: 700,
  margin: "20px auto 0",
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 12,
  marginTop: 16,
};

const gridCell = {
  background: "#faf8f3",
  borderRadius: 10,
  padding: "12px 14px",
  textAlign: "center",
};

const gridLabel = {
  fontSize: 12,
  color: "#888",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
};

const gridValue = {
  margin: "4px 0 0",
  fontWeight: 600,
  color: "#1a1a1a",
};

const errorBox = {
  maxWidth: 700,
  margin: "20px auto 0",
  background: "#fdecec",
  color: "#e11d48",
  padding: "12px 16px",
  borderRadius: 10,
  textAlign: "center",
  fontSize: 14,
};

const loadingBox = {
  textAlign: "center",
  marginTop: 20,
  color: "#666",
};
