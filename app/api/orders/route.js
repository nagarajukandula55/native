"use client";

import { useEffect, useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        const sorted = data.orders.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sorted);
      }
    } catch (err) {
      alert("Failed to load orders");
    }
    setLoading(false);
  }

  async function updateStatus(id, status) {
    try {
      setUpdatingId(id);
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        await loadOrders();
      } else {
        alert("❌ Failed to update status");
      }
    } catch (e) {
      alert("Server error");
    }
    setUpdatingId(null);
  }

  // Mark UPI payment as Paid
  async function markUpiPaid(orderId) {
    if (!confirm("Mark this UPI payment as Paid?")) return;
    try {
      setUpdatingId(orderId);
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, paymentStatus: "Paid" }),
      });
      const data = await res.json();
      if (data.success) {
        await loadOrders();
      } else {
        alert("❌ Failed to mark payment");
      }
    } catch (e) {
      alert("Server error");
    }
    setUpdatingId(null);
  }

  const getStatusStyle = (status) => {
    if (status === "Packed") return badgeYellow;
    if (status === "Shipped") return badgeBlue;
    if (status === "Out For Delivery") return badgePurple;
    if (status === "Delivered") return badgeGreen;
    if (status === "Paid") return badgeGreen;
    return badgeGray;
  };

  if (loading) return <h2 style={{ padding: 40 }}>Loading Orders...</h2>;

  return (
    <div style={container}>
      <h1 style={title}>📦 Orders Dashboard</h1>

      {orders.length === 0 && <p>No orders yet</p>}

      {orders.map((order) => {
        const status = order.status || "Order Placed";

        return (
          <div key={order._id} style={card}>
            <h3 style={{ marginBottom: 8 }}>Order ID: {order.orderId}</h3>
            <p><b>Customer:</b> {order.customerName}</p>
            <p><b>Phone:</b> {order.phone}</p>
            <p><b>Email:</b> {order.email || "-"}</p>
            <p><b>Address:</b> {order.address} - {order.pincode}</p>
            <p style={{ marginTop: 10 }}><b>Total:</b> ₹{order.totalAmount}</p>
            <p>
              <b>Status:</b>
              <span style={{ ...getStatusStyle(status), marginLeft: 8 }}>{status}</span>
            </p>
            <p>
              <b>Payment:</b> {order.paymentMethod} — {order.paymentStatus || "Pending"}
            </p>
            <p><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</p>

            <h4 style={{ marginTop: 15 }}>Items:</h4>
            <div style={itemsContainer}>
              {order.items?.map((item, i) => (
                <p key={i}>{item.name} — {item.quantity} × ₹{item.price}</p>
              ))}
            </div>

            <div style={btnWrap}>
              {/* Status Buttons */}
              <ActionButton
                disabled={updatingId === order._id}
                color="#f4b400"
                text="📦 Packed"
                onClick={() => updateStatus(order._id, "Packed")}
              />
              <ActionButton
                disabled={updatingId === order._id}
                color="#4285f4"
                text="🚚 Shipped"
                onClick={() => updateStatus(order._id, "Shipped")}
              />
              <ActionButton
                disabled={updatingId === order._id}
                color="#8e24aa"
                text="🛵 Out For Delivery"
                onClick={() => updateStatus(order._id, "Out For Delivery")}
              />
              <ActionButton
                disabled={updatingId === order._id}
                color="#0f9d58"
                text="✅ Delivered"
                onClick={() => updateStatus(order._id, "Delivered")}
              />

              {/* UPI Payment Confirmation */}
              {order.paymentMethod === "UPI" && order.paymentStatus === "Pending" && (
                <ActionButton
                  disabled={updatingId === order._id}
                  color="#16a34a"
                  text="💰 Mark Paid"
                  onClick={() => markUpiPaid(order._id)}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ================= STYLES ================= */
const container = { maxWidth: 1100, margin: "auto", padding: 30 };
const title = { fontSize: 28, marginBottom: 25, fontWeight: 600 };
const card = { background: "#fff", padding: 25, marginBottom: 20, borderRadius: 12, boxShadow: "0 4px 14px rgba(0,0,0,0.08)" };
const itemsContainer = { maxHeight: 150, overflowY: "auto", paddingLeft: 10 };
const btnWrap = { marginTop: 15, display: "flex", gap: 10, flexWrap: "wrap" };
const badgeYellow = { padding: "4px 10px", background: "#f4b400", color: "#fff", borderRadius: 6 };
const badgeBlue = { padding: "4px 10px", background: "#4285f4", color: "#fff", borderRadius: 6 };
const badgePurple = { padding: "4px 10px", background: "#8e24aa", color: "#fff", borderRadius: 6 };
const badgeGreen = { padding: "4px 10px", background: "#0f9d58", color: "#fff", borderRadius: 6 };
const badgeGray = { padding: "4px 10px", background: "#777", color: "#fff", borderRadius: 6 };

function ActionButton({ text, color, onClick, disabled }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: "8px 14px",
        border: "none",
        background: color,
        color: "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        borderRadius: 6,
        transition: "all 0.2s",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {text}
    </button>
  );
}
