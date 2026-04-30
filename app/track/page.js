"use client";

import { useState } from "react";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const fetchOrder = async () => {
  try {
    setLoading(true);
    setError("");
    setOrder(null);

    if (!orderId.trim()) {
      setError("Please enter Order ID");
      return;
    }

    const res = await fetch(
      `/api/orders/get-by-id?orderId=${orderId.trim()}`,
      {
        cache: "no-store",
      }
    );

    const data = await res.json().catch(() => null);

    console.log("TRACK RESPONSE:", data);

    if (!res.ok || !data?.success) {
      setError(data?.message || "Order not found");
      return;
    }

    setOrder(data.order);

  } catch (err) {
    console.error(err);
    setError("Something went wrong");
  } finally {
    setLoading(false);
  }
};

  /* ================= ORDER FLOW ================= */
  const steps = [
    "PENDING_PAYMENT",
    "PAID",
    "PROCESSING",
    "ASSIGNED_TO_WH",
    "SHIPPED",
    "DELIVERED",
  ];

  const currentIndex = steps.indexOf(order?.status || "PENDING_PAYMENT");

  return (
    <div style={container}>
      <h2>📦 Track Your Order</h2>

      {/* SEARCH */}
      <div style={searchBox}>
        <input
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          style={input}
        />

        <button onClick={fetchOrder} style={btn}>
          Track
        </button>
      </div>

      {/* ERROR */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* LOADING */}
      {loading && <p>Tracking order...</p>}

      {/* ORDER CARD */}
      {order && (
        <div style={card}>
          <h3>Order #{order.orderId}</h3>

          <p><b>Name:</b> {order.address?.name}</p>
          <p><b>Phone:</b> {order.address?.phone}</p>
          <p><b>Amount:</b> ₹{order.amount}</p>
          <p><b>Status:</b> {order.status}</p>

          {/* ================= TIMELINE ================= */}
          <div style={timeline}>
            {steps.map((step, index) => {
              const isActive = index <= currentIndex;

              const time = order?.timeline?.find(
                (t) => t.status === step
              )?.time;

              return (
                <div key={step} style={stepBox}>
                  <div
                    style={{
                      ...circle,
                      background: isActive ? "#16a34a" : "#e5e7eb",
                    }}
                  />

                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: isActive ? "#111" : "#9ca3af",
                      }}
                    >
                      {step}
                    </div>

                    {time && (
                      <small style={{ color: "#6b7280" }}>
                        {new Date(time).toLocaleString()}
                      </small>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ITEMS */}
          <div style={{ marginTop: 20 }}>
            <h4>Items</h4>

            {order.items?.map((item, i) => (
              <div key={i} style={itemRow}>
                <span>
                  {item.name} x {item.qty}
                </span>
                <span>₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  maxWidth: 700,
  margin: "auto",
  padding: 20,
};

const searchBox = {
  display: "flex",
  gap: 10,
  marginBottom: 20,
};

const input = {
  flex: 1,
  padding: 10,
  border: "1px solid #ddd",
  borderRadius: 8,
};

const btn = {
  padding: "10px 15px",
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 8,
};

const card = {
  padding: 20,
  border: "1px solid #eee",
  borderRadius: 12,
  background: "#fff",
};

const timeline = {
  marginTop: 20,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const stepBox = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const circle = {
  width: 12,
  height: 12,
  borderRadius: "50%",
};

const itemRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "6px 0",
  borderBottom: "1px solid #f1f1f1",
};
