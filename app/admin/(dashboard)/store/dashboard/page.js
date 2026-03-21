"use client";

import { useEffect, useState } from "react";

export default function StoreDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const stored = localStorage.getItem("store");
  const warehouseId = stored ? JSON.parse(stored).warehouseId : null;

  useEffect(() => {
    if (!warehouseId) return;
    loadOrders();
  }, [warehouseId]);

  async function loadOrders() {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        // Filter orders for this warehouse
        const filtered = data.orders.filter((o) =>
          o.warehouseAssignments?.some(w => w.warehouseId === warehouseId)
        );
        const sorted = filtered.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sorted);
      }
    } catch (err) {
      alert("Failed to load orders");
    }
    setLoading(false);
  }

  async function updateStatus(id, status, paymentStatus, awb) {
    try {
      setUpdatingId(id);
      const body = { id };
      if (status) body.status = status;
      if (paymentStatus) body.paymentStatus = paymentStatus;
      if (awb) body.awb = awb;

      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        await loadOrders();
      } else {
        alert("❌ Failed to update order");
      }
    } catch (e) {
      alert("Server error");
    }
    setUpdatingId(null);
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading Orders...</h2>;

  return (
    <div style={container}>
      <h1 style={title}>📦 Warehouse Dashboard</h1>
      {orders.length === 0 && <p>No orders assigned.</p>}

      {orders.map((order) => {
        const status = order.status || "Order Placed";

        return (
          <div key={order._id} style={card}>
            <h3>Order ID: {order.orderId}</h3>
            <p><b>Customer:</b> {order.customerName}</p>
            <p><b>Phone:</b> {order.phone}</p>
            <p><b>Email:</b> {order.email || "-"}</p>
            <p><b>Address:</b> {order.address} - {order.pincode}</p>
            <p><b>Total:</b> ₹{order.totalAmount}</p>
            <p>
              <b>Status:</b>
              <span style={{ ...getStatusStyle(status), marginLeft: 8 }}>{status}</span>
            </p>
            <p>
              <b>Payment:</b> {order.paymentStatus || "Pending"}
            </p>
            <p>
              <b>AWB:</b> {order.awb || "-"}
            </p>

            <h4>Items:</h4>
            <div style={itemsContainer}>
              {order.items?.map((item, i) => (
                <p key={i}>{item.name} — {item.quantity} × ₹{item.price}</p>
              ))}
            </div>

            <div style={btnWrap}>
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
                color="#0f9d58"
                text="✅ Delivered"
                onClick={() => updateStatus(order._id, "Delivered")}
              />
              <ActionButton
                disabled={updatingId === order._id}
                color="#8e24aa"
                text="💰 Mark Paid"
                onClick={() => updateStatus(order._id, null, "Paid")}
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <input
                placeholder="Enter AWB"
                style={{ padding: 6, width: 200, marginRight: 6 }}
                onBlur={(e) => updateStatus(order._id, null, null, e.target.value)}
                defaultValue={order.awb || ""}
              />
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
const itemsContainer = { maxHeight: 120, overflowY: "auto", paddingLeft: 10 };
const btnWrap = { marginTop: 15, display: "flex", gap: 10, flexWrap: "wrap" };
const badgeYellow = { padding: "4px 10px", background: "#f4b400", color: "#fff", borderRadius: 6 };
const badgeBlue = { padding: "4px 10px", background: "#4285f4", color: "#fff", borderRadius: 6 };
const badgeGreen = { padding: "4px 10px", background: "#0f9d58", color: "#fff", borderRadius: 6 };
const badgeGray = { padding: "4px 10px", background: "#777", color: "#fff", borderRadius: 6 };

function getStatusStyle(status) {
  if (status === "Packed") return badgeYellow;
  if (status === "Shipped") return badgeBlue;
  if (status === "Delivered") return badgeGreen;
  return badgeGray;
}

function ActionButton({ text, color, onClick, disabled }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{ padding: "8px 14px", border: "none", background: color, color: "#fff", cursor: disabled ? "not-allowed" : "pointer", borderRadius: 6, opacity: disabled ? 0.6 : 1 }}
    >
      {text}
    </button>
  );
}
