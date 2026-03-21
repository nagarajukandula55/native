"use client";

import { useEffect, useState } from "react";

export default function WarehouseDashboard({ warehouseId }) {
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
        // Filter orders assigned to this warehouse
        const filtered = data.orders.filter((o) =>
          o.warehouseAssignments?.some(
            (w) => w.warehouseId === warehouseId
          )
        );
        // Sort latest first
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(filtered);
      }
    } catch (err) {
      alert("Failed to load orders");
    }
    setLoading(false);
  }

  async function updateOrder(id, { status, paymentStatus, awbNumber }) {
    try {
      setUpdatingId(id);
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, paymentStatus, awbNumber }),
      });
      const data = await res.json();
      if (!data.success) {
        alert("❌ Failed to update order");
      } else {
        await loadOrders();
      }
    } catch (err) {
      alert("Server error");
    }
    setUpdatingId(null);
  }

  const getStatusStyle = (status) => {
    if (status === "Packed") return badgeYellow;
    if (status === "Shipped") return badgeBlue;
    if (status === "Out For Delivery") return badgePurple;
    if (status === "Delivered") return badgeGreen;
    return badgeGray;
  };

  if (loading) return <h2 style={{ padding: 40 }}>Loading Orders...</h2>;

  return (
    <div style={container}>
      <h1 style={title}>🏬 Warehouse Dashboard</h1>
      {orders.length === 0 && <p>No orders assigned to this warehouse.</p>}

      {orders.map((order) => (
        <div key={order._id} style={card}>
          <h3>Order ID: {order.orderId}</h3>
          <p><b>Customer:</b> {order.customerName}</p>
          <p><b>Phone:</b> {order.phone}</p>
          <p><b>Email:</b> {order.email || "-"}</p>
          <p><b>Address:</b> {order.address} - {order.pincode}</p>
          <p><b>Total:</b> ₹{order.totalAmount}</p>
          <p>
            <b>Status:</b>
            <span style={{ ...getStatusStyle(order.status), marginLeft: 8 }}>
              {order.status || "Order Placed"}
            </span>
          </p>
          <p>
            <b>Payment:</b> {order.paymentStatus || "Pending"}
          </p>
          <p><b>AWB:</b> {order.awbNumber || "-"}</p>
          <p><b>Created:</b> {new Date(order.createdAt).toLocaleString()}</p>

          <h4>Items:</h4>
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
              onClick={() => updateOrder(order._id, { status: "Packed" })}
            />
            <ActionButton
              disabled={updatingId === order._id}
              color="#4285f4"
              text="🚚 Shipped"
              onClick={() => updateOrder(order._id, { status: "Shipped" })}
            />
            <ActionButton
              disabled={updatingId === order._id}
              color="#8e24aa"
              text="🛵 Out For Delivery"
              onClick={() => updateOrder(order._id, { status: "Out For Delivery" })}
            />
            <ActionButton
              disabled={updatingId === order._id}
              color="#0f9d58"
              text="✅ Delivered"
              onClick={() => updateOrder(order._id, { status: "Delivered" })}
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <input
              placeholder="Enter AWB Number"
              defaultValue={order.awbNumber || ""}
              style={awbInputStyle}
              onBlur={(e) =>
                updateOrder(order._id, { awbNumber: e.target.value })
              }
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <button
              disabled={updatingId === order._id}
              style={paymentBtnStyle}
              onClick={() =>
                updateOrder(order._id, { paymentStatus: "Paid" })
              }
            >
              Mark Payment Paid
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= STYLES ================= */
const container = { maxWidth: 1100, margin: "auto", padding: 30 };
const title = { fontSize: 28, marginBottom: 25, fontWeight: 600 };
const card = {
  background: "#fff",
  padding: 25,
  marginBottom: 20,
  borderRadius: 12,
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
};
const itemsContainer = { maxHeight: 120, overflowY: "auto", paddingLeft: 10 };
const btnWrap = { marginTop: 15, display: "flex", gap: 10, flexWrap: "wrap" };
const awbInputStyle = { width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" };
const paymentBtnStyle = { padding: 8, width: "100%", borderRadius: 6, background: "#16a34a", color: "#fff", border: "none" };

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
