"use client";

import { useEffect, useState } from "react";

export default function StoreOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);

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

  async function updateStatus(orderId, status) {
    setUpdating(true);

    try {
      const res = await fetch("/api/store/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });

      const json = await res.json();

      if (json.success) {
        loadOrders();
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }

    setUpdating(false);
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading Orders...</h2>;

  return (
    <div style={{ maxWidth: 1300, margin: "auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        🏪 Store Orders
      </h1>

      {orders.length === 0 && <p>No orders assigned</p>}

      {orders.map(order => (
        <div
          key={order._id}
          style={{
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 15,
            marginTop: 15,
            background: "#f9fafb",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p><strong>Order:</strong> {order.orderId}</p>
              <p><strong>Customer:</strong> {order.customerName}</p>
            </div>

            <div>
              <span style={{
                padding: "5px 10px",
                borderRadius: 6,
                background: "#e0f2fe"
              }}>
                {order.status}
              </span>
            </div>
          </div>

          {/* Items */}
          <div style={{ marginTop: 10 }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ fontSize: 14 }}>
                {item.name} × {item.quantity}
              </div>
            ))}
          </div>

          {/* Warehouse */}
          <div style={{ marginTop: 10 }}>
            <strong>Warehouse:</strong>{" "}
            {order.warehouseAssignments?.[0]?.warehouseId?.name || "N/A"}
          </div>

          {/* Actions */}
          <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
            
            {order.status === "Order Placed" && (
              <button
                disabled={updating}
                onClick={() => updateStatus(order._id, "Packed")}
                style={btn("#f59e0b")}
              >
                📦 Mark Packed
              </button>
            )}

            {order.status === "Packed" && (
              <button
                disabled={updating}
                onClick={() => updateStatus(order._id, "Shipped")}
                style={btn("#6366f1")}
              >
                🚚 Mark Shipped
              </button>
            )}

            {order.status === "Shipped" && (
              <button
                disabled={updating}
                onClick={() => updateStatus(order._id, "Delivered")}
                style={btn("#16a34a")}
              >
                ✅ Mark Delivered
              </button>
            )}

          </div>
        </div>
      ))}
    </div>
  );
}

/* Button Style */
function btn(color) {
  return {
    padding: "8px 12px",
    background: color,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  };
}
