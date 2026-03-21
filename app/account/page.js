"use client";

import { useEffect, useState } from "react";

export default function AccountPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await fetch("/api/user/orders", { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading...</h2>;

  return (
    <div style={container}>
      <h1 style={title}>👤 My Orders</h1>

      {orders.length === 0 && <p>No orders found</p>}

      {orders.map((order) => (
        <div key={order._id} style={card}>
          <h3>Order ID: {order.orderId}</h3>

          <p><b>Total:</b> ₹{order.totalAmount}</p>

          <p>
            <b>Status:</b>{" "}
            <span style={badge(order.status)}>
              {order.status}
            </span>
          </p>

          <p>
            <b>Payment:</b>{" "}
            <span style={badge(order.paymentStatus)}>
              {order.paymentStatus}
            </span>
          </p>

          {/* TRACK BUTTON */}
          <button
            onClick={() => window.location.href = `/track?id=${order.orderId}`}
            style={trackBtn}
          >
            Track Order
          </button>

          {/* ITEMS */}
          <div style={{ marginTop: 10 }}>
            {order.items.map((item, i) => (
              <p key={i}>
                {item.name} — {item.quantity} × ₹{item.price}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===== STYLES ===== */

const container = {
  maxWidth: 900,
  margin: "auto",
  padding: 30,
};

const title = {
  fontSize: 26,
  marginBottom: 20,
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  marginBottom: 20,
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
};

const badge = (status) => ({
  padding: "4px 10px",
  borderRadius: 6,
  color: "#fff",
  background:
    status === "Delivered" || status === "Paid"
      ? "#16a34a"
      : "#f59e0b",
});

const trackBtn = {
  marginTop: 10,
  padding: "8px 14px",
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
