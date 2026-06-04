"use client";

import { useState } from "react";

export default function TrackOrderPage() {
  const [input, setInput] = useState("");
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     FETCH
  ========================= */

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");
      setOrder(null);
      setTracking(null);

      if (!input.trim()) {
        setError("Please enter Order ID or AWB");
        return;
      }

      const res = await fetch(
        `/api/orders/get-by-id?orderId=${input.trim()}`,
        { cache: "no-store" }
      );

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setOrder(data.order);

        const awb = data.order?.shipping?.awbNumber;
        if (awb) await fetchTracking(awb);

        return;
      }

      await fetchTracking(input.trim());
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchTracking = async (awb) => {
    try {
      const res = await fetch(`/api/shipping/track/${awb}`);
      const data = await res.json();
      if (data?.success) setTracking(data);
    } catch {}
  };

  /* =========================
     FLOW
  ========================= */

  const steps = [
    "ORDER PLACED",
    "PAYMENT VERIFIED",
    "PROCESSING",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
  ];

  const currentIndex = steps.indexOf(order?.status || "ORDER PLACED");

  const items = Array.isArray(order?.items)
    ? order.items
    : Array.isArray(order?.cart)
    ? order.cart
    : [];

  const activities =
    tracking?.tracking?.tracking_data?.shipment_track_activities || [];

  const shipment =
    tracking?.tracking?.tracking_data?.shipment_track?.[0] || {};

  const currentStatus =
    shipment?.current_status ||
    tracking?.tracking?.tracking_data?.shipment_status ||
    "IN TRANSIT";

  /* =========================
     UI
  ========================= */

  return (
    <div style={page}>

      {/* HERO */}
      <div style={hero}>
        <div style={heroOverlay} />

        <div style={heroContent}>
          <h1 style={title}>Track Your Order</h1>
          <p style={subtitle}>
            Enter Order ID or AWB to get real-time shipment updates
          </p>

          <div style={searchBox}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Order ID / AWB"
              style={inputStyle}
            />

            <button onClick={fetchOrder} style={btn}>
              Track Order
            </button>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && <div style={errorBox}>{error}</div>}

      {/* LOADING */}
      {loading && <div style={loading}>Tracking your shipment...</div>}

      {/* CONTENT WRAPPER */}
      <div style={container}>

        {/* ORDER CARD */}
        {order && (
          <div style={card}>
            <div style={cardHeader}>
              <div>
                <h2 style={{ margin: 0 }}>Order #{order.orderId}</h2>
                <p style={{ color: "#666" }}>{order.address?.name}</p>
              </div>

              <span style={badge}>{order.status}</span>
            </div>

            {/* PROGRESS BAR */}
            <div style={progressWrap}>
              {steps.map((s, i) => (
                <div key={s} style={stepWrap}>
                  <div
                    style={{
                      ...dot,
                      background: i <= currentIndex ? "#16a34a" : "#ddd",
                    }}
                  />
                  <div style={{ fontSize: 12, textAlign: "center" }}>
                    {s}
                  </div>
                </div>
              ))}
            </div>

            {/* ITEMS */}
            <div style={section}>
              <h3>Items</h3>

              {items.length === 0 ? (
                <p style={{ color: "#888" }}>No items found</p>
              ) : (
                items.map((item, i) => (
                  <div key={i} style={row}>
                    <span>
                      {item.name} × {item.qty}
                    </span>
                    <b>₹{item.price * item.qty}</b>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TRACKING CARD */}
        {tracking && (
          <div style={card}>
            <div style={cardHeader}>
              <div>
                <h2 style={{ margin: 0 }}>Live Tracking</h2>
                <p style={{ color: "#666" }}>AWB: {tracking.awb}</p>
              </div>

              <span style={liveBadge}>{currentStatus}</span>
            </div>

            {/* COURIER */}
            <div style={courierBox}>
              <b>Courier:</b>{" "}
              {shipment?.courier_name || "Assigning..."}
            </div>

            {/* TIMELINE */}
            <div style={timeline}>
              {activities.length === 0 ? (
                <p style={{ color: "#888" }}>
                  Tracking updates will appear soon
                </p>
              ) : (
                activities.map((a, i) => (
                  <div key={i} style={activity}>
                    <div style={activityDot} />
                    <div>
                      <b>{a.activity}</b>
                      <div style={{ color: "#666" }}>{a.location}</div>
                      <small style={{ color: "#999" }}>{a.date}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* =========================
   PREMIUM STYLES
========================= */

const page = {
  minHeight: "100vh",
  background: "#0b1220",
  color: "#fff",
};

const hero = {
  position: "relative",
  padding: "80px 20px",
  background: "linear-gradient(135deg,#0f172a,#1e293b)",
};

const heroOverlay = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(circle at top,#2563eb33,transparent)",
};

const heroContent = {
  position: "relative",
  maxWidth: 900,
  margin: "0 auto",
  textAlign: "center",
};

const title = {
  fontSize: 42,
  fontWeight: 800,
};

const subtitle = {
  opacity: 0.8,
  marginTop: 10,
};

const searchBox = {
  marginTop: 30,
  display: "flex",
  gap: 10,
  justifyContent: "center",
  flexWrap: "wrap",
};

const inputStyle = {
  padding: 14,
  borderRadius: 12,
  border: "none",
  width: 300,
};

const btn = {
  padding: "14px 20px",
  borderRadius: 12,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const container = {
  maxWidth: 1000,
  margin: "40px auto",
  display: "grid",
  gap: 20,
};

const card = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 20,
  padding: 20,
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const badge = {
  background: "#f59e0b",
  padding: "6px 12px",
  borderRadius: 999,
  fontSize: 12,
};

const liveBadge = {
  background: "#16a34a",
  padding: "6px 12px",
  borderRadius: 999,
  fontSize: 12,
};

const progressWrap = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 25,
  gap: 10,
};

const stepWrap = {
  flex: 1,
  textAlign: "center",
};

const dot = {
  width: 12,
  height: 12,
  borderRadius: "50%",
  margin: "0 auto 6px",
};

const section = {
  marginTop: 20,
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
};

const courierBox = {
  marginTop: 15,
  color: "#ddd",
};

const timeline = {
  marginTop: 20,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const activity = {
  display: "flex",
  gap: 12,
  position: "relative",
};

const activityDot = {
  width: 10,
  height: 10,
  borderRadius: "50%",
  background: "#2563eb",
  marginTop: 6,
};

const errorBox = {
  maxWidth: 900,
  margin: "20px auto",
  background: "#7f1d1d",
  padding: 12,
  borderRadius: 10,
};

const loading = {
  textAlign: "center",
  marginTop: 20,
};
