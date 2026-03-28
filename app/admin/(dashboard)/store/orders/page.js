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
      const res = await fetch("/api/store/orders");
      const json = await res.json();

      if (json.success) {
        setOrders(json.orders || []);
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load orders");
    }
    setLoading(false);
  }

  async function handleUpdate(orderId, payload) {
    setUpdatingId(orderId);

    try {
      const res = await fetch("/api/store/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, ...payload }),
      });

      const json = await res.json();

      if (json.success) {
        loadOrders();
      } else {
        alert(json.message || "Update failed");
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
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        📦 My Assigned Orders
      </h1>

      {orders.length === 0 && <p>No orders assigned to you yet.</p>}

      {orders.map((o) => (
        <div key={o._id} style={card}>
          
          {/* ✅ FIXED ORDER ID */}
          <p><strong>Order ID:</strong> {o.orderId}</p>

          <p><strong>Status:</strong> {o.status}</p>
          <p><strong>Payment:</strong> {o.paymentStatus || "Pending"}</p>

          {/* ================= ACTION BUTTONS ================= */}
          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>

            {o.status === "Order Placed" && (
              <button
                onClick={() => handleUpdate(o._id, { status: "Packed" })}
                disabled={updatingId === o._id}
              >
                📦 Mark Packed
              </button>
            )}

            {o.status === "Packed" && (
              <button
                onClick={() => handleUpdate(o._id, { status: "Shipped" })}
                disabled={updatingId === o._id}
              >
                🚚 Mark Shipped
              </button>
            )}

            {o.status === "Shipped" && (
              <button
                onClick={() => handleUpdate(o._id, { status: "Out For Delivery" })}
                disabled={updatingId === o._id}
              >
                🚛 Out For Delivery
              </button>
            )}

            {o.status === "Out For Delivery" && (
              <button
                onClick={() => handleUpdate(o._id, { status: "Delivered" })}
                disabled={updatingId === o._id}
              >
                ✅ Delivered
              </button>
            )}
          </div>

          {/* ================= COURIER DETAILS ================= */}
          <div style={{ marginTop: 15 }}>
            <input
              type="text"
              placeholder="AWB Number"
              defaultValue={o.awbNumber || ""}
              onBlur={(e) =>
                handleUpdate(o._id, { awbNumber: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Courier Name"
              defaultValue={o.courierName || ""}
              onBlur={(e) =>
                handleUpdate(o._id, { courierName: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Tracking URL"
              defaultValue={o.trackingUrl || ""}
              onBlur={(e) =>
                handleUpdate(o._id, { trackingUrl: e.target.value })
              }
            />
          </div>

          {/* ================= STATUS HISTORY ================= */}
          {o.statusHistory?.length > 0 && (
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

const card = {
  border: "1px solid #eee",
  borderRadius: 10,
  padding: 15,
  marginTop: 15,
  background: "#f9fafb",
};
