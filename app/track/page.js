"use client";

import { useState } from "react";

export default function TrackOrderPage() {
  const [input, setInput] = useState("");
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     FETCH ORDER + TRACKING
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

      /* =========================
         GET ORDER FROM DB
      ========================= */

      const res = await fetch(
        `/api/orders/get-by-id?orderId=${input.trim()}`,
        { cache: "no-store" }
      );

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setOrder(data.order);

        const awb = data.order?.shipping?.awbNumber;

        if (awb) {
          await fetchTracking(awb);
        }

        return;
      }

      /* =========================
         TRY DIRECT AWB TRACKING
      ========================= */

      await fetchTracking(input.trim());

    } catch (err) {
      console.error(err);
      setError("Something went wrong while tracking");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     AWB TRACKING FUNCTION
  ========================= */

  const fetchTracking = async (awb) => {
    try {
      const res = await fetch(`/api/shipping/track/${awb}`);
      const data = await res.json();

      if (data?.success) {
        setTracking(data);
      }
    } catch (err) {
      console.error("Tracking error:", err);
    }
  };

  /* =========================
     ORDER STATUS FLOW
  ========================= */

  const steps = [
    "PENDING_PAYMENT",
    "PAID",
    "PROCESSING",
    "PACKED",
    "DISPATCHED",
    "DELIVERED",
  ];

  const currentIndex = steps.indexOf(order?.status || "PENDING_PAYMENT");

  /* =========================
     SAFE DATA HELPERS
  ========================= */

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
    "IN_TRANSIT";

  /* =========================
     UI
  ========================= */

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fb", padding: 20 }}>
      
      {/* HERO */}
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto 30px",
          background: "linear-gradient(135deg,#111,#222)",
          color: "#fff",
          borderRadius: 24,
          padding: 40,
        }}
      >
        <h1 style={{ fontSize: 36 }}>📦 Track Shipment</h1>
        <p style={{ opacity: 0.8 }}>Enter Order ID or AWB Number</p>

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Order ID / AWB"
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 12,
              border: "none",
            }}
          />

          <button
            onClick={fetchOrder}
            style={{
              padding: "14px 24px",
              borderRadius: 12,
              border: "none",
              background: "#16a34a",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            Track
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            maxWidth: 1000,
            margin: "20px auto",
            background: "#fee2e2",
            color: "#991b1b",
            padding: 16,
            borderRadius: 12,
          }}
        >
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div style={{ textAlign: "center" }}>Loading...</div>
      )}

      {/* ORDER CARD */}
      {order && (
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto 24px",
            background: "#fff",
            borderRadius: 20,
            padding: 24,
          }}
        >
          <h2>Order #{order.orderId}</h2>
          <p>{order.address?.name}</p>

          <div style={{ marginTop: 20 }}>
            <b>Status:</b> {order.status}
          </div>

          {/* SAFE ITEMS */}
          <h3 style={{ marginTop: 20 }}>Items</h3>

          {items.length === 0 ? (
            <p>No items found</p>
          ) : (
            items.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{item.name} x {item.qty}</span>
                <span>₹{item.price * item.qty}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* TRACKING */}
      {tracking && (
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            background: "#fff",
            borderRadius: 20,
            padding: 24,
          }}
        >
          <h2>🚚 Live Tracking</h2>

          <p>
            AWB: <b>{tracking.awb}</b>
          </p>

          <p>Status: <b>{currentStatus}</b></p>

          {/* ACTIVITIES */}
          <div style={{ marginTop: 20 }}>
            {activities.length === 0 ? (
              <p>No tracking updates yet</p>
            ) : (
              activities.map((a, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <b>{a.activity}</b>
                  <div>{a.location}</div>
                  <small>{a.date}</small>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
