"use client";

import { useEffect, useState } from "react";

export default function StoreOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/store/orders"); // your store orders API
      const json = await res.json();
      if (json.success) setOrders(json.orders || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load orders");
    }
    setLoading(false);
  }

  async function handleUpdate(orderId, field, value) {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/store/update-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, [field]: value }),
      });
      const json = await res.json();
      if (json.success) {
        loadOrders();
      } else {
        alert(json.msg || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
    setUpdatingId(null);
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading your orders...</h2>;

  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>📦 My Assigned Orders</h1>

      {orders.length === 0 && <p>No orders assigned to you yet.</p>}

      {orders.map((o) => (
        <div
          key={o._id}
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 15,
            marginTop: 15,
            background: "#f9fafb",
          }}
        >
          <p><strong>Order ID:</strong> {o._id}</p>
          <p><strong>Status:</strong> {o.status}</p>
          <p><strong>Payment:</strong> {o.paymentStatus || "Pending"}</p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <select
              value={o.status}
              onChange={(e) => handleUpdate(o._id, "status", e.target.value)}
              disabled={updatingId === o._id}
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>

            <input
              type="text"
              placeholder="AWB Number"
              value={o.awbNumber || ""}
              onChange={(e) => handleUpdate(o._id, "awbNumber", e.target.value)}
              disabled={updatingId === o._id}
            />

            <input
              type="text"
              placeholder="Courier Name"
              value={o.courierName || ""}
              onChange={(e) => handleUpdate(o._id, "courierName", e.target.value)}
              disabled={updatingId === o._id}
            />

            <input
              type="text"
              placeholder="Tracking URL"
              value={o.trackingUrl || ""}
              onChange={(e) => handleUpdate(o._id, "trackingUrl", e.target.value)}
              disabled={updatingId === o._id}
            />
          </div>

          {o.statusHistory && o.statusHistory.length > 0 && (
            <div style={{ marginTop: 15 }}>
              <strong>Status History:</strong>
              <ul>
                {o.statusHistory.map((s, i) => (
                  <li key={i}>
                    {new Date(s.time).toLocaleString()} → {s.status}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
