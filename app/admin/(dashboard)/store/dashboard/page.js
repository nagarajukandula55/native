"use client";

import { useEffect, useState } from "react";

export default function StoreDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("storeToken") : null;

  useEffect(() => {
    if (token) loadOrders();
  }, [token]);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/store/orders", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      });
      const data = await res.json();
      if (data.success) {
        const sorted = data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);
      } else {
        alert("Failed to load orders");
      }
    } catch (err) {
      alert("Server error");
      console.error(err);
    }
    setLoading(false);
  }

  async function updateOrder(id, field, value) {
    try {
      setUpdatingId(id);
      const res = await fetch("/api/store/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, [field]: value }),
      });
      const data = await res.json();
      if (data.success) {
        await loadOrders();
      } else {
        alert("❌ Failed to update order");
      }
    } catch (e) {
      alert("Server error");
      console.error(e);
    }
    setUpdatingId(null);
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading Orders...</h2>;

  return (
    <div style={container}>
      <h1 style={title}>📦 Store Dashboard</h1>
      {orders.length === 0 && <p>No orders assigned to your warehouse yet.</p>}

      {orders.map(order => {
        const { _id, orderId, customerName, phone, address, pincode, items, totalAmount, status, paymentStatus, awb } = order;

        return (
          <div key={_id} style={card}>
            <h3>Order ID: {orderId}</h3>
            <p><b>Customer:</b> {customerName}</p>
            <p><b>Phone:</b> {phone}</p>
            <p><b>Address:</b> {address} - {pincode}</p>
            <p><b>Total:</b> ₹{totalAmount}</p>
            <p><b>Status:</b> <span style={badgeStyle(status)}>{status}</span></p>
            <p><b>Payment:</b> <span style={badgeStyle(paymentStatus)}>{paymentStatus}</span></p>
            <p><b>AWB:</b>
              <input
                value={awb || ""}
                onChange={e => updateOrder(_id, "awb", e.target.value)}
                style={{ padding: 5, marginLeft: 10, width: 200 }}
              />
            </p>

            <div style={btnWrap}>
              {["Packed","Shipped","Out For Delivery","Delivered"].map(s => (
                <button
                  key={s}
                  disabled={updatingId === _id}
                  onClick={() => updateOrder(_id, "status", s)}
                  style={{ ...actionBtn, background: statusColor(s) }}
                >
                  {s}
                </button>
              ))}
              {["Pending","Paid"].map(p => (
                <button
                  key={p}
                  disabled={updatingId === _id}
                  onClick={() => updateOrder(_id, "paymentStatus", p)}
                  style={{ ...actionBtn, background: paymentColor(p) }}
                >
                  {p}
                </button>
              ))}
            </div>

            <h4>Items:</h4>
            <div>
              {items.map((item, i) => <p key={i}>{item.name} — {item.quantity} × ₹{item.price}</p>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ===== STYLES ===== */
const container = { maxWidth: 1100, margin: "auto", padding: 30 };
const title = { fontSize: 28, marginBottom: 25, fontWeight: 600 };
const card = { background: "#fff", padding: 25, marginBottom: 20, borderRadius: 12, boxShadow: "0 4px 14px rgba(0,0,0,0.08)" };
const btnWrap = { marginTop: 15, display: "flex", gap: 10, flexWrap: "wrap" };
const actionBtn = { padding: "6px 12px", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };

const badgeStyle = (status) => ({
  padding: "4px 10px",
  borderRadius: 6,
  color: "#fff",
  background: status === "Delivered" || status === "Paid" ? "#0f9d58" : "#f4b400"
});

const statusColor = (status) => {
  switch(status) {
    case "Packed": return "#f4b400";
    case "Shipped": return "#4285f4";
    case "Out For Delivery": return "#8e24aa";
    case "Delivered": return "#0f9d58";
    default: return "#777";
  }
};

const paymentColor = (status) => status === "Paid" ? "#0f9d58" : "#f4b400";
